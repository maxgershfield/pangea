# Pangea Backend API - OpenAPI Specification

## Overview

This directory contains the OpenAPI 3.1.0 specification for the Pangea Backend API, documenting all endpoints, request/response schemas, and authentication flows.

## Files

- `pangea-backend-api.yaml` - Complete OpenAPI specification for the Pangea Backend API

## Viewing the API Documentation

### Option 1: Swagger UI (Recommended)

1. Install Swagger UI:
   ```bash
   npm install -g swagger-ui-serve
   ```

2. Serve the OpenAPI spec:
   ```bash
   swagger-ui-serve pangea-backend-api.yaml
   ```

3. Open in browser: `http://localhost:3000`

### Option 2: Online Swagger Editor

1. Go to https://editor.swagger.io/
2. Copy the contents of `pangea-backend-api.yaml`
3. Paste into the editor
4. View the interactive documentation

### Option 3: Redoc

1. Install Redoc CLI:
   ```bash
   npm install -g redoc-cli
   ```

2. Generate HTML documentation:
   ```bash
   redoc-cli bundle pangea-backend-api.yaml -o api-docs.html
   ```

3. Open `api-docs.html` in your browser

### Option 4: VS Code Extension

1. Install the "OpenAPI (Swagger) Editor" extension in VS Code
2. Open `pangea-backend-api.yaml`
3. Use the preview feature to view the documentation

## Key Endpoints

### Authentication Flow (Better-Auth)

1. **Register with Better-Auth** (Frontend)
   - Frontend handles Better-Auth registration
   - Better-Auth generates JWT token

2. **Create OASIS Avatar** (Backend)
   ```
   POST /api/auth/create-oasis-avatar
   Authorization: Bearer <Better-Auth-Token>
   ```
   - Creates OASIS avatar
   - Links avatar to Better-Auth user
   - Required before using wallet features

3. **Use Protected Endpoints**
   ```
   GET /api/wallet/balance
   Authorization: Bearer <Better-Auth-Token>
   ```

### Legacy Authentication Flow

1. **Register** (Backend)
   ```
   POST /api/auth/register
   ```
   - Creates OASIS avatar
   - Creates Pangea user
   - Returns backend JWT token

2. **Login** (Backend)
   ```
   POST /api/auth/login
   ```
   - Authenticates user
   - Returns backend JWT token

3. **Use Protected Endpoints**
   ```
   GET /api/wallet/balance
   Authorization: Bearer <Backend-JWT-Token>
   ```

## Authentication

### Better-Auth Tokens

- **Validation**: Via JWKS endpoint at `{FRONTEND_URL}/api/auth/jwks`
- **Required Claims**: `id`, `email`
- **Optional Claims**: `name`, `role`, `kycStatus`
- **Format**: `Authorization: Bearer <token>`

### Legacy Backend Tokens

- **Validation**: Via backend JWT secret
- **Claims**: `sub` (user ID), `email`, `username`, `avatarId`, `role`
- **Format**: `Authorization: Bearer <token>`

## Testing with OpenAPI

### Using Postman

1. Import the OpenAPI spec into Postman
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3001`
   - `token`: Your Better-Auth or backend JWT token
3. Use the imported collection to test endpoints

### Using curl

```bash
# Create OASIS avatar (Better-Auth)
curl -X POST http://localhost:3001/api/auth/create-oasis-avatar \
  -H "Authorization: Bearer <BETTER_AUTH_TOKEN>" \
  -H "Content-Type: application/json"

# Get wallet balance
curl http://localhost:3001/api/wallet/balance \
  -H "Authorization: Bearer <BETTER_AUTH_TOKEN>"

# Generate wallet
curl -X POST http://localhost:3001/api/wallet/generate \
  -H "Authorization: Bearer <BETTER_AUTH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "providerType": "SolanaOASIS",
    "setAsDefault": true
  }'
```

### Using httpie

```bash
# Create OASIS avatar
http POST http://localhost:3001/api/auth/create-oasis-avatar \
  Authorization:"Bearer <BETTER_AUTH_TOKEN>"

# Get wallet balance
http GET http://localhost:3001/api/wallet/balance \
  Authorization:"Bearer <BETTER_AUTH_TOKEN>"
```

## Code Generation

### Generate TypeScript Client

```bash
# Install openapi-generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i pangea-backend-api.yaml \
  -g typescript-axios \
  -o ../generated/typescript-client
```

### Generate Python Client

```bash
openapi-generator-cli generate \
  -i pangea-backend-api.yaml \
  -g python \
  -o ../generated/python-client
```

### Generate Go Client

```bash
openapi-generator-cli generate \
  -i pangea-backend-api.yaml \
  -g go \
  -o ../generated/go-client
```

## Schema Validation

### Validate the OpenAPI Spec

```bash
# Install swagger-cli
npm install -g swagger-cli

# Validate the spec
swagger-cli validate pangea-backend-api.yaml
```

### Validate Against JSON Schema

```bash
# Install ajv-cli
npm install -g ajv-cli

# Validate request/response examples
ajv validate -s schema.json -d example.json
```

## Integration with Backend

### Auto-generate from Code (Future)

Consider using tools like:
- `@nestjs/swagger` - Auto-generate OpenAPI from NestJS decorators
- `swagger-jsdoc` - Generate from JSDoc comments

### Keep in Sync

When updating the API:
1. Update the OpenAPI spec
2. Update backend code
3. Update frontend client (if using generated client)
4. Update tests

## Better-Auth Integration Flow

The OpenAPI spec documents the complete Better-Auth integration flow:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend: Better-Auth Registration                       │
│    POST /api/auth/sign-up (Better-Auth endpoint)            │
│    → Returns: { user, session }                             │
│    → Token stored in Better-Auth cookie                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend: Create OASIS Avatar                             │
│    POST /api/auth/create-oasis-avatar                       │
│    Authorization: Bearer <Better-Auth-Token>                 │
│    → Creates OASIS avatar                                   │
│    → Links to Pangea user                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend: Use Protected Endpoints                         │
│    GET /api/wallet/balance                                   │
│    POST /api/wallet/generate                                 │
│    GET /api/user/profile                                     │
│    Authorization: Bearer <Better-Auth-Token>                  │
│    → All endpoints work with Better-Auth tokens             │
└─────────────────────────────────────────────────────────────┘
```

## Examples

See the OpenAPI spec for detailed examples of:
- Request bodies
- Response schemas
- Error responses
- Authentication flows

## Support

For questions or issues:
1. Check the OpenAPI spec for endpoint details
2. Review `BETTER_AUTH_INTEGRATION_GUIDE.md` for integration help
3. Check backend logs for error details

