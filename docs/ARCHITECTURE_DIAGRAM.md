# Pangea Backend Architecture Diagram

## User Registration & OASIS Avatar Linking Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. POST /api/auth/register
       │    { email, password, username, firstName, lastName }
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Pangea Backend                                                             │
│  src/auth/controllers/auth.controller.ts                                    │
│  @Post('register')                                                           │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 2. auth.service.register()
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AuthService                                                                │
│  src/auth/services/auth.service.ts                                         │
│  register() method                                                          │
│                                                                              │
│  Step 1: Register with OASIS                                               │
│  Step 2: Sync to local database                                            │
│  Step 3: Generate Pangea JWT token                                         │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 3. oasisAuthService.register()
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OasisAuthService                                                           │
│  src/auth/services/oasis-auth.service.ts                                    │
│                                                                              │
│  POST https://api.oasisweb4.com/api/avatar/register                         │
│  Body: { email, password, username, firstName, lastName }                  │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 4. HTTP Request to Remote OASIS API
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OASIS API (Remote)                                                         │
│  https://api.oasisweb4.com                                                  │
│                                                                              │
│  POST /api/avatar/register                                                   │
│  → Creates OASIS Avatar                                                     │
│  → Returns: { Result: { Result: { AvatarId, Email, Username, ... } } }     │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 5. Response: OASIS Avatar Data
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OasisAuthService                                                           │
│  src/auth/services/oasis-auth.service.ts                                    │
│                                                                              │
│  Extracts: { avatarId, email, username, firstName, lastName }               │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 6. Return OASIS Avatar to AuthService
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AuthService                                                                │
│  src/auth/services/auth.service.ts                                          │
│                                                                              │
│  Step 2: Sync to Local Database                                            │
│  userSyncService.createAndLinkAvatar(oasisAvatar)                          │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 7. createAndLinkAvatar()
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OasisLinkService                                                            │
│  src/auth/services/oasis-link.service.ts                                     │
│                                                                              │
│  • Find or create user in PostgreSQL                                        │
│  • Link: user.avatar_id = OASIS avatarId                                   │
│  • Store: email, username, firstName, lastName                              │
│  • Return: User entity with avatarId                                       │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 8. User saved with avatarId link
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AuthService                                                                │
│  src/auth/services/auth.service.ts                                          │
│                                                                              │
│  Step 3: Generate Pangea JWT Token                                         │
│  generateJwtToken(user)                                                    │
│                                                                              │
│  Payload: {                                                                │
│    sub: user.id,                                                           │
│    email: user.email,                                                      │
│    username: user.username,                                                │
│    avatarId: user.avatarId,  ← OASIS Avatar ID linked here                │
│    role: user.role                                                         │
│  }                                                                          │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 9. Return AuthResponse
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AuthController                                                             │
│  src/auth/controllers/auth.controller.ts                                    │
│                                                                              │
│  Returns: {                                                                 │
│    user: { id, email, username, avatarId, ... },                           │
│    token: "eyJhbGciOiJIUzI1NiIs...",  ← JWT with avatarId                  │
│    expiresAt: "2025-01-10T..."                                             │
│  }                                                                          │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 10. HTTP Response
       │
       ▼
┌──────────────┐
│   User       │
│  (Browser)   │
│              │
│  ✅ Has JWT token with avatarId                                            │
│  ✅ Can use OASIS features (wallets, NFTs, etc.)                           │
└──────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    CRITICAL LINKING POINT                                   │
└─────────────────────────────────────────────────────────────────────────────┘

The link between Pangea User ID and OASIS Avatar ID is established in:

┌─────────────────────────────────────────────────────────────────────────────┐
│  OasisLinkService.createAndLinkAvatar()                                     │
│  src/auth/services/oasis-link.service.ts (lines 24-97)                      │
│                                                                              │
│  1. Receives OASIS Avatar data: { avatarId, email, ... }                    │
│  2. Creates/updates User in PostgreSQL:                                     │
│     user.id = <Pangea User ID>                                             │
│     user.avatar_id = <OASIS Avatar ID>  ← LINK ESTABLISHED HERE           │
│  3. Returns User entity with both IDs                                       │
└─────────────────────────────────────────────────────────────────────────────┘

This link is then:
- ✅ Stored in database (user.avatar_id column)
- ✅ Included in JWT token (avatarId claim)
- ✅ Used for all OASIS operations (wallets, NFTs, etc.)


┌─────────────────────────────────────────────────────────────────────────────┐
│                    FILE STRUCTURE & KEY FILES                               │
└─────────────────────────────────────────────────────────────────────────────┘

Registration Flow Files:
├── src/auth/controllers/auth.controller.ts
│   └── @Post('register') → auth.service.register()
│
├── src/auth/services/auth.service.ts
│   ├── register() → orchestrates the flow
│   ├── Calls: oasisAuthService.register()
│   ├── Calls: userSyncService.createAndLinkAvatar()
│   └── Calls: generateJwtToken()
│
├── src/auth/services/oasis-auth.service.ts
│   ├── register() → calls OASIS API
│   ├── POST https://api.oasisweb4.com/api/avatar/register
│   └── Extracts avatar data from nested response
│
├── src/auth/services/oasis-link.service.ts
│   ├── createAndLinkAvatar() → creates/updates user
│   ├── Links: user.avatar_id = OASIS avatarId
│   └── Returns User entity with link
│
└── src/auth/services/auth.service.ts (JWT generation)
    └── generateJwtToken() → includes avatarId in token


