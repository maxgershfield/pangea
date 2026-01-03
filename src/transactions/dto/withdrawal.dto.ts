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
		minimum: 0.00000001,
	})
	@IsNumber()
	@Min(0.000_000_01)
	@Type(() => Number)
	amount: number;

	@ApiProperty({
		description: "Destination wallet address",
		example: "5KtP...xyz",
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
