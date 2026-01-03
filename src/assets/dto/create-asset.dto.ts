import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	Max,
	Min,
} from "class-validator";

export enum AssetClass {
	REAL_ESTATE = "real_estate",
	ART = "art",
	COMMODITIES = "commodities",
	SECURITIES = "securities",
	OTHER = "other",
}

export enum Blockchain {
	SOLANA = "solana",
	ETHEREUM = "ethereum",
	RADIX = "radix",
}

export enum TokenStandard {
	SPL = "SPL",
	ERC_721 = "ERC-721",
	ERC_1155 = "ERC-1155",
	UAT = "UAT",
}

export class CreateAssetDto {
	@ApiProperty({
		description: "Asset name",
		example: "Manhattan Office Tower",
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: "Asset ticker symbol",
		example: "MOT",
	})
	@IsString()
	@IsNotEmpty()
	symbol: string;

	@ApiPropertyOptional({
		description: "Detailed description of the asset",
		example: "Prime commercial real estate in Manhattan financial district",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({
		description: "Asset classification",
		enum: AssetClass,
		example: AssetClass.REAL_ESTATE,
	})
	@IsEnum(AssetClass)
	assetClass: AssetClass;

	@ApiPropertyOptional({
		description: "Specific asset type within the class",
		example: "commercial",
	})
	@IsString()
	@IsOptional()
	assetType?: string;

	@ApiProperty({
		description: "Total token supply",
		example: 1_000_000,
		minimum: 1,
	})
	@IsNumber()
	@Min(1)
	totalSupply: number;

	@ApiPropertyOptional({
		description: "Token decimal places (0-18)",
		example: 0,
		minimum: 0,
		maximum: 18,
		default: 0,
	})
	@IsNumber()
	@Min(0)
	@Max(18)
	@IsOptional()
	decimals?: number;

	@ApiPropertyOptional({
		description: "Token standard",
		enum: TokenStandard,
		example: TokenStandard.SPL,
	})
	@IsEnum(TokenStandard)
	@IsOptional()
	tokenStandard?: TokenStandard;

	@ApiProperty({
		description: "Blockchain network for the token",
		enum: Blockchain,
		example: Blockchain.SOLANA,
	})
	@IsEnum(Blockchain)
	blockchain: Blockchain;

	@ApiPropertyOptional({
		description: "Network environment",
		example: "devnet",
		enum: ["devnet", "testnet", "mainnet"],
	})
	@IsString()
	@IsOptional()
	network?: string;

	@ApiPropertyOptional({
		description: "Total asset value in USD",
		example: 50_000_000,
		minimum: 0,
	})
	@IsNumber()
	@IsOptional()
	@Min(0)
	totalValueUsd?: number;

	@ApiPropertyOptional({
		description: "IPFS or URL to asset metadata JSON",
		example: "ipfs://QmXyz123...",
	})
	@IsUrl()
	@IsOptional()
	metadataUri?: string;

	@ApiPropertyOptional({
		description: "URL to asset image",
		example: "https://assets.pangea.markets/images/mot.png",
	})
	@IsUrl()
	@IsOptional()
	imageUri?: string;

	@ApiPropertyOptional({
		description: "URL to legal documents",
		example: "https://docs.pangea.markets/legal/mot",
	})
	@IsUrl()
	@IsOptional()
	legalDocumentsUri?: string;

	@ApiPropertyOptional({
		description: "Initial asset status",
		enum: ["draft", "listed", "trading", "closed"],
		example: "draft",
	})
	@IsString()
	@IsOptional()
	status?: string;

	@ApiPropertyOptional({
		description: "Whether to deploy the token contract on creation",
		example: false,
		default: false,
	})
	@IsBoolean()
	@IsOptional()
	deployContract?: boolean;

	@ApiPropertyOptional({
		description: "Wallet address for the asset issuer",
		example: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
	})
	@IsString()
	@IsOptional()
	issuerWallet?: string;

	@ApiPropertyOptional({
		description: "Additional metadata as key-value pairs",
		example: { investors: 150, closingDate: "2024-12-31" },
	})
	@IsOptional()
	metadata?: Record<string, any>;
}
