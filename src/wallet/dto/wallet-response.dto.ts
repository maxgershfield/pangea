import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Wallet info DTO
 */
export class WalletInfoDto {
	@ApiProperty({
		description: "Wallet UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	walletId: string;

	@ApiProperty({
		description: "Wallet public address",
		example: "5KtP...xyz",
	})
	walletAddress: string;

	@ApiProperty({
		description: "Wallet provider type",
		enum: ["SolanaOASIS", "EthereumOASIS"],
		example: "SolanaOASIS",
	})
	providerType: string;

	@ApiProperty({
		description: "Whether this is the default wallet for the blockchain",
		example: true,
	})
	isDefaultWallet: boolean;

	@ApiPropertyOptional({
		description: "Current balance",
		example: 100.5,
	})
	balance?: number;
}

/**
 * Balance entry DTO
 */
export class BalanceEntryDto {
	@ApiProperty({
		description: "Wallet UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	walletId: string;

	@ApiProperty({
		description: "Wallet public address",
		example: "5KtP...xyz",
	})
	walletAddress: string;

	@ApiProperty({
		description: "Wallet provider type",
		enum: ["SolanaOASIS", "EthereumOASIS"],
		example: "SolanaOASIS",
	})
	providerType: string;

	@ApiProperty({
		description: "Current balance",
		example: 100.5,
	})
	balance: number;

	@ApiPropertyOptional({
		description: "Token symbol",
		example: "SOL",
	})
	tokenSymbol?: string;

	@ApiPropertyOptional({
		description: "Error message if balance fetch failed",
		example: "Network timeout",
	})
	error?: string;
}

/**
 * Get balances response
 */
export class GetBalancesResponseDto {
	@ApiProperty({
		description: "Operation success status",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Array of wallet balances",
		type: [BalanceEntryDto],
	})
	balances: BalanceEntryDto[];

	@ApiProperty({
		description: "Whether user has any wallets",
		example: true,
	})
	hasWallets: boolean;

	@ApiPropertyOptional({
		description: "Info message",
		example: "No wallets found. Generate a wallet first using POST /api/wallet/generate",
	})
	message?: string;
}

/**
 * Get asset balance response
 */
export class GetAssetBalanceResponseDto {
	@ApiProperty({
		description: "Operation success status",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Asset balance details",
	})
	balance: BalanceEntryDto;
}

/**
 * Generate wallet response
 */
export class GenerateWalletResponseDto {
	@ApiProperty({
		description: "Operation success status",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Success message",
		example: "Wallet generated successfully for SolanaOASIS",
	})
	message: string;

	@ApiProperty({
		description: "Generated wallet info",
		type: WalletInfoDto,
	})
	wallet: WalletInfoDto;
}

/**
 * Connected wallet info
 */
export class ConnectedWalletInfoDto {
	@ApiProperty({
		description: "Wallet public address",
		example: "5KtP...xyz",
	})
	address: string;

	@ApiProperty({
		description: "Blockchain network",
		enum: ["solana", "ethereum"],
		example: "solana",
	})
	blockchain: string;
}

/**
 * Connect wallet response
 */
export class ConnectWalletResponseDto {
	@ApiProperty({
		description: "Operation success status",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Success message",
		example: "Wallet connected successfully",
	})
	message: string;

	@ApiProperty({
		description: "Connected wallet info",
		type: ConnectedWalletInfoDto,
	})
	wallet: ConnectedWalletInfoDto;
}

/**
 * Verify wallet response
 */
export class VerifyWalletResponseDto {
	@ApiProperty({
		description: "Operation success status",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Whether wallet ownership was verified",
		example: true,
	})
	verified: boolean;

	@ApiProperty({
		description: "Wallet info",
		type: ConnectedWalletInfoDto,
	})
	wallet: ConnectedWalletInfoDto;
}

/**
 * Sync balances response
 */
export class SyncBalancesResponseDto {
	@ApiProperty({
		description: "Operation success status",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Success message",
		example: "Balances synced successfully",
	})
	message: string;

	@ApiProperty({
		description: "Synced balances",
		type: [BalanceEntryDto],
	})
	balances: BalanceEntryDto[];
}

/**
 * Verification message response
 */
export class VerificationMessageResponseDto {
	@ApiProperty({
		description: "Operation success status",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Message to be signed by the wallet",
		example: "Sign this message to verify your wallet ownership: nonce-12345",
	})
	message: string;
}

/**
 * Wallet transaction entry
 */
export class WalletTransactionDto {
	@ApiProperty({
		description: "Transaction ID",
		example: "TXN-2024-001234",
	})
	transactionId: string;

	@ApiProperty({
		description: "Transaction type",
		enum: ["send", "receive", "swap"],
		example: "receive",
	})
	type: string;

	@ApiProperty({
		description: "Transaction amount",
		example: "100.50",
	})
	amount: string;

	@ApiPropertyOptional({
		description: "Token symbol",
		example: "SOL",
	})
	tokenSymbol?: string;

	@ApiPropertyOptional({
		description: "On-chain transaction hash",
		example: "5KtP...xyz",
	})
	transactionHash?: string;

	@ApiProperty({
		description: "Transaction timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	timestamp: Date;

	@ApiProperty({
		description: "Transaction status",
		enum: ["pending", "confirmed", "failed"],
		example: "confirmed",
	})
	status: string;
}

/**
 * Get wallet transactions response
 */
export class GetWalletTransactionsResponseDto {
	@ApiProperty({
		description: "Operation success status",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Wallet transactions",
		type: [WalletTransactionDto],
	})
	transactions: WalletTransactionDto[];
}
