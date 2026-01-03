import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Trade participant info
 */
export class TradeParticipantDto {
	@ApiProperty({
		description: "User ID",
		example: "550e8400-e29b-41d4-a716-446655440001",
	})
	id: string;

	@ApiProperty({
		description: "User email",
		example: "user@example.com",
	})
	email: string;

	@ApiPropertyOptional({
		description: "Username",
		example: "johndoe",
	})
	username?: string;
}

export class TradeResponseDto {
	@ApiProperty({
		description: "Database UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	id: string;

	@ApiProperty({
		description: "Unique trade identifier",
		example: "TRD-2024-001234",
	})
	tradeId: string;

	@ApiProperty({
		description: "Buyer information",
		type: TradeParticipantDto,
	})
	buyer: TradeParticipantDto;

	@ApiProperty({
		description: "Seller information",
		type: TradeParticipantDto,
	})
	seller: TradeParticipantDto;

	@ApiProperty({
		description: "Asset ID",
		example: "550e8400-e29b-41d4-a716-446655440002",
	})
	assetId: string;

	@ApiPropertyOptional({
		description: "Buy order ID",
		example: "ORD-2024-001234",
	})
	buyOrderId?: string;

	@ApiPropertyOptional({
		description: "Sell order ID",
		example: "ORD-2024-001235",
	})
	sellOrderId?: string;

	@ApiProperty({
		description: "Trade quantity (BigInt as string)",
		example: "100",
	})
	quantity: string;

	@ApiProperty({
		description: "Price per token in USD (Decimal as string)",
		example: "50.25",
	})
	pricePerTokenUsd: string;

	@ApiProperty({
		description: "Total trade value in USD (Decimal as string)",
		example: "5025.00",
	})
	totalValueUsd: string;

	@ApiProperty({
		description: "Platform fee in USD",
		example: "25.13",
	})
	platformFeeUsd: string;

	@ApiProperty({
		description: "Platform fee percentage",
		example: "0.50",
	})
	platformFeePercentage: string;

	@ApiProperty({
		description: "Blockchain network",
		example: "solana",
	})
	blockchain: string;

	@ApiProperty({
		description: "On-chain transaction hash",
		example: "5KtP...xyz",
	})
	transactionHash: string;

	@ApiPropertyOptional({
		description: "Block number",
		example: "12345678",
	})
	blockNumber?: string;

	@ApiProperty({
		description: "Trade execution timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	executedAt: Date;

	@ApiPropertyOptional({
		description: "Trade confirmation timestamp",
		example: "2024-01-15T10:31:00.000Z",
	})
	confirmedAt?: Date;

	@ApiProperty({
		description: "Trade status",
		enum: ["pending", "completed", "failed"],
		example: "completed",
	})
	status: string;

	@ApiProperty({
		description: "Settlement status",
		enum: ["pending", "settled", "failed"],
		example: "settled",
	})
	settlementStatus: string;
}

export class TradeListResponseDto {
	@ApiProperty({
		description: "Array of trades",
		type: [TradeResponseDto],
	})
	items: TradeResponseDto[];

	@ApiProperty({
		description: "Total number of trades matching filters",
		example: 100,
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
		example: 5,
	})
	totalPages: number;
}

export class TradeStatisticsDto {
	@ApiProperty({
		description: "Total number of trades",
		example: 150,
	})
	totalTrades: number;

	@ApiProperty({
		description: "Total trading volume in USD (Decimal as string)",
		example: "1500000.00",
	})
	totalVolume: string;

	@ApiProperty({
		description: "Average trade size in USD (Decimal as string)",
		example: "10000.00",
	})
	averageTradeSize: string;

	@ApiProperty({
		description: "Minimum trade price in USD (Decimal as string)",
		example: "48.00",
	})
	minPrice: string;

	@ApiProperty({
		description: "Maximum trade price in USD (Decimal as string)",
		example: "52.50",
	})
	maxPrice: string;

	@ApiProperty({
		description: "Average trade price in USD (Decimal as string)",
		example: "50.25",
	})
	averagePrice: string;
}
