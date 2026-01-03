import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Explicitly import Better-Auth entities to ensure they're registered
import {
  BetterAuthUser,
  BetterAuthSession,
  BetterAuthAccount,
  BetterAuthVerification,
} from '../auth/entities/index.js';
import { SessionSubscriber } from '../auth/subscribers/session.subscriber.js';
import { AccountSubscriber } from '../auth/subscribers/account.subscriber.js';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    // Disable migrations in development to avoid module loading issues
    // In production, migrations are compiled to dist/migrations (relative to dist/config)
    const migrationsPath = isProduction
      ? __dirname + '/../migrations/*.js'
      : undefined;

    // Base entities pattern - auto-discover all entities
    const entitiesPattern = [__dirname + '/../**/*.entity{.ts,.js}'];
    
    // Explicitly include Better-Auth entities to ensure they're loaded
    // This is necessary because the Better-Auth TypeORM adapter needs these entities
    const explicitEntities = [
      BetterAuthUser,
      BetterAuthSession,
      BetterAuthAccount,
      BetterAuthVerification,
    ];

    // Register subscribers to fix Better-Auth adapter issues
    const subscribers = [SessionSubscriber, AccountSubscriber];

    // If DATABASE_URL is provided, use it directly
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [...explicitEntities, ...entitiesPattern],
        migrations: migrationsPath ? [migrationsPath] : [], // Empty array in development
        migrationsRun: false, // Never auto-run migrations
        subscribers, // Register subscribers
        synchronize: false, // Explicitly disable auto-sync
        logging: !isProduction && this.configService.get<string>('NODE_ENV') === 'development',
      };
    }

    // Otherwise, use individual connection parameters
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'user'),
      password: this.configService.get<string>('DB_PASSWORD', 'password'),
      database: this.configService.get<string>('DB_DATABASE', 'pangea'),
      entities: [...explicitEntities, ...entitiesPattern],
      migrations: migrationsPath ? [migrationsPath] : [], // Empty array in development
      migrationsRun: false, // Never auto-run migrations
      subscribers, // Register subscribers
      synchronize: false, // Explicitly disable auto-sync
      logging: !isProduction && this.configService.get<string>('NODE_ENV') === 'development',
    };
  }
}
