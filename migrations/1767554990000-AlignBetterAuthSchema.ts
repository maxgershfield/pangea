import type { MigrationInterface, QueryRunner } from "typeorm";

export class AlignBetterAuthSchema1767554990000 implements MigrationInterface {
	name = "AlignBetterAuthSchema1767554990000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Drop legacy domain tables (rebuilt below with Better Auth user references)
		await queryRunner.query(`DROP TABLE IF EXISTS "order_book_snapshots" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "transactions" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "user_balances" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "trades" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "tokenized_assets" CASCADE`);

		// Drop redundant legacy tables
		await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "user_oasis_mapping" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "pangea_user_data" CASCADE`);

		// Ensure Better Auth user table exists and matches frontend schema
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text NOT NULL,
        "email" text NOT NULL,
        "email_verified" boolean DEFAULT false,
        "name" text,
        "image" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "last_login" timestamp,
        "is_active" boolean DEFAULT true,
        "username" text,
        "first_name" text,
        "last_name" text,
        "role" text DEFAULT 'user',
        "kyc_status" text DEFAULT 'none',
        "wallet_address_solana" text,
        "wallet_address_ethereum" text,
        "avatar_id" text,
        CONSTRAINT "PK_user" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

		await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "last_login" timestamp,
      ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "username" text,
      ADD COLUMN IF NOT EXISTS "first_name" text,
      ADD COLUMN IF NOT EXISTS "last_name" text,
      ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS "kyc_status" text DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS "wallet_address_solana" text,
      ADD COLUMN IF NOT EXISTS "wallet_address_ethereum" text,
      ADD COLUMN IF NOT EXISTS "avatar_id" text
    `);

		await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now()`);
		await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now()`);
		await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
		await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "kyc_status" SET DEFAULT 'none'`);
		await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "is_active" SET DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email_verified" SET DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL`);

		await queryRunner.query(
			`UPDATE "user" SET "email_verified" = false WHERE "email_verified" IS NULL`
		);
		await queryRunner.query(`UPDATE "user" SET "is_active" = true WHERE "is_active" IS NULL`);
		await queryRunner.query(`UPDATE "user" SET "role" = 'user' WHERE "role" IS NULL`);
		await queryRunner.query(`UPDATE "user" SET "kyc_status" = 'none' WHERE "kyc_status" IS NULL`);
		await queryRunner.query(`UPDATE "user" SET "created_at" = now() WHERE "created_at" IS NULL`);
		await queryRunner.query(`UPDATE "user" SET "updated_at" = now() WHERE "updated_at" IS NULL`);

		await queryRunner.query(`
      ALTER TABLE "user"
      ALTER COLUMN "email_verified" SET NOT NULL,
      ALTER COLUMN "role" SET NOT NULL,
      ALTER COLUMN "kyc_status" SET NOT NULL,
      ALTER COLUMN "is_active" SET NOT NULL,
      ALTER COLUMN "created_at" SET NOT NULL,
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

		// Drop dependent foreign keys before altering user.id type
		await queryRunner.query(`
      DO $$
      DECLARE constraint_name text;
      BEGIN
        IF to_regclass('session') IS NOT NULL THEN
          FOR constraint_name IN
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'session'::regclass AND contype = 'f'
          LOOP
            EXECUTE format('ALTER TABLE "session" DROP CONSTRAINT %I', constraint_name);
          END LOOP;
        END IF;

        IF to_regclass('account') IS NOT NULL THEN
          FOR constraint_name IN
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'account'::regclass AND contype = 'f'
          LOOP
            EXECUTE format('ALTER TABLE "account" DROP CONSTRAINT %I', constraint_name);
          END LOOP;
        END IF;
      END $$;
    `);

		await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'user'
            AND column_name = 'id'
            AND udt_name <> 'text'
        ) THEN
          ALTER TABLE "user" ALTER COLUMN "id" TYPE text USING "id"::text;
        END IF;
      END $$;
    `);

		await queryRunner.query(
			`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_email" ON "user" ("email")`
		);

		// Remove legacy Better Auth session ID triggers
		await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_ensure_session_id ON "session"`);
		await queryRunner.query("DROP FUNCTION IF EXISTS ensure_session_id()");
		await queryRunner.query("DROP FUNCTION IF EXISTS generate_session_id()");

		// Ensure Better Auth session table exists and matches frontend schema
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text NOT NULL,
        "user_id" text NOT NULL,
        "token" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "ip_address" text,
        "user_agent" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_session" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      ALTER TABLE "session"
      ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "ip_address" text,
      ADD COLUMN IF NOT EXISTS "user_agent" text
    `);

		await queryRunner.query(`
      DO $$
      DECLARE constraint_name text;
      BEGIN
        IF to_regclass('session') IS NOT NULL THEN
          FOR constraint_name IN
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'session'::regclass AND contype = 'f'
          LOOP
            EXECUTE format('ALTER TABLE "session" DROP CONSTRAINT %I', constraint_name);
          END LOOP;
        END IF;
      END $$;
    `);

		await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "id" TYPE text USING "id"::text`);
		await queryRunner.query(
			`ALTER TABLE "session" ALTER COLUMN "user_id" TYPE text USING "user_id"::text`
		);

		await queryRunner.query(`
      DELETE FROM "session"
      WHERE "user_id" IS NULL OR "token" IS NULL OR "expires_at" IS NULL
    `);

		await queryRunner.query(`
      UPDATE "session"
      SET "created_at" = now()
      WHERE "created_at" IS NULL
    `);

		await queryRunner.query(`
      UPDATE "session"
      SET "updated_at" = now()
      WHERE "updated_at" IS NULL
    `);

		await queryRunner.query(`
      ALTER TABLE "session"
      ALTER COLUMN "user_id" SET NOT NULL,
      ALTER COLUMN "token" SET NOT NULL,
      ALTER COLUMN "expires_at" SET NOT NULL,
      ALTER COLUMN "created_at" SET NOT NULL,
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

		await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "UQ_session_token"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "UQ_session_token"`);
		await queryRunner.query(
			`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_session_token" ON "session" ("token")`
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "session" ("user_id")`
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "idx_session_expires_at" ON "session" ("expires_at")`
		);

		await queryRunner.query(`
      ALTER TABLE "session"
      ADD CONSTRAINT "FK_session_user"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);

		// Ensure Better Auth account table exists and matches frontend schema
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" text NOT NULL,
        "user_id" text NOT NULL,
        "account_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "access_token" text,
        "refresh_token" text,
        "access_token_expires_at" timestamp,
        "refresh_token_expires_at" timestamp,
        "scope" text,
        "id_token" text,
        "password" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_account" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('account') IS NOT NULL THEN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'account' AND column_name = 'provider'
          ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'account' AND column_name = 'provider_id'
          ) THEN
            ALTER TABLE "account" RENAME COLUMN "provider" TO "provider_id";
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'account' AND column_name = 'expires_at'
          ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'account' AND column_name = 'access_token_expires_at'
          ) THEN
            ALTER TABLE "account" RENAME COLUMN "expires_at" TO "access_token_expires_at";
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'account' AND column_name = 'provider'
          ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'account' AND column_name = 'provider_id'
          ) THEN
            ALTER TABLE "account" DROP COLUMN "provider";
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'account' AND column_name = 'expires_at'
          ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'account' AND column_name = 'access_token_expires_at'
          ) THEN
            ALTER TABLE "account" DROP COLUMN "expires_at";
          END IF;
        END IF;
      END $$;
    `);

		await queryRunner.query(`
      ALTER TABLE "account"
      ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp,
      ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp,
      ADD COLUMN IF NOT EXISTS "scope" text,
      ADD COLUMN IF NOT EXISTS "id_token" text,
      ADD COLUMN IF NOT EXISTS "password" text,
      ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now()
    `);

		await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT now()`);
		await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now()`);

		await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "id" TYPE text USING "id"::text`);
		await queryRunner.query(
			`ALTER TABLE "account" ALTER COLUMN "user_id" TYPE text USING "user_id"::text`
		);
		await queryRunner.query(
			`ALTER TABLE "account" ALTER COLUMN "account_id" TYPE text USING "account_id"::text`
		);
		await queryRunner.query(
			`ALTER TABLE "account" ALTER COLUMN "provider_id" TYPE text USING "provider_id"::text`
		);

		await queryRunner.query(`
      DO $$
      DECLARE constraint_name text;
      BEGIN
        IF to_regclass('account') IS NOT NULL THEN
          FOR constraint_name IN
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'account'::regclass AND contype = 'f'
          LOOP
            EXECUTE format('ALTER TABLE "account" DROP CONSTRAINT %I', constraint_name);
          END LOOP;
        END IF;
      END $$;
    `);

		await queryRunner.query(`
      DELETE FROM "account"
      WHERE "user_id" IS NULL OR "account_id" IS NULL OR "provider_id" IS NULL
    `);

		await queryRunner.query(`
      UPDATE "account"
      SET "created_at" = now()
      WHERE "created_at" IS NULL
    `);

		await queryRunner.query(`
      UPDATE "account"
      SET "updated_at" = now()
      WHERE "updated_at" IS NULL
    `);

		await queryRunner.query(`
      ALTER TABLE "account"
      ALTER COLUMN "user_id" SET NOT NULL,
      ALTER COLUMN "account_id" SET NOT NULL,
      ALTER COLUMN "provider_id" SET NOT NULL,
      ALTER COLUMN "created_at" SET NOT NULL,
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

		await queryRunner.query(
			`ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "UQ_account_provider_account_id"`
		);
		await queryRunner.query(`DROP INDEX IF EXISTS "UQ_account_provider_account_id"`);

		await queryRunner.query(
			`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_account_provider_account_id" ON "account" ("provider_id", "account_id")`
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "idx_account_user_id" ON "account" ("user_id")`
		);

		await queryRunner.query(`
      ALTER TABLE "account"
      ADD CONSTRAINT "FK_account_user"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);

		// Ensure Better Auth verification table exists and matches frontend schema
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_verification" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      ALTER TABLE "verification"
      ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now()
    `);

		await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "created_at" SET DEFAULT now()`);
		await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DEFAULT now()`);

		await queryRunner.query(
			`ALTER TABLE "verification" ALTER COLUMN "id" TYPE text USING "id"::text`
		);

		await queryRunner.query(`
      DELETE FROM "verification"
      WHERE "identifier" IS NULL OR "value" IS NULL OR "expires_at" IS NULL
    `);

		await queryRunner.query(`
      UPDATE "verification"
      SET "created_at" = now()
      WHERE "created_at" IS NULL
    `);

		await queryRunner.query(`
      UPDATE "verification"
      SET "updated_at" = now()
      WHERE "updated_at" IS NULL
    `);

		await queryRunner.query(`
      ALTER TABLE "verification"
      ALTER COLUMN "identifier" SET NOT NULL,
      ALTER COLUMN "value" SET NOT NULL,
      ALTER COLUMN "expires_at" SET NOT NULL,
      ALTER COLUMN "created_at" SET NOT NULL,
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verification" ("identifier")`
		);

		// Ensure Better Auth JWKS table exists (used by JWT plugin)
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jwks" (
        "id" text NOT NULL,
        "public_key" text NOT NULL,
        "private_key" text NOT NULL,
        "created_at" timestamp NOT NULL,
        "expires_at" timestamp,
        CONSTRAINT "PK_jwks" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      ALTER TABLE "jwks"
      ADD COLUMN IF NOT EXISTS "public_key" text,
      ADD COLUMN IF NOT EXISTS "private_key" text,
      ADD COLUMN IF NOT EXISTS "created_at" timestamp,
      ADD COLUMN IF NOT EXISTS "expires_at" timestamp
    `);

		await queryRunner.query(`
      DELETE FROM "jwks"
      WHERE "public_key" IS NULL OR "private_key" IS NULL OR "created_at" IS NULL
    `);

		await queryRunner.query(`
      ALTER TABLE "jwks"
      ALTER COLUMN "public_key" SET NOT NULL,
      ALTER COLUMN "private_key" SET NOT NULL,
      ALTER COLUMN "created_at" SET NOT NULL
    `);

		// Update last_login on session creation
		await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_user_last_login()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE "user"
        SET "last_login" = now(),
            "updated_at" = now()
        WHERE "id" = NEW."user_id";
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

		await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_user_last_login ON "session"`);
		await queryRunner.query(`
      CREATE TRIGGER trigger_update_user_last_login
      AFTER INSERT OR UPDATE ON "session"
      FOR EACH ROW
      EXECUTE FUNCTION update_user_last_login();
    `);

		// Recreate domain tables referencing Better Auth user table
		await queryRunner.query(`
      CREATE TABLE "tokenized_assets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "asset_id" VARCHAR(100) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "symbol" VARCHAR(20) NOT NULL,
        "description" TEXT,
        "asset_class" VARCHAR(50) NOT NULL,
        "asset_type" VARCHAR(50),
        "total_supply" BIGINT NOT NULL,
        "decimals" INTEGER NOT NULL DEFAULT 0,
        "token_standard" VARCHAR(20),
        "blockchain" VARCHAR(20) NOT NULL,
        "network" VARCHAR(20) NOT NULL DEFAULT 'devnet',
        "contract_address" VARCHAR(255),
        "mint_address" VARCHAR(255),
        "total_value_usd" DECIMAL(18,2),
        "price_per_token_usd" DECIMAL(18,2),
        "metadata_uri" TEXT,
        "image_uri" TEXT,
        "legal_documents_uri" TEXT,
        "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
        "issuer_id" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "listed_at" TIMESTAMP,
        "metadata" jsonb,
        CONSTRAINT "UQ_tokenized_assets_asset_id" UNIQUE ("asset_id"),
        CONSTRAINT "PK_tokenized_assets" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" VARCHAR(100) NOT NULL,
        "user_id" text NOT NULL,
        "asset_id" uuid NOT NULL,
        "order_type" VARCHAR(20) NOT NULL,
        "order_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "price_per_token_usd" DECIMAL(18,2) NOT NULL,
        "quantity" BIGINT NOT NULL,
        "total_value_usd" DECIMAL(18,2) NOT NULL,
        "filled_quantity" BIGINT NOT NULL DEFAULT 0,
        "remaining_quantity" BIGINT NOT NULL,
        "expires_at" TIMESTAMP,
        "blockchain" VARCHAR(20) NOT NULL,
        "transaction_hash" VARCHAR(255),
        "is_market_order" BOOLEAN NOT NULL DEFAULT false,
        "is_limit_order" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "filled_at" TIMESTAMP,
        CONSTRAINT "UQ_orders_order_id" UNIQUE ("order_id"),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "trades" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "trade_id" VARCHAR(100) NOT NULL,
        "buyer_id" text NOT NULL,
        "seller_id" text NOT NULL,
        "asset_id" uuid NOT NULL,
        "buy_order_id" uuid,
        "sell_order_id" uuid,
        "quantity" BIGINT NOT NULL,
        "price_per_token_usd" DECIMAL(18,2) NOT NULL,
        "total_value_usd" DECIMAL(18,2) NOT NULL,
        "platform_fee_usd" DECIMAL(18,2) NOT NULL DEFAULT 0,
        "platform_fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
        "blockchain" VARCHAR(20) NOT NULL,
        "transaction_hash" VARCHAR(255) NOT NULL,
        "block_number" BIGINT,
        "executed_at" TIMESTAMP NOT NULL DEFAULT now(),
        "confirmed_at" TIMESTAMP,
        "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "settlement_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        CONSTRAINT "UQ_trades_trade_id" UNIQUE ("trade_id"),
        CONSTRAINT "PK_trades" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "user_balances" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL,
        "asset_id" uuid NOT NULL,
        "balance" BIGINT NOT NULL DEFAULT 0,
        "available_balance" BIGINT NOT NULL DEFAULT 0,
        "locked_balance" BIGINT NOT NULL DEFAULT 0,
        "blockchain" VARCHAR(20) NOT NULL,
        "on_chain_balance" BIGINT,
        "last_synced_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_balances_user_asset" UNIQUE ("user_id", "asset_id"),
        CONSTRAINT "PK_user_balances" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "transaction_id" VARCHAR(100) NOT NULL,
        "user_id" text NOT NULL,
        "asset_id" uuid NOT NULL,
        "transaction_type" VARCHAR(20) NOT NULL,
        "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "amount" BIGINT NOT NULL,
        "amount_usd" DECIMAL(18,2),
        "blockchain" VARCHAR(20) NOT NULL,
        "transaction_hash" VARCHAR(255),
        "from_address" VARCHAR(255),
        "to_address" VARCHAR(255),
        "block_number" BIGINT,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "confirmed_at" TIMESTAMP,
        "metadata" jsonb,
        CONSTRAINT "UQ_transactions_transaction_id" UNIQUE ("transaction_id"),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "order_book_snapshots" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "asset_id" uuid NOT NULL,
        "best_bid_price" DECIMAL(18,2),
        "best_bid_quantity" BIGINT,
        "best_ask_price" DECIMAL(18,2),
        "best_ask_quantity" BIGINT,
        "last_trade_price" DECIMAL(18,2),
        "volume_24h" BIGINT,
        "high_24h" DECIMAL(18,2),
        "low_24h" DECIMAL(18,2),
        "snapshot_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_book_snapshots" PRIMARY KEY ("id")
      )
    `);

		// Foreign key constraints
		await queryRunner.query(`
      ALTER TABLE "tokenized_assets"
      ADD CONSTRAINT "FK_tokenized_assets_issuer"
      FOREIGN KEY ("issuer_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_user"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_buyer"
      FOREIGN KEY ("buyer_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_seller"
      FOREIGN KEY ("seller_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_buy_order"
      FOREIGN KEY ("buy_order_id") REFERENCES "orders"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_sell_order"
      FOREIGN KEY ("sell_order_id") REFERENCES "orders"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "user_balances"
      ADD CONSTRAINT "FK_user_balances_user"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "user_balances"
      ADD CONSTRAINT "FK_user_balances_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_user"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "order_book_snapshots"
      ADD CONSTRAINT "FK_order_book_snapshots_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		// Indexes
		await queryRunner.query(`CREATE INDEX "idx_assets_asset_id" ON "tokenized_assets"("asset_id")`);
		await queryRunner.query(`CREATE INDEX "idx_assets_status" ON "tokenized_assets"("status")`);
		await queryRunner.query(
			`CREATE INDEX "idx_assets_blockchain" ON "tokenized_assets"("blockchain")`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_assets_contract_address" ON "tokenized_assets"("contract_address")`
		);

		await queryRunner.query(`CREATE INDEX "idx_orders_user_id" ON "orders"("user_id")`);
		await queryRunner.query(`CREATE INDEX "idx_orders_asset_id" ON "orders"("asset_id")`);
		await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders"("order_status")`);
		await queryRunner.query(
			`CREATE INDEX "idx_orders_type_status" ON "orders"("order_type", "order_status")`
		);
		await queryRunner.query(`CREATE INDEX "idx_orders_created_at" ON "orders"("created_at" DESC)`);

		await queryRunner.query(`CREATE INDEX "idx_trades_buyer_id" ON "trades"("buyer_id")`);
		await queryRunner.query(`CREATE INDEX "idx_trades_seller_id" ON "trades"("seller_id")`);
		await queryRunner.query(`CREATE INDEX "idx_trades_asset_id" ON "trades"("asset_id")`);
		await queryRunner.query(
			`CREATE INDEX "idx_trades_executed_at" ON "trades"("executed_at" DESC)`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_trades_transaction_hash" ON "trades"("transaction_hash")`
		);

		await queryRunner.query(`CREATE INDEX "idx_balances_user_id" ON "user_balances"("user_id")`);
		await queryRunner.query(`CREATE INDEX "idx_balances_asset_id" ON "user_balances"("asset_id")`);

		await queryRunner.query(`CREATE INDEX "idx_transactions_user_id" ON "transactions"("user_id")`);
		await queryRunner.query(`CREATE INDEX "idx_transactions_status" ON "transactions"("status")`);
		await queryRunner.query(
			`CREATE INDEX "idx_transactions_type" ON "transactions"("transaction_type")`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_transactions_transaction_hash" ON "transactions"("transaction_hash")`
		);

		await queryRunner.query(
			`CREATE INDEX "idx_orderbook_asset_id" ON "order_book_snapshots"("asset_id")`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_orderbook_snapshot_at" ON "order_book_snapshots"("snapshot_at" DESC)`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_user_last_login ON "session"`);
		await queryRunner.query("DROP FUNCTION IF EXISTS update_user_last_login()");

		// Drop Better Auth-backed domain tables
		await queryRunner.query(`DROP TABLE IF EXISTS "order_book_snapshots" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "transactions" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "user_balances" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "trades" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
		await queryRunner.query(`DROP TABLE IF EXISTS "tokenized_assets" CASCADE`);

		// Restore legacy users table
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) NOT NULL,
        "password_hash" VARCHAR(255),
        "username" VARCHAR(255),
        "firstName" VARCHAR(255),
        "lastName" VARCHAR(255),
        "avatar_id" VARCHAR(255),
        "wallet_address_solana" VARCHAR(44),
        "wallet_address_ethereum" VARCHAR(42),
        "role" VARCHAR(20) NOT NULL DEFAULT 'user',
        "kyc_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_login" TIMESTAMP,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_avatar_id" UNIQUE ("avatar_id"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

		// Restore legacy Better Auth mapping tables
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_oasis_mapping" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL,
        "avatar_id" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_oasis_mapping_user_id" UNIQUE ("user_id"),
        CONSTRAINT "UQ_user_oasis_mapping_avatar_id" UNIQUE ("avatar_id"),
        CONSTRAINT "PK_user_oasis_mapping" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_oasis_mapping_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pangea_user_data" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL,
        "role" VARCHAR(20) NOT NULL DEFAULT 'user',
        "kyc_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_pangea_user_data_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_pangea_user_data" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pangea_user_data_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "idx_user_oasis_mapping_user_id" ON "user_oasis_mapping" ("user_id")`
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "idx_user_oasis_mapping_avatar_id" ON "user_oasis_mapping" ("avatar_id")`
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "idx_pangea_user_data_user_id" ON "pangea_user_data" ("user_id")`
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "idx_pangea_user_data_role" ON "pangea_user_data" ("role")`
		);

		// Restore legacy domain tables referencing users
		await queryRunner.query(`
      CREATE TABLE "tokenized_assets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "asset_id" VARCHAR(100) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "symbol" VARCHAR(20) NOT NULL,
        "description" TEXT,
        "asset_class" VARCHAR(50) NOT NULL,
        "asset_type" VARCHAR(50),
        "total_supply" BIGINT NOT NULL,
        "decimals" INTEGER NOT NULL DEFAULT 0,
        "token_standard" VARCHAR(20),
        "blockchain" VARCHAR(20) NOT NULL,
        "network" VARCHAR(20) NOT NULL DEFAULT 'devnet',
        "contract_address" VARCHAR(255),
        "mint_address" VARCHAR(255),
        "total_value_usd" DECIMAL(18,2),
        "price_per_token_usd" DECIMAL(18,2),
        "metadata_uri" TEXT,
        "image_uri" TEXT,
        "legal_documents_uri" TEXT,
        "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
        "issuer_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "listed_at" TIMESTAMP,
        "metadata" jsonb,
        CONSTRAINT "UQ_tokenized_assets_asset_id" UNIQUE ("asset_id"),
        CONSTRAINT "PK_tokenized_assets" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" VARCHAR(100) NOT NULL,
        "user_id" uuid NOT NULL,
        "asset_id" uuid NOT NULL,
        "order_type" VARCHAR(20) NOT NULL,
        "order_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "price_per_token_usd" DECIMAL(18,2) NOT NULL,
        "quantity" BIGINT NOT NULL,
        "total_value_usd" DECIMAL(18,2) NOT NULL,
        "filled_quantity" BIGINT NOT NULL DEFAULT 0,
        "remaining_quantity" BIGINT NOT NULL,
        "expires_at" TIMESTAMP,
        "blockchain" VARCHAR(20) NOT NULL,
        "transaction_hash" VARCHAR(255),
        "is_market_order" BOOLEAN NOT NULL DEFAULT false,
        "is_limit_order" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "filled_at" TIMESTAMP,
        CONSTRAINT "UQ_orders_order_id" UNIQUE ("order_id"),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "trades" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "trade_id" VARCHAR(100) NOT NULL,
        "buyer_id" uuid NOT NULL,
        "seller_id" uuid NOT NULL,
        "asset_id" uuid NOT NULL,
        "buy_order_id" uuid,
        "sell_order_id" uuid,
        "quantity" BIGINT NOT NULL,
        "price_per_token_usd" DECIMAL(18,2) NOT NULL,
        "total_value_usd" DECIMAL(18,2) NOT NULL,
        "platform_fee_usd" DECIMAL(18,2) NOT NULL DEFAULT 0,
        "platform_fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
        "blockchain" VARCHAR(20) NOT NULL,
        "transaction_hash" VARCHAR(255) NOT NULL,
        "block_number" BIGINT,
        "executed_at" TIMESTAMP NOT NULL DEFAULT now(),
        "confirmed_at" TIMESTAMP,
        "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "settlement_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        CONSTRAINT "UQ_trades_trade_id" UNIQUE ("trade_id"),
        CONSTRAINT "PK_trades" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "user_balances" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "asset_id" uuid NOT NULL,
        "balance" BIGINT NOT NULL DEFAULT 0,
        "available_balance" BIGINT NOT NULL DEFAULT 0,
        "locked_balance" BIGINT NOT NULL DEFAULT 0,
        "blockchain" VARCHAR(20) NOT NULL,
        "on_chain_balance" BIGINT,
        "last_synced_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_balances_user_asset" UNIQUE ("user_id", "asset_id"),
        CONSTRAINT "PK_user_balances" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "transaction_id" VARCHAR(100) NOT NULL,
        "user_id" uuid NOT NULL,
        "asset_id" uuid NOT NULL,
        "transaction_type" VARCHAR(20) NOT NULL,
        "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "amount" BIGINT NOT NULL,
        "amount_usd" DECIMAL(18,2),
        "blockchain" VARCHAR(20) NOT NULL,
        "transaction_hash" VARCHAR(255),
        "from_address" VARCHAR(255),
        "to_address" VARCHAR(255),
        "block_number" BIGINT,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "confirmed_at" TIMESTAMP,
        "metadata" jsonb,
        CONSTRAINT "UQ_transactions_transaction_id" UNIQUE ("transaction_id"),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      CREATE TABLE "order_book_snapshots" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "asset_id" uuid NOT NULL,
        "best_bid_price" DECIMAL(18,2),
        "best_bid_quantity" BIGINT,
        "best_ask_price" DECIMAL(18,2),
        "best_ask_quantity" BIGINT,
        "last_trade_price" DECIMAL(18,2),
        "volume_24h" BIGINT,
        "high_24h" DECIMAL(18,2),
        "low_24h" DECIMAL(18,2),
        "snapshot_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_book_snapshots" PRIMARY KEY ("id")
      )
    `);

		await queryRunner.query(`
      ALTER TABLE "tokenized_assets"
      ADD CONSTRAINT "FK_tokenized_assets_issuer"
      FOREIGN KEY ("issuer_id") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_buyer"
      FOREIGN KEY ("buyer_id") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_seller"
      FOREIGN KEY ("seller_id") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_buy_order"
      FOREIGN KEY ("buy_order_id") REFERENCES "orders"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "trades"
      ADD CONSTRAINT "FK_trades_sell_order"
      FOREIGN KEY ("sell_order_id") REFERENCES "orders"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "user_balances"
      ADD CONSTRAINT "FK_user_balances_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "user_balances"
      ADD CONSTRAINT "FK_user_balances_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`
      ALTER TABLE "order_book_snapshots"
      ADD CONSTRAINT "FK_order_book_snapshots_asset"
      FOREIGN KEY ("asset_id") REFERENCES "tokenized_assets"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

		await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
		await queryRunner.query(
			`CREATE INDEX "idx_users_wallet_solana" ON "users"("wallet_address_solana")`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_users_wallet_ethereum" ON "users"("wallet_address_ethereum")`
		);

		await queryRunner.query(`CREATE INDEX "idx_assets_asset_id" ON "tokenized_assets"("asset_id")`);
		await queryRunner.query(`CREATE INDEX "idx_assets_status" ON "tokenized_assets"("status")`);
		await queryRunner.query(
			`CREATE INDEX "idx_assets_blockchain" ON "tokenized_assets"("blockchain")`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_assets_contract_address" ON "tokenized_assets"("contract_address")`
		);

		await queryRunner.query(`CREATE INDEX "idx_orders_user_id" ON "orders"("user_id")`);
		await queryRunner.query(`CREATE INDEX "idx_orders_asset_id" ON "orders"("asset_id")`);
		await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders"("order_status")`);
		await queryRunner.query(
			`CREATE INDEX "idx_orders_type_status" ON "orders"("order_type", "order_status")`
		);
		await queryRunner.query(`CREATE INDEX "idx_orders_created_at" ON "orders"("created_at" DESC)`);

		await queryRunner.query(`CREATE INDEX "idx_trades_buyer_id" ON "trades"("buyer_id")`);
		await queryRunner.query(`CREATE INDEX "idx_trades_seller_id" ON "trades"("seller_id")`);
		await queryRunner.query(`CREATE INDEX "idx_trades_asset_id" ON "trades"("asset_id")`);
		await queryRunner.query(
			`CREATE INDEX "idx_trades_executed_at" ON "trades"("executed_at" DESC)`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_trades_transaction_hash" ON "trades"("transaction_hash")`
		);

		await queryRunner.query(`CREATE INDEX "idx_balances_user_id" ON "user_balances"("user_id")`);
		await queryRunner.query(`CREATE INDEX "idx_balances_asset_id" ON "user_balances"("asset_id")`);

		await queryRunner.query(`CREATE INDEX "idx_transactions_user_id" ON "transactions"("user_id")`);
		await queryRunner.query(`CREATE INDEX "idx_transactions_status" ON "transactions"("status")`);
		await queryRunner.query(
			`CREATE INDEX "idx_transactions_type" ON "transactions"("transaction_type")`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_transactions_transaction_hash" ON "transactions"("transaction_hash")`
		);

		await queryRunner.query(
			`CREATE INDEX "idx_orderbook_asset_id" ON "order_book_snapshots"("asset_id")`
		);
		await queryRunner.query(
			`CREATE INDEX "idx_orderbook_snapshot_at" ON "order_book_snapshots"("snapshot_at" DESC)`
		);
	}
}
