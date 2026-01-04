import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "reflect-metadata";
import { DataSource, type DataSourceOptions } from "typeorm";

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const configService = new ConfigService();

const databaseUrl = configService.get<string>("DATABASE_URL");

const isProduction = configService.get<string>("NODE_ENV") === "production";
// In production, migrations are compiled to dist/migrations (relative to dist/config)
// In development, use source migrations from project root
const migrationsPath = isProduction
	? `${__dirname}/../migrations/*.js`
	: `${__dirname}/../../migrations/*{.ts,.js}`;
// Allow scoped migration runs (e.g., Neon) without replaying legacy migrations.
const migrationsGlob =
	configService.get<string>("TYPEORM_MIGRATIONS_PATH") ?? migrationsPath;

// Avoid entity metadata loading when running CLI migrations in ESM/tsx.
const disableEntities = configService.get<string>("TYPEORM_DISABLE_ENTITIES") === "true";
const entities = disableEntities ? [] : [`${__dirname}/../**/*.entity{.ts,.js}`];

const dataSourceOptions: DataSourceOptions = databaseUrl
	? {
			type: "postgres",
			url: databaseUrl,
			entities,
			migrations: [migrationsGlob],
		}
	: {
			type: "postgres",
			host: configService.get<string>("DB_HOST", "localhost"),
			port: configService.get<number>("DB_PORT", 5432),
			username: configService.get<string>("DB_USERNAME", "user"),
			password: configService.get<string>("DB_PASSWORD", "password"),
			database: configService.get<string>("DB_DATABASE", "pangea"),
			entities,
			migrations: [migrationsGlob],
		};

export const AppDataSource = new DataSource(dataSourceOptions);
