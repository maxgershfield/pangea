import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradesController } from './trades.controller.js';
import { TradesService } from './trades.service.js';
import { Trade } from './entities/trade.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Trade])],
  controllers: [TradesController],
  providers: [TradesService],
  exports: [TradesService], // Export for use in other modules (e.g., Order Matching)
})
export class TradesModule {}








