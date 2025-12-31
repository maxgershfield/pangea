import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAccountProvider${TIMESTAMP} implements MigrationInterface {
  name = 'FixAccountProvider${TIMESTAMP}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix existing accounts with password but provider=null
    // Set provider='credential' for email/password authentication
    await queryRunner.query(`
      UPDATE "account"
      SET "provider" = 'credential'
      WHERE "provider" IS NULL
      AND "password" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: Set provider back to NULL (not recommended, but for migration rollback)
    await queryRunner.query(`
      UPDATE "account"
      SET "provider" = NULL
      WHERE "provider" = 'credential'
      AND "password" IS NOT NULL
    `);
  }
}
