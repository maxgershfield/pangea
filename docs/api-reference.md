# API Reference

Complete endpoint reference for the Pangea backend API.

---

## Base URL

```
Production: https://pangea-production-128d.up.railway.app/api
Development: http://localhost:3000/api
```

All routes are prefixed with `/api`.

---

## Authentication

### Headers

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Token Lifecycle

1. **Obtain**: Login or register returns JWT token
2. **Store**: Save in HttpOnly cookie or session storage
3. **Use**: Include in Authorization header
4. **Expiry**: Tokens expire after 7 days

---

## Route Access Matrix

| Endpoint                           | Auth | Role  | Access Pattern |
| ---------------------------------- | ---- | ----- | -------------- |
| **Authentication**                 |
| `POST /auth/register`              | No   | -     | Direct         |
| `POST /auth/login`                 | No   | -     | Direct         |
| `POST /auth/forgot-password`       | No   | -     | Direct         |
| `POST /auth/reset-password`        | No   | -     | Direct         |
| `GET /auth/me`                     | Yes  | -     | Direct         |
| `GET /auth/session`                | Yes  | -     | Direct         |
| **User**                           |
| `GET /user/profile`                | Yes  | -     | Direct         |
| `PUT /user/profile`                | Yes  | -     | Via Next.js    |
| **Assets**                         |
| `GET /assets`                      | No   | -     | Direct         |
| `GET /assets/:id`                  | No   | -     | Direct         |
| `GET /assets/:id/orders`           | No   | -     | Direct         |
| `GET /assets/:id/trades`           | No   | -     | Direct         |
| `GET /assets/:id/price`            | No   | -     | Direct         |
| `GET /assets/search`               | No   | -     | Direct         |
| `POST /assets`                     | Yes  | Admin | Via Next.js    |
| `PUT /assets/:id`                  | Yes  | Admin | Via Next.js    |
| `DELETE /assets/:id`               | Yes  | Admin | Via Next.js    |
| **Orders**                         |
| `GET /orders`                      | Yes  | -     | Direct         |
| `GET /orders/open`                 | Yes  | -     | Direct         |
| `GET /orders/history`              | Yes  | -     | Direct         |
| `GET /orders/:orderId`             | Yes  | -     | Direct         |
| `POST /orders`                     | Yes  | -     | Via Next.js    |
| `PUT /orders/:orderId`             | Yes  | -     | Via Next.js    |
| `DELETE /orders/:orderId`          | Yes  | -     | Via Next.js    |
| **Trades**                         |
| `GET /trades`                      | Yes  | -     | Direct         |
| `GET /trades/:tradeId`             | Yes  | -     | Direct         |
| `GET /trades/history`              | Yes  | -     | Direct         |
| `GET /trades/statistics`           | Yes  | -     | Direct         |
| **Wallet**                         |
| `GET /wallet/balance`              | Yes  | -     | Direct         |
| `GET /wallet/balance/:assetId`     | Yes  | -     | Direct         |
| `GET /wallet/verification-message` | Yes  | -     | Direct         |
| `POST /wallet/connect`             | Yes  | -     | Via Next.js    |
| `POST /wallet/verify`              | Yes  | -     | Via Next.js    |
| `POST /wallet/sync`                | Yes  | -     | Via Next.js    |
| **Transactions**                   |
| `GET /transactions`                | Yes  | -     | Direct         |
| `GET /transactions/:txId`          | Yes  | -     | Direct         |
| `POST /transactions/deposit`       | Yes  | -     | Via Next.js    |
| `POST /transactions/withdraw`      | Yes  | -     | Via Next.js    |
| `POST /transactions/:txId/confirm` | Yes  | Admin | Via Next.js    |

**Legend:**
- **Direct**: Call from client with JWT token
- **Via Next.js**: Proxy through Next.js API route

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

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "avatarId": "oasis-avatar-id",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-12-27T17:13:15.682Z"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same format as register.

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "role": "user"
}
```

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

## Quick Start

```bash
# 1. Register
curl -X POST https://pangea-production-128d.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","username":"testuser"}'

# 2. Store the token
export TOKEN="your-jwt-token-here"

# 3. Get profile (authenticated)
curl https://pangea-production-128d.up.railway.app/api/user/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Browse assets (public)
curl https://pangea-production-128d.up.railway.app/api/assets
```

---

## TypeScript Client Example

```typescript
const API_URL = 'https://pangea-production-128d.up.railway.app/api';

class PangeaClient {
  private token: string | null = null;

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    this.token = data.token;
    return data;
  }

  async getAssets() {
    return fetch(`${API_URL}/assets`).then(r => r.json());
  }

  async getOrders() {
    return fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${this.token}` },
    }).then(r => r.json());
  }
}
```
