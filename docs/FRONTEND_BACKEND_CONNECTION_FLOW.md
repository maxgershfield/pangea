# Frontend to Backend Connection Flow

## Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  React Components / UI                                               │  │
│  │  (Client-Side)                                                       │  │
│  │                                                                        │  │
│  │  • Login Form                                                         │  │
│  │  • Registration Form                                                  │  │
│  │  • Wallet Dashboard                                                   │  │
│  │  • Asset Trading UI                                                   │  │
│  └───────────────────┬──────────────────────────────────────────────────┘  │
│                      │                                                      │
│                      │ 1. User Action (click, submit, etc.)                 │
│                      │                                                      │
│                      ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (Server-Side Proxy)                               │  │
│  │  apps/platform/app/api/                                               │  │
│  │                                                                        │  │
│  │  Examples:                                                             │  │
│  │  • /api/auth/login/route.ts                                           │  │
│  │  • /api/auth/register/route.ts                                        │  │
│  │  • /api/wallet/balance/route.ts                                       │  │
│  │  • /api/user/profile/route.ts                                         │  │
│  └───────────────────┬──────────────────────────────────────────────────┘  │
│                      │                                                      │
│                      │ 2. Reads HttpOnly Cookie                            │
│                      │    getAuthTokenCookie()                             │
│                      │                                                      │
│                      ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  auth-fetch.ts Utility                                                │  │
│  │  apps/platform/app/api/_lib/auth-fetch.ts                             │  │
│  │                                                                        │  │
│  │  • Reads token from HttpOnly cookie                                    │  │
│  │  • Adds Authorization: Bearer <token> header                          │  │
│  │  • Makes request to backend API                                       │  │
│  │  • Handles errors and cookie cleanup                                  │  │
│  └───────────────────┬──────────────────────────────────────────────────┘  │
│                      │                                                      │
│                      │ 3. HTTP Request                                      │
│                      │    Authorization: Bearer <JWT_TOKEN>                │
│                      │                                                      │
└──────────────────────┼──────────────────────────────────────────────────────┘
                       │
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Pangea Backend (NestJS)                                   │
│                    http://localhost:3001                                     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                                        │  │
│  │  src/auth/controllers/auth.controller.ts                             │  │
│  │  src/wallet/wallet.controller.ts                                      │  │
│  │  src/user/controllers/user.controller.ts                                │  │
│  │  etc.                                                                 │  │
│  └───────────────────┬──────────────────────────────────────────────────┘  │
│                      │                                                      │
│                      │ 4. Request Processing                               │
│                      │                                                      │
│                      ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Authentication Guards                                                 │  │
│  │                                                                        │  │
│  │  • JwksJwtGuard (expects Better-Auth tokens)                          │  │
│  │    - Validates via frontend JWKS endpoint                             │  │
│  │    - Currently BLOCKED for backend JWT tokens                         │  │
│  │                                                                        │  │
│  │  • @Public() decorator (bypasses auth)                                 │  │
│  │    - Used for: /api/auth/register, /api/auth/login                    │  │
│  │    - Used for: /api/wallet/test/generate (test endpoint)              │  │
│  └───────────────────┬──────────────────────────────────────────────────┘  │
│                      │                                                      │
│                      │ 5. Business Logic                                    │  │
│                      │                                                      │
│                      ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Services                                                              │  │
│  │                                                                        │  │
│  │  • AuthService (auth.service.ts)                                       │  │
│  │    - Generates Pangea JWT tokens                                      │  │
│  │    - Calls OasisAuthService                                            │  │
│  │                                                                        │  │
│  │  • OasisAuthService (oasis-auth.service.ts)                            │  │
│  │    - Makes HTTP requests to OASIS API                                 │  │
│  │                                                                        │  │
│  │  • UserSyncService (user-sync.service.ts)                             │  │
│  │    - Syncs OASIS avatars to Pangea database                            │  │
│  │    - Creates/updates users.avatar_id link                             │  │
│  │                                                                        │  │
│  │  • OasisWalletService (oasis-wallet.service.ts)                        │  │
│  │    - Uses OASIS admin token for internal calls                        │  │
│  └───────────────────┬──────────────────────────────────────────────────┘  │
│                      │                                                      │
│                      │ 6. OASIS API Calls (Internal)                       │  │
│                      │    Authorization: Bearer <OASIS_ADMIN_TOKEN>        │  │
│                      │                                                      │
└──────────────────────┼──────────────────────────────────────────────────────┘
                       │
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OASIS API                                                 │
│                    http://localhost:5003                                     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Avatar Endpoints                                                     │  │
│  │  • POST /api/avatar/register                                          │  │
│  │  • POST /api/avatar/authenticate                                       │  │
│  │  • GET  /api/avatar/get-avatar-detail-by-id/{id}                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Wallet Endpoints                                                     │  │
│  │  • POST /api/wallet/create-wallet                                     │  │
│  │  • GET  /api/wallet/balance                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. POST /api/auth/register
       │    { email, password, username, ... }
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend Next.js API Route                                                 │
│  apps/platform/app/api/auth/register/route.ts                             │
│                                                                              │
│  • Receives registration request                                             │
│  • Proxies to backend: POST http://localhost:3000/api/auth/register         │
│  • Backend returns: { user, token, expiresAt }                              │
│  • Sets HttpOnly cookie: pangea_token = <JWT_TOKEN>                         │
│  • Returns: { user, expiresAt } (token in cookie, not response)             │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 2. HTTP Response
       │    Set-Cookie: pangea_token=<JWT>; HttpOnly; Secure
       │    { user: {...}, expiresAt: "..." }
       │
       ▼
