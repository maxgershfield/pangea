import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateOrderDto {
	@ApiPropertyOptional({
		description: "Updated price per token in USD",
		example: 105.0,
		minimum: 0.01,
	})
	@IsOptional()
	@IsNumber()
	@Min(0.01)
	@Type(() => Number)
	pricePerTokenUsd?: number;

	@ApiPropertyOptional({
		description: "Updated quantity of tokens",
		example: 15,
		minimum: 1,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	quantity?: number;

	@ApiPropertyOptional({
		description: "Updated expiration timestamp (ISO 8601 format)",
		example: "2024-12-31T23:59:59.000Z",
	})
	@IsOptional()
	@IsDateString()
	expiresAt?: string;
}
