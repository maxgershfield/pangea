# OASIS Avatar Email Handling Fix

## Problem
When users attempted to create an OASIS avatar via `POST /api/auth/create-oasis-avatar`, the endpoint would fail with:
```json
{
  "result": {
    "isError": true,
    "message": "Sorry, the email ... is already in use, please use another one."
  }
}
```

This occurred when a user already had an OASIS account but hadn't linked it to their Better Auth account.

## Solution
Enhanced the avatar creation flow to handle existing OASIS avatars gracefully:

1. **Proactive Lookup**: Before attempting registration, check if an avatar already exists for the email
2. **Error Recovery**: If registration fails with "email already in use", automatically look up the existing avatar
3. **Linking**: Link the existing OASIS avatar to the Better Auth user instead of failing

## Changes

### `src/auth/services/oasis-link.service.ts`
- Added proactive email lookup before registration
- Added error recovery to catch "email already in use" and look up existing avatar
- Returns full avatar data including username, email, firstName, lastName

### `src/auth/services/oasis-auth.service.ts`
- Added `getAvatarByEmail()` method to fetch existing avatars by email
- Enhanced error detection to catch "email already in use" messages (case-insensitive)
- Improved error handling in outer catch block to preserve specific error messages

### `src/auth/controllers/auth.controller.ts`
- Updated `createOasisAvatar` endpoint to return full avatar data (username, email, firstName, lastName)
- Provides frontend with all necessary data to update user records

### `src/auth/dto/create-oasis-avatar.dto.ts`
- Updated response DTO to include all avatar fields returned by the endpoint

### `src/auth/services/auth.service.ts`
- Updated return type to return full `OASISAvatar` object instead of just `avatarId`

### `src/wallet/wallet.controller.ts`
- Removed automatic avatar creation from wallet endpoints
- Wallet endpoints now require explicit avatar creation via `POST /api/auth/create-oasis-avatar`
- Returns clear error message directing users to create avatar first

## API Response Format

**Before:**
```json
{
  "success": true,
  "message": "OASIS avatar created and linked successfully",
  "avatarId": "12345",
  "userId": "user-123"
}
```

**After:**
```json
{
  "success": true,
  "message": "OASIS avatar created and linked successfully",
  "avatarId": "12345",
  "userId": "user-123",
  "username": "john.doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

## Testing

The fix handles three scenarios:
1. **New user**: Creates new OASIS avatar and links it
2. **Existing avatar (proactive)**: Finds existing avatar by email before registration attempt
3. **Existing avatar (reactive)**: Catches registration error and looks up existing avatar

All scenarios result in the avatar being linked to the Better Auth user and full avatar data being returned.

