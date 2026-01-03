import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateOrderDto {
	@IsOptional()
	@IsNumber()
	@Min(0.01)
	@Type(() => Number)
	pricePerTokenUsd?: number;

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	quantity?: number;

	@IsOptional()
	@IsDateString()
	expiresAt?: string;
}
