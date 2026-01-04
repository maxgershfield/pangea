import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetsModule } from "../assets/assets.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { BetterAuthUser } from "../auth/entities/better-auth-user.entity.js";
import { BlockchainModule } from "../blockchain/blockchain.module.js";
import { TradesModule } from "../trades/trades.module.js";
import { UserBalance } from "../users/entities/user-balance.entity.js";
import { OrdersController } from "./controllers/orders.controller.js";
import { OrderBookSnapshot } from "./entities/order-book-snapshot.entity.js";
import { Order } from "./entities/order.entity.js";
import { OrderMatchingJob } from "./jobs/order-matching.job.js";
import { BalanceService } from "./services/balance.service.js";
import { OrderMatchingService } from "./services/order-matching.service.js";
import { OrdersService } from "./services/orders.service.js";
import { WebSocketService } from "./services/websocket.service.js";

@Module({
	imports: [
		TypeOrmModule.forFeature([Order, OrderBookSnapshot, UserBalance, BetterAuthUser]),
		TradesModule,
		BlockchainModule,
		AssetsModule,
		AuthModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret:
					configService.get<string>("JWT_SECRET") ||
					"YourSuperSecretKeyForJWTTokenGenerationThatShouldBeAtLeast32Characters",
				signOptions: { expiresIn: "7d" },
			}),
		}),
	],
	controllers: [OrdersController],
	providers: [
		OrdersService,
		OrderMatchingService,
		BalanceService,
		WebSocketService,
		OrderMatchingJob,
	],
	exports: [OrdersService, OrderMatchingService, BalanceService, WebSocketService],
})
export class OrdersModule {}
