# Remote OASIS API Setup

## Overview

The backend has been configured to use the remote OASIS API at `https://api.oasisweb4.com` instead of a local instance.

## Configuration Changes

### 1. Environment Variables

Updated `.env` file:
```env
OASIS_API_URL=https://api.oasisweb4.com
```

### 2. Code Defaults

Updated default URLs in code to use HTTPS:
- `src/services/oasis-wallet.service.ts` - Default: `https://api.oasisweb4.com`
- `src/services/oasis-token-manager.service.ts` - Default: `https://api.oasisweb4.com`
- `src/auth/services/oasis-auth.service.ts` - Already had: `https://api.oasisweb4.com`

### 3. Test Scripts

Updated test scripts to use remote API by default:
- `scripts/test-user-registration-and-linking.sh` - Default: `https://api.oasisweb4.com`
- `scripts/test-wallet-generation.sh` - Default: `https://api.oasisweb4.com`

## Verification

### Test Remote API Connection

Run the connection test script:
```bash
./scripts/test-remote-oasis-api.sh
```

This script verifies:
- ✅ Health endpoint is accessible
- ✅ Swagger documentation is accessible
- ✅ Using HTTPS (secure connection)
- ✅ SSL certificate is valid
- ✅ Response time is acceptable

### Expected Output

```
==========================================
REMOTE OASIS API CONNECTION TEST
==========================================

OASIS API URL: https://api.oasisweb4.com

🔍 Step 1: Testing Health Endpoint...
✅ Health endpoint is accessible

🔍 Step 2: Testing Swagger Endpoint...
✅ Swagger documentation is accessible

🔍 Step 3: Verifying API URL configuration...
✅ Using HTTPS (secure connection)

🔍 Step 4: Verifying SSL Certificate...
✅ SSL certificate is valid

🔍 Step 5: Testing Response Time...
✅ Response time: ~500ms (excellent)
```

## Using Remote API

### Option 1: Environment Variable (Recommended)

Set in `.env` file:
```env
OASIS_API_URL=https://api.oasisweb4.com
```

### Option 2: Command Line

Override for specific commands:
```bash
OASIS_API_URL=https://api.oasisweb4.com npm run start:dev
```

### Option 3: Test Scripts

Override for test scripts:
```bash
OASIS_API_URL=https://api.oasisweb4.com ./scripts/test-user-registration-and-linking.sh
```

## Switching Back to Local API

If you need to use a local OASIS API for development:

1. **Update .env file:**
   ```env
   OASIS_API_URL=http://localhost:5003
   ```

2. **Or override in command:**
   ```bash
   OASIS_API_URL=http://localhost:5003 npm run start:dev
   ```

3. **For test scripts:**
   ```bash
   OASIS_API_URL=http://localhost:5003 ./scripts/test-user-registration-and-linking.sh
   ```

## Testing

### Test User Registration

```bash
# Test with remote API
./scripts/test-user-registration-and-linking.sh
```

### Test Wallet Generation

```bash
# Test with remote API
./scripts/test-wallet-generation.sh
```

## API Endpoints

The remote OASIS API provides:

- **Health Check**: `https://api.oasisweb4.com/api/Health`
- **Swagger Docs**: `https://api.oasisweb4.com/swagger/index.html`
- **Avatar Registration**: `POST https://api.oasisweb4.com/api/avatar/register`
- **Avatar Authentication**: `POST https://api.oasisweb4.com/api/avatar/authenticate`
- **Wallet Operations**: Various endpoints under `/api/wallet/*`

## Benefits of Remote API

1. **No Local Setup Required** - No need to run OASIS API locally
2. **Always Up-to-Date** - Uses the latest production API
3. **Consistent Environment** - Same API version for all developers
4. **Production-Like Testing** - Test against the same API used in production

## Considerations

1. **Network Dependency** - Requires internet connection
2. **Rate Limiting** - May be subject to rate limits (check API documentation)
3. **Data Persistence** - Data created in remote API persists (use test accounts)
4. **Response Time** - Slightly slower than local (typically ~500ms)

## Troubleshooting

### Connection Issues

If you can't connect to the remote API:

1. **Check Internet Connection**
   ```bash
   curl https://api.oasisweb4.com/api/Health
   ```

2. **Check Firewall/VPN** - Ensure port 443 (HTTPS) is not blocked

3. **Check DNS** - Verify DNS resolution:
   ```bash
   nslookup api.oasisweb4.com
   ```

### SSL Certificate Issues

If you see SSL certificate errors:

1. **Update CA Certificates** (Linux/Mac):
   ```bash
   # macOS
   brew install ca-certificates
   
   # Linux
   sudo apt-get update && sudo apt-get install ca-certificates
   ```

2. **Check Certificate**:
   ```bash
   openssl s_client -connect api.oasisweb4.com:443 -showcerts
   ```

### Slow Response Times

If responses are slow:

1. **Check Network Latency**:
   ```bash
   ping api.oasisweb4.com
   ```

2. **Use Local API for Development** - Switch to local API if needed

## Next Steps

1. ✅ Remote API is configured
2. ✅ Connection test passed
3. ⏳ Test user registration flow
4. ⏳ Test wallet generation
5. ⏳ Test other OASIS operations

## Related Documentation

- `BETTER_AUTH_INTEGRATION_GUIDE.md` - Better-Auth integration
- `USER_REGISTRATION_AND_AVATAR_LINKING_FLOW.md` - Registration flow
- `TESTING_USER_REGISTRATION_FLOW.md` - Testing guide

