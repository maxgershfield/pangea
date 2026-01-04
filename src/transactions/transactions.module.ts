import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetsModule } from "../assets/assets.module.js";
import { TokenizedAsset } from "../assets/entities/tokenized-asset.entity.js";
import { BetterAuthUser } from "../auth/entities/better-auth-user.entity.js";
import { BlockchainModule } from "../blockchain/blockchain.module.js";
import { OrdersModule } from "../orders/orders.module.js";
import { SmartContractsModule } from "../smart-contracts/smart-contracts.module.js";
import { TransactionsController } from "./controllers/transactions.controller.js";
import { Transaction } from "./entities/transaction.entity.js";
import { DepositMonitoringJob } from "./jobs/deposit-monitoring.job.js";
import { TransactionsService } from "./services/transactions.service.js";
import { VaultService } from "./services/vault.service.js";

@Module({
	imports: [
		TypeOrmModule.forFeature([Transaction, TokenizedAsset, BetterAuthUser]),
		OrdersModule, // For BalanceService
		BlockchainModule, // For BlockchainService
		AssetsModule, // For TokenizedAsset repository access
		SmartContractsModule, // For SmartContractService (used by VaultService)
	],
	controllers: [TransactionsController],
	providers: [
		TransactionsService,
		VaultService,
		DepositMonitoringJob,
		// OasisWalletService is provided by OasisModule (global)
	],
	exports: [TransactionsService, VaultService],
})
export class TransactionsModule {}
