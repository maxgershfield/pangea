import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenizedAsset } from "../assets/entities/tokenized-asset.entity.js";
import { BetterAuthUser } from "../auth/entities/better-auth-user.entity.js";
import { Order } from "../orders/entities/order.entity.js";
import { Trade } from "../trades/entities/trade.entity.js";
import { Transaction } from "../transactions/entities/transaction.entity.js";
import { AdminController } from "./controllers/admin.controller.js";
import { AdminService } from "./services/admin.service.js";
@Module({
	imports: [TypeOrmModule.forFeature([BetterAuthUser, TokenizedAsset, Order, Trade, Transaction])],
	controllers: [AdminController],
	providers: [AdminService],
	exports: [AdminService],
})
export class AdminModule {}
