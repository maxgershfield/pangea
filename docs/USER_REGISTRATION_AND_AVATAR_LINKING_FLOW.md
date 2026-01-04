# User Registration and OASIS Avatar Linking Flow

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER REGISTRATION FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
│  (Frontend)  │
└──────┬───────┘
       │
       │ 1. POST /api/auth/register
       │    { email, password, username, firstName, lastName }
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Pangea Backend                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ auth.controller.ts                                                   │  │
│  │ POST /api/auth/register                                              │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 2. register(RegisterDto)                                 │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ auth.service.ts                                                       │  │
│  │ AuthService.register()                                                │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │ Step 1: Register with OASIS                                   │   │  │
│  │  │   const oasisAvatar = await                                   │   │  │
│  │  │     this.oasisAuthService.register({...})                     │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 3. register({ email, password, username, ... })          │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ oasis-auth.service.ts                                                 │  │
│  │ OasisAuthService.register()                                          │  │
│  │                                                                        │  │
│  │  • Builds request body:                                               │  │
│  │    { title, firstName, lastName, email, username,                     │  │
│  │      password, confirmPassword, avatarType, acceptTerms }              │  │
│  │                                                                        │  │
│  │  • Makes HTTP request to OASIS API                                    │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 4. POST https://api.oasisweb4.com/api/avatar/register   │
│                  │    (HTTP Request)                                        │
│                  │                                                          │
└──────────────────┼──────────────────────────────────────────────────────┘
                    │
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OASIS API                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ AvatarController.cs                                                   │  │
│  │ ONODE/.../Controllers/AvatarController.cs                            │  │
│  │                                                                        │  │
│  │ [HttpPost("register")]                                                │  │
│  │ public async Task<...> Register(RegisterRequest model)                │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 5. RegisterAsync(...)                                    │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ AvatarManager.cs                                                      │  │
│  │ OASIS Architecture/.../Managers/AvatarManager/                       │  │
│  │                                                                        │  │
│  │ AvatarManager.RegisterAsync(                                          │  │
│  │   title, firstName, lastName, email, password,                         │  │
│  │   username, avatarType, OASISType.OASISAPIREST)                      │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 6. Create Avatar in Database                             │  │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ OASIS Database (MongoDB/Neo4j/etc)                                    │  │
│  │                                                                        │  │
│  │  Avatar Created:                                                      │  │
│  │  {                                                                    │  │
│  │    id: "550e8400-e29b-41d4-a716-446655440000",  ← Avatar ID          │  │
│  │    username: "testuser",                                             │  │
│  │    email: "user@example.com",                                         │  │
│  │    firstName: "Test",                                                 │  │
│  │    lastName: "User",                                                 │  │
│  │    isActive: false,                                                   │  │
│  │    isVerified: false                                                  │  │
│  │  }                                                                    │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 7. AvatarResponseDto                                     │  │
│                  │    { id, username, email, firstName, lastName, ... }     │  │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ AvatarController.cs                                                   │  │
│  │ Returns: OASISHttpResponseMessage<AvatarResponseDto>                   │  │
│  │                                                                        │  │
│  │ Response Structure:                                                   │  │
│  │ {                                                                    │  │
│  │   Result: {                                                          │  │
│  │     Result: {                                                        │  │
│  │       Id: "550e8400-...",  ← This becomes avatarId                   │  │
│  │       Username: "testuser",                                          │  │
│  │       Email: "user@example.com",                                     │  │
│  │       ...                                                            │  │
│  │     }                                                                │  │
│  │   }                                                                  │  │
│  │ }                                                                    │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 8. HTTP Response (JSON)                                   │
│                  │                                                          │
└──────────────────┼──────────────────────────────────────────────────────┘
                    │
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Pangea Backend (continued)                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ oasis-auth.service.ts                                                 │  │
│  │                                                                        │  │
│  │  • Receives JSON response                                             │  │
│  │  • Parses nested structure (Result.Result.Result)                      │  │
│  │  • Extracts avatar data:                                             │  │
│  │                                                                        │  │
│  │  extractAvatarFromResponse() returns:                                 │  │
│  │  {                                                                    │  │
│  │    avatarId: "550e8400-...",  ← Extracted from Id/AvatarId           │  │
│  │    id: "550e8400-...",                                                │  │
│  │    username: "testuser",                                              │  │
│  │    email: "user@example.com",                                         │  │
│  │    firstName: "Test",                                                 │  │
│  │    lastName: "User"                                                   │  │
│  │  }                                                                    │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 9. Returns OASISAvatar object                            │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ auth.service.ts                                                       │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │ Step 2: Sync to local database                                │   │  │
│  │  │   const user = await                                          │   │  │
│  │  │     this.userSyncService.syncOasisUserToLocal(oasisAvatar)    │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 10. syncOasisUserToLocal(OASISAvatar)                   │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ user-sync.service.ts                                                  │  │
│  │ UserSyncService.syncOasisUserToLocal()                               │  │
│  │                                                                        │  │
│  │  • Checks if user exists by avatarId or email                         │  │
│  │  • Creates or updates User entity:                                   │  │
│  │                                                                        │  │
│  │  User {                                                               │  │
│  │    id: "pangea-user-uuid",      ← Pangea User ID                      │  │
│  │    email: "user@example.com",                                         │  │
│  │    username: "testuser",                                               │  │
│  │    firstName: "Test",                                                 │  │
│  │    lastName: "User",                                                  │  │
│  │    avatarId: "550e8400-...",   ← OASIS Avatar ID (LINK!)            │  │
│  │    ...                                                                │  │
│  │  }                                                                    │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 11. Save to Database                                     │  │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Pangea Database (PostgreSQL)                                          │  │
│  │                                                                        │  │
│  │  users table:                                                         │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │ id (UUID)          │ email              │ avatar_id (UUID)   │   │  │
│  │  ├──────────────────────────────────────────────────────────────┤   │  │
│  │  │ pangea-user-uuid   │ user@example.com   │ 550e8400-...       │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  │                                                                        │  │
│  │  ⭐ LINK ESTABLISHED: Pangea User ID ↔ OASIS Avatar ID               │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 12. Returns User entity                                   │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ auth.service.ts                                                       │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │ Step 3: Generate Pangea JWT token                             │   │  │
│  │  │   const token = this.generateJwtToken(user)                   │   │  │
│  │  │                                                                 │   │  │
│  │  │ JWT Payload:                                                   │   │  │
│  │  │ {                                                              │   │  │
│  │  │   sub: user.id,          ← Pangea User ID                     │   │  │
│  │  │   email: user.email,                                          │   │  │
│  │  │   username: user.username,                                     │   │  │
│  │  │   avatarId: user.avatarId,  ← OASIS Avatar ID                  │   │  │
│  │  │   role: user.role                                             │   │  │
│  │  │ }                                                              │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  │                                                                        │  │
│  │  Returns: AuthResponseDto                                             │  │
│  │  {                                                                    │  │
│  │    user: {                                                            │  │
│  │      id: "pangea-user-uuid",                                          │  │
│  │      email: "user@example.com",                                       │  │
│  │      username: "testuser",                                             │  │
│  │      avatarId: "550e8400-...",  ← OASIS Avatar ID                   │  │
│  │      ...                                                              │  │
│  │    },                                                                 │  │
│  │    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",                 │  │
│  │    expiresAt: "2025-01-09T..."                                       │  │
│  │  }                                                                    │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │ 13. Returns AuthResponseDto                              │  │
│                  │                                                          │
│                  ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ auth.controller.ts                                                      │  │
│  │ Returns HTTP 201 Created                                              │  │
│  └───────────────┬──────────────────────────────────────────────────────┘  │
│                  │                                                          │
└──────────────────┼──────────────────────────────────────────────────────┘
                    │
                    │ 14. HTTP Response
                    │
                    ▼
