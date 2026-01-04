import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OasisWalletService } from "../../services/oasis-wallet.service.js";
import { User } from "../../users/entities/user.entity.js";
import { UserBalance } from "../../users/entities/user-balance.entity.js";

@Injectable()
export class BalanceService {
	private readonly logger = new Logger(BalanceService.name);

	constructor(
		@InjectRepository(UserBalance)
		private readonly balanceRepository: Repository<UserBalance>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly oasisWalletService: OasisWalletService
	) {}

	/**
	 * Get balance for a user and asset
	 */
	async getBalance(userId: string, assetId: string): Promise<UserBalance> {
		const balance = await this.balanceRepository.findOne({
			where: { userId, assetId },
		});

		if (!balance) {
			// Create a new balance record if it doesn't exist
			const newBalance = this.balanceRepository.create({
				userId,
				assetId,
				balance: BigInt(0),
				availableBalance: BigInt(0),
				lockedBalance: BigInt(0),
				blockchain: "solana",
			});
			return await this.balanceRepository.save(newBalance);
		}

		return balance;
	}

	/**
	 * Lock balance for an order (for sell orders)
	 */
	async lockBalance(userId: string, assetId: string, quantity: bigint): Promise<void> {
		this.logger.log(`Locking balance: user ${userId}, asset ${assetId}, quantity ${quantity}`);

		// TODO: Implement actual database update when UserBalance entity is available
		// const balance = await this.getBalance(userId, assetId);
		//
		// if (balance.availableBalance < quantity) {
		//   throw new BadRequestException('Insufficient available balance');
		// }
		//
		// balance.availableBalance -= quantity;
		// balance.lockedBalance += quantity;
		//
		// await this.balanceRepository.save(balance);
	}

	/**
	 * Unlock balance (when order is cancelled or filled)
	 */
	async unlockBalance(userId: string, assetId: string, quantity: bigint): Promise<void> {
		this.logger.log(`Unlocking balance: user ${userId}, asset ${assetId}, quantity ${quantity}`);

		const balance = await this.getBalance(userId, assetId);

		if (balance.lockedBalance < quantity) {
			this.logger.warn(
				`Attempted to unlock ${quantity} but only ${balance.lockedBalance} is locked. Unlocking available amount.`
			);
			quantity = balance.lockedBalance;
		}

		balance.availableBalance += quantity;
		balance.lockedBalance -= quantity;

		await this.balanceRepository.save(balance);
	}

	/**
	 * Transfer tokens from seller to buyer
	 */
	async transfer(
		fromUserId: string,
		toUserId: string,
		assetId: string,
		quantity: bigint
	): Promise<void> {
		this.logger.log(
			`Transferring ${quantity} of asset ${assetId} from ${fromUserId} to ${toUserId}`
		);

		const fromBalance = await this.getBalance(fromUserId, assetId);
		const toBalance = await this.getBalance(toUserId, assetId);

		// Use lockedBalance for transfer (it's coming from an order)
		if (fromBalance.lockedBalance < quantity) {
			throw new BadRequestException("Insufficient locked balance for transfer");
		}

		// Deduct from seller (unlock and remove from balance)
		fromBalance.balance -= quantity;
		fromBalance.lockedBalance -= quantity;

		// Add to buyer
		toBalance.balance += quantity;
		toBalance.availableBalance += quantity;

		await this.balanceRepository.save([fromBalance, toBalance]);
	}

