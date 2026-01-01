import { Request } from 'express';

/**
 * Identity attached to `request.user` after successful authentication
 */
export interface UserContext {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  role?: string;
  kycStatus?: 'none' | 'pending' | 'verified' | 'rejected';
}

/**
 * Session metadata attached to `request.session` after authentication
 */
export interface SessionInfo {
  id: string;
  /** Session token [same as Bearer token] */
  token: string;
  expiresAt: Date;
}

/**
 * Express request + guaranteed auth context [set by the auth/session guard]
 *
 * ```ts
 * getProfile(@Req() req: AuthenticatedRequest) {
 *   req.user.email;
 *   req.session.expiresAt;
 * }
 * ```
 */
export interface AuthenticatedRequest extends Request {
  user: UserContext;
  session: SessionInfo;
}

/**
 * Express request where auth may be absent [public routes with optional auth]
 */
export interface MaybeAuthenticatedRequest extends Request {
  user?: UserContext;
  session?: SessionInfo;
}
