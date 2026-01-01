import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { CreateAssetDto } from "./create-asset.dto.js";

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	symbol?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsString()
	@IsOptional()
	assetType?: string;

	@IsNumber()
	@IsOptional()
	@Min(0)
	totalValueUsd?: number;

	@IsUrl()
	@IsOptional()
	metadataUri?: string;

	@IsUrl()
	@IsOptional()
	imageUri?: string;

	@IsUrl()
	@IsOptional()
	legalDocumentsUri?: string;

	@IsString()
	@IsOptional()
	status?: string;

	@IsOptional()
	metadata?: Record<string, any>;
}
