import {
    applyDecorators,
    CanActivate,
    createParamDecorator,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    SetMetadata,
    UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwksJwtGuard, UserContext } from '../guards/jwks-jwt.guard.js';

/**
 * Require JWT authentication, validated via JWKS.
 *
 * Used on routes/controllers that must have an authenticated user.
 */
export function RequireAuth() {
  return applyDecorators(UseGuards(JwksJwtGuard));
}

/**
 * Access the authenticated user, or a specific field, from the request.
 *
 * Requires `JwksJwtGuard` - normally via `@RequireAuth()`
 *
 * Examples:
 * ```ts
 * getMe(@CurrentUser() user: UserContext) {}
 * getEmail(@CurrentUser('email') email: string) {}
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserContext | undefined;
    if (!user) return null;
    return data ? user[data] : user;
  },
);

/** Metadata key for role requirements */
export const ROLES_KEY = 'roles';

/** Declare which roles are required to access given route/controller */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Require authentication + at minimum one of the given roles.
 *
 * Roles are treated as OR (any matching role passes)
 */
export function RequireRole(...roles: string[]) {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(JwksJwtGuard, RoleGuard));
}

/** Enforces `@RequireRole()` role metadata after authentication */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserContext | undefined;
    if (!user) throw new ForbiddenException('User not authenticated');

    if (!user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Insufficient role (required: ${requiredRoles.join(' | ')}, got: ${user.role ?? 'none'})`,
      );
    }

    return true;
  }
}

/** Metadata key for KYC requirements */
export const KYC_STATUS_KEY = 'kyc_status';

/**
 * Require authentication + a specific KYC status.
 *
 * Example:
 * ```ts
 * @RequireKyc('verified')
 * ```
 */
export function RequireKyc(status: 'none' | 'pending' | 'verified' | 'rejected') {
  return applyDecorators(SetMetadata(KYC_STATUS_KEY, status), UseGuards(JwksJwtGuard, KycGuard));
}

/** Enforces `@RequireKyc()` metadata after authentication */
@Injectable()
export class KycGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredStatus = this.reflector.getAllAndOverride<string>(KYC_STATUS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredStatus) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserContext | undefined;
    if (!user) throw new ForbiddenException('User not authenticated');

    if (user.kycStatus !== requiredStatus) {
      throw new ForbiddenException(
        `Invalid KYC status (required: ${requiredStatus}, got: ${user.kycStatus ?? 'none'})`,
      );
    }

    return true;
  }
}
