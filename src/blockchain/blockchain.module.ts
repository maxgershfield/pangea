import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenizedAsset } from "../assets/entities/tokenized-asset.entity.js";
import { User } from "../users/entities/user.entity.js";
import { BlockchainService } from "./services/blockchain.service.js";

@Module({
	imports: [TypeOrmModule.forFeature([User, TokenizedAsset])],
	providers: [BlockchainService],
	exports: [BlockchainService],
})
export class BlockchainModule {}
