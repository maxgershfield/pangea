# Explaining Changes to Rishav

## Quick Reference Guide

### 📚 Documentation Locations

#### Architecture & System Design
- **Main Architecture Doc**: `docs/architecture-overview.md`
  - System design, security decisions, read/write patterns
  - Complete architecture overview
- **Architecture Diagram**: `docs/ARCHITECTURE_DIAGRAM.md`
  - Detailed ASCII diagram of user registration and OASIS avatar linking flow
  - Shows file locations, data flow, and critical linking point
  - Includes database schema and JWT token structure

#### API Documentation
- **Pangea Backend API (OpenAPI)**: `docs/openapi/pangea-backend-api.yaml`
  - Complete OpenAPI 3.1.0 specification
  - All endpoints documented with request/response schemas
  - View guide: `docs/openapi/README.md`

- **OASIS API OpenAPI Spec** (Recommended - Most Current): `docs/openapi/oasis-web4-api.yaml`
  - **Authoritative source** - Most up-to-date OpenAPI 3.1.0 specification
  - Complete and current API documentation
  - Now included in the repository for easy access
- **OASIS API Swagger UI** (May Be Outdated): `https://api.oasisweb4.com/swagger/index.html`
  - Live Swagger UI (may not reflect latest changes)
  - **Note**: Use the OpenAPI spec file for accurate documentation

#### Key Documentation Files
- **Getting Started**: `docs/getting-started.md`
- **API Reference**: `docs/api-reference.md`
- **API Endpoints**: `docs/api-endpoints.md`
- **OASIS Integration**: `docs/wallet-oasis.md`
- **Remote OASIS Setup**: `docs/REMOTE_OASIS_API_SETUP.md`
- **Deployment**: `docs/deployment-railway.md`

---

## 🔑 Key File Areas

### Authentication & OASIS Integration
```
src/auth/
├── controllers/
│   └── auth.controller.ts          # NEW: create-oasis-avatar endpoint
├── guards/
│   └── jwks-jwt.guard.ts           # UPDATED: Better-Auth token support
├── services/
│   ├── auth.service.ts             # UPDATED: createOasisAvatarForUser method
│   ├── oasis-auth.service.ts       # UPDATED: Remote API configuration
│   └── oasis-auth-helper.ts        # NEW: HTTP helper (may not be needed)
└── entities/                        # Better-Auth entities (prepared, not used yet)
```

### OASIS Services
```
src/services/
├── oasis-wallet.service.ts          # UPDATED: HTTPS remote API default
└── oasis-token-manager.service.ts   # UPDATED: HTTPS remote API default
```

### Wallet Operations
```
src/wallet/
└── wallet.controller.ts             # UPDATED: Better-Auth token support (name field)
```

### Configuration
```
src/config/
└── database.config.ts                # UPDATED: Better-Auth entity configuration
```

---

## 📋 Summary of Changes

### 1. Remote OASIS API Integration ✅ WORKING
**What Changed:**
- Default OASIS API URL changed from `http://localhost:5003` to `https://api.oasisweb4.com`
- All OASIS service calls now use remote API by default
- Tested and working

**Key Files:**
- `src/services/oasis-wallet.service.ts` (line 59)
- `src/services/oasis-token-manager.service.ts` (line 32)
- `src/auth/services/oasis-auth.service.ts` (line 82)

**Documentation:**
- `docs/REMOTE_OASIS_API_SETUP.md` - Complete setup guide

**Test:**
```bash
./scripts/test-remote-oasis-api.sh
```

### 2. Better-Auth Preparation (Not Fully Implemented) ⚠️
**What Changed:**
- Added Better-Auth entity support in database config
- Added `POST /api/auth/create-oasis-avatar` endpoint
- Updated `JwksJwtGuard` to support `name` field from Better-Auth tokens
- **BUT**: Better-Auth is NOT actually working yet - just prepared

**Key Files:**
- `src/auth/controllers/auth.controller.ts` (lines 69-141) - New endpoint
- `src/auth/services/auth.service.ts` (lines 197-247) - New method
- `src/auth/guards/jwks-jwt.guard.ts` (lines 18-33) - Name field support
- `src/config/database.config.ts` - Better-Auth entities

