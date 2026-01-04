# Authentication Approaches: Backend JWT vs Better-Auth

## Current Situation

**Current Approach:**
- Backend generates its own JWT tokens (`auth.service.ts`)
- Frontend stores these tokens in HttpOnly cookies
- Backend's `JwksJwtGuard` expects Better-Auth tokens (validated via JWKS)
- **Mismatch**: Backend tokens ≠ Better-Auth tokens → Protected endpoints fail

**The Guard's Expectation:**
- `JwksJwtGuard` looks for JWKS endpoint at: `{FRONTEND_URL}/api/auth/jwks`
- Validates tokens using that JWKS endpoint
- **Problem**: Frontend doesn't have Better-Auth set up, so no JWKS endpoint exists

---

## Option 1: Keep Backend Token Generation (Current, but needs fix)

### How it works:
```
User → Frontend → Backend /api/auth/register
                  ↓
              Backend generates JWT token
                  ↓
              Returns token to frontend
                  ↓
              Frontend stores in cookie
                  ↓
              Subsequent requests include token
                  ↓
              Backend validates token (needs custom guard)
```

### Pros:
- ✅ Backend controls token generation
- ✅ Can include custom claims (avatarId, role, etc.)
- ✅ No frontend dependency for auth
- ✅ Works independently of frontend auth system

### Cons:
- ❌ Need to create custom guard (PangeaJwtGuard) to validate backend tokens
- ❌ `JwksJwtGuard` won't work with backend tokens
- ❌ Two token systems (backend JWT + Better-Auth) if frontend adds Better-Auth later

### Implementation:
1. Create `PangeaJwtGuard` that validates backend's own JWT tokens
2. Replace `JwksJwtGuard` with `PangeaJwtGuard` for endpoints using backend tokens
3. Keep `JwksJwtGuard` for future Better-Auth integration if needed

---

## Option 2: Use Better-Auth Tokens (Recommended)

### How it works:
```
User → Frontend Better-Auth → Registers/Logs in
                  ↓
              Better-Auth generates JWT token
                  ↓
              Frontend stores token in cookie
                  ↓
              Frontend calls backend API to create OASIS avatar
                  ↓
              Backend validates Better-Auth token via JWKS
                  ↓
              Backend creates OASIS avatar and links to user
```

### Pros:
- ✅ `JwksJwtGuard` already configured and ready
- ✅ Standard Better-Auth flow (industry standard)
- ✅ Frontend handles all auth (password reset, email verification, etc.)
- ✅ Backend is stateless (just validates tokens)
- ✅ Better-Auth provides built-in features (sessions, 2FA, etc.)

### Cons:
- ❌ Need to set up Better-Auth in frontend (not currently done)
- ❌ Need to coordinate OASIS avatar creation with Better-Auth registration
- ❌ Backend can't generate tokens (must use Better-Auth tokens)

### Implementation Steps:

#### 1. Set up Better-Auth in Frontend

```typescript
// apps/platform/lib/auth/better-auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    // Your database connection
  },
  emailAndPassword: {
    enabled: true,
  },
  // ... other config
});
```

#### 2. Create Next.js API Routes for Better-Auth

