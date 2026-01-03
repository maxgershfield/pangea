import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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
	@ApiProperty({
		description: "UUID of the asset to trade",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsUUID()
	assetId: string;

	@ApiProperty({
		description: "Order type - buy or sell",
		enum: ["buy", "sell"],
		example: "buy",
	})
	@IsEnum(["buy", "sell"])
	orderType: "buy" | "sell";

	@ApiProperty({
		description: "Price per token in USD",
		example: 100.5,
		minimum: 0.01,
	})
	@IsNumber()
	@Min(0.01)
	@Type(() => Number)
	pricePerTokenUsd: number;

	@ApiProperty({
		description: "Number of tokens to trade",
		example: 10,
		minimum: 1,
	})
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	quantity: number;

	@ApiPropertyOptional({
		description: "Whether this is a market order (executes at best available price)",
		example: false,
		default: false,
	})
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	isMarketOrder?: boolean;

	@ApiPropertyOptional({
		description: "Whether this is a limit order (executes at specified price or better)",
		example: true,
		default: true,
	})
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	isLimitOrder?: boolean;

	@ApiPropertyOptional({
		description: "Order expiration timestamp (ISO 8601 format)",
		example: "2024-12-31T23:59:59.000Z",
	})
	@IsOptional()
	@IsDateString()
	expiresAt?: string;

	@ApiPropertyOptional({
		description: "Blockchain for the order (solana or ethereum)",
		example: "solana",
		enum: ["solana", "ethereum"],
	})
	@IsOptional()
	@IsString()
	blockchain?: string;
}
