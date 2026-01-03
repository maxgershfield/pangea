import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SmartContractsModule } from "../smart-contracts/smart-contracts.module.js";
import { AssetsController } from "./controllers/assets.controller.js";
import { TokenizedAsset } from "./entities/tokenized-asset.entity.js";
import { AssetsService } from "./services/assets.service.js";

@Module({
	imports: [TypeOrmModule.forFeature([TokenizedAsset]), SmartContractsModule],
	controllers: [AssetsController],
	providers: [AssetsService],
	exports: [AssetsService],
})
export class AssetsModule {}
