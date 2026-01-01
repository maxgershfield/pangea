import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createRemoteJWKSet, JWTPayload, jwtVerify } from 'jose';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * User context attached to `request.user` after OK authentication.
 * Values are derived from `better-auth` JWT claims.
 */
export interface UserContext {
  id: string;
  email: string;
  role: string;
  kycStatus: string;
}

/** Expected `better-auth` JWT claim shape. */
interface BetterAuthJwtPayload extends JWTPayload {
  id: string;
  email: string;
  role?: string;
  kycStatus?: string;
}

/**
 * Validates `better-auth` JWTs using the frontend's JWKS endpoint.
 *
 * - Tokens are provided via `Authorization: Bearer <token>`
 * - Signatures are verified using a cached remote JWKS (`/api/auth/jwks`)
 * - On success, `request.user` is populated with `{ id, email, role, kycStatus }`
 *
 * Use `@Public()` (via `IS_PUBLIC_KEY`) to bypass this guard.
 */
@Injectable()
export class JwksJwtGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(JwksJwtGuard.name);
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  private readonly frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_APP_URL') ||
      'http://localhost:3001';
  }

  onModuleInit() {
    const jwksUrl = new URL('/api/auth/jwks', this.frontendUrl);

    // remote JWKS fetcher, implements caching + refresh throttling
    this.jwks = createRemoteJWKSet(jwksUrl, {
      cacheMaxAge: 10 * 60 * 1000, // 10m
      cooldownDuration: 30 * 1000, // 30s
    });

    this.logger.log(`JWKS configured: ${jwksUrl.toString()}`);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    const token = this.extractBearerToken(request);
    if (!token) throw new UnauthorizedException('Missing Bearer token');

    if (!this.jwks) {
      this.logger.error('JWKS not initialized');
      throw new UnauthorizedException('Authentication service unavailable');
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        // issuer: this.frontendUrl,
      });

      const jwtPayload = payload as BetterAuthJwtPayload;
      if (!jwtPayload.id || !jwtPayload.email) {
        throw new UnauthorizedException('Invalid token claims');
      }

      request.user = {
        id: jwtPayload.id,
        email: jwtPayload.email,
        role: jwtPayload.role ?? 'user',
        kycStatus: jwtPayload.kycStatus ?? 'none',
      } satisfies UserContext;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;

      const message = error instanceof Error ? error.message : 'Token validation failed';
      if (message.includes('expired')) throw new UnauthorizedException('Token expired');
      if (message.includes('signature')) throw new UnauthorizedException('Invalid token signature');

      this.logger.error(`JWT verification failed: ${message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /** Return Bearer token from `Authorization`, or `null` if missing/invalid. */
  private extractBearerToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return null;

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

    return token;
  }
}
