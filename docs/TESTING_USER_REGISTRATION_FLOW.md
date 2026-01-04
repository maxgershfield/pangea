# Testing User Registration and Avatar Linking Flow

## Quick Start

Run the automated test script:

```bash
cd pangea-repo
./scripts/test-user-registration-and-linking.sh
```

## Prerequisites

1. **Pangea Backend** must be running:
   ```bash
   cd pangea-repo
   npm run start:dev
   ```

2. **OASIS API** should be accessible (default: `https://api.oasisweb4.com`)

3. **jq** must be installed (for JSON parsing):
   ```bash
   # macOS
   brew install jq
   
   # Linux
   sudo apt-get install jq
   ```

## What the Test Does

The test script verifies the complete user registration and avatar linking flow:

1. ✅ **Backend Health Check** - Verifies Pangea backend is running
2. ✅ **OASIS API Connectivity** - Checks OASIS API is reachable
3. ✅ **User Registration** - Registers a new user via Pangea backend
4. ✅ **Link Verification** - Confirms Pangea User ID ↔ OASIS Avatar ID link
5. ✅ **JWT Token Check** - Verifies avatarId is in the JWT token
6. ✅ **Login Test** - Tests login and verifies link persists
7. ✅ **OASIS Operations** - Tests that avatarId can be used for OASIS API calls

## Expected Output

```
==========================================
USER REGISTRATION & AVATAR LINKING TEST
==========================================

Backend URL: http://localhost:3000
OASIS API URL: https://api.oasisweb4.com

📝 Test User:
   Email: test-link-1234567890@example.com
   Username: testlink1234567890

🔍 Step 1: Checking backend health...
✅ Backend is running.

🔍 Step 2: Checking OASIS API connectivity...
✅ OASIS API is reachable.

🔍 Step 3: Registering new user via Pangea backend...
✅ User registered successfully.
   User ID (Pangea): 550e8400-e29b-41d4-a716-446655440000
   Avatar ID (OASIS): 123e4567-e89b-12d3-a456-426614174000
   Email: test-link-1234567890@example.com
   Username: testlink1234567890
   Auth Token (first 30 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6...

🔍 Step 4: Verifying Pangea User ID ↔ OASIS Avatar ID link...
✅ Link established in registration response:
   Pangea User ID: 550e8400-e29b-41d4-a716-446655440000
   OASIS Avatar ID: 123e4567-e89b-12d3-a456-426614174000
   Link: 550e8400-e29b-41d4-a716-446655440000 ↔ 123e4567-e89b-12d3-a456-426614174000

🔍 Step 5: Verifying JWT token contains avatarId...
✅ JWT token contains correct avatarId: 123e4567-e89b-12d3-a456-426614174000

🔍 Step 6: Testing login to verify link persists...
✅ Login successful and link is consistent:
   Pangea User ID: 550e8400-e29b-41d4-a716-446655440000
   OASIS Avatar ID: 123e4567-e89b-12d3-a456-426614174000
   Link verified: 550e8400-e29b-41d4-a716-446655440000 ↔ 123e4567-e89b-12d3-a456-426614174000

🔍 Step 7: Testing OASIS operations using linked avatarId...
✅ OASIS API call succeeded using linked avatarId
   This confirms the avatarId is valid and linked correctly

==========================================
✅ ALL TESTS PASSED!
==========================================

Summary:
  ✅ User registration successful
  ✅ OASIS avatar created
  ✅ Pangea User ID ↔ OASIS Avatar ID link established
  ✅ Link stored in database (users.avatar_id)
  ✅ Link included in JWT token
  ✅ Link persists across login
  ✅ Link can be used for OASIS operations

Link Details:
  Pangea User ID: 550e8400-e29b-41d4-a716-446655440000
  OASIS Avatar ID: 123e4567-e89b-12d3-a456-426614174000
  Email: test-link-1234567890@example.com
  Username: testlink1234567890

The user registration and avatar linking flow is working correctly!
```

## Manual Testing

If you prefer to test manually, here are the steps:

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "pangea-user-uuid",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "avatarId": "oasis-avatar-uuid",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-01-10T..."
}
```

**Key Points:**
- ✅ `user.id` = Pangea User ID (UUID)
- ✅ `user.avatarId` = OASIS Avatar ID (UUID)
- ✅ Link is established: `user.id` ↔ `user.avatarId`

### 2. Verify Link in Database

```bash
# Connect to your database and check:
SELECT id, email, avatar_id FROM users WHERE email = 'test@example.com';
```

**Expected Result:**
```
id (Pangea User ID)          | email              | avatar_id (OASIS Avatar ID)
------------------------------|--------------------|----------------------------
550e8400-e29b-41d4-a716-...  | test@example.com   | 123e4567-e89b-12d3-a456-...
```

### 3. Test Login (Verify Link Persists)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Response:**
- Same `user.id` and `user.avatarId` as registration
- Link should be consistent

### 4. Use avatarId for OASIS Operations

```bash
# Get wallet balance (requires valid avatarId)
curl -X GET "http://localhost:3000/api/wallet/balance?avatarId={AVATAR_ID}" \
  -H "Authorization: Bearer {TOKEN}"
```

## Troubleshooting

### Backend Not Running

**Error:** `❌ Backend is not responding at http://localhost:3000`

**Solution:**
```bash
cd pangea-repo
npm run start:dev
```

### OASIS API Not Reachable

**Error:** `⚠️ OASIS API health check returned 000`

**Solution:**
- Check OASIS API is running
- Verify `OASIS_API_URL` environment variable
- Check network connectivity

### Registration Fails

**Error:** `❌ User registration failed`

**Possible Causes:**
- OASIS API not responding
- Invalid request format
- Email/username already exists

**Solution:**
- Check OASIS API logs
- Verify request body format
- Use a unique email/username

### Link Not Established

**Error:** `❌ Link not found in registration response!`

**Possible Causes:**
- `user-sync.service.ts` not saving avatarId
- Database save failed
- Response parsing issue

**Solution:**
- Check backend logs
- Verify database connection
- Check `user-sync.service.ts` implementation

### JWT Token Missing avatarId

**Error:** `⚠️ Could not verify avatarId in JWT token`

**Possible Causes:**
- JWT generation not including avatarId
- Token structure issue

**Solution:**
- Check `auth.service.ts` `generateJwtToken()` method
- Verify user object has avatarId before token generation

## Environment Variables

You can customize the test by setting environment variables:

```bash
# Use different backend URL
BACKEND_URL=http://localhost:3001 ./scripts/test-user-registration-and-linking.sh

# Use different OASIS API URL
OASIS_API_URL=http://localhost:5003 ./scripts/test-user-registration-and-linking.sh

# Both
BACKEND_URL=http://localhost:3001 OASIS_API_URL=http://localhost:5003 ./scripts/test-user-registration-and-linking.sh
```

## Next Steps

After successful testing:

1. ✅ Verify link is stored in database
2. ✅ Test wallet creation using linked avatarId
3. ✅ Test NFT operations using linked avatarId
4. ✅ Verify link persists across sessions
5. ✅ Test edge cases (duplicate emails, etc.)

---

**Last Updated:** 2025-01-03  
**Test Script:** `scripts/test-user-registration-and-linking.sh`


