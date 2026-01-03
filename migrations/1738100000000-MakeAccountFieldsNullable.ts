import type { MigrationInterface, QueryRunner } from "typeorm";

export class MakeAccountFieldsNullable1738100000000 implements MigrationInterface {
	name = "MakeAccountFieldsNullable1738100000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Make account table fields nullable to support Better-Auth email/password authentication
		// Better-Auth creates account records but may not always provide all fields immediately
		await queryRunner.query(`
      ALTER TABLE "account" 
      ALTER COLUMN "user_id" DROP NOT NULL,
      ALTER COLUMN "account_id" DROP NOT NULL,
      ALTER COLUMN "provider" DROP NOT NULL
    `);

		// Update unique constraint to allow nulls
		await queryRunner.query(`
      ALTER TABLE "account" 
      DROP CONSTRAINT IF EXISTS "UQ_account_provider_account_id"
    `);

		await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_account_provider_account_id" 
      ON "account" ("provider", "account_id") 
      WHERE "provider" IS NOT NULL AND "account_id" IS NOT NULL
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Restore NOT NULL constraints
		await queryRunner.query(`
      ALTER TABLE "account" 
      DROP CONSTRAINT IF EXISTS "UQ_account_provider_account_id"
    `);

		await queryRunner.query(`
      ALTER TABLE "account" 
      ALTER COLUMN "user_id" SET NOT NULL,
      ALTER COLUMN "account_id" SET NOT NULL,
      ALTER COLUMN "provider" SET NOT NULL
    `);

		await queryRunner.query(`
      ALTER TABLE "account" 
      ADD CONSTRAINT "UQ_account_provider_account_id" 
      UNIQUE ("provider", "account_id")
    `);
	}
}
