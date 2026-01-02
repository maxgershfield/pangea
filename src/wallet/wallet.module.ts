import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { BalanceSyncService } from "../services/balance-sync.service.js";
import { WalletConnectionService } from "../services/wallet-connection.service.js";
import { WalletController } from "./wallet.controller.js";
// OasisWalletService is provided by OasisModule (global)

@Module({
	imports: [AuthModule], // For JwksJwtGuard
	controllers: [WalletController],
	providers: [WalletConnectionService, BalanceSyncService],
	exports: [WalletConnectionService, BalanceSyncService],
})
export class WalletModule {}
