/**
 * Integration Test Setup
 *
 * Provides environment-aware database configuration and test module factory
 * for integration testing against SQLite (fast) or Neon (real integration).
 */
import type { DynamicModule, Provider, Type } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { ALL_ENTITIES, SQLITE_COMPATIBLE_ENTITIES, TEST_CONFIG, mockRedisClient } from "../../test-utils.js";

export interface IntegrationTestContext {
	module: TestingModule;
	dataSource: DataSource;
	cleanup: () => Promise<void>;
}

/**
 * Environment-aware database configuration
 * - TEST_USE_NEON=true: Use real Neon PostgreSQL
 * - Default: SQLite in-memory for fast, isolated tests
 */
export function getDatabaseConfig() {
	const useNeon = process.env.TEST_USE_NEON === "true";
	const neonUrl = process.env.TEST_DATABASE_URL;

	if (useNeon && neonUrl) {
		return {
			type: "postgres" as const,
			url: neonUrl,
			entities: ALL_ENTITIES,
			synchronize: false, // Never auto-sync against real Neon
			logging: process.env.TEST_DB_LOGGING === "true",
		};
	}

	// Default: SQLite in-memory for unit/fast tests
	// Use only SQLite-compatible entities (no jsonb, timestamp types)
	return {
		type: "better-sqlite3" as const,
		database: ":memory:",
		entities: SQLITE_COMPATIBLE_ENTITIES,
		synchronize: true,
		dropSchema: true,
	};
}

interface GuardOverride {
	guard: Type<unknown>;
	useValue: unknown;
}

interface ProviderOverride {
	provider: Type<unknown> | string | symbol;
	useValue: unknown;
}

interface CreateIntegrationTestModuleOptions {
	imports?: (Type<unknown> | DynamicModule)[];
	providers?: Provider[];
	controllers?: Type<unknown>[];
	guardOverrides?: GuardOverride[];
	providerOverrides?: ProviderOverride[];
}

/**
 * Creates integration test module with database and common dependencies.
 *
 * @example
 * ```typescript
 * const ctx = await createIntegrationTestModule({
 *   imports: [AuthModule],
 * });
 *
 * // Use ctx.dataSource for database operations
 * // Use ctx.module for NestJS testing
 *
 * // Clean up after tests
 * await ctx.cleanup();
 * ```
 */
export async function createIntegrationTestModule(
	options: CreateIntegrationTestModuleOptions = {}
): Promise<IntegrationTestContext> {
	const dbConfig = getDatabaseConfig();

	let moduleBuilder = Test.createTestingModule({
		imports: [
			ConfigModule.forRoot({
				isGlobal: true,
				load: [
					() => ({
						...TEST_CONFIG,
						FRONTEND_URL: "http://localhost:3001",
					}),
				],
			}),
			TypeOrmModule.forRoot(dbConfig),
			TypeOrmModule.forFeature(dbConfig.entities),
			...(options.imports || []),
		],
		controllers: options.controllers || [],
		providers: [
			{
				provide: "REDIS_CLIENT",
				useValue: mockRedisClient,
			},
			...(options.providers || []),
		],
	});

	// Apply guard overrides before compilation
	if (options.guardOverrides) {
		for (const override of options.guardOverrides) {
			moduleBuilder = moduleBuilder
				.overrideGuard(override.guard)
				.useValue(override.useValue);
		}
	}

	// Apply provider overrides before compilation
	if (options.providerOverrides) {
		for (const override of options.providerOverrides) {
			moduleBuilder = moduleBuilder
				.overrideProvider(override.provider)
				.useValue(override.useValue);
		}
	}

	const module = await moduleBuilder.compile();

	const dataSource = module.get<DataSource>(DataSource);

	const cleanup = async () => {
		if (dataSource.isInitialized) {
			// For Neon: delete test data but preserve schema
			if (dbConfig.type === "postgres") {
				try {
					await dataSource.query(`
						DELETE FROM session WHERE user_id LIKE 'ba-user-%';
						DELETE FROM account WHERE user_id LIKE 'ba-user-%';
						DELETE FROM verification WHERE identifier LIKE 'test%';
						DELETE FROM "user" WHERE id LIKE 'ba-user-%';
					`);
				} catch {
					// Ignore cleanup errors
				}
			}
			await dataSource.destroy();
		}
	};

	return { module, dataSource, cleanup };
}

/**
 * Helper to check if running against real Neon database
 */
export function isNeonTest(): boolean {
	return process.env.TEST_USE_NEON === "true" && !!process.env.TEST_DATABASE_URL;
}
