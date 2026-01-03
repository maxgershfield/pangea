import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Order response DTO
 */
export class OrderResponseDto {
	@ApiProperty({
		description: "Database UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	id: string;

	@ApiProperty({
		description: "Unique order identifier",
		example: "ORD-2024-001234",
	})
	orderId: string;

	@ApiProperty({
		description: "User ID who placed the order",
		example: "550e8400-e29b-41d4-a716-446655440001",
	})
	userId: string;

	@ApiProperty({
		description: "Asset ID being traded",
		example: "550e8400-e29b-41d4-a716-446655440002",
	})
	assetId: string;

	@ApiProperty({
		description: "Order type",
		enum: ["buy", "sell"],
		example: "buy",
	})
	orderType: "buy" | "sell";

	@ApiProperty({
		description: "Current order status",
		enum: ["pending", "open", "filled", "partially_filled", "cancelled"],
		example: "open",
	})
	orderStatus: string;

	@ApiProperty({
		description: "Price per token in USD",
		example: "100.50",
	})
	pricePerTokenUsd: string;

	@ApiProperty({
		description: "Total quantity ordered",
		example: "100",
	})
	quantity: string;

	@ApiProperty({
		description: "Quantity that has been filled",
		example: "25",
	})
	filledQuantity: string;

	@ApiProperty({
		description: "Remaining quantity to be filled",
		example: "75",
	})
	remainingQuantity: string;

	@ApiProperty({
		description: "Total order value in USD",
		example: "10050.00",
	})
	totalValueUsd: string;

	@ApiPropertyOptional({
		description: "Order expiration timestamp",
		example: "2024-12-31T23:59:59.000Z",
	})
	expiresAt?: Date;

	@ApiProperty({
		description: "Blockchain for the order",
		example: "solana",
	})
	blockchain: string;

	@ApiPropertyOptional({
		description: "Transaction hash if submitted on-chain",
		example: "5KtP...xyz",
	})
	transactionHash?: string;

	@ApiProperty({
		description: "Whether this is a market order",
		example: false,
	})
	isMarketOrder: boolean;

	@ApiProperty({
		description: "Whether this is a limit order",
		example: true,
	})
	isLimitOrder: boolean;

	@ApiProperty({
		description: "Order creation timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	createdAt: Date;

	@ApiProperty({
		description: "Last update timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	updatedAt: Date;

	@ApiPropertyOptional({
		description: "Timestamp when order was fully filled",
		example: "2024-01-15T11:00:00.000Z",
	})
	filledAt?: Date;
}

/**
 * Paginated order list response
 */
export class OrderListResponseDto {
	@ApiProperty({
		description: "Array of orders",
		type: [OrderResponseDto],
	})
	items: OrderResponseDto[];

	@ApiProperty({
		description: "Total number of orders matching filters",
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

/**
 * Simple success response for order operations
 */
export class OrderSuccessResponseDto {
	@ApiProperty({
		description: "Whether the operation was successful",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Result message",
		example: "Order cancelled successfully",
	})
	message: string;

	@ApiPropertyOptional({
		description: "Order ID if applicable",
		example: "ORD-2024-001234",
	})
	orderId?: string;
}