┌──────────────┐
│   User       │
│  (Browser)   │
│              │
│  ✅ Token stored in HttpOnly cookie                                         │
│  ✅ User data displayed in UI                                               │
└──────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUBSEQUENT API CALLS FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. User Action (e.g., view wallet balance)
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend React Component                                                   │
│  (Client-Side)                                                              │
│                                                                              │
│  • Calls: fetch('/api/wallet/balance')                                      │
│  • No token in request (cookie sent automatically)                         │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 2. Request to Next.js API Route
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend Next.js API Route                                                 │
│  apps/platform/app/api/wallet/balance/route.ts                              │
│                                                                              │
│  • Uses authFetch() utility                                                  │
│  • Reads token from HttpOnly cookie: getAuthTokenCookie()                   │
│  • Adds header: Authorization: Bearer <token>                              │
│  • Proxies to backend: GET http://localhost:3000/api/wallet/balance         │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 3. HTTP Request
       │    Authorization: Bearer <JWT_TOKEN>
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Pangea Backend                                                             │
│  src/wallet/wallet.controller.ts                                            │
│                                                                              │
│  • JwksJwtGuard validates token                                             │
│  • ⚠️  Currently expects Better-Auth tokens (from frontend JWKS)             │
│  • ❌ Backend JWT tokens will fail validation                               │
│  • ✅ @Public() endpoints work without auth                                 │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 4. Response
       │
       ▼
┌──────────────┐
│   User       │
│  (Browser)   │
│              │
│  ✅ Data displayed in UI                                                     │
└──────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    TOKEN FLOW DIAGRAM                                       │
└─────────────────────────────────────────────────────────────────────────────┘

Registration Flow:
┌──────────────┐
│   User       │
└──────┬───────┘
       │
       │ POST /api/auth/register
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend API Route                                                          │
│  /api/auth/register/route.ts                                                │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ POST http://localhost:3000/api/auth/register
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Pangea Backend                                                              │
│  AuthService.register()                                                      │
│                                                                              │
│  1. Calls OasisAuthService.register()                                       │
│     → Creates OASIS avatar                                                   │
│                                                                              │
│  2. Calls UserSyncService.syncOasisUserToLocal()                            │
│     → Creates Pangea user                                                   │
│     → Links: users.avatar_id = OASIS avatarId                               │
│                                                                              │
│  3. Generates JWT token (Pangea backend token)                               │
│     Payload: { sub: userId, email, username, avatarId, role }                │
│                                                                              │
│  4. Returns: { user, token, expiresAt }                                      │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ Response: { user: {...}, token: "eyJhbGciOiJIUzI1NiIs...", ... }
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend API Route                                                          │
│  /api/auth/register/route.ts                                                │
│                                                                              │
│  • Receives token from backend                                               │
│  • Sets HttpOnly cookie: setAuthCookies(token)                              │
│  • Returns: { user, expiresAt } (token NOT in response)                     │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ Response: { user: {...}, expiresAt: "..." }
       │ Set-Cookie: pangea_token=<JWT>; HttpOnly
       │
       ▼
