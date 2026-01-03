import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum BlockchainType {
	SOLANA = "solana",
	ETHEREUM = "ethereum",
}

export class VerifyWalletDto {
	@IsString()
	@IsNotEmpty()
	walletAddress: string;

	@IsString()
	@IsNotEmpty()
	signature: string;

	@IsString()
	@IsNotEmpty()
	message: string;

	@IsEnum(BlockchainType)
	@IsNotEmpty()
	blockchain: BlockchainType;
}