```typescript
// apps/platform/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

This automatically creates:
- `/api/auth/sign-up` - Registration
- `/api/auth/sign-in` - Login
- `/api/auth/jwks` - JWKS endpoint (needed by backend guard!)
- `/api/auth/session` - Get current session
- And many more...

#### 3. Modify Frontend Registration Flow

```typescript
// apps/platform/app/api/auth/register/route.ts
export async function POST(request: NextRequest) {
  // 1. Register with Better-Auth
  const authResponse = await fetch('/api/auth/sign-up', {
    method: 'POST',
    body: await request.json(),
  });
  
  if (!authResponse.ok) {
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: authResponse.status }
    );
  }
  
  const { user, session } = await authResponse.json();
  
  // 2. Create OASIS avatar via backend
  const oasisResponse = await fetch(`${API_URL}/api/auth/create-oasis-avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.token}`, // Better-Auth token
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      username: user.name,
      // ... other fields
    }),
  });
  
  // 3. Return Better-Auth session (token in cookie)
  return NextResponse.json({ user });
}
```

#### 4. Create Backend Endpoint for OASIS Avatar Creation

```typescript
// src/auth/controllers/auth.controller.ts
@Post('create-oasis-avatar')
@UseGuards(JwksJwtGuard) // Now this will work!
async createOasisAvatar(
  @Request() req: { user: UserContext },
  @Body() dto: CreateOasisAvatarDto,
) {
  // req.user is populated by JwksJwtGuard from Better-Auth token
  const userId = req.user.id;
  
  // Create OASIS avatar
  const oasisAvatar = await this.oasisAuthService.register({
    email: dto.email,
    username: dto.username,
    // ...
  });
  
  // Link to Pangea user
  await this.userSyncService.syncOasisUserToLocal(oasisAvatar);
  
  return { success: true, avatarId: oasisAvatar.avatarId };
}
```

#### 5. Remove Backend Token Generation

```typescript
// src/auth/services/auth.service.ts
// Remove generateJwtToken() method
// Remove JwtService dependency
// Registration/login endpoints become OASIS avatar creation only
```

---

## Comparison Table

| Aspect | Backend JWT (Current) | Better-Auth Tokens |
|--------|----------------------|-------------------|
| **Token Generation** | Backend generates | Better-Auth generates |
| **Token Validation** | Custom guard needed | `JwksJwtGuard` works |
| **Frontend Setup** | Minimal (just cookies) | Need Better-Auth setup |
| **OASIS Integration** | Direct in backend | Via backend API call |
| **Password Reset** | Backend handles | Better-Auth handles |
| **Email Verification** | Backend handles | Better-Auth handles |
| **2FA / MFA** | Need to implement | Built-in with Better-Auth |
| **Session Management** | Manual | Better-Auth handles |
| **Stateless Backend** | No (generates tokens) | Yes (validates only) |

---

## Recommendation: Use Better-Auth

**Why Better-Auth is better:**

1. **`JwksJwtGuard` is already configured** - It's ready to work, just needs Better-Auth setup
2. **Industry standard** - Better-Auth is a modern, well-maintained auth library
3. **Less backend code** - Backend becomes stateless (just validates tokens)
4. **More features** - Better-Auth provides password reset, email verification, 2FA, etc.
5. **Better separation** - Frontend handles auth, backend handles business logic

**The key insight:**
- Backend doesn't NEED to generate tokens
- Backend just needs to validate tokens and create OASIS avatars
- Better-Auth can handle all the auth complexity

---

## Migration Path

### Phase 1: Set up Better-Auth in Frontend
1. Install Better-Auth: `pnpm add better-auth`
2. Configure Better-Auth with database
3. Create Next.js API routes for Better-Auth endpoints
4. Test Better-Auth registration/login

### Phase 2: Create OASIS Avatar Endpoint
1. Create `POST /api/auth/create-oasis-avatar` endpoint
2. Protected by `JwksJwtGuard` (validates Better-Auth tokens)
3. Creates OASIS avatar and links to user

### Phase 3: Update Frontend Registration
1. Modify frontend registration to:
   - First register with Better-Auth
   - Then call backend to create OASIS avatar
2. Frontend login uses Better-Auth only

### Phase 4: Remove Backend Token Generation
1. Remove `generateJwtToken()` from `AuthService`
2. Remove `JwtService` dependency
3. Remove old `/api/auth/register` and `/api/auth/login` endpoints
4. Keep only OASIS-related endpoints

---

## Architecture with Better-Auth

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  React Components / UI                                               │  │
│  │  • Login Form                                                         │  │
│  │  • Registration Form                                                  │  │
│  └──────┬───────────────────────────────────────────────────────────────┘  │
│         │                                                                    │
│         │ 1. User submits registration                                      │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Frontend Next.js API Route                                          │  │
│  │  /api/auth/register/route.ts                                         │  │
│  │                                                                        │  │
│  │  1. Calls Better-Auth: POST /api/auth/sign-up                        │  │
│  │     → Better-Auth creates user in database                           │  │
│  │     → Better-Auth generates JWT token                                 │  │
│  │     → Returns: { user, session }                                      │  │
│  │                                                                        │  │
│  │  2. Calls Backend: POST /api/auth/create-oasis-avatar                │  │
│  │     Authorization: Bearer <Better-Auth-Token>                        │  │
│  │     → Backend validates token via JWKS                                │  │
│  │     → Backend creates OASIS avatar                                   │  │
│  │     → Backend links avatar to user                                    │  │
│  │                                                                        │  │
│  │  3. Returns user data (token in Better-Auth cookie)                   │  │
│  └──────┬───────────────────────────────────────────────────────────────┘  │
│         │                                                                    │
│         │ Response: { user: {...} }                                          │
│         │ Set-Cookie: better-auth.session_token=<Better-Auth-JWT>           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  User Authenticated                                                   │  │
│  │  Token stored in Better-Auth cookie                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Subsequent API Calls                                                 │  │
│  │                                                                        │  │
│  │  User → Frontend API Route → Backend API                              │  │
│  │         (reads Better-Auth cookie)    (validates via JWKS)            │  │
│  │                                                                        │  │
│  │  ✅ JwksJwtGuard validates Better-Auth token successfully             │  │
│  │  ✅ Protected endpoints work                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    Better-Auth (Frontend)                                   │
│                    /api/auth/*                                              │
│                                                                              │
│  • POST /api/auth/sign-up      → Register user                              │
│  • POST /api/auth/sign-in      → Login user                                 │
│  • GET  /api/auth/jwks         → JWKS endpoint (for backend validation)    │
│  • GET  /api/auth/session      → Get current session                        │
│  • POST /api/auth/sign-out     → Logout                                     │
│  • POST /api/auth/forgot-password → Password reset                          │
│  • ... and many more                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    Pangea Backend                                            │
│                    http://localhost:3001                                      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  POST /api/auth/create-oasis-avatar                                   │  │
│  │  @UseGuards(JwksJwtGuard)                                             │  │
│  │                                                                        │  │
│  │  1. JwksJwtGuard validates Better-Auth token via JWKS                │  │
│  │  2. Extracts user info: { id, email, role }                          │  │
│  │  3. Creates OASIS avatar                                              │  │
│  │  4. Links avatar to Pangea user                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  All Other Protected Endpoints                                        │  │
│  │  @UseGuards(JwksJwtGuard)                                             │  │
│  │                                                                        │  │
│  │  • GET  /api/wallet/balance                                           │  │
│  │  • GET  /api/user/profile                                             │  │
│  │  • POST /api/wallet/generate                                          │  │
│  │  • ... all protected endpoints                                         │  │
│  │                                                                        │  │
│  │  ✅ All work with Better-Auth tokens!                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Answer to Your Question

**"Does the backend need to generate its own JWT tokens?"**

**No!** The backend doesn't need to generate tokens. It can just:
1. Validate Better-Auth tokens via `JwksJwtGuard` (already configured)
2. Create OASIS avatars when needed
3. Link avatars to users

**"How would it work if we just accept Better-Auth tokens from the frontend?"**

1. Frontend uses Better-Auth for all authentication
2. Better-Auth generates JWT tokens and stores them in cookies
3. Frontend makes API calls with Better-Auth tokens
4. Backend validates tokens via `JwksJwtGuard` using Better-Auth's JWKS endpoint
5. Backend extracts user info from token and processes requests
6. Backend creates OASIS avatars when needed (via separate endpoint)

**The key:** Better-Auth handles auth, backend handles business logic (OASIS integration, wallets, etc.)