	/**
	 * Get payment token balance (SOL, ETH) for a user from OASIS API
	 *
	 * @description
	 * Retrieves the payment token balance (native blockchain tokens) for a user from the OASIS API.
	 * This method is used internally for order validation to check if users have sufficient funds
	 * to place buy orders. The balance is returned in the smallest unit (lamports for Solana,
	 * wei for Ethereum) as a BigInt for precision with large numbers.
	 *
	 * @param {string} userId - The UUID of the user whose balance to retrieve
	 * @param {string} blockchain - The blockchain type: "solana" or "ethereum"
	 *
	 * @returns {Promise<bigint>} The payment token balance in smallest units:
	 *   - Solana: Balance in lamports (1 SOL = 1e9 lamports)
	 *   - Ethereum: Balance in wei (1 ETH = 1e18 wei)
	 *   - Returns BigInt(0) if user not found, missing avatarId, missing wallet, or on error
	 *
	 * @example
	 * ```typescript
	 * // Get Solana balance
	 * const solBalance = await balanceService.getPaymentTokenBalance(userId, "solana");
	 * // Returns: BigInt(1000000000) // 1 SOL in lamports
	 *
	 * // Convert to SOL for display
	 * const solInTokens = Number(solBalance) / 1e9; // 1.0 SOL
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Get Ethereum balance
	 * const ethBalance = await balanceService.getPaymentTokenBalance(userId, "ethereum");
	 * // Returns: BigInt(2000000000000000000) // 2 ETH in wei
	 *
	 * // Convert to ETH for display
	 * const ethInTokens = Number(ethBalance) / 1e18; // 2.0 ETH
	 * ```
	 *
	 * @throws {Error} Logs errors but returns BigInt(0) to allow order creation to continue
	 *
	 * @see {@link OasisWalletService.getWallets} - Retrieves wallets for the avatar
	 * @see {@link OasisWalletService.getBalance} - Retrieves balance from OASIS API
	 * @see {@link OrdersService.validateOrder} - Uses this method for buy order validation
	 * @see {@link OrderMatchingService.validateBalances} - Uses this method for trade validation
	 *
	 * @since 1.0.0
	 * @category Payment
	 * @tag Balance
	 * @tag OASIS
	 */
	async getPaymentTokenBalance(userId: string, blockchain: string): Promise<bigint> {
		this.logger.log(`Getting payment token balance for user ${userId} on ${blockchain}`);

		try {
			// 1. Get user entity
			const user = await this.userRepository.findOne({ where: { id: userId } });
			if (!user?.avatarId) {
				this.logger.warn(
					`User ${userId} not found or missing avatarId. Returning 0 balance.`
				);
				return BigInt(0);
			}

		// 2. Get provider type
		const providerType = blockchain === "solana" ? "SolanaOASIS" : "EthereumOASIS";

		// 3. Get wallets for the specific provider type
		const wallets = await this.oasisWalletService.getWallets(user.avatarId, providerType);
		const wallet = wallets.find((w) => w.isDefaultWallet) || wallets[0];
		if (!wallet) {
			this.logger.warn(
				`User ${userId} missing ${providerType} wallet. Returning 0 balance.`
			);
			return BigInt(0);
		}

			// 4. Get balance from OASIS
			const balance = await this.oasisWalletService.getBalance(
				wallet.walletId,
				providerType
			);

			// 5. Convert to BigInt (assuming balance is in native token units)
			// For Solana: balance is in lamports (1 SOL = 1e9 lamports)
			// For Ethereum: balance is in wei (1 ETH = 1e18 wei)
			const decimals = blockchain === "solana" ? 9 : 18;
			const balanceBigInt = BigInt(Math.floor(balance.balance * 10 ** decimals));

			return balanceBigInt;
		} catch (error) {
			this.logger.error(
				`Failed to get payment token balance: ${error.message}`,
				error.stack
			);
			// Return 0 on error to allow order creation (can be refined later)
			return BigInt(0);
		}
	}

	/**
	 * Add balance to user (for deposits)
	 */
	async addBalance(userId: string, assetId: string, amount: bigint): Promise<void> {
		this.logger.log(`Adding balance: user ${userId}, asset ${assetId}, amount ${amount}`);

		const balance = await this.getBalance(userId, assetId);
		balance.balance += amount;
		balance.availableBalance += amount;

		await this.balanceRepository.save(balance);
	}

	/**
	 * Subtract balance from user (for withdrawals)
	 */
	async subtractBalance(userId: string, assetId: string, amount: bigint): Promise<void> {
		this.logger.log(`Subtracting balance: user ${userId}, asset ${assetId}, amount ${amount}`);

		const balance = await this.getBalance(userId, assetId);

		if (balance.availableBalance < amount) {
			throw new BadRequestException("Insufficient available balance");
		}

		balance.balance -= amount;
		balance.availableBalance -= amount;

		await this.balanceRepository.save(balance);
	}
}
