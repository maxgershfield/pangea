# Key Files: Authentication & OASIS Avatar Linking

## 🔑 Critical Files (In Order of Flow)

### 1. Entry Point - Controller
**File**: `src/auth/controllers/auth.controller.ts`

**Key Methods:**
- `register()` - Line 23-28: Entry point for user registration
- `login()` - Line 34-39: Entry point for user login
- `createOasisAvatar()` - Line 87-141: **NEW** - For Better-Auth users

**What it does:**
- Receives HTTP requests
- Calls AuthService methods
- Returns responses with JWT tokens

---

### 2. Orchestration - Main Auth Service
**File**: `src/auth/services/auth.service.ts`

**Key Methods:**
- `register()` - Lines 37-89: **Main registration flow**
  - Step 1: Calls `oasisAuthService.register()` → Creates OASIS avatar
  - Step 2: Calls `userSyncService.syncOasisUserToLocal()` → **Creates the link**
  - Step 3: Calls `generateJwtToken()` → Includes avatarId in token
  
- `login()` - Lines 97-131: Login flow (same pattern)
- `createOasisAvatarForUser()` - Lines 197-247: **NEW** - For Better-Auth integration

**Critical Line:**
- Line 57: `userSyncService.syncOasisUserToLocal(oasisAvatar)` - **This creates the link**

---

### 3. OASIS API Integration
**File**: `src/auth/services/oasis-auth.service.ts`

**Key Methods:**
- `register()` - Lines 99-175: Calls OASIS API to create avatar
  - Makes HTTP request to: `POST https://api.oasisweb4.com/api/avatar/register`
  - Parses nested response structure
  - Returns: `{ avatarId, email, username, firstName, lastName }`
  
- `login()` - Lines 177-230: Authenticates with OASIS API

**Configuration:**
- Line 82: `baseUrl = https://api.oasisweb4.com` (remote API)

---

### 4. ⭐ CRITICAL LINKING POINT
**File**: `src/auth/services/user-sync.service.ts`

**Key Method:**
- `syncOasisUserToLocal()` - Lines 24-97: **THIS IS WHERE THE LINK IS CREATED**

**What it does:**
```typescript
// Line 39-40: Find user by avatarId
let user = await this.userRepository.findOne({
  where: { avatarId: oasisAvatar.avatarId },
});

// Line 57: SET THE LINK
user.avatarId = oasisAvatar.avatarId;  // ← LINK ESTABLISHED HERE

// Line 69: Or create new user with link
avatarId: oasisAvatar.avatarId,  // ← LINK ESTABLISHED HERE
```

**Database:**
- Stores link in: `users.avatar_id` column
- Links: Pangea User ID ↔ OASIS Avatar ID

---

### 5. User Entity (Database Schema)
**File**: `src/users/entities/user.entity.ts`

**Key Property:**
- `avatarId` - Line 32-33: The column that stores the OASIS Avatar ID link
  ```typescript
  @Column({ name: 'avatar_id', unique: true, nullable: true })
  avatarId: string;
  ```

**Database Column:**
- `users.avatar_id` - UUID linking to OASIS Avatar
- Unique constraint ensures one-to-one relationship

---

### 6. JWT Token Generation
**File**: `src/auth/services/auth.service.ts`

**Key Method:**
- `generateJwtToken()` - Lines 199-209: Creates JWT with avatarId

**Token Payload:**
```typescript
{
  sub: user.id,           // Pangea User ID
  email: user.email,
  username: user.username,
  avatarId: user.avatarId,  // ← OASIS Avatar ID included in token
  role: user.role
}
```

---

### 7. Using the Linked Avatar ID
**File**: `src/services/oasis-wallet.service.ts`

**Key Methods:**
- `getWallets(avatarId)` - Uses avatarId to get wallets from OASIS
- `generateWallet(avatarId, ...)` - Uses avatarId to create wallet
- `getBalance(walletId, providerType)` - Uses wallet linked to avatarId

**How avatarId is obtained:**
- From JWT token (extracted by guards)
- Or from `user.avatarId` in database

---

### 8. Lazy Avatar Creation (For Wallet Operations)
**File**: `src/auth/services/oasis-link.service.ts`

**Key Method:**
- `ensureOasisAvatar()` - Lines 82-94: Creates avatar if doesn't exist
  - Used by wallet operations when avatar might not exist yet
  - Calls `createAndLinkAvatar()` if needed

---

## 📊 Flow Summary

```
1. auth.controller.ts (register)
   ↓
2. auth.service.ts (register)
   ├─→ oasis-auth.service.ts (register) → Creates OASIS avatar
   ├─→ user-sync.service.ts (syncOasisUserToLocal) → ⭐ CREATES LINK
   └─→ generateJwtToken() → Includes avatarId in token
   ↓
3. Response with JWT containing avatarId
```

---

## 🔗 The Link

**Where it's created:**
- `src/auth/services/user-sync.service.ts` - Line 57 (update) or Line 69 (create)

**Where it's stored:**
- Database: `users.avatar_id` column
- JWT Token: `avatarId` claim

**Where it's used:**
- `src/services/oasis-wallet.service.ts` - All wallet operations
- `src/wallet/wallet.controller.ts` - Wallet endpoints
- Any OASIS API call that needs avatarId

---

## 📝 Quick Reference

| File | Purpose | Critical Method |
|------|---------|----------------|
| `auth.controller.ts` | HTTP endpoints | `register()`, `login()` |
| `auth.service.ts` | Orchestrates flow | `register()` - calls sync |
| `oasis-auth.service.ts` | OASIS API calls | `register()` - creates avatar |
| `user-sync.service.ts` | **⭐ Creates link** | `syncOasisUserToLocal()` |
| `user.entity.ts` | Database schema | `avatarId` property |
| `oasis-wallet.service.ts` | Uses avatarId | `getWallets(avatarId)` |
| `oasis-link.service.ts` | Lazy creation | `ensureOasisAvatar()` |

---

## 🎯 The Critical Line

**File**: `src/auth/services/user-sync.service.ts`
**Line**: 57 (for updates) or 69 (for new users)

```typescript
user.avatarId = oasisAvatar.avatarId;  // ← THIS IS THE LINK
```

This single line establishes the connection between:
- Pangea User ID (`user.id`)
- OASIS Avatar ID (`oasisAvatar.avatarId`)

And it's stored in the database as `users.avatar_id`.

