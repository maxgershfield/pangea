import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export enum OrderStatus {
	PENDING = "pending",
	OPEN = "open",
	FILLED = "filled",
	PARTIALLY_FILLED = "partially_filled",
	CANCELLED = "cancelled",
}

export enum OrderType {
	BUY = "buy",
	SELL = "sell",
}

export class AdminOrderFiltersDto {
	@IsOptional()
	@IsEnum(OrderStatus)
	orderStatus?: OrderStatus;

	@IsOptional()
	@IsEnum(OrderType)
	orderType?: OrderType;

	@IsOptional()
	@IsString()
	userId?: string;

	@IsOptional()
	@IsUUID()
	assetId?: string;

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
