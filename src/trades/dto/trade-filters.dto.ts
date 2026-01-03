import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class TradeFiltersDto {
	@ApiPropertyOptional({
		description: "Filter by asset UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsOptional()
	@IsUUID()
	assetId?: string;

	@ApiPropertyOptional({
		description: "Filter by trade status",
		enum: ["pending", "completed", "failed"],
		example: "completed",
	})
	@IsOptional()
	@IsString()
	status?: string;

	@ApiPropertyOptional({
		description: "Filter by settlement status",
		enum: ["pending", "settled", "failed"],
		example: "settled",
	})
	@IsOptional()
	@IsString()
	settlementStatus?: string;

	@ApiPropertyOptional({
		description: "Filter trades from this date (ISO 8601)",
		example: "2024-01-01T00:00:00.000Z",
	})
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional({
		description: "Filter trades until this date (ISO 8601)",
		example: "2024-12-31T23:59:59.000Z",
	})
	@IsOptional()
	@IsDateString()
	endDate?: string;

	@ApiPropertyOptional({
		description: "Page number for pagination",
		example: 1,
		default: 1,
		minimum: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({
		description: "Number of items per page",
		example: 20,
		default: 20,
		minimum: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 20;
}

export interface TradeFilters {
	assetId?: string;
	status?: string;
	settlementStatus?: string;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}
