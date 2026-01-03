import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Request,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator.js";
import { JwksJwtGuard } from "../auth/guards/jwks-jwt.guard.js";
import { OasisLinkService } from "../auth/services/oasis-link.service.js";
import { BalanceSyncService } from "../services/balance-sync.service.js";
import { OasisWalletService } from "../services/oasis-wallet.service.js";
import { WalletConnectionService } from "../services/wallet-connection.service.js";
import { ConnectWalletDto } from "./dto/connect-wallet.dto.js";
import { GenerateWalletDto } from "./dto/generate-wallet.dto.js";
import { VerifyWalletDto } from "./dto/verify-wallet.dto.js";
import {
    ConnectWalletResponseDto,
    GenerateWalletResponseDto,
    GetAssetBalanceResponseDto,
    GetBalancesResponseDto,
    GetWalletTransactionsResponseDto,
    SyncBalancesResponseDto,
    VerificationMessageResponseDto,
    VerifyWalletResponseDto,
} from "./dto/wallet-response.dto.js";

@ApiTags("Wallet")
@ApiBearerAuth()
@Controller("wallet")
@UseGuards(JwksJwtGuard)
export class WalletController {
	constructor(
		private readonly walletConnectionService: WalletConnectionService,
		private readonly oasisWalletService: OasisWalletService,
		private readonly balanceSyncService: BalanceSyncService,
		private readonly oasisLinkService: OasisLinkService
	) {}

