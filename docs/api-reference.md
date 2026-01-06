# API Reference

Complete endpoint reference for the Pangea backend API.

**Base URL:** `https://pangea-production-128d.up.railway.app/api` (production) or `http://localhost:3000/api` (dev)

**Authentication:** Include `Authorization: Bearer <jwt-token>` header for protected routes.

---

## Endpoints

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-20T17:13:15.682Z",
  "service": "Pangea Markets Backend",
  "version": "1.0.0",
  "checks": {
    "database": { "status": "ok" },
    "redis": { "status": "ok" }
  }
}
```

---

### Authentication

> **Important**: User authentication (login, register, password reset) is handled by **Better Auth** in the frontend. The backend only provides OASIS integration endpoints.

#### Create OASIS Avatar

Creates an OASIS avatar and links it to the authenticated Better Auth user. Should be called after first login/registration.

```http
POST /api/auth/create-oasis-avatar
Authorization: Bearer <better-auth-jwt>
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OASIS avatar created and linked successfully",
  "avatarId": "oasis-avatar-id",
  "userId": "uuid"
}
```

**Note**: The `email`, `username`, `firstName`, and `lastName` are optional if they're already in the Better Auth JWT token.

---

### Assets

#### List Assets

```http
GET /api/assets?status=active&limit=20&offset=0
```

**Query Parameters:**
- `status` - Filter: draft, listed, trading, closed
- `assetClass` - Filter: real_estate, art, commodities, securities
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Asset Name",
      "symbol": "ASSET",
      "assetClass": "securities",
      "pricePerTokenUsd": "10.50",
      "status": "trading"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### Get Asset

```http
GET /api/assets/:assetId
```

#### Get Order Book

```http
GET /api/assets/:assetId/orders
```

**Response:**
```json
{
  "assetId": "uuid",
  "bids": [{ "price": "10.00", "quantity": "100", "count": 3 }],
  "asks": [{ "price": "10.50", "quantity": "50", "count": 2 }],
  "midPrice": "10.25",
  "spread": "0.50"
}
```

#### Get Price

```http
GET /api/assets/:assetId/price
```

**Response:**
```json
{
  "assetId": "uuid",
  "price": "10.50",
  "change24h": 2.5,
  "timestamp": "2025-12-20T17:00:00Z"
}
```

---

### Orders

#### Create Order

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "uuid",
  "orderType": "buy",
  "pricePerTokenUsd": "10.50",
  "quantity": "100",
  "isLimitOrder": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "orderId": "uuid",
  "orderStatus": "open",
  "pricePerTokenUsd": "10.50",
  "quantity": "100",
  "filledQuantity": "0",
  "remainingQuantity": "100"
}
```

#### List Orders

```http
GET /api/orders?status=open&orderType=buy
Authorization: Bearer <token>
```

#### Cancel Order

```http
DELETE /api/orders/:orderId
Authorization: Bearer <token>
```

---

### Wallet

#### Get Balances

```http
GET /api/wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "balances": [
    {
      "assetId": "uuid",
      "balance": "1000.00",
      "availableBalance": "900.00",
      "lockedBalance": "100.00"
    }
  ]
}
```

#### Connect Wallet

```http
POST /api/wallet/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message...",
  "blockchain": "ethereum"
}
```

---

### Transactions

#### Deposit

```http
POST /api/transactions/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "uuid",
  "amount": "1000",
  "blockchain": "solana"
}
```

**Response:**
```json
{
  "transactionId": "uuid",
  "vaultAddress": "vault-address-to-send-to",
  "status": "pending"
}
```

#### Withdraw

```http
POST /api/transactions/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "uuid",
  "amount": "500",
  "toAddress": "wallet-address",
  "blockchain": "solana"
}
```

---

## Error Responses

### Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 400  | Bad Request - validation error       |
| 401  | Unauthorized - invalid/missing token |
| 403  | Forbidden - insufficient permissions |
| 404  | Not Found - resource doesn't exist   |
| 429  | Too Many Requests - rate limited     |
| 500  | Server Error                         |

---

## Quick Example

```bash
# Create OASIS avatar (after Better Auth registration/login)
curl -X POST http://localhost:3000/api/auth/create-oasis-avatar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BETTER_AUTH_JWT" \
  -d '{"email":"test@example.com","username":"testuser"}'

# Use token for authenticated requests
curl http://localhost:3000/api/assets \
  -H "Authorization: Bearer YOUR_BETTER_AUTH_JWT"
```
