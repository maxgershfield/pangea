import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OasisModule } from "../services/oasis.module.js";
import { AuthController } from "./controllers/auth.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { KycGuard, RoleGuard } from "./decorators/session-auth.decorators.js";
import { BetterAuthAccount } from "./entities/better-auth-account.entity.js";
import { BetterAuthSession } from "./entities/better-auth-session.entity.js";
import { BetterAuthUser } from "./entities/better-auth-user.entity.js";
import { BetterAuthVerification } from "./entities/better-auth-verification.entity.js";
import { JwksJwtGuard } from "./guards/jwks-jwt.guard.js";
import { AuthService } from "./services/auth.service.js";
import { OasisAuthService } from "./services/oasis-auth.service.js";
import { OasisLinkService } from "./services/oasis-link.service.js";
import { SessionSubscriber } from "./subscribers/session.subscriber.js";

/**
 * Auth Module
 *
 * Provides JWT-based authentication using JWKS verification with Better Auth.
 *
 * Architecture:
 * 1. Frontend handles all user auth via Better Auth (login, register, password reset)
 * 2. Frontend obtains JWT from Better Auth JWT plugin (/api/auth/token)
 * 3. Frontend forwards JWT to backend via Authorization header
 * 4. Backend validates JWT using JWKS endpoint (/api/auth/jwks)
 * 5. Claims (id, email, role, kycStatus) are attached to request.user
 *
 * OASIS Integration:
 * - After first login, frontend calls /auth/create-oasis-avatar
 * - This creates an OASIS avatar and links it to the Better Auth user
 * - The avatarId is stored in the Better Auth user table
 *
 * Guards:
 * - JwksJwtGuard: Validates JWT using JWKS [stateless]
 * - RoleGuard: Checks user role after authentication
 * - KycGuard: Checks KYC status after authentication
 *
 * Decorators:
 * - @RequireAuth(): Require JWT authentication
 * - @RequireRole('admin'): Require specific role
 * - @RequireKyc('verified'): Require KYC status
 * - @CurrentUser(): Extract user from request
 * - @Public(): Mark route as public [no auth required]
 */
@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([
			BetterAuthUser,
			BetterAuthSession,
			BetterAuthAccount,
			BetterAuthVerification,
		]),
		OasisModule, // For OASIS wallet services
	],
	controllers: [AuthController, UserController],
	providers: [
		AuthService,
		OasisAuthService,
		OasisLinkService,
		SessionSubscriber,
		JwksJwtGuard,
		RoleGuard,
		KycGuard,
	],
	exports: [AuthService, OasisLinkService, JwksJwtGuard, RoleGuard, KycGuard],
})
export class AuthModule {}
