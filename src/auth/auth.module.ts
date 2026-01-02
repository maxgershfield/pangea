import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OasisModule } from '../services/oasis.module.js';
import { User } from '../users/entities/user.entity.js';
import { AuthController } from './controllers/auth.controller.js';
import { UserController } from './controllers/user.controller.js';
import { KycGuard, RoleGuard } from './decorators/session-auth.decorators.js';
import { BetterAuthAccount } from './entities/better-auth-account.entity.js';
import { BetterAuthSession } from './entities/better-auth-session.entity.js';
import { BetterAuthUser } from './entities/better-auth-user.entity.js';
import { BetterAuthVerification } from './entities/better-auth-verification.entity.js';
import { JwksJwtGuard } from './guards/jwks-jwt.guard.js';
import { AuthService } from './services/auth.service.js';
import { OasisAuthService } from './services/oasis-auth.service.js';
import { OasisLinkService } from './services/oasis-link.service.js';
import { UserSyncService } from './services/user-sync.service.js';
import { SessionSubscriber } from './subscribers/session.subscriber.js';

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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'pangea-jwt-secret',
        signOptions: {
          expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
        },
      }),
    }),
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
