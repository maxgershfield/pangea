import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class OrderFiltersDto {
	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsEnum(["buy", "sell"])
	orderType?: "buy" | "sell";

	@IsOptional()
	@IsUUID()
	assetId?: string;

	@IsOptional()
	@Type(() => Number)
	page?: number;

	@IsOptional()
	@Type(() => Number)
	limit?: number;
}
