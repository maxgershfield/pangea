# Changelog

## Recent Changes

### Remote OASIS API Configuration
- **Updated**: Default OASIS API URL to `https://api.oasisweb4.com` (HTTPS)
- **Updated**: All services to use remote OASIS API by default
- **Updated**: Test scripts to use remote API
- **Added**: `REMOTE_OASIS_API_SETUP.md` - Remote API configuration guide
- **Added**: `test-remote-oasis-api.sh` - Connection test script

### OpenAPI Specification
- **Added**: Complete OpenAPI 3.1.0 specification (`docs/openapi/pangea-backend-api.yaml`)
- **Added**: OpenAPI documentation guide (`docs/openapi/README.md`)
- **Documentation**: All endpoints documented with request/response schemas

### Bug Fixes
- **Fixed**: Missing `HttpException` import in `auth.controller.ts`

---

## Current Implementation

### Authentication
- Backend JWT token generation (register/login endpoints)
- OASIS avatar creation and linking
- User sync to local database

### OASIS Integration
- Remote API: `https://api.oasisweb4.com`
- Wallet operations (generate, balance, connect, verify)
- Avatar management

### API Documentation
- OpenAPI 3.1.0 specification
- Complete endpoint documentation
