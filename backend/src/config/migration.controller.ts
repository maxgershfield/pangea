import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

/**
 * Admin controller to manually trigger migrations
 * This is useful when Railway Shell is not available
 */
@Controller('admin/migrations')
export class MigrationController {
  private readonly logger = new Logger(MigrationController.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runMigrations() {
    try {
      this.logger.log('Manually triggering migrations...');
      
      const executedMigrations = await this.dataSource.runMigrations();
      
      if (executedMigrations && executedMigrations.length > 0) {
        this.logger.log(`✅ Executed ${executedMigrations.length} migration(s):`);
        executedMigrations.forEach((migration) => {
          this.logger.log(`   - ${migration.name}`);
        });
        
        return {
          success: true,
          message: `Executed ${executedMigrations.length} migration(s)`,
          migrations: executedMigrations.map(m => m.name),
        };
      } else {
        return {
          success: true,
          message: 'No pending migrations. Database is up to date.',
          migrations: [],
        };
      }
    } catch (error) {
      this.logger.error(`Failed to run migrations: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Migration failed: ${error.message}`,
        error: error.message,
      };
    }
  }
}

