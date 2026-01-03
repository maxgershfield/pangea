import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Asset response DTO
 */
export class AssetResponseDto {
	@ApiProperty({
		description: "Database UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	id: string;

	@ApiProperty({
		description: "Unique asset identifier",
		example: "AST-MOT-001",
	})
	assetId: string;

	@ApiProperty({
		description: "Asset name",
		example: "Manhattan Office Tower",
	})
	name: string;

	@ApiProperty({
		description: "Asset ticker symbol",
		example: "MOT",
	})
	symbol: string;

	@ApiPropertyOptional({
		description: "Asset description",
		example: "Prime commercial real estate in Manhattan",
	})
	description?: string;

	@ApiProperty({
		description: "Asset classification",
		example: "real_estate",
	})
	assetClass: string;

	@ApiPropertyOptional({
		description: "Specific asset type",
		example: "commercial",
	})
	assetType?: string;

	@ApiProperty({
		description: "Total token supply",
		example: "1000000",
	})
	totalSupply: string;

	@ApiProperty({
		description: "Token decimals",
		example: 0,
	})
	decimals: number;

	@ApiPropertyOptional({
		description: "Token standard",
		example: "SPL",
	})
	tokenStandard?: string;

	@ApiProperty({
		description: "Blockchain network",
		example: "solana",
	})
	blockchain: string;

	@ApiProperty({
		description: "Network environment",
		example: "devnet",
	})
	network: string;

	@ApiPropertyOptional({
		description: "Smart contract address",
		example: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
	})
	contractAddress?: string;

	@ApiPropertyOptional({
		description: "Solana mint address",
		example: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
	})
	mintAddress?: string;

	@ApiPropertyOptional({
		description: "Total asset value in USD",
		example: "50000000.00",
	})
	totalValueUsd?: string;

	@ApiPropertyOptional({
		description: "Price per token in USD",
		example: "50.00",
	})
	pricePerTokenUsd?: string;

	@ApiPropertyOptional({
		description: "Metadata URI",
		example: "ipfs://QmXyz123...",
	})
	metadataUri?: string;

	@ApiPropertyOptional({
		description: "Image URI",
		example: "https://assets.pangea.markets/images/mot.png",
	})
	imageUri?: string;

	@ApiPropertyOptional({
		description: "Legal documents URI",
		example: "https://docs.pangea.markets/legal/mot",
	})
	legalDocumentsUri?: string;

	@ApiProperty({
		description: "Asset status",
		enum: ["draft", "listed", "trading", "closed"],
		example: "trading",
	})
	status: string;

	@ApiProperty({
		description: "Issuer user ID",
		example: "550e8400-e29b-41d4-a716-446655440001",
	})
	issuerId: string;

	@ApiProperty({
		description: "Creation timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	createdAt: Date;

	@ApiProperty({
		description: "Last update timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	updatedAt: Date;

	@ApiPropertyOptional({
		description: "Listing timestamp",
		example: "2024-01-16T09:00:00.000Z",
	})
	listedAt?: Date;

	@ApiPropertyOptional({
		description: "Additional metadata",
		example: { change24h: 2.5, volume: 150_000, sparkline: [48, 49, 50, 49.5, 50] },
	})
	metadata?: Record<string, any>;
}

/**
 * Paginated asset list response
 */
export class AssetListResponseDto {
	@ApiProperty({
		description: "Array of assets",
		type: [AssetResponseDto],
	})
	items: AssetResponseDto[];

	@ApiProperty({
		description: "Total number of assets matching filters",
		example: 50,
	})
	total: number;

	@ApiProperty({
		description: "Current page number",
		example: 1,
	})
	page: number;

	@ApiProperty({
		description: "Items per page",
		example: 20,
	})
	limit: number;

	@ApiProperty({
		description: "Total number of pages",
		example: 3,
	})
	totalPages: number;
}

/**
 * Order book entry
 */
export class OrderBookEntryDto {
	@ApiProperty({
		description: "Price level",
		example: "50.00",
	})
	price: string;

	@ApiProperty({
		description: "Total quantity at this price",
		example: "1000",
	})
	quantity: string;

	@ApiProperty({
		description: "Number of orders at this price",
		example: 5,
	})
	count: number;
}

/**
 * Order book response
 */
export class OrderBookResponseDto {
	@ApiProperty({
		description: "Asset ID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	assetId: string;

	@ApiProperty({
		description: "Buy orders (bids)",
		type: [OrderBookEntryDto],
	})
	bids: OrderBookEntryDto[];

	@ApiProperty({
		description: "Sell orders (asks)",
		type: [OrderBookEntryDto],
	})
	asks: OrderBookEntryDto[];

	@ApiPropertyOptional({
		description: "Mid-market price",
		example: "50.25",
	})
	midPrice?: string;

	@ApiPropertyOptional({
		description: "Bid-ask spread",
		example: "0.50",
	})
	spread?: string;

	@ApiProperty({
		description: "Timestamp of the order book snapshot",
		example: "2024-01-15T10:30:00.000Z",
	})
	timestamp: Date;
}

/**
 * Asset price response
 */
export class AssetPriceResponseDto {
	@ApiProperty({
		description: "Asset ID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	assetId: string;

	@ApiProperty({
		description: "Current price in USD",
		example: "50.25",
	})
	price: string;

	@ApiPropertyOptional({
		description: "24-hour price change percentage",
		example: 2.5,
	})
	change24h?: number;

	@ApiProperty({
		description: "Price timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	timestamp: Date;
}

/**
 * Trade history entry for asset
 */
export class AssetTradeEntryDto {
	@ApiProperty({
		description: "Trade ID",
		example: "TRD-2024-001234",
	})
	tradeId: string;

	@ApiProperty({
		description: "Trade price",
		example: "50.00",
	})
	price: string;

	@ApiProperty({
		description: "Trade quantity",
		example: "100",
	})
	quantity: string;

	@ApiProperty({
		description: "Trade type (buy/sell from taker perspective)",
		enum: ["buy", "sell"],
		example: "buy",
	})
	side: string;

	@ApiProperty({
		description: "Trade execution timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	executedAt: Date;
}
