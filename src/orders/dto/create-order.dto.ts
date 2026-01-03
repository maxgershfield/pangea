import { Type } from "class-transformer";
import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Min,
} from "class-validator";

export class CreateOrderDto {
	@IsUUID()
	assetId: string;

	@IsEnum(["buy", "sell"])
	orderType: "buy" | "sell";

	@IsNumber()
	@Min(0.01)
	@Type(() => Number)
	pricePerTokenUsd: number;

	@IsNumber()
	@Min(1)
	@Type(() => Number)
	quantity: number;

	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	isMarketOrder?: boolean;

	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	isLimitOrder?: boolean;

	@IsOptional()
	@IsDateString()
	expiresAt?: string;

	@IsOptional()
	@IsString()
	blockchain?: string;
}
