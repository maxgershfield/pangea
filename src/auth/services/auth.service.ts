import {
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../users/entities/user.entity.js";
import { AuthResponseDto, LoginDto, RegisterDto } from "../dto/index.js";
import { OasisAuthService } from "./oasis-auth.service.js";
import { UserSyncService } from "./user-sync.service.js";

/**
 * Main authentication service
 * Generates Pangea-specific JWT tokens (not OASIS tokens)
 * Based on Shipex Pro pattern
 */
@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly oasisAuthService: OasisAuthService,
		private readonly userSyncService: UserSyncService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	/**
	 * Register a new user
	 * 1. Register with OASIS Avatar API
	 * 2. Sync to local database
	 * 3. Generate Pangea JWT token
	 */
	async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
		try {
			this.logger.log(
				`Starting registration for email: ${registerDto.email}, username: ${registerDto.username}`
			);

			// 1. Register with OASIS
			const oasisAvatar = await this.oasisAuthService.register({
				email: registerDto.email,
				password: registerDto.password,
				username: registerDto.username,
				firstName: registerDto.firstName,
				lastName: registerDto.lastName,
			});

			this.logger.log(`OASIS registration successful, avatarId: ${oasisAvatar.avatarId}`);

			// 2. Sync to local database
			const user = await this.userSyncService.syncOasisUserToLocal(oasisAvatar);

			this.logger.log(`User synced to local DB, userId: ${user.id}`);

			// 3. Generate Pangea JWT token
			const token = this.generateJwtToken(user);

			return {
				user: {
					id: user.id,
					email: user.email,
					username: user.username || "",
					firstName: user.firstName || undefined,
					lastName: user.lastName || undefined,
					avatarId: user.avatarId || "",
					role: user.role,
				},
				token,
				expiresAt: this.getTokenExpiration(),
			};
		} catch (error: any) {
			this.logger.error(`Registration failed: ${error.message}`);
			this.logger.error(`Error stack: ${error.stack}`);
			// Re-throw with proper HTTP exception if it's not already one
			if (error instanceof HttpException || error.status) {
				throw error;
			}
			throw new HttpException(
				error.message || "Registration failed",
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Login user
	 * 1. Authenticate with OASIS Avatar API
	 * 2. Sync to local database
	 * 3. Generate Pangea JWT token
	 */
	async login(loginDto: LoginDto): Promise<AuthResponseDto> {
		try {
			// 1. Authenticate with OASIS
			const oasisAvatar = await this.oasisAuthService.login(loginDto.email, loginDto.password);

			// 2. Sync to local database
			const user = await this.userSyncService.syncOasisUserToLocal(oasisAvatar);

			// 3. Update last login
			await this.userSyncService.updateLastLogin(user.id);

			// 4. Generate Pangea JWT token
			const token = this.generateJwtToken(user);

			return {
				user: {
					id: user.id,
					email: user.email,
					username: user.username || "",
					firstName: user.firstName || undefined,
					lastName: user.lastName || undefined,
					avatarId: user.avatarId || "",
					role: user.role,
				},
				token,
				expiresAt: this.getTokenExpiration(),
			};
		} catch (error: any) {
			this.logger.error(`Login failed: ${error.message}`);
			throw new UnauthorizedException("Invalid email or password");
		}
	}

	/**
	 * Get user profile
	 */
	async getProfile(userId: string): Promise<User> {
		const user = await this.userSyncService.getUserById(userId);
		if (!user) {
			throw new UnauthorizedException("User not found");
		}
		return user;
	}

	/**
	 * Update user profile
	 */
	async updateProfile(
		userId: string,
		updateData: {
			firstName?: string;
			lastName?: string;
			email?: string;
		}
	): Promise<User> {
		const user = await this.userSyncService.getUserById(userId);
		if (!user) {
			throw new UnauthorizedException("User not found");
		}

		if (!user.avatarId) {
			throw new Error("User avatar ID not found");
		}

		// Update in OASIS
		const updatedOasisAvatar = await this.oasisAuthService.updateUserProfile(
			user.avatarId,
			updateData
		);

		// Sync updated data back to local database
		return await this.userSyncService.syncOasisUserToLocal(updatedOasisAvatar);
	}

	/**
	 * Request password reset
	 */
	async forgotPassword(email: string): Promise<void> {
		await this.oasisAuthService.forgotPassword(email);
		// Don't reveal if email exists or not
	}

	/**
	 * Reset password
	 */
	async resetPassword(token: string, newPassword: string): Promise<void> {
		await this.oasisAuthService.resetPassword(token, newPassword);
	}

	/**
	 * Validate user from JWT payload
	 */
	async validateUser(userId: string): Promise<User | null> {
		return this.userSyncService.getUserById(userId);
	}

	/**
	 * Create OASIS avatar for Better-Auth user
	 * Called after Better-Auth registration/login to create OASIS avatar
	 * and link it to the user.
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
				`Creating OASIS avatar for Better-Auth user: ${data.userId}, email: ${data.email}`
			);

			// 1. Register with OASIS
			const oasisAvatar = await this.oasisAuthService.register({
				email: data.email,
				password: this.generateRandomPassword(), // Random password - user uses Better-Auth
				username: data.username || data.email.split("@")[0],
				firstName: data.firstName || "",
				lastName: data.lastName || "",
			});

			this.logger.log(`OASIS avatar created: ${oasisAvatar.avatarId}`);

			// 2. Sync to local database (creates/updates user with avatarId)
			const user = await this.userSyncService.syncOasisUserToLocal(oasisAvatar);

			this.logger.log(`OASIS avatar linked to user: ${user.id}`);

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
	 * Generate random password for OASIS avatar
	 * (User won't use this - they authenticate via Better-Auth)
	 */
	private generateRandomPassword(): string {
		return (
			Math.random().toString(36).slice(-12) +
			Math.random().toString(36).slice(-12) +
			Math.random().toString(36).slice(-12).toUpperCase() +
			"!@#"
		);
	}

	/**
	 * Generate Pangea JWT token (not OASIS token)
	 */
	private generateJwtToken(user: User): string {
		const payload = {
			sub: user.id,
			email: user.email,
			username: user.username,
			avatarId: user.avatarId,
			role: user.role,
		};

		return this.jwtService.sign(payload);
	}

	/**
	 * Get token expiration date
	 */
	private getTokenExpiration(): Date {
		const expiresIn = this.configService.get<string>("JWT_EXPIRES_IN") || "7d";
		// Parse expiresIn (e.g., "7d", "24h", "30m")
		const now = new Date();
		if (expiresIn.endsWith("d")) {
			const days = Number.parseInt(expiresIn, 10);
			now.setDate(now.getDate() + days);
		} else if (expiresIn.endsWith("h")) {
			const hours = Number.parseInt(expiresIn, 10);
			now.setHours(now.getHours() + hours);
		} else if (expiresIn.endsWith("m")) {
			const minutes = Number.parseInt(expiresIn, 10);
			now.setMinutes(now.getMinutes() + minutes);
		} else {
			// Default to 7 days
			now.setDate(now.getDate() + 7);
		}
		return now;
	}
}
