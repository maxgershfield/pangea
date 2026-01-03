import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Min } from "class-validator";

export enum TransactionType {
	DEPOSIT = "deposit",
	WITHDRAWAL = "withdrawal",
}

export enum TransactionStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
}

export class AdminTransactionFiltersDto {
	@IsOptional()
	@IsEnum(TransactionType)
	transactionType?: TransactionType;

	@IsOptional()
	@IsEnum(TransactionStatus)
	status?: TransactionStatus;

	@IsOptional()
	@IsUUID()
	userId?: string;

	@IsOptional()
	@IsUUID()
	assetId?: string;

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
