# Authentication Integration (Better Auth + OASIS)

This module links Better Auth users to OASIS avatars and exposes profile endpoints. Registration, login, and session management are handled by Better Auth in the frontend.

## Architecture

- Better Auth (frontend): registration, login, sessions, JWT issuance.
- Backend: verifies Better Auth JWTs via JWKS, reads/writes the Better Auth `user` table, and links OASIS avatars.

## Services

### `OasisAuthService`
- OASIS API client (avatar creation and related calls).

### `OasisLinkService`
- Creates OASIS avatars and updates `user.avatar_id`.

### `AuthService`
- Orchestrates avatar linking and user profile access.

## Endpoints

### Protected Endpoints (Require Better Auth JWT)
- `POST /api/auth/create-oasis-avatar` - Create and link an OASIS avatar
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update profile fields

## Usage

### Create OASIS Avatar
```typescript
POST /api/auth/create-oasis-avatar
Headers: {
  "Authorization": "Bearer <better_auth_jwt>"
}
Body (optional):
{
  "email": "user@example.com",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe"
}
```

## Guards

### `JwksJwtGuard`
- Validates Better Auth JWTs via JWKS (`/api/auth/jwks`)
- Attaches user claims to `request.user`

### Usage in Controllers
```typescript
@UseGuards(JwksJwtGuard)
@Get('protected')
async protectedRoute(@CurrentUser() user: any) {
  // user is available here
}
```

## Environment Variables

```env
OASIS_API_URL=https://api.oasisplatform.world
FRONTEND_URL=http://localhost:3001
DATABASE_URL=postgresql://...
```

## Database

### Better Auth User (`user` table)
- `id` (TEXT) - Canonical user ID
- `email`, `emailVerified`, `name`, `image`
- `username`, `first_name`, `last_name`
- `avatar_id` - OASIS Avatar ID (set by backend)
- `wallet_address_solana`, `wallet_address_ethereum`
- `role` (default: 'user')
- `kyc_status` (default: 'none')
- `last_login`, `is_active`
- Timestamps: `created_at`, `updated_at`

### Notes
- Password hashes live in `account.password` for `provider_id='credential'`.
- Authentication flows (register/login/reset) are handled by Better Auth in the frontend.
