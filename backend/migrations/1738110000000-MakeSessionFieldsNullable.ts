import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeSessionFieldsNullable1738110000000 implements MigrationInterface {
  name = 'MakeSessionFieldsNullable1738110000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make session table fields nullable to support Better-Auth TypeORM adapter
    // The adapter may not always provide all fields immediately
    // Note: id remains NOT NULL as it's the primary key
    await queryRunner.query(`
      ALTER TABLE "session" 
      ALTER COLUMN "user_id" DROP NOT NULL,
      ALTER COLUMN "expires_at" DROP NOT NULL,
      ALTER COLUMN "token" DROP NOT NULL
    `);
    
    // Update unique constraint on token to allow nulls
    await queryRunner.query(`
      ALTER TABLE "session" 
      DROP CONSTRAINT IF EXISTS "UQ_session_token"
    `);
    
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_session_token" 
      ON "session" ("token") 
      WHERE "token" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore NOT NULL constraints
    await queryRunner.query(`
      ALTER TABLE "session" 
      ALTER COLUMN "user_id" SET NOT NULL,
      ALTER COLUMN "expires_at" SET NOT NULL,
      ALTER COLUMN "token" SET NOT NULL
    `);
  }
}

