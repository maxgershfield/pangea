# OASIS API Documentation Access

## Quick Access

### OpenAPI Specification File (Recommended - Most Current)
**Location**: `docs/openapi/oasis-web4-api.yaml`

- **Authoritative source** - Most up-to-date OpenAPI 3.1.0 specification
- Complete and current API documentation
- Can be used for code generation
- Can be viewed in Swagger Editor or Swagger UI

**Note**: The live Swagger UI at `https://api.oasisweb4.com/swagger/index.html` may not be current. Use the OpenAPI spec file for the most accurate documentation.

### Live Swagger UI (May Be Outdated)
**URL**: https://api.oasisweb4.com/swagger/index.html

- Interactive API documentation
- Try out endpoints directly
- **Warning**: May not reflect the latest API changes
- **Recommendation**: Use the OpenAPI spec file instead

## Viewing the OpenAPI Spec

### Option 1: Online Swagger Editor
1. Go to https://editor.swagger.io/
2. Open `docs/openapi/oasis-web4-api.yaml`
3. Or copy/paste the YAML content

### Option 2: Swagger UI (Local)
```bash
npm install -g swagger-ui-serve
swagger-ui-serve docs/openapi/oasis-web4-api.yaml
```
Then open: http://localhost:3000

### Option 3: VS Code Extension
1. Install "OpenAPI (Swagger) Editor" extension
2. Open `docs/openapi/oasis-web4-api.yaml`
3. Use preview feature

## Key Endpoints

### Authentication
- `POST /api/avatar/register` - Register new avatar
- `POST /api/avatar/authenticate` - Login

### Wallet Operations
- `POST /api/wallet/create-wallet` - Create wallet
- `GET /api/wallet/balance` - Get balance
- `GET /api/wallet/avatar/{avatarId}/wallets` - List wallets

### Other Operations
- NFT management
- Karma system
- Data storage
- And more...

## Integration with Pangea Backend

The Pangea backend uses the OASIS API for:
- User authentication (avatar registration/login)
- Wallet management
- Blockchain operations

See `docs/REMOTE_OASIS_API_SETUP.md` for configuration details.