┌─────────────────────────────────────────────────────────────────────────────┐
│                    USING THE LINKED AVATAR ID                              │
└─────────────────────────────────────────────────────────────────────────────┘

After registration, the avatarId is used for OASIS operations:

┌──────────────┐
│   User       │
│  (Browser)   │
└──────┬───────┘
       │
       │ GET /api/wallet/balance
       │ Authorization: Bearer <JWT with avatarId>
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  WalletController                                                           │
│  src/wallet/wallet.controller.ts                                            │
│                                                                              │
│  1. Extract avatarId from JWT token (or get from user.avatarId)            │
│  2. Call: oasisWalletService.getWallets(avatarId)                          │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 2. getWallets(avatarId)
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OasisWalletService                                                        │
│  src/services/oasis-wallet.service.ts                                       │
│                                                                              │
│  GET https://api.oasisweb4.com/api/wallet/avatar/{avatarId}/wallets        │
│  Authorization: Bearer <OASIS Admin Token>                                 │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 3. HTTP Request to OASIS API
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OASIS API (Remote)                                                         │
│  https://api.oasisweb4.com                                                  │
│                                                                              │
│  Returns: List of wallets for the avatar                                    │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                                          │
└─────────────────────────────────────────────────────────────────────────────┘

PostgreSQL Table: users

┌─────────────┬──────────────┬─────────────────────────────────────────────┐
│ Column      │ Type         │ Description                                 │
├─────────────┼──────────────┼─────────────────────────────────────────────┤
│ id          │ UUID         │ Pangea User ID (primary key)                │
│ email       │ VARCHAR      │ User email                                  │
│ username    │ VARCHAR      │ Username                                    │
│ avatar_id   │ UUID         │ OASIS Avatar ID ← LINK TO OASIS             │
│ first_name  │ VARCHAR      │ First name                                  │
│ last_name   │ VARCHAR      │ Last name                                   │
│ role        │ VARCHAR      │ User role (user, admin, etc.)               │
│ created_at  │ TIMESTAMP    │ Creation timestamp                          │
│ updated_at  │ TIMESTAMP    │ Update timestamp                            │
└─────────────┴──────────────┴─────────────────────────────────────────────┘

The avatar_id column is the critical link between:
- Pangea User (user.id)
- OASIS Avatar (OASIS Avatar ID)


┌─────────────────────────────────────────────────────────────────────────────┐
│                    JWT TOKEN STRUCTURE                                      │
└─────────────────────────────────────────────────────────────────────────────┘

JWT Token Payload (after registration):

{
  "sub": "d711e061-9262-4784-a354-48f22c5d2508",  ← Pangea User ID
  "email": "user@example.com",
  "username": "johndoe",
  "avatarId": "b1c86d3c-6b86-41fd-99e3-8eb528de29ab",  ← OASIS Avatar ID
  "role": "user",
  "iat": 1234567890,
  "exp": 1235173890
}

The avatarId in the token allows:
- Direct access to OASIS features without database lookup
- Wallet operations
- NFT operations
- Karma operations
- All OASIS API calls


┌─────────────────────────────────────────────────────────────────────────────┐
│                    REMOTE OASIS API CONFIGURATION                           │
└─────────────────────────────────────────────────────────────────────────────┘

All OASIS API calls now use the remote API:

Configuration:
- Default URL: https://api.oasisweb4.com
- Set in: .env as OASIS_API_URL
- Used by:
  - src/services/oasis-wallet.service.ts
  - src/services/oasis-token-manager.service.ts
  - src/auth/services/oasis-auth.service.ts

OASIS API Endpoints Used:
- POST /api/avatar/register
- POST /api/avatar/authenticate
- GET  /api/wallet/avatar/{avatarId}/wallets
- POST /api/wallet/create-wallet
- GET  /api/wallet/balance
- And more...


┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUMMARY                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Key Points:
1. User registers → Backend creates OASIS avatar → Links to Pangea user
2. Link stored in: user.avatar_id column (PostgreSQL)
3. Link included in: JWT token (avatarId claim)
4. Link used for: All OASIS operations (wallets, NFTs, etc.)
5. OASIS API: Remote (https://api.oasisweb4.com) - tested and working

Critical Files:
- src/auth/services/oasis-link.service.ts - Creates the link
- src/auth/services/auth.service.ts - Orchestrates registration
- src/auth/services/oasis-auth.service.ts - OASIS API integration
- src/services/oasis-wallet.service.ts - Uses avatarId for wallet ops

Database:
- user.avatar_id = OASIS Avatar ID (the link)

Token:
- JWT contains avatarId (allows direct OASIS access)


