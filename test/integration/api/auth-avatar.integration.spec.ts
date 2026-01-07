/**
 * Auth Avatar API Integration Tests
 *
 * Tests the OASIS avatar creation endpoint (POST /auth/create-oasis-avatar)
 * which links Better Auth users to OASIS blockchain identities.
 */
import type { INestApplication } from "@nestjs/common";
import "reflect-metadata";
import request from "supertest";
import type { DataSource, Repository } from "typeorm";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthModule } from "../../../src/auth/auth.module.js";
import { BetterAuthUser } from "../../../src/auth/entities/better-auth-user.entity.js";
import { JwksJwtGuard } from "../../../src/auth/guards/jwks-jwt.guard.js";
import { OasisAuthService } from "../../../src/auth/services/oasis-auth.service.js";
import { BetterAuthUserFixture } from "../fixtures/better-auth-user.fixture.js";
import {
    createTestJwtContext,
    type TestJwtContext,
} from "../fixtures/jwt-token.fixture.js";
import {
    createIntegrationTestModule,
    type IntegrationTestContext,
} from "../setup/integration-test.setup.js";
import { createMockJwksJwtGuard } from "../setup/mock-jwks-server.js";

describe("Auth Avatar API Integration", () => {
	let app: INestApplication;
	let ctx: IntegrationTestContext;
	let dataSource: DataSource;
	let userRepo: Repository<BetterAuthUser>;
	let fixture: BetterAuthUserFixture;
	let jwtContext: TestJwtContext;
	let mockOasisAuthService: {
		register: ReturnType<typeof vi.fn>;
		getUserProfile?: ReturnType<typeof vi.fn>;
	};

	beforeAll(async () => {
		jwtContext = await createTestJwtContext();

		// Mock OASIS auth service
		mockOasisAuthService = {
			register: vi.fn().mockResolvedValue({
				avatarId: "mock-oasis-avatar-id",
				id: "mock-oasis-avatar-id",
				username: "testuser",
				email: "test@example.com",
				firstName: "Test",
				lastName: "User",
			}),
			getUserProfile: vi.fn().mockResolvedValue({
				avatarId: "mock-oasis-avatar-id",
				id: "mock-oasis-avatar-id",
				username: "testuser",
				email: "test@example.com",
				firstName: "Test",
				lastName: "User",
			}),
		};

		// Create mock guard
		const mockGuard = createMockJwksJwtGuard();

		ctx = await createIntegrationTestModule({
			imports: [AuthModule],
			guardOverrides: [
				{ guard: JwksJwtGuard, useValue: mockGuard },
			],
			providerOverrides: [
				{ provider: OasisAuthService, useValue: mockOasisAuthService },
			],
		});

		app = ctx.module.createNestApplication();
		await app.init();

		dataSource = ctx.dataSource;
		userRepo = dataSource.getRepository(BetterAuthUser);
		fixture = new BetterAuthUserFixture(dataSource);
	});

	beforeEach(() => {
		// Reset mock before each test
		mockOasisAuthService.register.mockClear();
		if (mockOasisAuthService.getUserProfile) {
			mockOasisAuthService.getUserProfile.mockClear();
		}
		mockOasisAuthService.register.mockResolvedValue({
			avatarId: `mock-avatar-${Date.now()}`,
			id: `mock-avatar-${Date.now()}`,
			username: "testuser",
			email: "test@example.com",
			firstName: "Test",
			lastName: "User",
		});
	});

	afterEach(async () => {
		await fixture.cleanup();
	});

	afterAll(async () => {
		await app.close();
		await ctx.cleanup();
	});

	describe("POST /auth/create-oasis-avatar", () => {
		it("should create OASIS avatar and return all fields", async () => {
			// Arrange
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			expect(user.avatarId).toBeNull();

			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
				name: "Test User",
			});

			// Mock OASIS response with full avatar data
			mockOasisAuthService.register.mockResolvedValueOnce({
				avatarId: "mock-avatar-id",
				id: "mock-avatar-id",
				username: "testuser",
				email: user.email,
				firstName: "Test",
				lastName: "User",
			});

			// Act
			const response = await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(201);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.avatarId).toBeDefined();
			expect(response.body.userId).toBe(user.id);
			expect(response.body.message).toContain("successfully");
			// Verify new response fields
			expect(response.body.username).toBeDefined();
			expect(response.body.email).toBeDefined();
			expect(response.body.firstName).toBeDefined();
			expect(response.body.lastName).toBeDefined();
		});

		it("should update user.avatarId in database", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(201);

			// Verify database was updated
			const updatedUser = await userRepo.findOne({ where: { id: user.id } });
			expect(updatedUser?.avatarId).toBeDefined();
			expect(updatedUser?.avatarId).not.toBeNull();
		});

		it("should return existing avatarId if user already has one", async () => {
			const existingAvatarId = "existing-avatar-id";
			const { user } = await fixture.createUserWithAvatar(existingAvatarId);

			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			const response = await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(201);

			expect(response.body.avatarId).toBe(existingAvatarId);
		});

		it("should use email from token if not in body", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({}) // No email in body
				.expect(201);

			// Verify OasisAuthService was called with email from token
			expect(mockOasisAuthService.register).toHaveBeenCalledWith(
				expect.objectContaining({
					email: user.email,
				}),
			);
		});

		it("should use email from body if provided", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const bodyEmail = "override@example.com";
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({ email: bodyEmail })
				.expect(201);

			expect(mockOasisAuthService.register).toHaveBeenCalledWith(
				expect.objectContaining({
					email: bodyEmail,
				}),
			);
		});

		it("should parse name into firstName/lastName", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
				name: "John Doe Smith",
			});

			await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(201);

			expect(mockOasisAuthService.register).toHaveBeenCalledWith(
				expect.objectContaining({
					firstName: "John",
					lastName: "Doe Smith",
				}),
			);
		});

		it("should use firstName/lastName from body if provided", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
				name: "Token Name",
			});

			await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({
					firstName: "Body",
					lastName: "Name",
				})
				.expect(201);

			expect(mockOasisAuthService.register).toHaveBeenCalledWith(
				expect.objectContaining({
					firstName: "Body",
					lastName: "Name",
				}),
			);
		});

		it("should return 401/403 without authentication", async () => {
			const response = await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.send({});
			expect([401, 403]).toContain(response.status);
		});

		it("should return 401/403 with invalid token", async () => {
			const response = await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", "Bearer invalid-token")
				.send({});
			expect([401, 403]).toContain(response.status);
		});

		it("should handle username generation from email", async () => {
			const { user } = await fixture.createCompleteUser({
				avatarId: null,
				email: "testuser@example.com",
			});
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(201);

			expect(mockOasisAuthService.register).toHaveBeenCalledWith(
				expect.objectContaining({
					username: expect.stringContaining("testuser"),
				}),
			);
		});

		it("should use custom username from body if provided", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({ username: "custom_username" })
				.expect(201);

			expect(mockOasisAuthService.register).toHaveBeenCalledWith(
				expect.objectContaining({
					username: "custom_username",
				}),
			);
		});
	});

	describe("OASIS Service Integration", () => {
		it("should call OasisAuthService.register with correct parameters", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({
					email: "test@example.com",
					firstName: "Test",
					lastName: "User",
					username: "testuser",
				})
				.expect(201);

			expect(mockOasisAuthService.register).toHaveBeenCalledTimes(1);
			expect(mockOasisAuthService.register).toHaveBeenCalledWith(
				expect.objectContaining({
					email: "test@example.com",
					firstName: "Test",
					lastName: "User",
					username: "testuser",
				}),
			);
		});

		it("should handle OASIS service errors gracefully", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			// Mock service to throw error
			mockOasisAuthService.register.mockRejectedValueOnce(
				new Error("OASIS service unavailable"),
			);

			const response = await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({});

			// Should return error status
			expect(response.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe("Response Format", () => {
		it("should return proper response structure with all fields", async () => {
			const { user } = await fixture.createCompleteUser({ avatarId: null });
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			// Mock OASIS response with full avatar data
			mockOasisAuthService.register.mockResolvedValueOnce({
				avatarId: "mock-avatar-id",
				id: "mock-avatar-id",
				username: "testuser",
				email: user.email,
				firstName: "Test",
				lastName: "User",
			});

			const response = await request(app.getHttpServer())
				.post("/auth/create-oasis-avatar")
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(201);

			// Check response has expected fields
			expect(response.body).toHaveProperty("success");
			expect(response.body).toHaveProperty("message");
			expect(response.body).toHaveProperty("avatarId");
			expect(response.body).toHaveProperty("userId");
			expect(response.body).toHaveProperty("username");
			expect(response.body).toHaveProperty("email");
			expect(response.body).toHaveProperty("firstName");
			expect(response.body).toHaveProperty("lastName");

			expect(typeof response.body.success).toBe("boolean");
			expect(typeof response.body.message).toBe("string");
			expect(typeof response.body.avatarId).toBe("string");
			expect(typeof response.body.userId).toBe("string");
			expect(typeof response.body.username).toBe("string");
			expect(typeof response.body.email).toBe("string");
			expect(typeof response.body.firstName).toBe("string");
			expect(typeof response.body.lastName).toBe("string");
		});
	});
});
