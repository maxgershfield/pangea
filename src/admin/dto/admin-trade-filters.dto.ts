import { Type } from "class-transformer";
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from "class-validator";

export enum TradeStatus {
	PENDING = "pending",
	CONFIRMED = "confirmed",
	SETTLED = "settled",
	FAILED = "failed",
}

export class AdminTradeFiltersDto {
	@IsOptional()
	@IsEnum(TradeStatus)
	status?: TradeStatus;

	@IsOptional()
	@IsUUID()
	assetId?: string;

	@IsOptional()
	@IsString()
	buyerId?: string;

	@IsOptional()
	@IsString()
	sellerId?: string;

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
