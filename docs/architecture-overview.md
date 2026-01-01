# Architecture Overview

System design, security decisions, and read/write patterns for the Pangea backend.

---

## Design Philosophy

**Defense in Depth for Financial Operations**

```
Client → Next.js API Routes → Backend API → Database
             ↓                      ↓
        Validation              JWT Auth
        Audit Trail             User Scoping
        Rate Limiting           Business Logic
```

---

## Read/Write Pattern

### Decision

| Operation                   | Approach              | Reason                                  |
| --------------------------- | --------------------- | --------------------------------------- |
| **Read (GET)**              | Direct from client    | Fast, no proxy overhead                 |
| **Write (POST/PUT/DELETE)** | Proxy through Next.js | Security, audit trail, extra validation |

### Benefits

1. **Security Layers** - Each layer adds validation
2. **Audit Trail** - All writes logged at Next.js level
3. **Business Logic** - Additional validation before backend
4. **Performance** - Reads are fast, writes have acceptable overhead
5. **Consistency** - All writes go through one code path

---

## Route Classification

### Public Routes (No Auth)

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/assets
GET  /api/assets/:id
GET  /api/assets/:id/orders
GET  /api/assets/:id/trades
GET  /api/assets/:id/price
GET  /api/assets/search
GET  /api/health
```

### Protected Routes (JWT Required)

```
# User
GET/PUT /api/user/profile

# Orders
GET     /api/orders
GET     /api/orders/open
GET     /api/orders/history
GET     /api/orders/:orderId
POST    /api/orders           # Via Next.js
PUT     /api/orders/:orderId  # Via Next.js
DELETE  /api/orders/:orderId  # Via Next.js

# Trades
GET  /api/trades
GET  /api/trades/:tradeId
GET  /api/trades/history
GET  /api/trades/statistics

# Wallet
GET   /api/wallet/balance
GET   /api/wallet/balance/:assetId
POST  /api/wallet/connect      # Via Next.js
POST  /api/wallet/verify       # Via Next.js
POST  /api/wallet/sync         # Via Next.js

# Transactions
GET   /api/transactions
GET   /api/transactions/:txId
POST  /api/transactions/deposit   # Via Next.js
POST  /api/transactions/withdraw  # Via Next.js
```

### Admin Routes (Admin Role Required)

```
POST/PUT/DELETE /api/assets
POST            /api/transactions/:txId/confirm
ALL             /api/admin/*
ALL             /api/smart-contracts/*
```

---

## Implementation Patterns

### Read Operation (Direct from Client)

```typescript
'use client';

async function fetchOrders(token: string) {
  const response = await fetch(`${BACKEND_URL}/api/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}
```

### Write Operation (Via Next.js API Route)

**Client:**
```typescript
'use client';

async function createOrder(orderData: CreateOrderDto) {
  // Call Next.js API route, not backend
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return response.json();
}
```

**Next.js API Route:**
```typescript
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Validate session
  const session = await getServerSession();
  if (!session?.jwtToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get and validate request data
  const orderData = await request.json();
  if (!orderData.assetId || orderData.quantity <= 0) {
    return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
  }

  // 3. Audit trail
  console.log(`[AUDIT] User ${session.userId} creating order`, {
    assetId: orderData.assetId,
    quantity: orderData.quantity,
    timestamp: new Date().toISOString()
  });

  // 4. Forward to backend
  const response = await fetch(`${process.env.BACKEND_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();
  return NextResponse.json(result, { status: response.status });
}
```

---

## Rate Limiting Strategy

| Endpoint Type    | Limit              | Layer             |
| ---------------- | ------------------ | ----------------- |
| Auth endpoints   | 5/min per IP       | Backend           |
| Public assets    | 60/min per IP      | Backend           |
| Authenticated    | 100/min per user   | Backend           |
| Write operations | 10-20/min per user | Next.js + Backend |
| Admin            | 200/min per user   | Backend           |

### Implementation

```typescript
// Using @nestjs/throttler with Redis storage
ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60000, limit: 100 }],
  storage: new ThrottlerStorageRedisService(),
});

// Per-route customization
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
async login() { /* ... */ }
```

---

## Authentication Flow

```
1. User Login
   Client → POST /api/auth/login → Backend
                                      ↓
                               JWT Token (7 days)
                                      ↓
   Client ← { token, user, expiresAt } ←

2. Protected Request
   Client → GET /api/orders (Authorization: Bearer <token>)
                                      ↓
                               JwtAuthGuard validates
                                      ↓
                               User context extracted
                                      ↓
   Client ← User-scoped data ←
```

### Token Storage

- **HttpOnly Cookie** (recommended): Set by Next.js, secure
- **Session Storage**: Client-side, cleared on tab close
- **Local Storage**: Persistent, but less secure

---

## Security Invariants

1. **JWT tokens are Pangea-generated**, not OASIS tokens
2. **All protected routes require valid JWT** via JwtAuthGuard
3. **User data is always scoped** - users can only access their own data
4. **Admin operations require admin role** - checked by RoleGuard
5. **CORS is configured** - only allowed origins can make requests
6. **Write operations should go through Next.js** - extra validation layer

---

## CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://pangea.rkund.com',  // Production
    'http://localhost:3001',     // Development
  ],
  credentials: true,
});
```

---

## Error Handling

### Standard Error Response

```typescript
{
  statusCode: number;
  message: string | string[];
  error?: string;
}
```

### Status Codes

| Code | Meaning           | Action                    |
| ---- | ----------------- | ------------------------- |
| 400  | Bad Request       | Check request body/params |
| 401  | Unauthorized      | Login again               |
| 403  | Forbidden         | Insufficient permissions  |
| 404  | Not Found         | Resource doesn't exist    |
| 429  | Too Many Requests | Wait and retry            |
| 500  | Server Error      | Report issue              |

---

## Next Steps

1. **Implement rate limiting** - Use @nestjs/throttler with Redis
2. **Add request logging** - Audit trail for all operations
3. **Set up monitoring** - Alerts for rate limit violations
4. **Consider API keys** - For internal service-to-service calls

