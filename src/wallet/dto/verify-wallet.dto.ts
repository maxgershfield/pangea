import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum BlockchainType {
	SOLANA = "solana",
	ETHEREUM = "ethereum",
}

export class VerifyWalletDto {
	@ApiProperty({
		description: "Wallet public address to verify",
		example: "5KtP...xyz",
	})
	@IsString()
	@IsNotEmpty()
	walletAddress: string;

	@ApiProperty({
		description: "Signed message signature from the wallet",
		example: "0x...",
	})
	@IsString()
	@IsNotEmpty()
	signature: string;

	@ApiProperty({
		description: "Original message that was signed",
		example: "Sign this message to verify your wallet ownership",
	})
	@IsString()
	@IsNotEmpty()
	message: string;

	@ApiProperty({
		description: "Blockchain network",
		enum: BlockchainType,
		example: BlockchainType.SOLANA,
	})
	@IsEnum(BlockchainType)
	@IsNotEmpty()
	blockchain: BlockchainType;
}
