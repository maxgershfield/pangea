import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
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

  @Get('status')
  async getMigrationStatus() {
    try {
      // Check if Better-Auth tables exist
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      const betterAuthTables = ['user', 'session', 'account', 'verification', 'user_oasis_mapping'];
      const tableChecks = await Promise.all(
        betterAuthTables.map(async (tableName) => {
          try {
            const result = await queryRunner.query(
              `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
              )`,
              [tableName]
            );
            return { table: tableName, exists: result[0].exists };
          } catch (error) {
            return { table: tableName, exists: false, error: error.message };
          }
        })
      );
      
      await queryRunner.release();
      
      return {
        success: true,
        betterAuthTables: tableChecks,
        allTablesExist: tableChecks.every(t => t.exists),
        message: tableChecks.every(t => t.exists) 
          ? 'All Better-Auth tables exist' 
          : 'Some Better-Auth tables are missing',
      };
    } catch (error) {
      this.logger.error(`Failed to check migration status: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Status check failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get('check-account')
  async checkAccountRecords() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      // Check recent account records
      const accounts = await queryRunner.query(`
        SELECT id, user_id, account_id, provider, password IS NOT NULL as has_password, created_at
        FROM account
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      // Check recent user records
      const users = await queryRunner.query(`
        SELECT id, email, name, created_at
        FROM "user"
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      // Check if accounts are properly linked to users (join test)
      const accountUserJoin = await queryRunner.query(`
        SELECT 
          a.id as account_id,
          a.user_id,
          a.provider,
          a.password IS NOT NULL as has_password,
          u.id as user_id_from_user,
          u.email
        FROM account a
        LEFT JOIN "user" u ON a.user_id = u.id
        WHERE a.provider = 'credential'
        ORDER BY a.created_at DESC
        LIMIT 5
      `);
      
      await queryRunner.release();
      
      return {
        success: true,
        recentAccounts: accounts,
        recentUsers: users,
        accountCount: accounts.length,
        userCount: users.length,
        accountUserJoin: accountUserJoin,
      };
    } catch (error) {
      this.logger.error(`Failed to check account records: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Check failed: ${error.message}`,
        error: error.message,
      };
    }
  }

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
