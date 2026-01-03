import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class DepositDto {
	@ApiProperty({
		description: "Asset UUID to deposit",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsUUID()
	assetId: string;

	@ApiProperty({
		description: "Amount to deposit",
		example: 100.5,
		minimum: 0.00000001,
	})
	@IsNumber()
	@Min(0.000_000_01)
	@Type(() => Number)
	amount: number;

	@ApiProperty({
		description: "Blockchain network for the deposit",
		enum: ["solana", "ethereum"],
		example: "solana",
	})
	@IsString()
	blockchain: string;

	@ApiPropertyOptional({
		description: "Source wallet address (optional, can be inferred from user)",
		example: "5KtP...xyz",
	})
	@IsOptional()
	@IsString()
	fromAddress?: string;
}
