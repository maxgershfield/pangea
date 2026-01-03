import { ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { CreateAssetDto } from "./create-asset.dto.js";

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
	@ApiPropertyOptional({
		description: "Updated asset name",
		example: "Manhattan Office Tower - Updated",
	})
	@IsString()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({
		description: "Updated asset symbol",
		example: "MOT2",
	})
	@IsString()
	@IsOptional()
	symbol?: string;

	@ApiPropertyOptional({
		description: "Updated description",
		example: "Prime commercial real estate in Manhattan - renovated 2024",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		description: "Updated asset type",
		example: "mixed-use",
	})
	@IsString()
	@IsOptional()
	assetType?: string;

	@ApiPropertyOptional({
		description: "Updated total value in USD",
		example: 55000000,
		minimum: 0,
	})
	@IsNumber()
	@IsOptional()
	@Min(0)
	totalValueUsd?: number;

	@ApiPropertyOptional({
		description: "Updated metadata URI",
		example: "ipfs://QmUpdated123...",
	})
	@IsUrl()
	@IsOptional()
	metadataUri?: string;

	@ApiPropertyOptional({
		description: "Updated image URI",
		example: "https://assets.pangea.markets/images/mot-v2.png",
	})
	@IsUrl()
	@IsOptional()
	imageUri?: string;

	@ApiPropertyOptional({
		description: "Updated legal documents URI",
		example: "https://docs.pangea.markets/legal/mot-v2",
	})
	@IsUrl()
	@IsOptional()
	legalDocumentsUri?: string;

	@ApiPropertyOptional({
		description: "Updated asset status",
		enum: ["draft", "listed", "trading", "closed"],
		example: "trading",
	})
	@IsString()
	@IsOptional()
	status?: string;

	@ApiPropertyOptional({
		description: "Updated metadata",
		example: { investors: 200, closingDate: "2025-06-30" },
	})
	@IsOptional()
	metadata?: Record<string, any>;
}
