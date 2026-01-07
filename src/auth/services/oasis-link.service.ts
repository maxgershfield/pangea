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
	 * Returns the full OASIS avatar object for frontend to create user record
	 * 
	 * First checks if avatar already exists by email, then creates if not found
	 */
	async createAndLinkAvatar(params: {
		userId: string;
		email: string;
		username?: string;
		firstName?: string;
		lastName?: string;
		name?: string;
	}): Promise<import("./oasis-auth.service.js").OASISAvatar> {
		const { userId, email, username, firstName, lastName, name } = params;

		// Check if already linked
		const existing = await this.getAvatarId(userId);
		if (existing) {
			// Return existing avatar data
			const existingAvatar = await this.oasisAuthService.getUserProfile(existing);
			return existingAvatar;
		}

		// Check if avatar already exists in OASIS by email
		try {
			this.logger.log(`Checking if OASIS avatar exists for email: ${email}`);
			const existingAvatar = await this.oasisAuthService.getAvatarByEmail(email);
			
			if (existingAvatar) {
				this.logger.log(`Found existing OASIS avatar ${existingAvatar.avatarId} for email: ${email}`);
				
				// Link existing avatar to Better Auth user
				const user = await this.userRepository.findOne({
					where: { id: userId },
				});

				if (!user) {
					throw new Error(`Better Auth user not found: ${userId}`);
				}

				user.avatarId = existingAvatar.avatarId;
				await this.userRepository.save(user);

				this.logger.log(`Linked existing OASIS avatar ${existingAvatar.avatarId} to user ${userId}`);
				return existingAvatar;
			}
		} catch (error: any) {
			// If lookup fails (e.g., auth issue), log but continue to try creating
			this.logger.warn(`Failed to check for existing avatar by email: ${error.message}. Will attempt to create new avatar.`);
		}

		// Avatar doesn't exist, create new one
		this.logger.log(`No existing avatar found, creating new OASIS avatar for email: ${email}`);

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
			return oasisAvatar;
		} catch (error: any) {
			// If registration fails because email is already in use, try to look up existing avatar
			const errorMessage = error.message?.toLowerCase() || "";
			const lowerMessage = errorMessage;
			
			if (lowerMessage.includes("already in use") || 
			    (lowerMessage.includes("email") && lowerMessage.includes("already")) ||
			    lowerMessage.includes("sorry, the email")) {
				this.logger.log(`Registration failed - email already in use. Attempting to look up existing avatar for: ${email}`);
				
				try {
					const existingAvatar = await this.oasisAuthService.getAvatarByEmail(email);
					
					if (existingAvatar) {
						this.logger.log(`Found existing OASIS avatar ${existingAvatar.avatarId} for email: ${email}`);
						
						// Link existing avatar to Better Auth user
						const user = await this.userRepository.findOne({
							where: { id: userId },
						});

						if (!user) {
							throw new Error(`Better Auth user not found: ${userId}`);
						}

						user.avatarId = existingAvatar.avatarId;
						await this.userRepository.save(user);

						this.logger.log(`Linked existing OASIS avatar ${existingAvatar.avatarId} to user ${userId}`);
						return existingAvatar;
					} else {
						this.logger.warn(`Email is in use but could not find avatar by email. This may indicate an OASIS API issue.`);
						throw new Error(`Email ${email} is already in use in OASIS, but avatar lookup failed. Please contact support.`);
					}
				} catch (lookupError: any) {
					this.logger.error(`Failed to look up existing avatar after registration error: ${lookupError.message}`);
					throw new Error(`Email ${email} is already in use in OASIS. Please use a different email or contact support to link your existing account.`);
				}
			}
			
			this.logger.error(`Failed to create OASIS avatar: ${error.message}`);
			throw new Error(`Failed to create OASIS avatar: ${error.message}`);
		}
	}

	/**
	 * Ensure OASIS avatar exists (lazy creation)
	 * This is the main method called by wallet services
	 * @deprecated Use getAvatarId() and createAndLinkAvatar() separately for better control
	 */
	async ensureOasisAvatar(userId: string, email: string, name?: string): Promise<string> {
		let avatarId = await this.getAvatarId(userId);

		if (!avatarId) {
			const avatar = await this.createAndLinkAvatar({ userId, email, name });
			avatarId = avatar.avatarId;
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
