# Backend Testing Status

## ✅ What's Working Now

### Authentication & Registration
- ✅ **User Registration** (`POST /api/auth/register`)
  - Creates Pangea user
  - Creates OASIS avatar
  - Links Pangea User ID ↔ OASIS Avatar ID
  - Returns JWT token with avatarId

- ✅ **User Login** (`POST /api/auth/login`)
  - Authenticates with OASIS
  - Syncs user data
  - Returns JWT token with avatarId
  - Link persists correctly

### Test Endpoints (Public)
- ✅ **Wallet Generation (Test)** (`POST /api/wallet/test/generate`)
  - Bypasses authentication with `@Public()` decorator
  - Can create wallets for testing
  - Uses `userId`, `email`, `name` directly in body

## ⚠️ What's Still Blocked

### Protected Endpoints (Require JwksJwtGuard)

The following endpoints are protected by `JwksJwtGuard`, which expects **Better-Auth tokens from the frontend**, not the Pangea backend's own JWT tokens:

#### Wallet Endpoints
- ❌ `GET /api/wallet/balance` - Get all balances
- ❌ `GET /api/wallet/balance/:assetId` - Get asset balance
- ❌ `POST /api/wallet/generate` - Generate wallet (protected version)
- ❌ `POST /api/wallet/connect` - Connect external wallet
- ❌ `POST /api/wallet/verify` - Verify wallet
- ❌ `POST /api/wallet/sync` - Sync balances
- ❌ `GET /api/wallet/verification-message` - Get verification message
- ❌ `GET /api/wallet/transactions/:walletId` - Get transactions

#### Other Protected Endpoints
- ❌ `GET /api/user/profile` - Get user profile
- ❌ All other endpoints using `@UseGuards(JwksJwtGuard)`

## 🔍 Why They're Blocked

The `JwksJwtGuard`:
1. Expects tokens from the frontend's JWKS endpoint (`/api/auth/jwks`)
2. Validates tokens using `jwtVerify` with remote JWKS
3. The Pangea backend's own JWT tokens (from `auth.service.ts`) are:
   - Signed with a different key (from `JwtService`)
   - Not compatible with the frontend's JWKS endpoint
   - Will fail validation with "Invalid token signature"

## 🚀 Options to Unblock Testing

### Option 1: Add More Test Endpoints (Quick Fix)
Add `@Public()` decorator to test versions of endpoints:

```typescript
@Public()
@Post("test/balance")
async testGetBalances(@Body() dto: { userId: string; email: string }) {
  // Test implementation
}
```

**Pros:**
- Quick to implement
- Doesn't change production code
- Can test functionality immediately

**Cons:**
- Test endpoints need to be removed before production
- Doesn't test the actual authentication flow

### Option 2: Create a Custom JWT Guard (Better Solution)
Create a guard that validates Pangea backend's own JWT tokens:

```typescript
@Injectable()
export class PangeaJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Validate Pangea backend's own JWT tokens
    // Extract user from token payload
  }
}
```

Then use it instead of `JwksJwtGuard`:
```typescript
@UseGuards(PangeaJwtGuard) // Instead of JwksJwtGuard
```

**Pros:**
- Tests the actual authentication flow
- Can be used alongside `JwksJwtGuard` (different endpoints)
- More realistic testing

**Cons:**
- Requires implementation
- Need to decide which endpoints use which guard

### Option 3: Fix JwksJwtGuard to Support Both (Best Solution)
Modify `JwksJwtGuard` to:
1. First try to validate as Better-Auth token (JWKS)
2. If that fails, try to validate as Pangea backend token (local JWT)
3. Support both token types

**Pros:**
- Single guard handles both cases
- Works with frontend and backend tokens
- Most flexible solution

**Cons:**
- More complex implementation
- Need to handle token type detection

### Option 4: Use Frontend for Testing (End-to-End)
Test through the actual frontend application:
- Frontend gets Better-Auth tokens
- Frontend makes authenticated requests
- Tests the complete flow

**Pros:**
- Tests the real user flow
- No code changes needed

**Cons:**
- Requires frontend to be set up
- Slower testing cycle
- Harder to automate

## 📊 Current Testing Capabilities

| Endpoint Category | Status | Can Test? |
|------------------|--------|-----------|
| Auth (register/login) | ✅ Public | ✅ Yes |
| Wallet (test endpoint) | ✅ Public | ✅ Yes |
| Wallet (protected) | ❌ Blocked | ❌ No |
| User Profile | ❌ Blocked | ❌ No |
| Other Protected | ❌ Blocked | ❌ No |

## 🎯 Recommended Next Steps

1. **Immediate**: Test wallet creation using the test endpoint
   ```bash
   POST /api/wallet/test/generate
   {
     "userId": "...",
     "email": "...",
     "providerType": "SolanaOASIS"
   }
   ```

2. **Short-term**: Implement `PangeaJwtGuard` for backend testing
   - Allows testing with backend JWT tokens
   - Doesn't interfere with frontend integration

3. **Long-term**: Decide on authentication strategy
   - Use Better-Auth for all endpoints (requires frontend integration)
   - Use Pangea JWT for backend, Better-Auth for frontend (hybrid)
   - Support both token types in guards

## ✅ What We Can Test Right Now

### 1. Wallet Creation (Test Endpoint)
```bash
curl -X POST http://localhost:3001/api/wallet/test/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "d69af702-9f8c-4ac7-8854-969e57eb4d64",
    "email": "test-link-1767436590@example.com",
    "name": "Test User",
    "providerType": "SolanaOASIS",
    "setAsDefault": true
  }'
```

### 2. User Registration Flow
- ✅ Already tested and working
- ✅ Link established correctly

### 3. User Login Flow
- ✅ Already tested and working
- ✅ Link persists correctly

## 🔧 Quick Fix: Add Test Endpoints

If you want to test more endpoints immediately, I can add `@Public()` test versions of:
- `GET /api/wallet/test/balance`
- `GET /api/wallet/test/transactions/:walletId`
- `GET /api/user/test/profile`

These would accept `userId` and `email` directly in the request body/query params.

---

**Last Updated:** 2025-01-03  
**Status:** Core flow working, protected endpoints blocked by authentication guard


