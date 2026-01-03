import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class TransactionFiltersDto {
	@IsOptional()
	@IsUUID()
	assetId?: string;

	@IsOptional()
	@IsEnum(["deposit", "withdrawal"])
	transactionType?: "deposit" | "withdrawal";

	@IsOptional()
	@IsString()
	status?: string; // 'pending', 'processing', 'completed', 'failed'

	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 20;
}

export interface TransactionFilters {
	assetId?: string;
	transactionType?: "deposit" | "withdrawal";
	status?: string;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}
