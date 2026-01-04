# Better-Auth Integration Guide for Frontend

## Overview

The backend has been updated to work with Better-Auth tokens. All protected endpoints are ready to accept Better-Auth tokens once the frontend is configured.

## What's Ready

✅ **All protected endpoints use `JwksJwtGuard`** - They will automatically work with Better-Auth tokens  
✅ **New endpoint for OASIS avatar creation** - `POST /api/auth/create-oasis-avatar`  
✅ **Token validation via JWKS** - Backend validates tokens using your Better-Auth JWKS endpoint  
✅ **User context extraction** - Backend extracts `id`, `email`, `role`, `kycStatus`, and `name` from tokens  

## Frontend Setup Required

### 1. Set up Better-Auth

Install and configure Better-Auth in your Next.js app:

```bash
pnpm add better-auth
```

Create Better-Auth configuration:

```typescript
// apps/platform/lib/auth/better-auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"; // or your adapter

export const auth = betterAuth({
  database: {
    // Your database adapter
  },
  emailAndPassword: {
    enabled: true,
  },
  // ... other config
});
```

### 2. Create Next.js API Routes

Create the Better-Auth API routes:

```typescript
// apps/platform/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

This automatically creates:
- `/api/auth/sign-up` - Registration
- `/api/auth/sign-in` - Login
- `/api/auth/jwks` - **JWKS endpoint (required by backend!)**
- `/api/auth/session` - Get current session
- `/api/auth/sign-out` - Logout
- And many more...

### 3. Update Registration Flow

After Better-Auth registration, call the backend to create OASIS avatar:

```typescript
// apps/platform/app/api/auth/register/route.ts (or your registration handler)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Register with Better-Auth
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        name: body.name, // Better-Auth will include this in token
      }),
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      return NextResponse.json(
        { message: error.message || 'Registration failed' },
        { status: authResponse.status }
      );
    }

    const { user, session } = await authResponse.json();

    // 2. Create OASIS avatar via backend
    // The backend will extract user info from the Better-Auth token
    const oasisResponse = await fetch(`${BACKEND_URL}/api/auth/create-oasis-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`, // Better-Auth token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Optional - backend will use token claims if not provided
        email: user.email,
        name: user.name,
      }),
    });

    if (!oasisResponse.ok) {
      const error = await oasisResponse.json();
      // Log error but don't fail registration - user can create avatar later
      console.error('Failed to create OASIS avatar:', error);
    }

    // 3. Return Better-Auth session (token in cookie)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Update Login Flow

Login is simpler - just use Better-Auth:

```typescript
// apps/platform/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const AUTH_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Login with Better-Auth
    const response = await fetch(`${AUTH_URL}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Login failed' },
        { status: response.status }
      );
    }

    // Better-Auth handles token storage in cookies
    // Just return user data
    return NextResponse.json({
      user: data.user,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 5. Update API Calls to Use Better-Auth Tokens

Your existing `auth-fetch.ts` utility should work, but make sure it reads Better-Auth tokens:

```typescript
// apps/platform/app/api/_lib/auth-fetch.ts
import { cookies } from "next/headers";

// Better-Auth stores token in cookie named 'better-auth.session_token'
// Check your Better-Auth config for the exact cookie name
const BETTER_AUTH_COOKIE = 'better-auth.session_token';

export async function getAuthTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  // Try Better-Auth cookie first
  const betterAuthToken = cookieStore.get(BETTER_AUTH_COOKIE)?.value;
  if (betterAuthToken) {
    return betterAuthToken;
  }
  // Fallback to old cookie name if needed
  return cookieStore.get('pangea_token')?.value;
}
```

## Backend Endpoints

### Public Endpoints (No Auth Required)

- `POST /api/auth/register` - Legacy registration (will be deprecated)
- `POST /api/auth/login` - Legacy login (will be deprecated)
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Protected Endpoints (Require Better-Auth Token)

All these endpoints use `JwksJwtGuard` and will work with Better-Auth tokens:

#### Auth
- `POST /api/auth/create-oasis-avatar` - **NEW**: Create OASIS avatar for Better-Auth user

#### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

#### Wallet
- `GET /api/wallet/balance` - Get all wallet balances
- `GET /api/wallet/balance/:assetId` - Get balance for specific asset
- `POST /api/wallet/generate` - Generate new wallet
- `POST /api/wallet/connect` - Connect external wallet
- `POST /api/wallet/verify` - Verify wallet ownership
- `POST /api/wallet/sync` - Sync balances
- `GET /api/wallet/verification-message` - Get verification message
- `GET /api/wallet/transactions/:walletId` - Get transaction history

#### Other Protected Endpoints
- All other endpoints using `@UseGuards(JwksJwtGuard)`

## Token Structure

The backend expects Better-Auth tokens with these claims:

```typescript
{
  id: string;        // Required: User ID
  email: string;     // Required: User email
  role?: string;     // Optional: User role (defaults to "user")
  kycStatus?: string; // Optional: KYC status (defaults to "none")
  name?: string;     // Optional: User name (will be used for OASIS avatar)
}
```

## User Context

After token validation, the backend attaches `UserContext` to `request.user`:

```typescript
{
  id: string;        // From token.id
  email: string;     // From token.email
  role: string;      // From token.role or "user"
  kycStatus: string; // From token.kycStatus or "none"
  name?: string;     // From token.name (if provided)
}
```

## Environment Variables

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Frontend URL (for Better-Auth)
```

### Backend

```env
FRONTEND_URL=http://localhost:3000  # Frontend URL (for JWKS endpoint)
# or
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Alternative name
```

The backend will look for JWKS at: `{FRONTEND_URL}/api/auth/jwks`

## Testing

### 1. Test Better-Auth Setup

```bash
# Start frontend
cd apps/platform
pnpm dev

# Test Better-Auth endpoints
curl http://localhost:3000/api/auth/jwks  # Should return JWKS
```

### 2. Test Registration Flow

```bash
# 1. Register with Better-Auth
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# 2. Get token from response and create OASIS avatar
curl -X POST http://localhost:3001/api/auth/create-oasis-avatar \
  -H "Authorization: Bearer <BETTER_AUTH_TOKEN>" \
  -H "Content-Type: application/json"
```

### 3. Test Protected Endpoints

```bash
# Get wallet balance (requires Better-Auth token)
curl http://localhost:3001/api/wallet/balance \
  -H "Authorization: Bearer <BETTER_AUTH_TOKEN>"
```

## Migration Notes

### Current State (Before Better-Auth)

- Backend generates its own JWT tokens
- Frontend stores tokens in `pangea_token` cookie
- Protected endpoints fail (guard expects Better-Auth tokens)

### After Better-Auth Setup

- Better-Auth generates tokens
- Frontend stores tokens in Better-Auth cookie
- All protected endpoints work automatically
- OASIS avatar created via `/api/auth/create-oasis-avatar`

### Backward Compatibility

The backend still has legacy endpoints (`/api/auth/register`, `/api/auth/login`) that generate backend tokens. These will continue to work but should be deprecated once Better-Auth is fully integrated.

## Troubleshooting

### Error: "JWKS not initialized"

**Cause**: Backend can't reach frontend's JWKS endpoint  
**Fix**: 
1. Ensure frontend is running
2. Check `FRONTEND_URL` environment variable in backend
3. Verify `/api/auth/jwks` is accessible

### Error: "Invalid token signature"

**Cause**: Token is not from Better-Auth (e.g., old backend token)  
**Fix**: Use Better-Auth tokens only

### Error: "Missing Bearer token"

**Cause**: No token in Authorization header  
**Fix**: Ensure frontend includes `Authorization: Bearer <token>` header

### Error: "Invalid token claims"

**Cause**: Token missing required claims (`id` or `email`)  
**Fix**: Ensure Better-Auth token includes `id` and `email` claims

## Next Steps

1. ✅ Backend is ready for Better-Auth tokens
2. ⏳ Frontend needs to set up Better-Auth
3. ⏳ Frontend needs to update registration/login flows
4. ⏳ Frontend needs to call `/api/auth/create-oasis-avatar` after registration
5. ⏳ Test end-to-end flow
6. ⏳ Deprecate legacy registration/login endpoints

## Support

If you encounter issues:
1. Check backend logs for JWKS connection errors
2. Verify Better-Auth token structure matches expected claims
3. Ensure `FRONTEND_URL` is correctly configured
4. Test JWKS endpoint is accessible: `curl {FRONTEND_URL}/api/auth/jwks`


