import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Wallet information DTO
 * 
 * Contains essential information about a blockchain wallet linked to an OASIS avatar.
 * Used in wallet generation and retrieval responses.
 */
export class WalletInfoDto {
	@ApiProperty({
		description: "Unique identifier for the wallet in the OASIS system. This ID is used for subsequent wallet operations such as checking balance or retrieving transactions.",
		example: "550e8400-e29b-41d4-a716-446655440000",
		format: "uuid",
	})
	walletId: string;

	@ApiProperty({
		description:
			"Public blockchain address for the wallet. This is the address where funds can be sent. " +
			"Format depends on the blockchain: Solana addresses are base58-encoded strings, " +
			"Ethereum addresses are hex strings starting with 0x.",
		example: "5KtP...xyz",
		examples: {
			solana: {
				value: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
				description: "Solana wallet address (base58 format)",
			},
			ethereum: {
				value: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
				description: "Ethereum wallet address (hex format with 0x prefix)",
			},
		},
	})
	walletAddress: string;

	@ApiProperty({
		description: "Blockchain provider type that this wallet belongs to. Determines which blockchain network the wallet operates on.",
		enum: ["SolanaOASIS", "EthereumOASIS"],
		example: "SolanaOASIS",
		enumName: "WalletProviderType",
	})
	providerType: string;

	@ApiProperty({
		description:
			"Indicates whether this wallet is set as the default wallet for its blockchain provider. " +
			"The default wallet is used when no specific wallet is specified for transactions.",
		example: true,
		type: Boolean,
	})
	isDefaultWallet: boolean;

	@ApiPropertyOptional({
		description:
			"Current balance of the wallet in the native blockchain token (e.g., SOL for Solana, ETH for Ethereum). " +
			"This value may be 0 for newly generated wallets. Use GET /api/wallet/balance to refresh the balance.",
		example: 100.5,
		type: Number,
		minimum: 0,
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
 * Response DTO for wallet generation
 * 
 * Returned when a new wallet is successfully generated via POST /api/wallet/generate.
 * Contains the generated wallet information including ID, address, provider type, and default status.
 */
export class GenerateWalletResponseDto {
	@ApiProperty({
		description: "Indicates whether the wallet generation operation was successful",
		example: true,
		type: Boolean,
	})
	success: boolean;

	@ApiProperty({
		description: "Human-readable success message describing the operation result",
		example: "Wallet generated successfully for SolanaOASIS",
		examples: {
			solana: {
				value: "Wallet generated successfully for SolanaOASIS",
				description: "Success message for Solana wallet generation",
			},
			ethereum: {
				value: "Wallet generated successfully for EthereumOASIS",
				description: "Success message for Ethereum wallet generation",
			},
		},
	})
	message: string;

	@ApiProperty({
		description: "Detailed information about the generated wallet, including ID, address, provider type, default status, and initial balance",
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
