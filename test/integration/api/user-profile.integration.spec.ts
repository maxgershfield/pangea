/**
 * User Profile API Integration Tests
 *
 * Tests the user profile endpoints (GET/PUT /user/profile) with
 * full HTTP request/response validation and JWT authentication.
 */
import type { INestApplication } from "@nestjs/common";
import "reflect-metadata";
import request from "supertest";
import type { DataSource } from "typeorm";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { AuthModule } from "../../../src/auth/auth.module.js";
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

describe("User Profile API Integration", () => {
	let app: INestApplication;
	let ctx: IntegrationTestContext;
	let dataSource: DataSource;
	let fixture: BetterAuthUserFixture;
	let jwtContext: TestJwtContext;

	beforeAll(async () => {
		jwtContext = await createTestJwtContext();

		// Create mock guard and providers
		const mockGuard = createMockJwksJwtGuard();

		ctx = await createIntegrationTestModule({
			imports: [AuthModule],
			guardOverrides: [
				{ guard: JwksJwtGuard, useValue: mockGuard },
			],
			providerOverrides: [
				{
					provider: OasisAuthService,
					useValue: {
						register: async () => ({
							avatarId: "mock-oasis-avatar-id",
							success: true,
						}),
					},
				},
			],
		});

		app = ctx.module.createNestApplication();
		await app.init();

		dataSource = ctx.dataSource;
		fixture = new BetterAuthUserFixture(dataSource);
	});

	afterEach(async () => {
		await fixture.cleanup();
	});

	afterAll(async () => {
		await app.close();
		await ctx.cleanup();
	});

	describe("GET /user/profile", () => {
		it("should return user profile for authenticated user", async () => {
			// Arrange
			const { user } = await fixture.createCompleteUser({
				email: "profile-test@example.com",
				firstName: "Profile",
				lastName: "Test",
			});
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
				role: user.role,
				kycStatus: user.kycStatus,
			});

			// Act
			const response = await request(app.getHttpServer())
				.get("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			// Assert
			expect(response.body.id).toBe(user.id);
			expect(response.body.email).toBe("profile-test@example.com");
			expect(response.body.firstName).toBe("Profile");
			expect(response.body.lastName).toBe("Test");
		});

		it("should return 401/403 without authentication", async () => {
			// NestJS guards return 403 Forbidden by default, some return 401
			const response = await request(app.getHttpServer()).get("/user/profile");
			expect([401, 403]).toContain(response.status);
		});

		it("should return 401/403 with invalid token format", async () => {
			const response = await request(app.getHttpServer())
				.get("/user/profile")
				.set("Authorization", "Bearer invalid-token-format");
			expect([401, 403]).toContain(response.status);
		});

		it("should return 401/403 without Bearer prefix", async () => {
			const token = await jwtContext.generateToken({
				id: "test-user",
				email: "test@example.com",
			});

			const response = await request(app.getHttpServer())
				.get("/user/profile")
				.set("Authorization", token); // Missing "Bearer " prefix
			expect([401, 403]).toContain(response.status);
		});

		it("should return 404 for non-existent user", async () => {
			// Create a token for a user that doesn't exist in DB
			const token = await jwtContext.generateToken({
				id: "non-existent-user-id-12345",
				email: "ghost@example.com",
			});

			await request(app.getHttpServer())
				.get("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.expect(404);
		});

		it("should include avatarId in response", async () => {
			const avatarId = "oasis-avatar-test-123";
			const { user } = await fixture.createUserWithAvatar(avatarId);
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			const response = await request(app.getHttpServer())
				.get("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(response.body.avatarId).toBe(avatarId);
		});

		it("should include all user fields in response", async () => {
			const { user } = await fixture.createCompleteUser({
				name: "Full Name",
				firstName: "First",
				lastName: "Last",
				username: "testuser123",
				role: "admin",
				kycStatus: "verified",
				walletAddressSolana: "SolanaAddress123",
				walletAddressEthereum: "0xEthAddress456",
				avatarId: "avatar-789",
				isActive: true,
			});

			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			const response = await request(app.getHttpServer())
				.get("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(response.body.name).toBe("Full Name");
			expect(response.body.firstName).toBe("First");
			expect(response.body.lastName).toBe("Last");
			expect(response.body.username).toBe("testuser123");
			expect(response.body.role).toBe("admin");
			expect(response.body.kycStatus).toBe("verified");
			expect(response.body.walletAddressSolana).toBe("SolanaAddress123");
			expect(response.body.walletAddressEthereum).toBe("0xEthAddress456");
			expect(response.body.avatarId).toBe("avatar-789");
			expect(response.body.isActive).toBe(true);
		});
	});

	describe("PUT /user/profile", () => {
		it("should update user firstName and lastName", async () => {
			const { user } = await fixture.createCompleteUser();
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			const response = await request(app.getHttpServer())
				.put("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.send({
					firstName: "NewFirst",
					lastName: "NewLast",
				})
				.expect(200);

			expect(response.body.firstName).toBe("NewFirst");
			expect(response.body.lastName).toBe("NewLast");
		});

		it("should update user email", async () => {
			const { user } = await fixture.createCompleteUser();
			const newEmail = `updated-${Date.now()}@example.com`;
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			const response = await request(app.getHttpServer())
				.put("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.send({ email: newEmail })
				.expect(200);

			expect(response.body.email).toBe(newEmail);
		});

		it("should preserve unchanged fields", async () => {
			const { user } = await fixture.createCompleteUser({
				firstName: "Original",
				lastName: "Name",
				kycStatus: "verified",
			});
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			const response = await request(app.getHttpServer())
				.put("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.send({ firstName: "Updated" })
				.expect(200);

			expect(response.body.firstName).toBe("Updated");
			expect(response.body.lastName).toBe("Name"); // Unchanged
			expect(response.body.kycStatus).toBe("verified"); // Unchanged
		});

		it("should return 401/403 without authentication", async () => {
			const response = await request(app.getHttpServer())
				.put("/user/profile")
				.send({ firstName: "Test" });
			expect([401, 403]).toContain(response.status);
		});

		it("should return 404 for non-existent user", async () => {
			const token = await jwtContext.generateToken({
				id: "non-existent-user-id",
				email: "ghost@example.com",
			});

			await request(app.getHttpServer())
				.put("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.send({ firstName: "Test" })
				.expect(404);
		});

		it("should handle empty update body", async () => {
			const { user } = await fixture.createCompleteUser({
				firstName: "Original",
			});
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			const response = await request(app.getHttpServer())
				.put("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(200);

			// Should return unchanged user
			expect(response.body.firstName).toBe("Original");
		});

		it("should persist updates to database", async () => {
			const { user } = await fixture.createCompleteUser();
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			// Update via API
			await request(app.getHttpServer())
				.put("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.send({
					firstName: "Persisted",
					lastName: "Update",
				})
				.expect(200);

			// Verify in database
			const userRepo = fixture.getUserRepository();
			const dbUser = await userRepo.findOne({ where: { id: user.id } });

			expect(dbUser?.firstName).toBe("Persisted");
			expect(dbUser?.lastName).toBe("Update");
		});
	});

	describe("Content-Type Handling", () => {
		it("should accept application/json content type", async () => {
			const { user } = await fixture.createCompleteUser();
			const token = await jwtContext.generateToken({
				id: user.id,
				email: user.email,
			});

			await request(app.getHttpServer())
				.put("/user/profile")
				.set("Authorization", `Bearer ${token}`)
				.set("Content-Type", "application/json")
				.send({ firstName: "Test" })
				.expect(200);
		});
	});
});
