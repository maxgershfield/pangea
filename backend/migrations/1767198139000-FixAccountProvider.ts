import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAccountProvider1767198139000 implements MigrationInterface {
  name = 'FixAccountProvider1767198139000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix existing accounts with password but provider=null or provider='credential'
    // Better-Auth uses 'email' as the provider for email/password authentication
    await queryRunner.query(`
      UPDATE "account"
      SET "provider" = 'email'
      WHERE ("provider" IS NULL OR "provider" = 'credential')
      AND "password" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: Set provider back to NULL (not recommended, but for migration rollback)
    await queryRunner.query(`
      UPDATE "account"
      SET "provider" = NULL
      WHERE "provider" = 'email'
      AND "password" IS NOT NULL
    `);
  }
}