┌──────────────┐
│   User       │
│  (Browser)   │
│              │
│  ✅ Token in HttpOnly cookie (secure, not accessible to JS)                 │
│  ✅ User data in response                                                    │
└──────────────┘


Subsequent Requests Flow:
┌──────────────┐
│   User       │
│  (Browser)   │
└──────┬───────┘
       │
       │ GET /api/wallet/balance
       │ Cookie: pangea_token=<JWT>
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend API Route                                                          │
│  /api/wallet/balance/route.ts                                               │
│                                                                              │
│  • Uses authFetch('/api/wallet/balance')                                    │
│  • Reads cookie: getAuthTokenCookie() → "eyJhbGciOiJIUzI1NiIs..."           │
│  • Adds header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...               │
│  • Proxies: GET http://localhost:3000/api/wallet/balance                    │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ GET http://localhost:3000/api/wallet/balance
       │ Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Pangea Backend                                                              │
│  WalletController.getBalances()                                              │
│                                                                              │
│  • JwksJwtGuard tries to validate token                                      │
│  • ⚠️  Expects Better-Auth token (from frontend JWKS endpoint)              │
│  • ❌ Backend JWT token fails: "Invalid token signature"                    │
│  • Returns: 401 Unauthorized                                                │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ Response: 401 Unauthorized
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend API Route                                                          │
│  /api/wallet/balance/route.ts                                               │
│                                                                              │
│  • Detects 401 response                                                      │
│  • Clears auth cookies: clearAuthCookies()                                  │
│  • Returns: { error: "Session expired", status: 401 }                       │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ Response: 401 Unauthorized
       │
       ▼
┌──────────────┐
│   User       │
│  (Browser)   │
│              │
│  ❌ Redirected to login / Error shown                                        │
└──────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    FILE STRUCTURE & CONNECTIONS                             │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend (Next.js):
├── apps/platform/
│   ├── app/
│   │   ├── api/
│   │   │   ├── _lib/
│   │   │   │   └── auth-fetch.ts          ← Utility for authenticated requests
│   │   │   │                                • Reads HttpOnly cookies
│   │   │   │                                • Adds Authorization header
│   │   │   │                                • Proxies to backend
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts         ← POST /api/auth/login
│   │   │   │   │                            • Proxies to backend
│   │   │   │   │                            • Sets HttpOnly cookie
│   │   │   │   │
│   │   │   │   ├── register/route.ts      ← POST /api/auth/register
│   │   │   │   │                            • Proxies to backend
│   │   │   │   │                            • Sets HttpOnly cookie
│   │   │   │   │
│   │   │   │   └── cookies.ts              ← Cookie utilities
│   │   │   │                                  • setAuthCookies()
│   │   │   │                                  • getAuthTokenCookie()
│   │   │   │                                  • clearAuthCookies()
│   │   │   │
│   │   │   ├── wallet/
│   │   │   │   ├── balance/route.ts        ← GET /api/wallet/balance
│   │   │   │   │                            • Uses authFetch()
│   │   │   │   │                            • Proxies to backend
│   │   │   │   │
│   │   │   │   └── [other wallet routes]   ← All use authFetch()
│   │   │   │
│   │   │   └── user/
│   │   │       └── profile/route.ts         ← GET /api/user/profile
│   │   │                                      • Uses authFetch()
│   │   │
│   │   └── [React components]                ← Client-side UI
│   │
│   └── .env.local                            ← NEXT_PUBLIC_API_URL=http://localhost:3000
│
Backend (NestJS):
├── src/
│   ├── auth/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts          ← POST /api/auth/register, /api/auth/login
│   │   │   │                                  • @Public() - no auth required
│   │   │   │                                  • Returns JWT token
│   │   │   │
│   │   │   └── user.controller.ts          ← GET /api/user/profile
│   │   │                                      • @UseGuards(JwksJwtGuard)
│   │   │                                      • ❌ Currently blocked
│   │   │
│   │   ├── guards/
│   │   │   └── jwks-jwt.guard.ts            ← Validates Better-Auth tokens
│   │   │                                      • Expects JWKS from frontend
│   │   │                                      • ❌ Doesn't work with backend JWT
│   │   │
│   │   └── services/
│   │       ├── auth.service.ts              ← Generates Pangea JWT tokens
│   │       ├── oasis-auth.service.ts        ← Calls OASIS API
│   │       └── user-sync.service.ts         ← Links users.avatar_id
│   │
│   └── wallet/
│       └── wallet.controller.ts             ← Wallet endpoints
│                                             • @UseGuards(JwksJwtGuard)
│                                             • ❌ Currently blocked
│                                             • ✅ /api/wallet/test/generate (@Public())


┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION                                            │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend Configuration:
┌─────────────────────────────────────────────────────────────────────────────┐
│  .env.local (or environment variables)                                      │
│                                                                              │
│  NEXT_PUBLIC_API_URL=http://localhost:3000                                   │
│                                                                              │
│  Used in:                                                                    │
│  • apps/platform/app/api/_lib/auth-fetch.ts                                 │
│  • apps/platform/app/api/auth/login/route.ts                                │
│  • apps/platform/app/api/auth/register/route.ts                             │
└─────────────────────────────────────────────────────────────────────────────┘

Backend Configuration:
┌─────────────────────────────────────────────────────────────────────────────┐
│  .env                                                                        │
│                                                                              │
│  PORT=3001                                                                   │
│  OASIS_API_URL=http://localhost:5003                                        │
│  JWT_SECRET=<secret>                                                         │
│  JWT_EXPIRES_IN=7d                                                           │
│                                                                              │
│  Used in:                                                                    │
│  • src/main.ts (PORT)                                                       │
│  • src/auth/services/oasis-auth.service.ts (OASIS_API_URL)                  │
│  • src/auth/services/auth.service.ts (JWT_SECRET, JWT_EXPIRES_IN)          │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION MISMATCH ISSUE                            │
└─────────────────────────────────────────────────────────────────────────────┘

Current Problem:
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Frontend Flow:                                                              │
│  1. User registers → Backend generates JWT token                             │
│  2. Frontend stores token in HttpOnly cookie                                 │
│  3. Frontend makes request → Includes token in Authorization header          │
│  4. Backend JwksJwtGuard tries to validate token                             │
│  5. ❌ FAILS: Token is Pangea backend JWT, not Better-Auth token            │
│  6. ❌ Returns 401 Unauthorized                                              │
│                                                                              │
│  Root Cause:                                                                 │
│  • JwksJwtGuard expects tokens from frontend's JWKS endpoint                │
│  • Backend generates its own JWT tokens (different signing key)             │
│  • These tokens are incompatible                                            │
│                                                                              │
│  Solution Options:                                                           │
│  1. Create PangeaJwtGuard that validates backend's own JWT tokens            │
│  2. Modify JwksJwtGuard to support both token types                         │
│  3. Use Better-Auth in frontend and generate compatible tokens              │
│  4. Add @Public() test endpoints for development                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKING ENDPOINTS                                         │
└─────────────────────────────────────────────────────────────────────────────┘

✅ Public Endpoints (No Auth Required):
  • POST /api/auth/register
  • POST /api/auth/login
  • POST /api/auth/forgot-password
  • POST /api/auth/reset-password
  • POST /api/wallet/test/generate (test endpoint)

❌ Protected Endpoints (Currently Blocked):
  • GET  /api/wallet/balance
  • GET  /api/wallet/balance/:assetId
  • POST /api/wallet/generate
  • POST /api/wallet/connect
  • POST /api/wallet/verify
  • GET  /api/user/profile
  • All other endpoints using JwksJwtGuard


┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUMMARY                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Connection Flow:
  1. User → Frontend UI (React)
  2. Frontend UI → Next.js API Route (server-side proxy)
  3. Next.js API Route → Pangea Backend API
  4. Pangea Backend → OASIS API (internal calls)

Token Flow:
  1. Backend generates JWT token on registration/login
  2. Frontend stores token in HttpOnly cookie
  3. Frontend API routes read cookie and forward to backend
  4. Backend JwksJwtGuard validates token (currently fails for backend JWT)

Current Status:
  ✅ Registration/Login working
  ✅ Token storage in cookies working
  ✅ Frontend-backend connection working
  ❌ Protected endpoints blocked by authentication guard mismatch

Next Steps:
  1. Implement PangeaJwtGuard to validate backend JWT tokens
  2. Or modify JwksJwtGuard to support both token types
  3. Or integrate Better-Auth in frontend for compatible tokens


