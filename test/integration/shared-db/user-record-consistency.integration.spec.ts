/**
 * User Record Consistency Integration Tests
 *
 * Verifies that the backend can correctly read user data created by the frontend
 * (simulated via fixtures). Tests query patterns, nullable field handling,
 * and default value preservation.
 */
import "reflect-metadata";
import type { DataSource, Repository } from "typeorm";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { BetterAuthAccount } from "../../../src/auth/entities/better-auth-account.entity.js";
import { BetterAuthSession } from "../../../src/auth/entities/better-auth-session.entity.js";
import { BetterAuthUser } from "../../../src/auth/entities/better-auth-user.entity.js";
import { BetterAuthUserFixture } from "../fixtures/better-auth-user.fixture.js";
import {
    createIntegrationTestModule,
    type IntegrationTestContext,
} from "../setup/integration-test.setup.js";

describe("User Record Consistency", () => {
	let ctx: IntegrationTestContext;
	let dataSource: DataSource;
	let userRepo: Repository<BetterAuthUser>;
	let fixture: BetterAuthUserFixture;

	beforeAll(async () => {
		ctx = await createIntegrationTestModule();
		dataSource = ctx.dataSource;
		userRepo = dataSource.getRepository(BetterAuthUser);
		fixture = new BetterAuthUserFixture(dataSource);
	});

	afterEach(async () => {
		await fixture.cleanup();
	});

	afterAll(async () => {
		await ctx.cleanup();
	});

	describe("Reading Frontend-Created Users", () => {
		it("should read user created by frontend (simulated)", async () => {
			// Arrange: Create user as frontend would
			const { user: createdUser } = await fixture.createCompleteUser({
				email: "frontend-user@test.com",
				firstName: "Frontend",
				lastName: "User",
			});

			// Act: Read as backend would
			const backendUser = await userRepo.findOne({
				where: { id: createdUser.id },
			});

			// Assert: Backend sees same data
			expect(backendUser).toBeDefined();
			expect(backendUser?.email).toBe("frontend-user@test.com");
			expect(backendUser?.firstName).toBe("Frontend");
			expect(backendUser?.lastName).toBe("User");
			expect(backendUser?.role).toBe("user");
			expect(backendUser?.kycStatus).toBe("none");
		});

		it("should handle nullable fields correctly", async () => {
			const { user } = await fixture.createCompleteUser({
				image: null,
				walletAddressSolana: null,
				walletAddressEthereum: null,
				avatarId: null,
			});

			const retrieved = await userRepo.findOne({ where: { id: user.id } });

			expect(retrieved?.image).toBeNull();
			expect(retrieved?.walletAddressSolana).toBeNull();
			expect(retrieved?.walletAddressEthereum).toBeNull();
			expect(retrieved?.avatarId).toBeNull();
		});

		it("should preserve default values from frontend", async () => {
			const { user } = await fixture.createCompleteUser();

			expect(user.role).toBe("user");
			expect(user.kycStatus).toBe("none");
			expect(user.isActive).toBe(true);
			expect(user.emailVerified).toBe(true);
		});

		it("should read user with all fields populated", async () => {
			const { user: createdUser } = await fixture.createCompleteUser({
				name: "Full Name",
				firstName: "First",
				lastName: "Last",
				username: "fulluser",
				role: "admin",
				kycStatus: "verified",
				walletAddressSolana: "5KtPmMeZN7TQEXsolana",
				walletAddressEthereum: "0x742d35Ccethereum",
				avatarId: "oasis-avatar-123",
			});

			const user = await userRepo.findOne({ where: { id: createdUser.id } });

			expect(user?.name).toBe("Full Name");
			expect(user?.firstName).toBe("First");
			expect(user?.lastName).toBe("Last");
			expect(user?.username).toBe("fulluser");
			expect(user?.role).toBe("admin");
			expect(user?.kycStatus).toBe("verified");
			expect(user?.walletAddressSolana).toBe("5KtPmMeZN7TQEXsolana");
			expect(user?.walletAddressEthereum).toBe("0x742d35Ccethereum");
			expect(user?.avatarId).toBe("oasis-avatar-123");
		});
	});

	describe("User Query Patterns", () => {
		it("should find user by email (unique constraint)", async () => {
			const email = `unique-email-${Date.now()}@test.com`;
			await fixture.createCompleteUser({ email });

			const user = await userRepo.findOne({ where: { email } });

			expect(user).toBeDefined();
			expect(user?.email).toBe(email);
		});

		it("should find users by role", async () => {
			await fixture.createAdminUser();
			await fixture.createCompleteUser({ role: "user" });

			const admins = await userRepo.find({ where: { role: "admin" } });

			expect(admins.length).toBeGreaterThanOrEqual(1);
			expect(admins.every((u) => u.role === "admin")).toBe(true);
		});

		it("should find users by KYC status", async () => {
			await fixture.createVerifiedUser();

			const verified = await userRepo.find({ where: { kycStatus: "verified" } });

			expect(verified.length).toBeGreaterThanOrEqual(1);
			expect(verified.every((u) => u.kycStatus === "verified")).toBe(true);
		});

		it("should find active users", async () => {
			await fixture.createCompleteUser({ isActive: true });
			await fixture.createCompleteUser({ isActive: false });

			const activeUsers = await userRepo.find({ where: { isActive: true } });

			expect(activeUsers.length).toBeGreaterThanOrEqual(1);
			expect(activeUsers.every((u) => u.isActive === true)).toBe(true);
		});

		it("should find users with avatar", async () => {
			const avatarId = `avatar-${Date.now()}`;
			await fixture.createUserWithAvatar(avatarId);
			await fixture.createCompleteUser({ avatarId: null });

			const user = await userRepo.findOne({ where: { avatarId } });

			expect(user).toBeDefined();
			expect(user?.avatarId).toBe(avatarId);
		});

		it("should return null for non-existent user", async () => {
			const user = await userRepo.findOne({
				where: { id: "non-existent-id-12345" },
			});

			expect(user).toBeNull();
		});
	});

	describe("Timestamp Handling", () => {
		it("should correctly store and retrieve timestamps", async () => {
			const beforeCreate = new Date();
			const { user } = await fixture.createCompleteUser();
			const afterCreate = new Date();

			expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
				beforeCreate.getTime() - 1000,
			);
			expect(user.createdAt.getTime()).toBeLessThanOrEqual(
				afterCreate.getTime() + 1000,
			);
		});

		it("should have updatedAt set on creation", async () => {
			const { user } = await fixture.createCompleteUser();

			expect(user.updatedAt).toBeDefined();
			expect(user.updatedAt instanceof Date).toBe(true);
		});

		it("should store lastLogin as nullable timestamp", async () => {
			const { user: userWithLogin } = await fixture.createCompleteUser({
				lastLogin: new Date(),
			});
			const { user: userWithoutLogin } = await fixture.createCompleteUser({
				lastLogin: null,
			});

			expect(userWithLogin.lastLogin).toBeInstanceOf(Date);
			expect(userWithoutLogin.lastLogin).toBeNull();
		});
	});

	describe("Email Verification Status", () => {
		it("should correctly read emailVerified status", async () => {
			const { user: verifiedUser } = await fixture.createCompleteUser({
				emailVerified: true,
			});
			const { user: unverifiedUser } = await fixture.createCompleteUser({
				emailVerified: false,
			});

			const retrievedVerified = await userRepo.findOne({
				where: { id: verifiedUser.id },
			});
			const retrievedUnverified = await userRepo.findOne({
				where: { id: unverifiedUser.id },
			});

			expect(retrievedVerified?.emailVerified).toBe(true);
			expect(retrievedUnverified?.emailVerified).toBe(false);
		});
	});

	describe("User with Relations", () => {
		it("should read user with session relation", async () => {
			const { user, session } = await fixture.createCompleteUser();

			// Query session with user relation (relation is defined on Session side)
			const sessionRepo = ctx.dataSource.getRepository(BetterAuthSession);
			const sessionWithUser = await sessionRepo.findOne({
				where: { id: session?.id },
				relations: ["user"],
			});

			expect(sessionWithUser).toBeDefined();
			expect(sessionWithUser?.user).toBeDefined();
			expect(sessionWithUser?.user.id).toBe(user.id);
			expect(sessionWithUser?.userId).toBe(user.id);
		});

		it("should read user with account relation", async () => {
			const { user, account } = await fixture.createCompleteUser();

			// Query account with user relation (relation is defined on Account side)
			const accountRepo = ctx.dataSource.getRepository(BetterAuthAccount);
			const accountWithUser = await accountRepo.findOne({
				where: { id: account?.id },
				relations: ["user"],
			});

			expect(accountWithUser).toBeDefined();
			expect(accountWithUser?.user).toBeDefined();
			expect(accountWithUser?.user.id).toBe(user.id);
			expect(accountWithUser?.userId).toBe(user.id);
		});
	});

	describe("Batch Queries", () => {
		it("should find multiple users efficiently", async () => {
			const user1 = await fixture.createUserOnly({ firstName: "Batch1" });
			const user2 = await fixture.createUserOnly({ firstName: "Batch2" });
			const user3 = await fixture.createUserOnly({ firstName: "Batch3" });

			const users = await userRepo.find({
				where: [{ id: user1.id }, { id: user2.id }, { id: user3.id }],
			});

			expect(users.length).toBe(3);
		});

		it("should count users by criteria", async () => {
			await fixture.createAdminUser();
			await fixture.createAdminUser();
			await fixture.createCompleteUser({ role: "user" });

			const adminCount = await userRepo.count({ where: { role: "admin" } });

			expect(adminCount).toBeGreaterThanOrEqual(2);
		});
	});
});