┌──────────────┐
│   User       │
│  (Frontend)  │
│              │
│  ✅ User registered                                                       │
│  ✅ OASIS avatar created                                                  │
│  ✅ Pangea user ID linked to OASIS avatar ID                             │
│  ✅ JWT token received                                                    │
└──────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         KEY LINKING POINT                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Pangea User ID (UUID)          ←→          OASIS Avatar ID (UUID)
    ────────────────────                      ────────────────────
    
    Stored in:                                  Stored in:
    • users.id                                  • Avatar.Id
    • users.avatar_id (foreign key)             • Avatar.AvatarId
    
    Used in:                                     Used in:
    • Pangea JWT token (sub field)              • OASIS API calls
    • Pangea database queries                   • Wallet creation
    • User profile lookups                      • NFT operations
                                                 • Karma operations


┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE LOCATIONS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Pangea Backend:
├── src/auth/
│   ├── auth.controller.ts              ← HTTP endpoint
│   └── services/
│       ├── auth.service.ts             ← Main orchestration
│       ├── oasis-auth.service.ts        ← OASIS API client
│       └── user-sync.service.ts        ← ⭐ LINKING HAPPENS HERE
│
└── src/users/
    └── entities/
        └── user.entity.ts              ← User model with avatarId field

OASIS API:
├── ONODE/.../Controllers/
│   └── AvatarController.cs             ← Registration endpoint
│
├── OASIS Architecture/.../Managers/
│   └── AvatarManager/
│       ├── AvatarManager.cs            ← Registration logic
│       └── AvatarManager-Private.cs    ← Internal methods
│
└── ONODE/.../Models/Avatar/
    └── AvatarResponseDto.cs            ← Response format


┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHERE THE LINK IS CREATED                                │
└─────────────────────────────────────────────────────────────────────────────┘

File: pangea-repo/src/auth/services/user-sync.service.ts
Method: syncOasisUserToLocal()
Lines: 24-97

┌─────────────────────────────────────────────────────────────────────────────┐
│  async syncOasisUserToLocal(oasisAvatar: OASISAvatar): Promise<User> {     │
│                                                                              │
│    // Try to find existing user by avatarId                                 │
│    let user = await this.userRepository.findOne({                           │
│      where: { avatarId: oasisAvatar.avatarId }  ← Check existing link      │
│    });                                                                       │
│                                                                              │
│    // If not found by avatarId, try by email                                │
│    if (!user) {                                                              │
│      user = await this.userRepository.findOne({                             │
│        where: { email: oasisAvatar.email }                                   │
│      });                                                                     │
│    }                                                                         │
│                                                                              │
│    if (user) {                                                               │
│      // Update existing user                                                │
│      user.avatarId = oasisAvatar.avatarId;  ← ⭐ UPDATE LINK               │
│      ...                                                                     │
│    } else {                                                                  │
│      // Create new user                                                      │
│      const userData = {                                                      │
│        email: oasisAvatar.email,                                             │
│        username: oasisAvatar.username,                                       │
│        firstName: oasisAvatar.firstName,                                     │
│        lastName: oasisAvatar.lastName,                                       │
│        avatarId: oasisAvatar.avatarId,  ← ⭐ CREATE LINK                   │
│        role: "user",                                                         │
│        ...                                                                   │
│      };                                                                      │
│      user = this.userRepository.create(userData);                            │
│    }                                                                         │
│                                                                              │
│    const savedUser = await this.userRepository.save(user);  ← Save link   │
│    return savedUser;                                                         │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Pangea Database (PostgreSQL):
┌─────────────────────────────────────────────────────────────────────────┐
│ users table                                                               │
├─────────────────────────────────────────────────────────────────────────┤
│ Column           │ Type    │ Constraints                                │
├──────────────────┼─────────┼────────────────────────────────────────────┤
│ id               │ UUID    │ PRIMARY KEY (Pangea User ID)               │
│ email            │ VARCHAR │ UNIQUE, NOT NULL                           │
│ username         │ VARCHAR │ NULLABLE                                   │
│ first_name       │ VARCHAR │ NULLABLE                                   │
│ last_name        │ VARCHAR │ NULLABLE                                   │
│ avatar_id        │ VARCHAR │ UNIQUE, NULLABLE  ← OASIS Avatar ID        │
│ password_hash    │ VARCHAR │ NULLABLE                                   │
│ role             │ VARCHAR │ DEFAULT 'user'                             │
│ created_at       │ TIMESTAMP│ DEFAULT now()                             │
│ updated_at       │ TIMESTAMP│ DEFAULT now()                              │
└──────────────────┴─────────┴────────────────────────────────────────────┘

OASIS Database (MongoDB/Neo4j/etc):
┌─────────────────────────────────────────────────────────────────────────┐
│ Avatar Document/Node                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ Field           │ Type    │ Description                                 │
├─────────────────┼─────────┼────────────────────────────────────────────┤
│ Id              │ GUID    │ PRIMARY KEY (OASIS Avatar ID)               │
│ AvatarId        │ GUID    │ Same as Id (for compatibility)              │
│ Username        │ String  │ UNIQUE                                      │
│ Email           │ String  │ UNIQUE                                      │
│ FirstName       │ String  │                                             │
│ LastName        │ String  │                                             │
│ IsActive        │ Boolean │ Default: false                               │
│ IsVerified      │ Boolean │ Default: false                             │
│ CreatedDate     │ DateTime│                                             │
│ ModifiedDate    │ DateTime│                                             │
└─────────────────┴─────────┴────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUMMARY                                             │
└─────────────────────────────────────────────────────────────────────────────┘

1. User registers via Pangea frontend
   ↓
2. Pangea backend calls OASIS API to create avatar
   ↓
3. OASIS creates avatar and returns avatarId
   ↓
4. Pangea backend receives OASIS avatar data
   ↓
5. UserSyncService creates/updates Pangea user record
   ↓
6. ⭐ LINK CREATED: users.avatar_id = OASIS avatarId
   ↓
7. Pangea generates JWT token (includes avatarId)
   ↓
8. User receives token and can use OASIS features

The link is stored in:
  • Pangea Database: users.avatar_id column
  • Pangea JWT Token: avatarId field in payload
  • Used for: Wallet creation, NFT operations, OASIS API calls


