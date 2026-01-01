import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartContractsModule } from '../smart-contracts/smart-contracts.module';
import { AssetsController } from './controllers/assets.controller';
import { TokenizedAsset } from './entities/tokenized-asset.entity';
import { AssetsService } from './services/assets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenizedAsset]),
    SmartContractsModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
