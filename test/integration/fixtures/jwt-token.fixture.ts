/**
 * JWT Token Fixture
 *
 * Generates test JWT tokens for integration testing of protected endpoints.
 */
import { SignJWT, exportJWK, generateKeyPair } from "jose";

export interface UserContext {
	id: string;
	email: string;
	role?: string;
	kycStatus?: string;
	name?: string;
}

export interface TestJwtContext {
	generateToken: (user: Partial<UserContext>) => Promise<string>;
	generateExpiredToken: (user: Partial<UserContext>) => Promise<string>;
	getJwks: () => { keys: JsonWebKey[] };
}

/**
 * Creates a test JWT context with key generation and token creation.
 *
 * @example
 * ```typescript
 * const jwtContext = await createTestJwtContext();
 *
 * const token = await jwtContext.generateToken({
 *   id: user.id,
 *   email: user.email,
 *   role: 'admin',
 * });
 *
 * // Use in HTTP request
 * await request(app)
 *   .get('/user/profile')
 *   .set('Authorization', `Bearer ${token}`)
 *   .expect(200);
 * ```
 */
export async function createTestJwtContext(): Promise<TestJwtContext> {
	const { privateKey, publicKey } = await generateKeyPair("RS256");

	const jwk = await exportJWK(publicKey);
	jwk.kid = "test-key-001";
	jwk.alg = "RS256";
	jwk.use = "sig";

	const generateToken = async (user: Partial<UserContext>): Promise<string> => {
		return new SignJWT({
			id: user.id,
			email: user.email,
			role: user.role || "user",
			kycStatus: user.kycStatus || "none",
			name: user.name,
			sub: user.id,
		})
			.setProtectedHeader({ alg: "RS256", kid: "test-key-001" })
			.setIssuedAt()
			.setExpirationTime("1h")
			.sign(privateKey);
	};

	const generateExpiredToken = async (user: Partial<UserContext>): Promise<string> => {
		const now = Math.floor(Date.now() / 1000);
		return new SignJWT({
			id: user.id,
			email: user.email,
			role: user.role || "user",
			kycStatus: user.kycStatus || "none",
			name: user.name,
			sub: user.id,
		})
			.setProtectedHeader({ alg: "RS256", kid: "test-key-001" })
			.setIssuedAt(now - 7200) // 2 hours ago
			.setExpirationTime(now - 3600) // 1 hour ago (expired)
			.sign(privateKey);
	};

	const getJwks = () => ({ keys: [jwk] });

	return { generateToken, generateExpiredToken, getJwks };
}

/**
 * Creates a simple test token without key pair generation.
 * Useful for mock guard scenarios where full JWT validation isn't needed.
 */
export function createSimpleTestToken(user: Partial<UserContext>): string {
	const header = { alg: "none", typ: "JWT" };
	const payload = {
		id: user.id || "test-user",
		email: user.email || "test@example.com",
		role: user.role || "user",
		kycStatus: user.kycStatus || "none",
		name: user.name || "Test User",
		sub: user.id || "test-user",
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + 3600,
	};

	const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
	const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

	// Unsigned token (for use with mock guards that don't verify signature)
	return `${headerB64}.${payloadB64}.`;
}
