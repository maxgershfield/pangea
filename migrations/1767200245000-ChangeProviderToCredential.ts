import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProviderToCredential1767200245000 implements MigrationInterface {
  name = 'ChangeProviderToCredential1767200245000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change provider from 'email' back to 'credential' for email/password authentication
    // Better-Auth expects 'credential' as the provider value (not 'email')
    await queryRunner.query(`
      UPDATE "account"
      SET "provider" = 'credential'
      WHERE "provider" = 'email'
      AND "password" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "account"
      SET "provider" = 'email'
      WHERE "provider" = 'credential'
      AND "password" IS NOT NULL
    `);
  }
}
