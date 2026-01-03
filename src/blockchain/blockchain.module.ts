import { Module } from "@nestjs/common";
import { BlockchainService } from "./services/blockchain.service.js";

@Module({
	providers: [BlockchainService],
	exports: [BlockchainService],
})
export class BlockchainModule {}
