# Frontend Integration Guide

Complete guide for frontend developers integrating with the Pangea backend API.

---

## Quick Start

### Base URL
```
Production: https://pangea-production-128d.up.railway.app/api
Development: http://localhost:3000/api
```

### Authentication
All protected endpoints require a JWT token:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Architecture Pattern

| Operation                   | Approach              | Reason                                  |
| --------------------------- | --------------------- | --------------------------------------- |
| **Read (GET)**              | Call backend directly | Fast, no proxy overhead                 |
| **Write (POST/PUT/DELETE)** | Proxy through Next.js | Security, audit trail, extra validation |

---

## Authentication

### Register
```typescript
POST /api/auth/register
Body: {
  email: string;        // Required
  password: string;     // Required
  username: string;     // Required
  firstName?: string;
  lastName?: string;
}

Response: {
  user: { id, email, username, avatarId, role },
  token: string,
  expiresAt: string
}
```

**What happens on registration:**
1. Backend creates OASIS Avatar (external identity)
2. Creates local user record linked via `avatarId`
3. Returns Pangea JWT token (use this for all API calls)

### Login
```typescript
POST /api/auth/login
Body: { email: string, password: string }

Response: { user, token, expiresAt }  // Same as register
```

### Get Current User
```typescript
GET /api/auth/me
Headers: { Authorization: 'Bearer <token>' }

Response: {
  id: string,
  email: string,
  username: string,
  avatarId: string,
  role: string,
  walletAddressSolana?: string,
  walletAddressEthereum?: string
}
```

---

## Assets (Public - No Auth Required)

### List All Assets
```typescript
GET /api/assets?page=1&limit=20&status=active&assetClass=real-estate

Response: {
  data: [{
    id, name, symbol, description, assetClass,
    totalSupply, currentPrice, status, blockchain, contractAddress
  }],
  total: number,
  page: number,
  limit: number
}
```

### Get Asset Details
```typescript
GET /api/assets/:assetId

Response: {
  id, name, symbol, description, assetClass,
  totalSupply, currentPrice, status, blockchain,
  contractAddress, metadata
}
```

### Get Order Book
```typescript
GET /api/assets/:assetId/orders

Response: {
  bids: [{ orderId, pricePerTokenUsd, quantity, remainingQuantity }],  // Buy orders
  asks: [{ orderId, pricePerTokenUsd, quantity, remainingQuantity }]   // Sell orders
}
```

### Get Current Price
```typescript
GET /api/assets/:assetId/price

Response: {
  assetId, currentPrice, priceChange24h?, volume24h?
}
```

---

## Orders (Protected)

### Create Order
```typescript
POST /api/orders
Body: {
  assetId: string,
  orderType: 'buy' | 'sell',
  pricePerTokenUsd: number,   // Min 0.01
  quantity: number,           // Min 1
  isLimitOrder?: boolean,     // Default: true
  isMarketOrder?: boolean,    // Default: false
  expiresAt?: string,
  blockchain?: 'solana' | 'ethereum'
}

Response: {
  orderId, assetId, orderType,
  orderStatus: 'pending' | 'open' | 'filled' | 'partially_filled' | 'cancelled',
  pricePerTokenUsd, quantity, remainingQuantity, filledQuantity, createdAt
}
```

**Notes:**
- Sell orders lock tokens until filled/cancelled
- Orders are automatically matched when created
- Market orders execute immediately at best available price

### Get User's Orders
```typescript
GET /api/orders?status=open&orderType=buy&page=1&limit=20
GET /api/orders/open      // Only open orders
GET /api/orders/history   // Completed/cancelled orders
GET /api/orders/:orderId  // Single order details
```

### Cancel Order
```typescript
DELETE /api/orders/:orderId

Response: { orderId, orderStatus: 'cancelled', message }
```

---

## Trades (Protected)

### Get Trade History
```typescript
GET /api/trades?assetId=xxx&status=completed&page=1&limit=20

Response: {
  data: [{
    tradeId, assetId, buyerId, sellerId,
    quantity, pricePerTokenUsd, totalValueUsd,
    transactionHash?, executedAt,
    settlementStatus: 'pending' | 'completed' | 'failed'
  }],
  total, page, limit
}
```

### Get Trade Statistics
```typescript
GET /api/trades/statistics?assetId=xxx

Response: {
  totalTrades, totalVolume, averagePrice,
  highestPrice, lowestPrice, lastTradePrice
}
```

---

## Wallet (Protected)

### Connect External Wallet
```typescript
// 1. Get verification message
GET /api/wallet/verification-message?walletAddress=xxx&blockchain=solana

Response: { message: string }

// 2. User signs message in Phantom/MetaMask

// 3. Submit signed message
POST /api/wallet/connect
Body: {
  blockchain: 'solana' | 'ethereum',
  walletAddress: string,
  signature: string,
  message: string
}

Response: { success: true, wallet: { address, blockchain } }
```

### Get Balances
```typescript
GET /api/wallet/balance                // All balances
GET /api/wallet/balance/:assetId       // Single asset balance

Response: {
  success: true,
  balances: [{
    walletId, walletAddress, providerType,
    balance, tokenSymbol
  }]
}
```

