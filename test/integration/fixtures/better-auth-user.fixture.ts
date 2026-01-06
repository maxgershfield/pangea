/**
 * Better Auth User Fixture
 *
 * Factory for creating test users with sessions and accounts,
 * simulating what the frontend (Better Auth + Drizzle) would create.
 */
import type { DataSource, Repository } from "typeorm";
import { In } from "typeorm";
import { BetterAuthAccount } from "../../../src/auth/entities/better-auth-account.entity.js";
import { BetterAuthSession } from "../../../src/auth/entities/better-auth-session.entity.js";
import { BetterAuthUser } from "../../../src/auth/entities/better-auth-user.entity.js";

export interface UserWithRelations {
	user: BetterAuthUser;
	session?: BetterAuthSession;
	account?: BetterAuthAccount;
}

/**
 * Fixture factory for creating complete Better Auth user records.
 * Tracks created IDs for cleanup after tests.
 *
 * @example
 * ```typescript
 * const fixture = new BetterAuthUserFixture(dataSource);
 *
 * const { user, session, account } = await fixture.createCompleteUser({
 *   email: 'test@example.com',
 * });
 *
 * // After test
 * await fixture.cleanup();
 * ```
 */
export class BetterAuthUserFixture {
	private userRepo: Repository<BetterAuthUser>;
	private sessionRepo: Repository<BetterAuthSession>;
	private accountRepo: Repository<BetterAuthAccount>;
	private createdUserIds: string[] = [];
	private createdSessionIds: string[] = [];
	private createdAccountIds: string[] = [];

	constructor(dataSource: DataSource) {
		this.userRepo = dataSource.getRepository(BetterAuthUser);
		this.sessionRepo = dataSource.getRepository(BetterAuthSession);
		this.accountRepo = dataSource.getRepository(BetterAuthAccount);
	}

	/**
	 * Create a complete user with session and account (simulating frontend creation)
	 */
	async createCompleteUser(
		overrides: Partial<BetterAuthUser> = {},
	): Promise<UserWithRelations> {
		const userId = `ba-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date();

		// Create user (as frontend Drizzle would)
		const user = await this.userRepo.save({
			id: userId,
			email: `${userId}@test.example.com`,
			emailVerified: true,
			name: "Test User",
			image: null,
			username: userId.slice(0, 20),
			firstName: "Test",
			lastName: "User",
			role: "user",
			kycStatus: "none",
			walletAddressSolana: null,
			walletAddressEthereum: null,
			avatarId: null,
			lastLogin: now,
			isActive: true,
			createdAt: now,
			updatedAt: now,
			...overrides,
			id: userId, // Ensure ID is not overridden
		});

		this.createdUserIds.push(userId);

		// Create session
		const sessionId = `session-${userId}`;
		const session = await this.sessionRepo.save({
			id: sessionId,
			userId: user.id,
			token: `token-${Date.now()}-${Math.random().toString(36).slice(2)}`,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			ipAddress: "127.0.0.1",
			userAgent: "Vitest Integration Test",
			createdAt: now,
			updatedAt: now,
		});
		this.createdSessionIds.push(sessionId);

		// Create credential account
		const accountId = `account-${userId}`;
		const account = await this.accountRepo.save({
			id: accountId,
			userId: user.id,
			accountId: user.id,
			providerId: "credential",
			password: "$2b$10$test.hashed.password",
			createdAt: now,
			updatedAt: now,
		});
		this.createdAccountIds.push(accountId);

		return { user, session, account };
	}

	/**
	 * Create user only (for testing partial scenarios)
	 */
	async createUserOnly(
		overrides: Partial<BetterAuthUser> = {},
	): Promise<BetterAuthUser> {
		const userId = `ba-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date();

		const user = await this.userRepo.save({
			id: userId,
			email: `${userId}@test.example.com`,
			emailVerified: true,
			name: "Test User",
			image: null,
			username: userId.slice(0, 20),
			firstName: "Test",
			lastName: "User",
			role: "user",
			kycStatus: "none",
			walletAddressSolana: null,
			walletAddressEthereum: null,
			avatarId: null,
			lastLogin: now,
			isActive: true,
			createdAt: now,
			updatedAt: now,
			...overrides,
			id: userId,
		});

		this.createdUserIds.push(userId);
		return user;
	}

	/**
	 * Create admin user
	 */
	async createAdminUser(
		overrides: Partial<BetterAuthUser> = {},
	): Promise<UserWithRelations> {
		return this.createCompleteUser({ role: "admin", ...overrides });
	}

	/**
	 * Create KYC verified user
	 */
	async createVerifiedUser(
		overrides: Partial<BetterAuthUser> = {},
	): Promise<UserWithRelations> {
		return this.createCompleteUser({ kycStatus: "verified", ...overrides });
	}

	/**
	 * Create user with OASIS avatar
	 */
	async createUserWithAvatar(
		avatarId: string,
		overrides: Partial<BetterAuthUser> = {},
	): Promise<UserWithRelations> {
		return this.createCompleteUser({ avatarId, ...overrides });
	}

	/**
	 * Create user with wallet addresses
	 */
	async createUserWithWallets(
		wallets: { solana?: string; ethereum?: string },
		overrides: Partial<BetterAuthUser> = {},
	): Promise<UserWithRelations> {
		return this.createCompleteUser({
			walletAddressSolana: wallets.solana || null,
			walletAddressEthereum: wallets.ethereum || null,
			...overrides,
		});
	}

	/**
	 * Get repository for direct database access in tests
	 */
	getUserRepository(): Repository<BetterAuthUser> {
		return this.userRepo;
	}

	/**
	 * Cleanup all created users (and cascaded sessions/accounts)
	 */
	async cleanup(): Promise<void> {
		try {
			// Delete in correct order due to FK constraints
			if (this.createdSessionIds.length > 0) {
				await this.sessionRepo.delete({ id: In(this.createdSessionIds) });
			}
			if (this.createdAccountIds.length > 0) {
				await this.accountRepo.delete({ id: In(this.createdAccountIds) });
			}
			if (this.createdUserIds.length > 0) {
				await this.userRepo.delete({ id: In(this.createdUserIds) });
			}
		} catch {
			// Ignore cleanup errors (may already be deleted by cascade)
		} finally {
			this.createdUserIds = [];
			this.createdSessionIds = [];
			this.createdAccountIds = [];
		}
	}
}
