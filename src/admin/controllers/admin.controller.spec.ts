import "reflect-metadata";

import { Test, type TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TokenizedAsset } from "../../assets/entities/tokenized-asset.entity.js";
import { BetterAuthUser } from "../../auth/entities/better-auth-user.entity.js";
import { AdminGuard } from "../../auth/guards/admin.guard.js";
import { JwksJwtGuard } from "../../auth/guards/jwks-jwt.guard.js";
import { Order } from "../../orders/entities/order.entity.js";
import { Trade } from "../../trades/entities/trade.entity.js";
import { Transaction } from "../../transactions/entities/transaction.entity.js";
import { AdminService } from "../services/admin.service.js";
import { AdminController } from "./admin.controller.js";

describe("AdminController", () => {
	let controller: AdminController;
	let _service: AdminService;

	const mockAdminService = {
		getUsers: vi.fn(),
		getUser: vi.fn(),
		updateUser: vi.fn(),
		updateUserKycStatus: vi.fn(),
		getUserActivityLogs: vi.fn(),
		getAssets: vi.fn(),
		createAsset: vi.fn(),
		updateAsset: vi.fn(),
		deleteAsset: vi.fn(),
		approveAssetListing: vi.fn(),
		getAssetStatistics: vi.fn(),
		getOrders: vi.fn(),
		cancelOrder: vi.fn(),
		getOrderStatistics: vi.fn(),
		getTrades: vi.fn(),
		getTradeStatistics: vi.fn(),
		getTransactions: vi.fn(),
		approveWithdrawal: vi.fn(),
		getPlatformStatistics: vi.fn(),
		getAnalytics: vi.fn(),
	};

	const mockUserRepository = {};
	const mockAssetRepository = {};
	const mockOrderRepository = {};
	const mockTradeRepository = {};
	const mockTransactionRepository = {};
	const mockDataSource = {};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AdminController],
			providers: [
				{
					provide: AdminService,
					useValue: mockAdminService,
				},
				{
					provide: getRepositoryToken(BetterAuthUser),
					useValue: mockUserRepository,
				},
				{
					provide: getRepositoryToken(TokenizedAsset),
					useValue: mockAssetRepository,
				},
				{
					provide: getRepositoryToken(Order),
					useValue: mockOrderRepository,
				},
				{
					provide: getRepositoryToken(Trade),
					useValue: mockTradeRepository,
				},
				{
					provide: getRepositoryToken(Transaction),
					useValue: mockTransactionRepository,
				},
				{
					provide: DataSource,
					useValue: mockDataSource,
				},
			],
		})
			.overrideGuard(JwksJwtGuard)
			.useValue({ canActivate: () => true })
			.overrideGuard(AdminGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<AdminController>(AdminController);
		_service = module.get<AdminService>(AdminService);

		vi.clearAllMocks();
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("getUsers", () => {
		it("should return users from service", async () => {
			const filters = { page: 1, limit: 20 };
			const expectedResult = {
				items: [],
				total: 0,
				page: 1,
				limit: 20,
				totalPages: 0,
			};
			mockAdminService.getUsers.mockResolvedValue(expectedResult);

			const result = await controller.getUsers(filters);

			expect(result).toEqual(expectedResult);
			expect(mockAdminService.getUsers).toHaveBeenCalledWith(filters);
		});
	});

	describe("getUser", () => {
		it("should return user by id", async () => {
			const userId = "123";
			const expectedUser = { id: userId, email: "test@test.com" };
			mockAdminService.getUser.mockResolvedValue(expectedUser);

			const result = await controller.getUser(userId);

			expect(result).toEqual(expectedUser);
			expect(mockAdminService.getUser).toHaveBeenCalledWith(userId);
		});
	});

	describe("updateUser", () => {
		it("should update user", async () => {
			const userId = "123";
			const updateDto = { firstName: "New Name" };
			const updatedUser = { id: userId, ...updateDto };
			mockAdminService.updateUser.mockResolvedValue(updatedUser);

			const result = await controller.updateUser(userId, updateDto);

			expect(result).toEqual(updatedUser);
			expect(mockAdminService.updateUser).toHaveBeenCalledWith(userId, updateDto);
		});
	});

	describe("updateKycStatus", () => {
		it("should update KYC status", async () => {
			const userId = "123";
			const dto = { status: "verified" as any };
			const updatedUser = { id: userId, kycStatus: "verified" };
			mockAdminService.updateUserKycStatus.mockResolvedValue(updatedUser);

			const result = await controller.updateKycStatus(userId, dto);

			expect(result).toEqual(updatedUser);
			expect(mockAdminService.updateUserKycStatus).toHaveBeenCalledWith(userId, dto);
		});
	});

	describe("getAssets", () => {
		it("should return assets from service", async () => {
			const filters = { page: 1, limit: 20 };
			const expectedResult = {
				items: [],
				total: 0,
				page: 1,
				limit: 20,
				totalPages: 0,
			};
			mockAdminService.getAssets.mockResolvedValue(expectedResult);

			const result = await controller.getAssets(filters);

			expect(result).toEqual(expectedResult);
			expect(mockAdminService.getAssets).toHaveBeenCalledWith(filters);
		});
	});

	describe("createAsset", () => {
		it("should create asset", async () => {
			const dto = { name: "Test Asset", symbol: "TEST" } as any;
			const createdAsset = { id: "123", ...dto };
			mockAdminService.createAsset.mockResolvedValue(createdAsset);

			const result = await controller.createAsset(dto);

			expect(result).toEqual(createdAsset);
			expect(mockAdminService.createAsset).toHaveBeenCalledWith(dto, undefined);
		});
	});

	describe("cancelOrder", () => {
		it("should cancel order", async () => {
			const orderId = "123";
			const cancelledOrder = { id: orderId, orderStatus: "cancelled" };
			mockAdminService.cancelOrder.mockResolvedValue(cancelledOrder);

			const result = await controller.cancelOrder(orderId);

			expect(result).toEqual(cancelledOrder);
			expect(mockAdminService.cancelOrder).toHaveBeenCalledWith(orderId);
		});
	});

	describe("getPlatformStatistics", () => {
		it("should return platform statistics", async () => {
			const expectedStats = {
				totalUsers: 100,
				activeUsers: 80,
				totalAssets: 50,
				totalOrders: 200,
				totalTrades: 150,
				totalVolume: 50_000,
				totalRevenue: 500,
			};
			mockAdminService.getPlatformStatistics.mockResolvedValue(expectedStats);

			const result = await controller.getPlatformStatistics();

			expect(result).toEqual(expectedStats);
			expect(mockAdminService.getPlatformStatistics).toHaveBeenCalled();
		});
	});

	describe("getAnalytics", () => {
		it("should return analytics data", async () => {
			const filters = { period: "month" as any };
			const expectedAnalytics = {
				period: "month",
				dateRange: { start: new Date(), end: new Date() },
				trades: { count: 10, volume: 1000, fees: 10 },
			};
			mockAdminService.getAnalytics.mockResolvedValue(expectedAnalytics);

			const result = await controller.getAnalytics(filters);

			expect(result).toEqual(expectedAnalytics);
			expect(mockAdminService.getAnalytics).toHaveBeenCalledWith(filters);
		});
	});
});
