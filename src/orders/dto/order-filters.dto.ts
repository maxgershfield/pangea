import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class OrderFiltersDto {
	@ApiPropertyOptional({
		description: "Filter by order status",
		enum: ["pending", "open", "filled", "partially_filled", "cancelled"],
		example: "open",
	})
	@IsOptional()
	@IsString()
	status?: string;

	@ApiPropertyOptional({
		description: "Filter by order type",
		enum: ["buy", "sell"],
		example: "buy",
	})
	@IsOptional()
	@IsEnum(["buy", "sell"])
	orderType?: "buy" | "sell";

	@ApiPropertyOptional({
		description: "Filter by asset UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsOptional()
	@IsUUID()
	assetId?: string;

	@ApiPropertyOptional({
		description: "Page number for pagination",
		example: 1,
		default: 1,
		minimum: 1,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page?: number;

	@ApiPropertyOptional({
		description: "Number of items per page",
		example: 20,
		default: 20,
		minimum: 1,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	limit?: number;
}
