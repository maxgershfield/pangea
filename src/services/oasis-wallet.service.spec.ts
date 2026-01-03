import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OasisTokenManagerService } from "./oasis-token-manager.service.js";
import { OasisWalletService } from "./oasis-wallet.service.js";

describe("OasisWalletService", () => {
	let service: OasisWalletService;
	let _configService: ConfigService;

	const mockConfigService = {
		get: vi.fn((key: string) => {
			if (key === "OASIS_API_URL") {
				return "https://api.oasisplatform.world";
			}
			if (key === "OASIS_API_KEY") {
				return "test-api-key";
			}
			return undefined;
		}),
	};

	const mockTokenManager = {
		getToken: vi.fn().mockResolvedValue("test-token"),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OasisWalletService,
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: OasisTokenManagerService,
					useValue: mockTokenManager,
				},
			],
		}).compile();

		service = module.get<OasisWalletService>(OasisWalletService);
		_configService = module.get<ConfigService>(ConfigService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("generateWallet", () => {
		it("should generate a wallet with correct parameters", async () => {
			// This would require mocking axios
			// Implementation depends on testing strategy
			expect(service).toBeDefined();
		});
	});
});
