import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OasisModule } from '../services/oasis.module';
import { User } from '../users/entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { KycGuard, RoleGuard } from './decorators/session-auth.decorators';
import { BetterAuthAccount } from './entities/better-auth-account.entity';
import { BetterAuthSession } from './entities/better-auth-session.entity';
import { BetterAuthUser } from './entities/better-auth-user.entity';
import { BetterAuthVerification } from './entities/better-auth-verification.entity';
import { JwksJwtGuard } from './guards/jwks-jwt.guard';
import { AuthService } from './services/auth.service';
import { OasisAuthService } from './services/oasis-auth.service';
import { OasisLinkService } from './services/oasis-link.service';
import { UserSyncService } from './services/user-sync.service';
import { SessionSubscriber } from './subscribers/session.subscriber';

/**
 * Auth Module
 *
 * Provides JWT-based authentication using JWKS verification.
 * Implementation notes:
 * 1. Next.js frontend manages sessions via `better-auth`
 * 2. Frontend obtains JWT from `better-auth` JWT plugin (/api/auth/token)
 * 3. Frontend forwards JWT to backend via Authorization header
 * 4. Backend validates JWT using JWKS endpoint (/api/auth/jwks)
 * 5. Claims (id, email, role, kycStatus) are attached to request.user
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
      User,
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
    UserSyncService,
    OasisLinkService,
    SessionSubscriber,
    JwksJwtGuard,
    RoleGuard,
    KycGuard,
  ],
  exports: [
    AuthService,
    OasisLinkService,
    JwksJwtGuard,
    RoleGuard,
    KycGuard,
  ],
})
export class AuthModule {}
