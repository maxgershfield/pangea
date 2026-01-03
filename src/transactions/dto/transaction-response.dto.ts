import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Transaction response DTO
 */
export class TransactionResponseDto {
	@ApiProperty({
		description: "Database UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	id: string;

	@ApiProperty({
		description: "Unique transaction identifier",
		example: "TXN-2024-001234",
	})
	transactionId: string;

	@ApiProperty({
		description: "User ID who initiated the transaction",
		example: "550e8400-e29b-41d4-a716-446655440001",
	})
	userId: string;

	@ApiProperty({
		description: "Asset ID being transacted",
		example: "550e8400-e29b-41d4-a716-446655440002",
	})
	assetId: string;

	@ApiProperty({
		description: "Transaction type",
		enum: ["deposit", "withdrawal"],
		example: "deposit",
	})
	transactionType: "deposit" | "withdrawal";

	@ApiProperty({
		description: "Transaction amount",
		example: "100.50",
	})
	amount: string;

	@ApiProperty({
		description: "Current transaction status",
		enum: ["pending", "processing", "completed", "failed"],
		example: "completed",
	})
	status: string;

	@ApiProperty({
		description: "Blockchain network",
		enum: ["solana", "ethereum"],
		example: "solana",
	})
	blockchain: string;

	@ApiPropertyOptional({
		description: "On-chain transaction hash",
		example: "5KtP...xyz",
	})
	transactionHash?: string;

	@ApiPropertyOptional({
		description: "Source wallet address (for deposits)",
		example: "5KtP...abc",
	})
	fromAddress?: string;

	@ApiPropertyOptional({
		description: "Destination wallet address (for withdrawals)",
		example: "5KtP...xyz",
	})
	toAddress?: string;

	@ApiPropertyOptional({
		description: "Transaction fee in USD",
		example: "0.50",
	})
	feeUsd?: string;

	@ApiPropertyOptional({
		description: "Block number when transaction was confirmed",
		example: "12345678",
	})
	blockNumber?: string;

	@ApiProperty({
		description: "Transaction creation timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	createdAt: Date;

	@ApiProperty({
		description: "Last update timestamp",
		example: "2024-01-15T10:31:00.000Z",
	})
	updatedAt: Date;

	@ApiPropertyOptional({
		description: "Transaction completion timestamp",
		example: "2024-01-15T10:32:00.000Z",
	})
	completedAt?: Date;

	@ApiPropertyOptional({
		description: "Error message if transaction failed",
		example: "Insufficient balance",
	})
	errorMessage?: string;
}

/**
 * Paginated transaction list response
 */
export class TransactionListResponseDto {
	@ApiProperty({
		description: "Array of transactions",
		type: [TransactionResponseDto],
	})
	items: TransactionResponseDto[];

	@ApiProperty({
		description: "Total number of transactions matching filters",
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
 * Deposit initiation response
 */
export class DepositResponseDto {
	@ApiProperty({
		description: "Whether the deposit was initiated successfully",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Transaction ID",
		example: "TXN-2024-001234",
	})
	transactionId: string;

	@ApiProperty({
		description: "Deposit address to send funds to",
		example: "5KtP...xyz",
	})
	depositAddress: string;

	@ApiProperty({
		description: "Amount to deposit",
		example: "100.50",
	})
	amount: string;

	@ApiProperty({
		description: "Blockchain network",
		example: "solana",
	})
	blockchain: string;

	@ApiPropertyOptional({
		description: "Deposit instructions or notes",
		example: "Send exactly 100.50 USDC to the address above",
	})
	instructions?: string;

	@ApiProperty({
		description: "Deposit expiration time",
		example: "2024-01-15T11:30:00.000Z",
	})
	expiresAt: Date;
}

/**
 * Withdrawal initiation response
 */
export class WithdrawalResponseDto {
	@ApiProperty({
		description: "Whether the withdrawal was initiated successfully",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Transaction ID",
		example: "TXN-2024-001235",
	})
	transactionId: string;

	@ApiProperty({
		description: "Withdrawal status",
		enum: ["pending", "processing"],
		example: "pending",
	})
	status: string;

	@ApiProperty({
		description: "Amount being withdrawn",
		example: "50.25",
	})
	amount: string;

	@ApiProperty({
		description: "Destination wallet address",
		example: "5KtP...xyz",
	})
	toAddress: string;

	@ApiProperty({
		description: "Blockchain network",
		example: "solana",
	})
	blockchain: string;

	@ApiPropertyOptional({
		description: "Estimated completion time",
		example: "2024-01-15T11:00:00.000Z",
	})
	estimatedCompletionTime?: Date;

	@ApiPropertyOptional({
		description: "Network fee in USD",
		example: "0.25",
	})
	feeUsd?: string;
}

/**
 * Transaction confirmation response (admin)
 */
export class TransactionConfirmResponseDto {
	@ApiProperty({
		description: "Whether the confirmation was successful",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Transaction ID",
		example: "TXN-2024-001234",
	})
	transactionId: string;

	@ApiProperty({
		description: "New transaction status",
		example: "completed",
	})
	status: string;

	@ApiPropertyOptional({
		description: "Confirmation message",
		example: "Transaction confirmed and processed",
	})
	message?: string;
}
