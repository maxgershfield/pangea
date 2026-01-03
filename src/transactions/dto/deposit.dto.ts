import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class DepositDto {
	@IsUUID()
	assetId: string;

	@IsNumber()
	@Min(0.000_000_01) // Minimum amount
	@Type(() => Number)
	amount: number;

	@IsString()
	blockchain: string; // 'solana' | 'ethereum'

	@IsOptional()
	@IsString()
	fromAddress?: string; // User's wallet address (optional, can be inferred from user)
}
