import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, IsUUID, Min } from "class-validator";

export class WithdrawalDto {
	@ApiProperty({
		description: "Asset UUID to withdraw",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsUUID()
	assetId: string;

	@ApiProperty({
		description: "Amount to withdraw",
		example: 50.25,
		minimum: 0.000_000_01,
	})
	@IsNumber()
	@Min(0.000_000_01)
	@Type(() => Number)
	amount: number;

	@ApiProperty({
		description: "Destination address - can be either an external wallet address or an avatar ID (UUID). The system automatically detects the address type. For Solana: use base58 address (e.g., '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'). For Ethereum: use hex address with 0x prefix (e.g., '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'). For avatar ID: use UUID format (e.g., '550e8400-e29b-41d4-a716-446655440000').",
		example: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
		examples: {
			solanaAddress: {
				value: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
				description: "Solana wallet address (external)",
			},
			ethereumAddress: {
				value: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
				description: "Ethereum wallet address (external)",
			},
			avatarId: {
				value: "550e8400-e29b-41d4-a716-446655440000",
				description: "Avatar ID (UUID) - OASIS will look up the wallet",
			},
		},
	})
	@IsString()
	toAddress: string;

	@ApiProperty({
		description: "Blockchain network for the withdrawal",
		enum: ["solana", "ethereum"],
		example: "solana",
	})
	@IsString()
	blockchain: string;
}
