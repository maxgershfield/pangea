import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Trade } from "./entities/trade.entity.js";
import { TradesController } from "./trades.controller.js";
import { TradesService } from "./trades.service.js";

@Module({
	imports: [TypeOrmModule.forFeature([Trade])],
	controllers: [TradesController],
	providers: [TradesService],
	exports: [TradesService], // Export for use in other modules (e.g., Order Matching)
})
export class TradesModule {}
