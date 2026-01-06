import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OasisWalletService } from "../../services/oasis-wallet.service.js";
import { TokenizedAsset as TokenizedAssetEntity } from "../../assets/entities/tokenized-asset.entity.js";
import { User } from "../../users/entities/user.entity.js";

// Placeholder interface for TokenizedAsset (kept for backward compatibility)
export interface TokenizedAsset {
	id: string;
	symbol?: string;
	contractAddress?: string;
	mintAddress?: string;
	blockchain: string;
}

export interface ExecuteTradeParams {
	buyer: User;
	seller: User;
	asset: TokenizedAsset;
	quantity: number;
	price: number;
}

@Injectable()
export class BlockchainService {
	private readonly logger = new Logger(BlockchainService.name);

	constructor(
		private readonly oasisWalletService: OasisWalletService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(TokenizedAssetEntity)
		private readonly assetRepository: Repository<TokenizedAssetEntity>
	) {}

	/**
	 * Execute a trade on the blockchain
	 * This will call the smart contract to transfer tokens and payment
	 */
	async executeTrade(params: ExecuteTradeParams): Promise<string> {
		const { buyer, seller, asset, quantity, price } = params;

		this.logger.log(
			`Executing trade: ${asset.id}, quantity ${quantity}, price ${price}`
		);

		try {
			// 1. Get OASIS avatar IDs for buyer and seller
			const buyerAvatarId = buyer.avatarId;
			const sellerAvatarId = seller.avatarId;

			if (!(buyerAvatarId && sellerAvatarId)) {
				throw new Error(
					`Buyer or seller missing avatarId. Buyer: ${buyerAvatarId}, Seller: ${sellerAvatarId}`
				);
			}

			// 2. Determine provider type from asset blockchain
			const providerType =
				asset.blockchain === "solana" ? "SolanaOASIS" : "EthereumOASIS";

			// 3. Get default wallets for buyer and seller
			const buyerWallet = await this.oasisWalletService.getDefaultWallet(
				buyerAvatarId
			);
			const sellerWallet = await this.oasisWalletService.getDefaultWallet(
				sellerAvatarId
			);

			if (!(buyerWallet && sellerWallet)) {
				throw new Error(
					`Buyer or seller missing wallet. Buyer: ${buyerWallet?.walletId}, Seller: ${sellerWallet?.walletId}`
				);
			}

			// Verify wallets are for the correct provider type
			if (buyerWallet.providerType !== providerType) {
				throw new Error(
					`Buyer wallet provider type ${buyerWallet.providerType} does not match required ${providerType}`
				);
			}

			if (sellerWallet.providerType !== providerType) {
				throw new Error(
					`Seller wallet provider type ${sellerWallet.providerType} does not match required ${providerType}`
				);
			}

			// 4. Determine token symbol (from asset)
			const tokenSymbol = asset.symbol || asset.id; // Use asset symbol or ID as token identifier

			// 5. Send tokens from seller to buyer via OASIS
			const result = await this.oasisWalletService.sendToken({
				fromAvatarId: sellerAvatarId,
				toAvatarId: buyerAvatarId,
				amount: quantity,
				tokenSymbol,
				providerType,
				walletId: sellerWallet.walletId,
			});

			this.logger.log(
				`Trade executed successfully. Transaction hash: ${result.transactionHash}`
			);

			// Wait for confirmation (keep existing behavior for now)
			await this.waitForConfirmation(result.transactionHash, asset.blockchain);

			return result.transactionHash;
		} catch (error: any) {
			this.logger.error(
				`Failed to execute trade: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Wait for transaction confirmation
	 */
	private async waitForConfirmation(transactionHash: string, blockchain: string): Promise<void> {
		this.logger.log(`Waiting for confirmation of transaction ${transactionHash} on ${blockchain}`);

		// TODO: Implement actual confirmation waiting
		// This would poll the blockchain until the transaction is confirmed
		// For Solana: use connection.confirmTransaction()
		// For Ethereum: use provider.waitForTransaction()

		// Simulate delay
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	/**
	 * Execute trade on Solana
	 */
	// private async executeSolanaTrade(params: ExecuteTradeParams): Promise<string> {
	//   // TODO: Implement Solana trade execution
	//   // This would use @solana/web3.js and @solana/spl-token
	//   // to call the smart contract program
	// }

	/**
	 * Execute trade on Ethereum
	 */
	// private async executeEthereumTrade(params: ExecuteTradeParams): Promise<string> {
	//   // TODO: Implement Ethereum trade execution
	//   // This would use ethers.js to call the smart contract
	// }

	/**
	 * Execute withdrawal on blockchain
	 * 
	 * Note: This implementation uses OASIS API which may only support avatar-to-avatar transfers.
	 * If OASIS API doesn't support external addresses, this will fail and we'll need to implement
	 * direct blockchain SDK calls (Option B from the implementation plan).
	 */
	async withdraw(params: {
		user: string;
		asset: string;
		amount: bigint;
		toAddress: string;
		blockchain: string;
	}): Promise<string> {
		const { user: userId, asset: assetId, amount, toAddress, blockchain } = params;

		this.logger.log(
			`Initiating withdrawal: user ${userId}, asset ${assetId}, amount ${amount}, to ${toAddress}`
		);

		try {
			// 1. Get user entity
			const user = await this.userRepository.findOne({ where: { id: userId } });
			if (!user?.avatarId) {
				throw new Error(`User ${userId} not found or missing avatarId`);
			}

			// 2. Get asset to determine token symbol
			const asset = await this.assetRepository.findOne({ where: { id: assetId } });
			if (!asset) {
				throw new Error(`Asset ${assetId} not found`);
			}

			// 3. Get provider type from blockchain
			const providerType = blockchain === "solana" ? "SolanaOASIS" : "EthereumOASIS";

			// 4. Get user's default wallet for the blockchain
			const wallet = await this.oasisWalletService.getDefaultWallet(user.avatarId);
			if (!wallet) {
				throw new Error(`User ${userId} missing default wallet for ${providerType}`);
			}

			// Check if wallet matches the required provider type
			// Note: getDefaultWallet may return any provider type, so we need to check
			const wallets = await this.oasisWalletService.getWallets(user.avatarId, providerType);
			const matchingWallet = wallets.find((w) => w.providerType === providerType);
			
			if (!matchingWallet) {
				throw new Error(`User ${userId} missing ${providerType} wallet`);
			}

			// 5. Determine token symbol from asset
			const tokenSymbol = asset.symbol || assetId;

			// 6. Convert amount from BigInt to number (handle decimals)
			// For Solana: typically 9 decimals (lamports)
			// For Ethereum: typically 18 decimals (wei)
			// For tokenized assets, use asset.decimals if available
			const decimals = asset.decimals || (blockchain === "solana" ? 9 : 18);
			const amountNumber = Number(amount) / 10 ** decimals;

			// 7. Send tokens to external address via OASIS
			// OASIS API supports sending to both avatar IDs and direct wallet addresses
			// If toAddress looks like a wallet address (not a UUID), use toWalletAddress
			// Otherwise, try as avatarId first, then fall back to wallet address
			const isWalletAddress = !toAddress.match(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
			);

			this.logger.log(
				`Sending ${amountNumber} ${tokenSymbol} from avatar ${user.avatarId} to ${isWalletAddress ? "wallet address" : "avatar"} ${toAddress}`
			);

			const result = await this.oasisWalletService.sendToken({
				fromAvatarId: user.avatarId,
				toWalletAddress: isWalletAddress ? toAddress : undefined,
				toAvatarId: isWalletAddress ? undefined : toAddress,
				amount: amountNumber,
				tokenSymbol,
				providerType,
				walletId: matchingWallet.walletId,
			});

			this.logger.log(
				`Withdrawal executed successfully. Transaction hash: ${result.transactionHash}`
			);

			// Wait for confirmation (simulated for now)
			await this.waitForConfirmation(result.transactionHash, blockchain);

			return result.transactionHash;
		} catch (error: any) {
			this.logger.error(`Failed to execute withdrawal: ${error.message}`, error.stack);
			throw error;
		}
	}

	/**
	 * Get transaction details from blockchain via OASIS API
	 */
	async getTransaction(
		transactionHash: string,
		blockchain: string
	): Promise<{
		status: "pending" | "confirmed" | "failed";
		blockNumber?: bigint;
		fromAddress?: string;
		toAddress?: string;
		amount?: bigint;
		confirmations?: number;
	}> {
		this.logger.log(
			`Getting transaction ${transactionHash} from ${blockchain} via OASIS API`
		);

		try {
			// Call OASIS API to get transaction details
			const tx = await this.oasisWalletService.getTransactionByHash(
				transactionHash,
				blockchain
			);

			// Map OASIS API response to BlockchainService return type
			return {
				status: tx.status,
				blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : undefined,
				fromAddress: tx.fromAddress,
				toAddress: tx.toAddress,
				amount: tx.amount ? BigInt(tx.amount) : undefined,
				confirmations: tx.confirmations,
			};
		} catch (error: any) {
			this.logger.error(
				`Failed to get transaction ${transactionHash} on ${blockchain}: ${error.message}`,
				error.stack
			);

			// Return pending status on error (transaction might still be processing)
			// This allows the caller to retry if needed
			return {
				status: "pending",
			};
		}
	}

	/**
	 * Monitor vault address for new deposits
	 */
	async monitorVaultDeposits(
		vaultAddress: string,
		blockchain: string,
		sinceBlock?: bigint
	): Promise<
		Array<{
			transactionHash: string;
			fromAddress: string;
			toAddress: string;
			amount: bigint;
			blockNumber: bigint;
			timestamp: Date;
		}>
	> {
		this.logger.log(`Monitoring vault ${vaultAddress} on ${blockchain} for deposits`);

		// TODO: Implement actual blockchain monitoring
		// This should:
		// 1. Query blockchain for transactions to the vault address
		// 2. Filter for deposits (incoming transactions)
		// 3. Return transaction details

		// Placeholder implementation - return empty array
		return [];
	}
}
