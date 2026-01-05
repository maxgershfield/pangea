/**
 * Schema Alignment Integration Tests
 *
 * Verifies that TypeORM entities in the backend match the Drizzle schema
 * defined in the frontend (pangea-frontend/packages/auth/src/db/schema.ts).
 *
 * These tests ensure both services can read/write to the shared Neon database
 * without schema mismatches.
 */
import "reflect-metadata";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BetterAuthAccount } from "../../../src/auth/entities/better-auth-account.entity.js";
import { BetterAuthSession } from "../../../src/auth/entities/better-auth-session.entity.js";
import { BetterAuthUser } from "../../../src/auth/entities/better-auth-user.entity.js";
import { BetterAuthVerification } from "../../../src/auth/entities/better-auth-verification.entity.js";
import {
    createIntegrationTestModule,
    type IntegrationTestContext,
} from "../setup/integration-test.setup.js";

describe("Schema Alignment: Backend TypeORM <-> Frontend Drizzle", () => {
	let ctx: IntegrationTestContext;
	let dataSource: DataSource;

	beforeAll(async () => {
		ctx = await createIntegrationTestModule();
		dataSource = ctx.dataSource;
	});

	afterAll(async () => {
		await ctx.cleanup();
	});

	describe("User Table Schema", () => {
		it("should have all required columns matching Drizzle schema", () => {
			const metadata = dataSource.getMetadata(BetterAuthUser);
			const columnNames = metadata.columns.map((c) => c.databaseName);

			// Core Better Auth fields
			expect(columnNames).toContain("id");
			expect(columnNames).toContain("email");
			expect(columnNames).toContain("email_verified");
			expect(columnNames).toContain("name");
			expect(columnNames).toContain("image");
			expect(columnNames).toContain("created_at");
			expect(columnNames).toContain("updated_at");

			// Pangea-specific fields
			expect(columnNames).toContain("username");
			expect(columnNames).toContain("first_name");
			expect(columnNames).toContain("last_name");
			expect(columnNames).toContain("role");
			expect(columnNames).toContain("kyc_status");
			expect(columnNames).toContain("wallet_address_solana");
			expect(columnNames).toContain("wallet_address_ethereum");
			expect(columnNames).toContain("avatar_id");
			expect(columnNames).toContain("last_login");
			expect(columnNames).toContain("is_active");
		});

		it("should use text primary key (not UUID) matching Better Auth", () => {
			const metadata = dataSource.getMetadata(BetterAuthUser);
			const primaryColumn = metadata.primaryColumns[0];

			expect(primaryColumn.databaseName).toBe("id");
			expect(primaryColumn.type).toBe("text");
			// Ensure not auto-generated (Better Auth generates IDs)
			expect(primaryColumn.isGenerated).toBeFalsy();
		});

		it("should have unique email constraint", () => {
			const metadata = dataSource.getMetadata(BetterAuthUser);
			const emailColumn = metadata.findColumnWithDatabaseName("email");

			expect(emailColumn).toBeDefined();
			expect(emailColumn?.type).toBe("text");
			// Check unique constraint via uniques or indices
			const hasUniqueEmail =
				metadata.uniques.some((u) =>
					u.columns.some((c) => c.databaseName === "email"),
				) ||
				metadata.indices.some(
					(i) =>
						i.isUnique && i.columns.some((c) => c.databaseName === "email"),
				);
			expect(hasUniqueEmail).toBe(true);
		});

		it("should have correct boolean type for emailVerified", () => {
			const metadata = dataSource.getMetadata(BetterAuthUser);
			const emailVerifiedColumn =
				metadata.findColumnWithDatabaseName("email_verified");

			expect(emailVerifiedColumn).toBeDefined();
			expect(emailVerifiedColumn?.type).toBe("boolean");
		});

		it("should have correct nullable fields", () => {
			const metadata = dataSource.getMetadata(BetterAuthUser);

			// These fields should be nullable
			const nullableFields = [
				"image",
				"username",
				"first_name",
				"last_name",
				"wallet_address_solana",
				"wallet_address_ethereum",
				"avatar_id",
				"last_login",
			];

			for (const fieldName of nullableFields) {
				const column = metadata.findColumnWithDatabaseName(fieldName);
				expect(column, `Column ${fieldName} should exist`).toBeDefined();
				expect(column?.isNullable, `Column ${fieldName} should be nullable`).toBe(
					true,
				);
			}
		});

		it("should have correct default values", () => {
			const metadata = dataSource.getMetadata(BetterAuthUser);

			const roleColumn = metadata.findColumnWithDatabaseName("role");
			expect(roleColumn?.default).toBe("user");

			const kycStatusColumn = metadata.findColumnWithDatabaseName("kyc_status");
			expect(kycStatusColumn?.default).toBe("none");

			const isActiveColumn = metadata.findColumnWithDatabaseName("is_active");
			expect(isActiveColumn?.default).toBe(true);

			const emailVerifiedColumn =
				metadata.findColumnWithDatabaseName("email_verified");
			expect(emailVerifiedColumn?.default).toBe(false);
		});
	});

	describe("Session Table Schema", () => {
		it("should have correct columns", () => {
			const metadata = dataSource.getMetadata(BetterAuthSession);
			const columnNames = metadata.columns.map((c) => c.databaseName);

			expect(columnNames).toContain("id");
			expect(columnNames).toContain("user_id");
			expect(columnNames).toContain("token");
			expect(columnNames).toContain("expires_at");
			expect(columnNames).toContain("ip_address");
			expect(columnNames).toContain("user_agent");
			expect(columnNames).toContain("created_at");
			expect(columnNames).toContain("updated_at");
		});

		it("should have foreign key to user table", () => {
			const metadata = dataSource.getMetadata(BetterAuthSession);
			const userIdColumn = metadata.findColumnWithDatabaseName("user_id");

			expect(userIdColumn).toBeDefined();
			expect(userIdColumn?.type).toBe("text");

			// Check relation exists
			const userRelation = metadata.relations.find(
				(r) => r.propertyName === "user",
			);
			expect(userRelation).toBeDefined();
		});

		it("should have unique token column", () => {
			const metadata = dataSource.getMetadata(BetterAuthSession);
			const tokenColumn = metadata.findColumnWithDatabaseName("token");

			expect(tokenColumn).toBeDefined();
			// Check unique constraint via uniques or indices
			const hasUniqueToken =
				metadata.uniques.some((u) =>
					u.columns.some((c) => c.databaseName === "token"),
				) ||
				metadata.indices.some(
					(i) =>
						i.isUnique && i.columns.some((c) => c.databaseName === "token"),
				);
			expect(hasUniqueToken).toBe(true);
		});

		it("should have text primary key", () => {
			const metadata = dataSource.getMetadata(BetterAuthSession);
			const primaryColumn = metadata.primaryColumns[0];

			expect(primaryColumn.databaseName).toBe("id");
			expect(primaryColumn.type).toBe("text");
		});
	});

	describe("Account Table Schema", () => {
		it("should have correct columns for credential provider", () => {
			const metadata = dataSource.getMetadata(BetterAuthAccount);
			const columnNames = metadata.columns.map((c) => c.databaseName);

			expect(columnNames).toContain("id");
			expect(columnNames).toContain("user_id");
			expect(columnNames).toContain("account_id");
			expect(columnNames).toContain("provider_id");
			expect(columnNames).toContain("password");
			expect(columnNames).toContain("created_at");
			expect(columnNames).toContain("updated_at");
		});

		it("should have columns for OAuth providers", () => {
			const metadata = dataSource.getMetadata(BetterAuthAccount);
			const columnNames = metadata.columns.map((c) => c.databaseName);

			expect(columnNames).toContain("access_token");
			expect(columnNames).toContain("refresh_token");
			expect(columnNames).toContain("access_token_expires_at");
			expect(columnNames).toContain("refresh_token_expires_at");
			expect(columnNames).toContain("scope");
			expect(columnNames).toContain("id_token");
		});

		it("should have foreign key to user table", () => {
			const metadata = dataSource.getMetadata(BetterAuthAccount);
			const userIdColumn = metadata.findColumnWithDatabaseName("user_id");

			expect(userIdColumn).toBeDefined();
			expect(userIdColumn?.type).toBe("text");

			// Check relation exists
			const userRelation = metadata.relations.find(
				(r) => r.propertyName === "user",
			);
			expect(userRelation).toBeDefined();
		});

		it("should have text primary key", () => {
			const metadata = dataSource.getMetadata(BetterAuthAccount);
			const primaryColumn = metadata.primaryColumns[0];

			expect(primaryColumn.databaseName).toBe("id");
			expect(primaryColumn.type).toBe("text");
		});
	});

	describe("Verification Table Schema", () => {
		it("should match Better Auth verification pattern", () => {
			const metadata = dataSource.getMetadata(BetterAuthVerification);
			const columnNames = metadata.columns.map((c) => c.databaseName);

			expect(columnNames).toContain("id");
			expect(columnNames).toContain("identifier");
			expect(columnNames).toContain("value");
			expect(columnNames).toContain("expires_at");
			expect(columnNames).toContain("created_at");
			expect(columnNames).toContain("updated_at");
		});

		it("should have text primary key", () => {
			const metadata = dataSource.getMetadata(BetterAuthVerification);
			const primaryColumn = metadata.primaryColumns[0];

			expect(primaryColumn.databaseName).toBe("id");
			expect(primaryColumn.type).toBe("text");
		});
	});

	describe("Table Names", () => {
		it("should use correct table names matching Drizzle schema", () => {
			expect(dataSource.getMetadata(BetterAuthUser).tableName).toBe("user");
			expect(dataSource.getMetadata(BetterAuthSession).tableName).toBe("session");
			expect(dataSource.getMetadata(BetterAuthAccount).tableName).toBe("account");
			expect(dataSource.getMetadata(BetterAuthVerification).tableName).toBe(
				"verification",
			);
		});
	});
});