---

## Transactions (Protected)

### Deposit
```typescript
POST /api/transactions/deposit
Body: {
  assetId: string,
  amount: string,
  blockchain: 'solana' | 'ethereum',
  fromAddress?: string
}

Response: {
  transactionId, assetId, amount,
  vaultAddress: string,  // Send tokens here
  status: 'pending', createdAt
}
```

### Withdraw
```typescript
POST /api/transactions/withdraw
Body: {
  assetId: string,
  amount: string,
  toAddress: string,
  blockchain: 'solana' | 'ethereum'
}

Response: {
  transactionId, assetId, amount, toAddress,
  status: 'processing', transactionHash?, createdAt
}
```

### Get Transaction History
```typescript
GET /api/transactions?assetId=xxx&transactionType=deposit&status=completed

Response: {
  data: [{
    transactionId, assetId,
    transactionType: 'deposit' | 'withdrawal',
    amount, status, transactionHash?, createdAt, completedAt?
  }],
  total
}
```

---

## WebSocket (Real-time Updates)

### Connect
```typescript
import { io } from 'socket.io-client';

const socket = io('https://pangea-production-128d.up.railway.app/trading', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connected', (data) => console.log('Connected:', data));
socket.on('error', (error) => console.error('Error:', error));
```

### Subscribe to Order Book
```typescript
socket.emit('subscribe:orderbook', { assetId: 'xxx' });

socket.on('orderbook:update', (data) => {
  // { assetId, orderBook: { bids, asks }, timestamp }
});
```

### Subscribe to Trades
```typescript
socket.emit('subscribe:trades', { assetId: 'xxx' });

socket.on('trade:executed', (trade) => {
  // { tradeId, assetId, quantity, pricePerTokenUsd, executedAt }
});
```

### Subscribe to User Events
```typescript
socket.emit('subscribe:user');

socket.on('order:updated', (order) => {
  // { orderId, orderStatus, filledQuantity, remainingQuantity }
});

socket.on('balance:update', (balance) => {
  // { userId, assetId, balance, timestamp }
});
```

### Unsubscribe
```typescript
socket.emit('unsubscribe:orderbook', { assetId: 'xxx' });
socket.emit('unsubscribe:trades', { assetId: 'xxx' });
```

---

## TypeScript API Client

```typescript
class PangeaApi {
  private baseUrl = 'https://pangea-production-128d.up.railway.app/api';
  private token: string | null = null;

  setToken(token: string) { this.token = token; }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message);
    }

    return response.json();
  }

  // Auth
  async register(data: { email: string; password: string; username: string }) {
    const res = await this.request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    this.setToken(res.token);
    return res;
  }

  async login(email: string, password: string) {
    const res = await this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    this.setToken(res.token);
    return res;
  }

  // Data
  getProfile = () => this.request('/user/profile');
  getAssets = () => this.request('/assets');
  getOrders = () => this.request('/orders');
  getOpenOrders = () => this.request('/orders/open');
  getTrades = () => this.request('/trades');
  getTradeStats = () => this.request('/trades/statistics');
  getTransactions = () => this.request('/transactions');
}
```

---

## Error Handling

### Status Codes
| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (validation errors)      |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 500  | Server Error                         |

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",  // Can be string or array
  "error": "Bad Request"
}
```

### Handling Validation Errors
```typescript
if (!response.ok) {
  const error = await response.json();
  if (Array.isArray(error.message)) {
    console.error('Validation errors:', error.message.join(', '));
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## Endpoint Reference

### Public (No Auth)
| Endpoint                     | Description            |
| ---------------------------- | ---------------------- |
| `POST /auth/register`        | Register user          |
| `POST /auth/login`           | Login                  |
| `POST /auth/forgot-password` | Request password reset |
| `GET /assets`                | List assets            |
| `GET /assets/:id`            | Asset details          |
| `GET /assets/:id/orders`     | Order book             |
| `GET /assets/:id/price`      | Current price          |

### Protected (Require Auth)
| Endpoint                    | Description       |
| --------------------------- | ----------------- |
| `GET /auth/me`              | Current user      |
| `GET /user/profile`         | User profile      |
| `GET/POST/DELETE /orders/*` | Order operations  |
| `GET /trades/*`             | Trade history     |
| `GET/POST /wallet/*`        | Wallet operations |
| `GET/POST /transactions/*`  | Deposit/withdraw  |

### WebSocket Events
| Event              | Description          |
| ------------------ | -------------------- |
| `trade:executed`   | New trade completed  |
| `orderbook:update` | Order book changed   |
| `order:updated`    | Order status changed |
| `balance:update`   | Balance changed      |
| `price:update`     | Price changed        |

---

## Next Steps

1. **Start with auth**: Register/login to get JWT token
2. **Browse assets**: Use public endpoints
3. **Connect wallet**: Link Phantom/MetaMask
4. **Create orders**: Place buy/sell orders
5. **Subscribe to updates**: Use WebSocket for real-time data
