import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

describe("AppController", () => {
	let appController: AppController;
	let appService: AppService;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				{
					provide: AppService,
					useValue: {
						getHealth: vi.fn().mockResolvedValue({
							status: "ok",
							timestamp: "2025-01-27T00:00:00.000Z",
							service: "Pangea Markets Backend",
							version: "1.0.0",
						}),
					},
				},
			],
		}).compile();

		appController = app.get<AppController>(AppController);
		appService = app.get<AppService>(AppService);
	});

	describe("getHealth", () => {
		it("should return health status", async () => {
			const result = await appController.getHealth();
			expect(result).toHaveProperty("status");
			expect(result).toHaveProperty("service");
			expect(appService.getHealth).toHaveBeenCalled();
		});
	});
});