**Status:**
- Infrastructure ready
- Endpoint exists but not used (frontend doesn't have Better-Auth yet)
- Current auth still uses backend JWT tokens

### 3. OpenAPI Specification ✅
**What Changed:**
- Complete OpenAPI 3.1.0 specification for all endpoints
- All request/response schemas documented

**Location:**
- `docs/openapi/pangea-backend-api.yaml`
- `docs/openapi/README.md` - How to view/use

**View:**
- Online: https://editor.swagger.io/ (paste YAML)
- Or: `swagger-ui-serve docs/openapi/pangea-backend-api.yaml`

### 4. Documentation Cleanup ✅
**What Changed:**
- Removed 14 unnecessary docs (Better-Auth guides, email bypass, etc.)
- Kept only essential documentation
- Updated `docs/README.md` with better organization

**Removed:**
- All Better-Auth integration guides (not implemented)
- Email verification bypass docs (unclear if used)
- Redundant flow diagrams
- Temporary testing docs

**Kept:**
- Essential: getting-started, api-reference, wallet-oasis, deployment
- OpenAPI spec
- Architecture and integration docs

### 5. Testing Infrastructure ✅
**What Changed:**
- Added multiple test scripts
- Added helper scripts for starting services

**New Scripts:**
- `scripts/test-user-registration-and-linking.sh` - Registration flow
- `scripts/test-wallet-generation.sh` - Wallet generation
- `scripts/test-remote-oasis-api.sh` - OASIS API connection
- `scripts/start-backend.sh` - Start backend on custom port
- `scripts/start-oasis-api.sh` - Start local OASIS API

---

## 🗺️ Architecture Overview

### Current Authentication Flow (WORKING)
```
User → POST /api/auth/register
  ↓
Backend → OASIS API (https://api.oasisweb4.com/api/avatar/register)
  ↓
Backend → Create Pangea user + link to OASIS avatar
  ↓
Backend → Generate JWT token
  ↓
User ← JWT token (use for all requests)
```

### Future Better-Auth Flow (PREPARED, NOT WORKING)
```
User → Better-Auth registration (frontend)
  ↓
Frontend → POST /api/auth/create-oasis-avatar (with Better-Auth token)
  ↓
Backend → Validate Better-Auth token via JWKS
  ↓
Backend → Create OASIS avatar + link to user
  ↓
User ← OASIS avatar created
```

---

## 🔍 Key Points to Explain

### 1. Remote OASIS API
- **Status**: ✅ Working and tested
- **Impact**: All OASIS calls now use remote API
- **Config**: Set in `.env` as `OASIS_API_URL=https://api.oasisweb4.com`
- **Can override**: Use local API by setting env var

### 2. Better-Auth
- **Status**: ⚠️ Prepared but not implemented
- **What exists**: Entities, endpoint, guard support
- **What's missing**: Frontend Better-Auth setup
- **Current auth**: Still uses backend JWT tokens (unchanged)

### 3. OpenAPI Spec
- **Status**: ✅ Complete
- **Location**: `docs/openapi/pangea-backend-api.yaml`
- **Use**: API documentation, code generation, testing

### 4. Documentation
- **Status**: ✅ Cleaned up
- **Before**: 27 files (many unnecessary)
- **After**: 13 essential files
- **Focus**: Only what's actually implemented

### 5. No Breaking Changes
- **All changes backward compatible**
- **Existing endpoints work the same**
- **Can still use local OASIS API if needed**

---

## 📍 Quick Links for Rishav

### Architecture
- **System Design**: `docs/architecture-overview.md`
- **Database Schema**: `docs/database-schema.md`

### API Documentation
- **Pangea Backend API**: `docs/openapi/pangea-backend-api.yaml`
- **OASIS API OpenAPI** (Most Current): `docs/openapi/oasis-web4-api.yaml`
  - **Authoritative source** - Most up-to-date specification
  - Complete OpenAPI 3.1.0 documentation
- **OASIS API Swagger UI** (May Be Outdated): https://api.oasisweb4.com/swagger/index.html
  - **Note**: May not reflect latest API changes - use OpenAPI spec file instead

### Key Code Areas
- **Auth Controller**: `src/auth/controllers/auth.controller.ts`
- **OASIS Services**: `src/services/oasis-*.service.ts`
- **Wallet Controller**: `src/wallet/wallet.controller.ts`
- **Database Config**: `src/config/database.config.ts`

### Testing
- **Test Scripts**: `scripts/test-*.sh`
- **Helper Scripts**: `scripts/start-*.sh`

---

## 💬 Talking Points

1. **Remote OASIS API is working** - Tested and verified
2. **Better-Auth is prepared but not active** - Infrastructure ready, waiting on frontend
3. **No breaking changes** - Everything backward compatible
4. **Documentation cleaned up** - Removed 14 unnecessary docs
5. **OpenAPI spec added** - Complete API documentation
6. **Testing infrastructure improved** - Multiple test scripts added

---

## 🧪 Verification

To verify the changes work:
```bash
# Test remote OASIS API
./scripts/test-remote-oasis-api.sh

# Test user registration
./scripts/test-user-registration-and-linking.sh

# Test wallet generation
./scripts/test-wallet-generation.sh
```

All tests should pass with remote OASIS API.

