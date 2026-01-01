import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AssetsModule } from "./assets/assets.module.js";
import { DatabaseConfig } from "./config/database.config.js";
import { MigrationController } from "./config/migration.controller.js";
import { MigrationRunnerService } from "./config/migration-runner.service.js";
import { RedisModule } from "./config/redis.module.js";
import { OrdersModule } from "./orders/orders.module.js";
import { OasisModule } from "./services/oasis.module.js";
import { SmartContractsModule } from "./smart-contracts/smart-contracts.module.js";
import { TradesModule } from "./trades/trades.module.js";
import { TransactionsModule } from "./transactions/transactions.module.js";
import { WalletModule } from "./wallet/wallet.module.js";

@Module({
	imports: [
		// Configuration module
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),

		// Database module
		TypeOrmModule.forRootAsync({
			useClass: DatabaseConfig,
		}),

		// Redis module
		RedisModule,

		// Schedule module for cron jobs
		ScheduleModule.forRoot(),

		// OASIS services module (global)
		OasisModule,

		// Feature modules
		TradesModule,
		OrdersModule,
		AssetsModule,
		SmartContractsModule,
		TransactionsModule,
		AdminModule,
		WalletModule,
	],
	controllers: [AppController, MigrationController],
	providers: [AppService, MigrationRunnerService],
})
export class AppModule {}
