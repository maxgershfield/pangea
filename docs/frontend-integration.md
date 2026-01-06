# Frontend Integration Guide

Quick guide for frontend developers.

---

## Base URL

```
Production: https://pangea-production-128d.up.railway.app/api
Development: http://localhost:3000/api
```

---

## Authentication

### Register/Login
```typescript
POST /api/auth/register
Body: { email, password, username, firstName?, lastName? }

POST /api/auth/login
Body: { email, password }

Response: { user, token, expiresAt }
```

### Use Token
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## Common Endpoints

### Assets (Public)
```typescript
GET /api/assets                    // List all
GET /api/assets/:id                // Details
GET /api/assets/:id/orders         // Order book
GET /api/assets/:id/price          // Current price
```

### Orders (Protected)
```typescript
POST /api/orders                   // Create order
Body: { assetId, orderType: 'buy'|'sell', pricePerTokenUsd, quantity, isLimitOrder? }

GET /api/orders                    // User's orders
GET /api/orders/open               // Open orders
DELETE /api/orders/:id             // Cancel
```

### Wallet (Protected)
```typescript
POST /api/wallet/connect           // Connect Phantom/MetaMask
Body: { blockchain: 'solana'|'ethereum', walletAddress, signature, message }

GET /api/wallet/balance            // All balances
```

### Transactions (Protected)
```typescript
POST /api/transactions/deposit     // Initiate deposit
Body: { assetId, amount, blockchain }

POST /api/transactions/withdraw    // Initiate withdrawal
Body: { assetId, amount, toAddress, blockchain }
```

---

## WebSocket

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/trading', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

// Subscribe
socket.emit('subscribe:orderbook', { assetId: 'xxx' });
socket.emit('subscribe:trades', { assetId: 'xxx' });

// Listen
socket.on('orderbook:update', (data) => { /* ... */ });
socket.on('trade:executed', (trade) => { /* ... */ });
```

---

## Error Handling

```typescript
if (!response.ok) {
  const error = await response.json();
  // error.message can be string or array
  console.error(error.message);
}
```

**Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## TypeScript Client Example

See `docs/api-reference.md` for complete examples.

---

**Full API docs**: See [API Reference](./api-reference.md) for all endpoints.
