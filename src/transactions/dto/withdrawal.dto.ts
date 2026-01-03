import { Type } from "class-transformer";
import { IsNumber, IsString, IsUUID, Min } from "class-validator";

export class WithdrawalDto {
	@IsUUID()
	assetId: string;

	@IsNumber()
	@Min(0.000_000_01) // Minimum amount
	@Type(() => Number)
	amount: number;

	@IsString()
	toAddress: string; // Destination wallet address

	@IsString()
	blockchain: string; // 'solana' | 'ethereum'
}
