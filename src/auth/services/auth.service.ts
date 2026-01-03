import {
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BetterAuthUser } from "../entities/better-auth-user.entity.js";
import { OasisAuthService } from "./oasis-auth.service.js";

/**
 * Authentication Service
 *
 * This service handles OASIS avatar integration for Better Auth users.
 * User authentication (login, register, password reset) is handled entirely
 * by Better Auth in the frontend.
 *
 * Responsibilities:
 * - Create OASIS avatars for Better Auth users
 * - Link OASIS avatarId to Better Auth user table
 * - Provide user profile access (reads from Better Auth user table)
 */
@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly oasisAuthService: OasisAuthService,
		@InjectRepository(BetterAuthUser)
		private readonly betterAuthUserRepository: Repository<BetterAuthUser>
	) {}

	/**
	 * Get user profile from Better Auth user table
	 */
	async getProfile(userId: string): Promise<BetterAuthUser> {
		const user = await this.betterAuthUserRepository.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		}

		return user;
	}

	/**
	 * Update user profile in Better Auth user table
	 */
	async updateProfile(
		userId: string,
		updateData: {
			firstName?: string;
			lastName?: string;
			email?: string;
		}
	): Promise<BetterAuthUser> {
		const user = await this.betterAuthUserRepository.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		}

		// Update fields if provided
		if (updateData.firstName !== undefined) {
			user.firstName = updateData.firstName;
		}
		if (updateData.lastName !== undefined) {
			user.lastName = updateData.lastName;
		}
		if (updateData.email !== undefined) {
			user.email = updateData.email;
		}

		return this.betterAuthUserRepository.save(user);
	}

	/**
	 * Create OASIS avatar for Better Auth user
	 *
	 * This method:
	 * 1. Creates an OASIS avatar via the OASIS API
	 * 2. Updates the Better Auth user table with the avatarId
	 *
	 * @param data User data from Better Auth JWT
	 * @returns The created OASIS avatarId
	 */
	async createOasisAvatarForUser(data: {
		userId: string;
		email: string;
		username?: string;
		firstName?: string;
		lastName?: string;
	}): Promise<string> {
		try {
			this.logger.log(
				`Creating OASIS avatar for Better Auth user: ${data.userId}, email: ${data.email}`
			);

			// Check if user already has an OASIS avatar
			const existingUser = await this.betterAuthUserRepository.findOne({
				where: { id: data.userId },
			});

			if (existingUser?.avatarId) {
				this.logger.log(`User ${data.userId} already has OASIS avatar: ${existingUser.avatarId}`);
				return existingUser.avatarId;
			}

			// 1. Create OASIS avatar
			const oasisAvatar = await this.oasisAuthService.register({
				email: data.email,
				password: this.generateRandomPassword(), // Random password - user authenticates via Better Auth
				username: data.username || data.email.split("@")[0],
				firstName: data.firstName || "",
				lastName: data.lastName || "",
			});

			this.logger.log(`OASIS avatar created: ${oasisAvatar.avatarId}`);

			// 2. Update Better Auth user table with avatarId
			await this.updateBetterAuthUserWithAvatarId(data.userId, oasisAvatar.avatarId);

			this.logger.log(`OASIS avatar linked to Better Auth user: ${data.userId}`);

			return oasisAvatar.avatarId;
		} catch (error: any) {
			this.logger.error(`Failed to create OASIS avatar: ${error.message}`);
			this.logger.error(`Error stack: ${error.stack}`);
			throw new HttpException(
				error.message || "Failed to create OASIS avatar",
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Update Better Auth user table with OASIS avatarId
	 *
	 * TODO: Ensure the frontend schema (packages/auth/src/db/schema.ts) includes
	 * the avatarId field and run migrations before using this in production.
	 *
	 * Required frontend schema change:
	 * ```typescript
	 * export const user = pgTable("user", {
	 *   // ... existing fields ...
	 *   avatarId: text("avatar_id"),  // Add this field
	 * });
	 * ```
	 */
	private async updateBetterAuthUserWithAvatarId(
		userId: string,
		avatarId: string
	): Promise<void> {
		const user = await this.betterAuthUserRepository.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new HttpException(
				`Better Auth user not found: ${userId}`,
				HttpStatus.NOT_FOUND
			);
		}

		user.avatarId = avatarId;
		await this.betterAuthUserRepository.save(user);

		this.logger.log(`Updated Better Auth user ${userId} with avatarId: ${avatarId}`);
	}

	/**
	 * Get user's OASIS avatarId from Better Auth user table
	 */
	async getAvatarId(userId: string): Promise<string | null> {
		const user = await this.betterAuthUserRepository.findOne({
			where: { id: userId },
		});

		return user?.avatarId || null;
	}

	/**
	 * Check if user has an OASIS avatar
	 */
	async hasOasisAvatar(userId: string): Promise<boolean> {
		const avatarId = await this.getAvatarId(userId);
		return avatarId !== null;
	}

	/**
	 * Generate random password for OASIS avatar
	 * (User won't use this - they authenticate via Better Auth)
	 */
	private generateRandomPassword(): string {
		return (
			Math.random().toString(36).slice(-12) +
			Math.random().toString(36).slice(-12) +
			Math.random().toString(36).slice(-12).toUpperCase() +
			"!@#"
		);
	}
}
