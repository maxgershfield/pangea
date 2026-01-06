/**
 * Mock JWKS Server
 *
 * Provides JWT signing and verification utilities for testing
 * the JwksJwtGuard without requiring a real frontend JWKS endpoint.
 */
import { SignJWT, exportJWK, generateKeyPair } from "jose";
import { vi } from "vitest";

export interface JwtPayload {
	id: string;
	email: string;
	role?: string;
	kycStatus?: string;
	name?: string;
}

export interface MockJwksContext {
	privateKey: CryptoKey;
	publicKey: CryptoKey;
	jwks: { keys: JsonWebKey[] };
	generateToken: (payload: JwtPayload) => Promise<string>;
	generateExpiredToken: (payload: JwtPayload) => Promise<string>;
	getJwks: () => { keys: JsonWebKey[] };
}

/**
 * Creates a mock JWKS context for testing JWT validation.
 *
 * @example
 * ```typescript
 * const jwksContext = await createMockJwksContext();
 * const token = await jwksContext.generateToken({
 *   id: 'user-123',
 *   email: 'test@example.com',
 * });
 * ```
 */
export async function createMockJwksContext(): Promise<MockJwksContext> {
	// Generate RSA key pair for JWT signing
	const { privateKey, publicKey } = await generateKeyPair("RS256");

	// Export public key as JWK
	const jwk = await exportJWK(publicKey);
	jwk.kid = "test-key-001";
	jwk.alg = "RS256";
	jwk.use = "sig";

	const jwks = { keys: [jwk] };

	const generateToken = async (payload: JwtPayload): Promise<string> => {
		return new SignJWT({
			...payload,
			sub: payload.id,
		})
			.setProtectedHeader({ alg: "RS256", kid: "test-key-001" })
			.setIssuedAt()
			.setExpirationTime("1h")
			.setIssuer("http://localhost:3001")
			.sign(privateKey);
	};

	const generateExpiredToken = async (payload: JwtPayload): Promise<string> => {
		const now = Math.floor(Date.now() / 1000);
		return new SignJWT({
			...payload,
			sub: payload.id,
		})
			.setProtectedHeader({ alg: "RS256", kid: "test-key-001" })
			.setIssuedAt(now - 7200) // 2 hours ago
			.setExpirationTime(now - 3600) // 1 hour ago (expired)
			.setIssuer("http://localhost:3001")
			.sign(privateKey);
	};

	const getJwks = () => jwks;

	return { privateKey, publicKey, jwks, generateToken, generateExpiredToken, getJwks };
}

/**
 * Creates a mock JwksJwtGuard that validates test tokens.
 * Use this to override the real guard in integration tests.
 *
 * @example
 * ```typescript
 * ctx.module
 *   .overrideGuard(JwksJwtGuard)
 *   .useValue(createMockJwksJwtGuard(jwksContext));
 * ```
 */
export function createMockJwksJwtGuard(_jwksContext?: MockJwksContext) {
	return {
		canActivate: vi.fn().mockImplementation(async (context: {
			switchToHttp: () => {
				getRequest: () => {
					headers?: { authorization?: string };
					user?: JwtPayload;
				};
			};
		}) => {
			const request = context.switchToHttp().getRequest();
			const authHeader = request.headers?.authorization;

			if (!authHeader?.startsWith("Bearer ")) {
				return false;
			}

			try {
				// Decode token payload without full verification for testing
				const token = authHeader.split(" ")[1];
				const [, payloadB64] = token.split(".");
				const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

				request.user = {
					id: payload.id || payload.sub,
					email: payload.email,
					role: payload.role || "user",
					kycStatus: payload.kycStatus || "none",
					name: payload.name,
				};

				return true;
			} catch {
				return false;
			}
		}),
	};
}

/**
 * Creates a simple mock guard that always allows access with a default user.
 * Useful for tests that don't need specific user context.
 */
export function createAlwaysAllowGuard(defaultUser: Partial<JwtPayload> = {}) {
	return {
		canActivate: vi.fn().mockImplementation((context: {
			switchToHttp: () => {
				getRequest: () => {
					user?: JwtPayload;
				};
			};
		}) => {
			const request = context.switchToHttp().getRequest();
			request.user = {
				id: defaultUser.id || "test-user-id",
				email: defaultUser.email || "test@example.com",
				role: defaultUser.role || "user",
				kycStatus: defaultUser.kycStatus || "none",
				name: defaultUser.name || "Test User",
			};
			return true;
		}),
	};
}
