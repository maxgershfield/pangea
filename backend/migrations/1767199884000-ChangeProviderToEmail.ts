import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProviderToEmail${TIMESTAMP} implements MigrationInterface {
  name = 'ChangeProviderToEmail${TIMESTAMP}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change provider from 'credential' to 'email' for email/password authentication
    // Better-Auth uses 'email' as the provider value
    await queryRunner.query(`
      UPDATE "account"
      SET "provider" = 'email'
      WHERE "provider" = 'credential'
      AND "password" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "account"
      SET "provider" = 'credential'
      WHERE "provider" = 'email'
      AND "password" IS NOT NULL
    `);
  }
}
