import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

/**
 * Service to automatically run pending migrations on startup
 * Only runs migrations if there are pending ones (safe to call multiple times)
 */
@Injectable()
export class MigrationRunnerService implements OnModuleInit {
  private readonly logger = new Logger(MigrationRunnerService.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Run migrations in background, don't block startup
    setImmediate(async () => {
      try {
        this.logger.log('Checking for pending database migrations...');
        
        // Check if migrations table exists
        const migrationsTableExists = await this.dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'migrations'
          );
        `);

        if (!migrationsTableExists[0]?.exists) {
          this.logger.log('Migrations table does not exist. Running migrations...');
          await this.dataSource.runMigrations();
          this.logger.log('✅ Database migrations completed successfully');
          return;
        }

        // Check for pending migrations
        const pendingMigrations = await this.dataSource.showMigrations();
        
        if (pendingMigrations && pendingMigrations.length > 0) {
          this.logger.log(`Found ${pendingMigrations.length} pending migration(s). Running migrations...`);
          await this.dataSource.runMigrations();
          this.logger.log('✅ Database migrations completed successfully');
        } else {
          this.logger.log('No pending migrations. Database is up to date.');
        }
      } catch (error) {
        this.logger.error(
          `Failed to run migrations: ${error.message}`,
          error.stack,
        );
        // Don't throw - allow app to start even if migrations fail
        // This is a safety measure to prevent blocking startup
      }
    });
  }
}
