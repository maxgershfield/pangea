import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { AssetClass, Blockchain } from "./create-asset.dto.js";

export class FindAssetsDto {
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

	@ApiPropertyOptional({
		description: "Filter by asset status",
		enum: ["draft", "listed", "trading", "closed"],
		example: "trading",
	})
	@IsOptional()
	@IsString()
	status?: string;

	@ApiPropertyOptional({
		description: "Filter by asset class",
		enum: AssetClass,
		example: AssetClass.REAL_ESTATE,
	})
	@IsOptional()
	@IsEnum(AssetClass)
	assetClass?: AssetClass;

	@ApiPropertyOptional({
		description: "Filter by blockchain",
		enum: Blockchain,
		example: Blockchain.SOLANA,
	})
	@IsOptional()
	@IsEnum(Blockchain)
	blockchain?: Blockchain;
}
