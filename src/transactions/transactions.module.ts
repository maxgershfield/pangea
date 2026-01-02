import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity.js';
import { TokenizedAsset } from '../assets/entities/tokenized-asset.entity.js';
import { User } from '../users/entities/user.entity.js';
import { TransactionsController } from './controllers/transactions.controller.js';
import { TransactionsService } from './services/transactions.service.js';
import { VaultService } from './services/vault.service.js';
import { DepositMonitoringJob } from './jobs/deposit-monitoring.job.js';
import { OrdersModule } from '../orders/orders.module.js';
import { BlockchainModule } from '../blockchain/blockchain.module.js';
import { AssetsModule } from '../assets/assets.module.js';
import { SmartContractsModule } from '../smart-contracts/smart-contracts.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TokenizedAsset, User]),
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








