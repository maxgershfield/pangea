import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenizedAsset } from "../assets/entities/tokenized-asset.entity.js";
import { BetterAuthUser } from "../auth/entities/better-auth-user.entity.js";
import { BlockchainService } from "./services/blockchain.service.js";

@Module({
	imports: [TypeOrmModule.forFeature([BetterAuthUser, TokenizedAsset])],
	providers: [BlockchainService],
	exports: [BlockchainService],
})
export class BlockchainModule {}