	@Get("balance")
	@ApiOperation({
		summary: "Get all wallet balances",
		description: "Retrieve all wallet balances for the authenticated user",
	})
	@ApiResponse({
		status: 200,
		description: "Wallet balances retrieved successfully",
		type: GetBalancesResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async getBalances(@Request() req: any) {
		const userId = req.user?.id;
		const email = req.user?.email;
		const name = req.user?.name;

		if (!(userId && email)) {
			throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED);
		}

		try {
			const avatarId = await this.oasisLinkService.ensureOasisAvatar(
				userId,
				email,
				name || undefined
			);

			const wallets = await this.oasisWalletService.getWallets(avatarId);

			if (!wallets || wallets.length === 0) {
				return {
					success: true,
					balances: [],
					message: "No wallets found. Generate a wallet first using POST /api/wallet/generate",
					hasWallets: false,
				};
			}

			const balances = await Promise.all(
				wallets.map(async (wallet) => {
					try {
						const balance = await this.oasisWalletService.getBalance(
							wallet.walletId,
							wallet.providerType
						);
						return {
							walletId: wallet.walletId,
							walletAddress: wallet.walletAddress,
							providerType: wallet.providerType,
							balance: balance.balance,
							tokenSymbol: balance.tokenSymbol,
						};
					} catch (error) {
						return {
							walletId: wallet.walletId,
							walletAddress: wallet.walletAddress,
							providerType: wallet.providerType,
							balance: 0,
							error: error.message,
						};
					}
				})
			);

			return {
				success: true,
				balances,
				hasWallets: true,
			};
		} catch (error: any) {
			if (error.response?.status === 404 || error.message?.includes("not found")) {
				return {
					success: true,
					balances: [],
					message: "No wallets found. Generate a wallet first using POST /api/wallet/generate",
					hasWallets: false,
				};
			}
			throw new HttpException(
				`Failed to get balances: ${error.message}`,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	@Get("balance/:assetId")
	@ApiOperation({
		summary: "Get asset balance",
		description: "Retrieve balance for a specific asset",
	})
	@ApiParam({
		name: "assetId",
		description: "Asset UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "Asset balance retrieved successfully",
		type: GetAssetBalanceResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 404, description: "Balance not found" })
	async getAssetBalance(@Request() req: any, @Param("assetId") assetId: string) {
		const userId = req.user?.id;
		const email = req.user?.email;
		const name = req.user?.name;

		if (!(userId && email)) {
			throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED);
		}

		const avatarId = await this.oasisLinkService.ensureOasisAvatar(
			userId,
			email,
			name || undefined
		);

		try {
			const providerType =
				assetId.includes("solana") || assetId.includes("SOL") ? "SolanaOASIS" : "EthereumOASIS";

			const balance = await this.balanceSyncService.syncAssetBalance(
				userId,
				avatarId,
				assetId,
				providerType
			);

			if (!balance) {
				throw new HttpException("Balance not found", HttpStatus.NOT_FOUND);
			}

			return {
				success: true,
				balance,
			};
		} catch (error) {
			throw new HttpException(
				`Failed to get asset balance: ${error.message}`,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	@Post("generate")
	@ApiOperation({
		summary: "Generate new wallet",
		description: "Generate a new wallet for the authenticated user's OASIS avatar",
	})
	@ApiResponse({
		status: 201,
		description: "Wallet generated successfully",
		type: GenerateWalletResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 500, description: "Failed to generate wallet" })
	async generateWallet(@Request() req: any, @Body() dto: GenerateWalletDto) {
		const userId = req.user?.id;
		const email = req.user?.email;
		const name = req.user?.name;

		if (!(userId && email)) {
			throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED);
		}

		try {
			const avatarId = await this.oasisLinkService.ensureOasisAvatar(
				userId,
				email,
				name || undefined
			);

			const wallet = await this.oasisWalletService.generateWallet(
				avatarId,
				dto.providerType,
				dto.setAsDefault ?? true
			);

			return {
				success: true,
				message: `Wallet generated successfully for ${dto.providerType}`,
				wallet: {
					walletId: wallet.walletId,
					walletAddress: wallet.walletAddress,
					providerType: wallet.providerType,
					isDefaultWallet: wallet.isDefaultWallet,
					balance: wallet.balance || 0,
				},
			};
		} catch (error: any) {
			throw new HttpException(
				{
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					message: `Failed to generate wallet: ${error.message}. Make sure your avatar exists (register/login first).`,
					error: "Wallet generation failed",
				},
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	@Post("connect")
	@ApiOperation({
		summary: "Connect external wallet",
		description: "Connect an external wallet (Phantom or MetaMask) to the user account",
	})
	@ApiResponse({
		status: 201,
		description: "Wallet connected successfully",
		type: ConnectWalletResponseDto,
	})
	@ApiResponse({ status: 400, description: "Unsupported blockchain or invalid signature" })
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async connectWallet(@Request() req: any, @Body() dto: ConnectWalletDto) {
		const userId = req.user?.id;

		if (!userId) {
			throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED);
		}

		try {
			let result;
			if (dto.blockchain === "solana") {
				result = await this.walletConnectionService.connectPhantom(
					userId,
					dto.walletAddress,
					dto.signature,
					dto.message
				);
			} else if (dto.blockchain === "ethereum") {
				result = await this.walletConnectionService.connectMetaMask(
					userId,
					dto.walletAddress,
					dto.signature,
					dto.message
				);
			} else {
				throw new HttpException(
					`Unsupported blockchain: ${dto.blockchain}`,
					HttpStatus.BAD_REQUEST
				);
			}

			return {
				success: true,
				message: "Wallet connected successfully",
				wallet: {
					address: result.walletAddress,
					blockchain: result.blockchain,
				},
			};
		} catch (error) {
			throw new HttpException(
				`Failed to connect wallet: ${error.message}`,
				error.status || HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	@Post("verify")
	@ApiOperation({
		summary: "Verify wallet ownership",
		description: "Verify ownership of an external wallet by validating a signed message",
	})
	@ApiResponse({
		status: 200,
		description: "Wallet verification result",
		type: VerifyWalletResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async verifyWallet(@Request() req: any, @Body() dto: VerifyWalletDto) {
		const userId = req.user?.id;

		if (!userId) {
			throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED);
		}

		try {
			const result = await this.walletConnectionService.verifyOwnership({
				walletAddress: dto.walletAddress,
				signature: dto.signature,
				message: dto.message,
				blockchain: dto.blockchain,
			});

			return {
				success: true,
				verified: result.isValid,
				wallet: {
					address: result.walletAddress,
					blockchain: result.blockchain,
				},
			};
		} catch (error) {
			throw new HttpException(
				`Failed to verify wallet: ${error.message}`,
				error.status || HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	@Post("sync")
	@ApiOperation({
		summary: "Sync wallet balances",
		description: "Manually trigger balance synchronization for all user wallets",
	})
	@ApiResponse({
		status: 200,
		description: "Balances synced successfully",
		type: SyncBalancesResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async syncBalances(@Request() req: any) {
		const userId = req.user?.id;
		const email = req.user?.email;
		const name = req.user?.name;

		if (!(userId && email)) {
			throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED);
		}

		try {
			const avatarId = await this.oasisLinkService.ensureOasisAvatar(
				userId,
				email,
				name || undefined
			);

			const balances = await this.balanceSyncService.syncUserBalances(userId, avatarId);

			return {
				success: true,
				message: "Balances synced successfully",
				balances,
			};
		} catch (error) {
			throw new HttpException(
				`Failed to sync balances: ${error.message}`,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	@Get("verification-message")
	@ApiOperation({
		summary: "Get verification message",
		description: "Get a message to be signed by the wallet for verification",
	})
	@ApiResponse({
		status: 200,
		description: "Verification message generated",
		type: VerificationMessageResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async getVerificationMessage(
		@Request() req: any,
		@Body() body: { walletAddress: string; blockchain: string }
	) {
		const userId = req.user?.id;

		if (!userId) {
			throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED);
		}

		const message = this.walletConnectionService.generateVerificationMessage(
			userId,
			body.walletAddress,
			body.blockchain
		);

		return {
			success: true,
			message,
		};
	}

	@Get("transactions/:walletId")
	@ApiOperation({
		summary: "Get wallet transactions",
		description: "Retrieve transaction history for a specific wallet",
	})
	@ApiParam({
		name: "walletId",
		description: "Wallet UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "Wallet transactions retrieved successfully",
		type: GetWalletTransactionsResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 404, description: "Wallet not found" })
	async getTransactions(@Request() req: any, @Param("walletId") walletId: string) {
		const userId = req.user?.id;
		const email = req.user?.email;
		const name = req.user?.name;

		if (!(userId && email)) {
			throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED);
		}

		try {
			const avatarId = await this.oasisLinkService.ensureOasisAvatar(
				userId,
				email,
				name || undefined
			);

			const wallets = await this.oasisWalletService.getWallets(avatarId);
			const wallet = wallets.find((w) => w.walletId === walletId);

			if (!wallet) {
				throw new HttpException("Wallet not found", HttpStatus.NOT_FOUND);
			}

			const transactions = await this.oasisWalletService.getTransactions(walletId);

			return {
				success: true,
				transactions,
			};
		} catch (error) {
			throw new HttpException(
				`Failed to get transactions: ${error.message}`,
				error.status || HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	@Public()
	@Post("test/generate")
	@ApiExcludeEndpoint()
	async testGenerateWallet(
		@Body() dto: GenerateWalletDto & { userId: string; email: string; name?: string }
	) {
		const { userId, email, name, providerType, setAsDefault } = dto;

		if (!(userId && email)) {
			throw new HttpException("userId and email are required", HttpStatus.BAD_REQUEST);
		}

		try {
			const avatarId = await this.oasisLinkService.ensureOasisAvatar(userId, email, name);

			const wallet = await this.oasisWalletService.generateWallet(
				avatarId,
				providerType,
				setAsDefault ?? true
			);

			return {
				success: true,
				message: `Wallet generated successfully for ${providerType}`,
				wallet: {
					walletId: wallet.walletId,
					walletAddress: wallet.walletAddress,
					providerType: wallet.providerType,
					isDefaultWallet: wallet.isDefaultWallet,
					balance: wallet.balance || 0,
				},
			};
		} catch (error: any) {
			throw new HttpException(
				{
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					message: `Failed to generate wallet: ${error.message}. Make sure your avatar exists (register/login first).`,
					error: "Wallet generation failed",
				},
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
