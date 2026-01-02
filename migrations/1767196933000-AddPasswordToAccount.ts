import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordToAccount1767196933000 implements MigrationInterface {
  name = 'AddPasswordToAccount1767196933000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add password field to account table for Better-Auth email/password authentication
    // Better-Auth stores password hash in account table with provider='credential'
    await queryRunner.query(`
      ALTER TABLE "account" 
      ADD COLUMN IF NOT EXISTS "password" VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "account" 
      DROP COLUMN IF EXISTS "password"
    `);
  }
}
