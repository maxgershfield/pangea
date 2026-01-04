import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BetterAuthUser } from "../entities/better-auth-user.entity.js";
import { OasisAuthService } from "./oasis-auth.service.js";

@Injectable()
export class OasisLinkService {
	private readonly logger = new Logger(OasisLinkService.name);

	constructor(
		private readonly oasisAuthService: OasisAuthService,
		@InjectRepository(BetterAuthUser)
		private readonly userRepository: Repository<BetterAuthUser>
	) {}

	/**
	 * Get OASIS avatar ID for Better-Auth user (if exists)
	 */
	async getAvatarId(userId: string): Promise<string | null> {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});

		return user?.avatarId ?? null;
	}

	/**
	 * Create OASIS avatar and link to Better-Auth user
	 */
	async createAndLinkAvatar(params: {
		userId: string;
		email: string;
		username?: string;
		firstName?: string;
		lastName?: string;
		name?: string;
	}): Promise<string> {
		const { userId, email, username, firstName, lastName, name } = params;

		// Check if already linked
		const existing = await this.getAvatarId(userId);
		if (existing) {
			return existing;
		}

		// Generate random password (user won't use it - they use Better-Auth)
		const randomPassword = this.generateRandomPassword();

		// Split name into first/last (if provided and explicit values missing)
		const nameParts = name?.split(" ") || [];
		const resolvedFirstName = firstName ?? nameParts[0] ?? "";
		const resolvedLastName = lastName ?? nameParts.slice(1).join(" ") ?? "";

		try {
			// Create OASIS avatar
			const oasisAvatar = await this.oasisAuthService.register({
				email,
				password: randomPassword,
				username: username || email.split("@")[0],
				firstName: resolvedFirstName,
				lastName: resolvedLastName,
			});

			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				throw new Error(`Better Auth user not found: ${userId}`);
			}

			user.avatarId = oasisAvatar.avatarId;
			await this.userRepository.save(user);

			this.logger.log(`Created and linked OASIS avatar ${oasisAvatar.avatarId} for user ${userId}`);
			return oasisAvatar.avatarId;
		} catch (error: any) {
			this.logger.error(`Failed to create OASIS avatar: ${error.message}`);
			throw new Error(`Failed to create OASIS avatar: ${error.message}`);
		}
	}

	/**
	 * Ensure OASIS avatar exists (lazy creation)
	 * This is the main method called by wallet services
	 */
	async ensureOasisAvatar(userId: string, email: string, name?: string): Promise<string> {
		let avatarId = await this.getAvatarId(userId);

		if (!avatarId) {
			avatarId = await this.createAndLinkAvatar({ userId, email, name });
		}

		return avatarId;
	}

	/**
	 * Get or create avatar (used when we know user will need OASIS features)
	 */
	async getOrCreateAvatar(userId: string, email: string, name?: string): Promise<string> {
		return this.ensureOasisAvatar(userId, email, name);
	}

	private generateRandomPassword(): string {
		// Generate secure random password (user won't use it)
		return (
			Math.random().toString(36).slice(-12) +
			Math.random().toString(36).slice(-12) +
			Math.random().toString(36).slice(-12).toUpperCase() +
			"!@#"
		);
	}
}
