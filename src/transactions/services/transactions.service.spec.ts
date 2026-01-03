// reflect-metadata MUST be first for TypeORM decorator metadata
import "reflect-metadata";

import { Test, type TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BlockchainService } from "../../blockchain/services/blockchain.service.js";
import { BalanceService } from "../../orders/services/balance.service.js";
import { WebSocketService } from "../../orders/services/websocket.service.js";
import { OasisWalletService } from "../../services/oasis-wallet.service.js";
import { User } from "../../users/entities/user.entity.js";
import { Transaction } from "../entities/transaction.entity.js";
import { TransactionsService } from "./transactions.service.js";
import { VaultService } from "./vault.service.js";

describe("TransactionsService", () => {
	let service: TransactionsService;
	let _transactionRepository: Repository<Transaction>;
	let _userRepository: Repository<User>;
	let _balanceService: BalanceService;
	let _blockchainService: BlockchainService;
	let _vaultService: VaultService;
	let _oasisWalletService: OasisWalletService;

	const mockTransactionRepository = {
		create: vi.fn(),
		save: vi.fn(),
		findOne: vi.fn(),
		find: vi.fn(),
		findAndCount: vi.fn(),
	};

	const mockUserRepository = {
		findOne: vi.fn(),
	};

	const mockBalanceService = {
		getBalance: vi.fn(),
		lockBalance: vi.fn(),
		unlockBalance: vi.fn(),
		addBalance: vi.fn(),
		subtractBalance: vi.fn(),
	};

	const mockBlockchainService = {
		withdraw: vi.fn(),
		getTransaction: vi.fn(),
		monitorVaultDeposits: vi.fn(),
	};

	const mockVaultService = {
		getVaultAddress: vi.fn(),
	};

	const mockOasisWalletService = {
		getDefaultWallet: vi.fn(),
		getWallets: vi.fn(),
	};

	const mockWebSocketService = {
		emitBalanceUpdate: vi.fn(),
		emitTransactionUpdate: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TransactionsService,
				{
					provide: getRepositoryToken(Transaction),
					useValue: mockTransactionRepository,
				},
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepository,
				},
				{
					provide: BalanceService,
					useValue: mockBalanceService,
				},
				{
					provide: WebSocketService,
					useValue: mockWebSocketService,
				},
				{
					provide: BlockchainService,
					useValue: mockBlockchainService,
				},
				{
					provide: VaultService,
					useValue: mockVaultService,
				},
				{
					provide: OasisWalletService,
					useValue: mockOasisWalletService,
				},
			],
		}).compile();

		service = module.get<TransactionsService>(TransactionsService);
		_transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
		_userRepository = module.get<Repository<User>>(getRepositoryToken(User));
		_balanceService = module.get<BalanceService>(BalanceService);
		_blockchainService = module.get<BlockchainService>(BlockchainService);
		_vaultService = module.get<VaultService>(VaultService);
		_oasisWalletService = module.get<OasisWalletService>(OasisWalletService);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("initiateDeposit", () => {
		it("should create a deposit transaction", async () => {
			const userId = "user-123";
			const depositDto = {
				assetId: "asset-123",
				amount: 100,
				blockchain: "solana",
			};

			const mockVaultAddress = "vault-address-123";
			const mockUser = {
				id: userId,
				walletAddressSolana: "wallet-123",
			};

			mockVaultService.getVaultAddress.mockResolvedValue(mockVaultAddress);
			mockUserRepository.findOne.mockResolvedValue(mockUser);
			mockTransactionRepository.create.mockReturnValue({
				transactionId: "TXN-123",
				...depositDto,
			});
			mockTransactionRepository.save.mockResolvedValue({
				transactionId: "TXN-123",
				...depositDto,
			});

			const result = await service.initiateDeposit(depositDto, userId);

			expect(mockVaultService.getVaultAddress).toHaveBeenCalledWith(
				depositDto.assetId,
				depositDto.blockchain
			);
			expect(mockTransactionRepository.create).toHaveBeenCalled();
			expect(mockTransactionRepository.save).toHaveBeenCalled();
			expect(result.transactionId).toBe("TXN-123");
		});
	});

	describe("initiateWithdrawal", () => {
		it("should create a withdrawal transaction when balance is sufficient", async () => {
			const userId = "user-123";
			const withdrawalDto = {
				assetId: "asset-123",
				amount: 50,
				toAddress: "recipient-123",
				blockchain: "solana",
			};

			const mockBalance = {
				userId,
				assetId: withdrawalDto.assetId,
				availableBalance: BigInt(100 * 1e9),
				lockedBalance: BigInt(0),
			};

			const mockUser = {
				id: userId,
				walletAddressSolana: "wallet-123",
			};

			const mockTransactionHash = "tx-hash-123";

			mockBalanceService.getBalance.mockResolvedValue(mockBalance);
			mockUserRepository.findOne.mockResolvedValue(mockUser);
			mockBlockchainService.withdraw.mockResolvedValue(mockTransactionHash);
			mockTransactionRepository.create.mockReturnValue({
				transactionId: "TXN-123",
				...withdrawalDto,
			});
			mockTransactionRepository.save.mockResolvedValue({
				transactionId: "TXN-123",
				transactionHash: mockTransactionHash,
				...withdrawalDto,
			});

			const result = await service.initiateWithdrawal(withdrawalDto, userId);

			expect(mockBalanceService.getBalance).toHaveBeenCalledWith(userId, withdrawalDto.assetId);
			expect(mockBalanceService.lockBalance).toHaveBeenCalled();
			expect(mockBlockchainService.withdraw).toHaveBeenCalled();
			expect(result.transactionHash).toBe(mockTransactionHash);
		});

		it("should throw error when balance is insufficient", async () => {
			const userId = "user-123";
			const withdrawalDto = {
				assetId: "asset-123",
				amount: 200,
				toAddress: "recipient-123",
				blockchain: "solana",
			};

			const mockBalance = {
				userId,
				assetId: withdrawalDto.assetId,
				availableBalance: BigInt(100 * 1e9), // Less than requested
				lockedBalance: BigInt(0),
			};

			mockBalanceService.getBalance.mockResolvedValue(mockBalance);

			await expect(service.initiateWithdrawal(withdrawalDto, userId)).rejects.toThrow(
				"Insufficient balance"
			);
		});
	});

	describe("confirmTransaction", () => {
		it("should confirm a deposit transaction and update balance", async () => {
			const transactionId = "TXN-123";
			const mockTransaction = {
				transactionId,
				userId: "user-123",
				assetId: "asset-123",
				transactionType: "deposit",
				status: "pending",
				amount: BigInt(100 * 1e9),
				blockchain: "solana",
				transactionHash: "tx-hash-123",
				user: { id: "user-123" },
				asset: { id: "asset-123" },
			};

			const mockBlockchainTx = {
				status: "confirmed",
				blockNumber: BigInt(12_345),
			};

			mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
			mockBlockchainService.getTransaction.mockResolvedValue(mockBlockchainTx);
			mockTransactionRepository.save.mockResolvedValue({
				...mockTransaction,
				status: "completed",
				confirmedAt: new Date(),
			});

			const result = await service.confirmTransaction(transactionId);

			expect(mockBlockchainService.getTransaction).toHaveBeenCalledWith(
				mockTransaction.transactionHash,
				mockTransaction.blockchain
			);
			expect(mockBalanceService.addBalance).toHaveBeenCalledWith(
				mockTransaction.userId,
				mockTransaction.assetId,
				mockTransaction.amount
			);
			expect(result.status).toBe("completed");
		});

		it("should confirm a withdrawal transaction and update balance", async () => {
			const transactionId = "TXN-123";
			const mockTransaction = {
				transactionId,
				userId: "user-123",
				assetId: "asset-123",
				transactionType: "withdrawal",
				status: "processing",
				amount: BigInt(50 * 1e9),
				blockchain: "solana",
				transactionHash: "tx-hash-123",
				user: { id: "user-123" },
				asset: { id: "asset-123" },
			};

			const mockBlockchainTx = {
				status: "confirmed",
				blockNumber: BigInt(12_345),
			};

			mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
			mockBlockchainService.getTransaction.mockResolvedValue(mockBlockchainTx);
			mockTransactionRepository.save.mockResolvedValue({
				...mockTransaction,
				status: "completed",
				confirmedAt: new Date(),
			});

			const result = await service.confirmTransaction(transactionId);

			expect(mockBalanceService.subtractBalance).toHaveBeenCalledWith(
				mockTransaction.userId,
				mockTransaction.assetId,
				mockTransaction.amount
			);
			expect(mockBalanceService.unlockBalance).toHaveBeenCalledWith(
				mockTransaction.userId,
				mockTransaction.assetId,
				mockTransaction.amount
			);
			expect(result.status).toBe("completed");
		});
	});
});
