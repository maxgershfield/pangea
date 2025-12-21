# Frontend Developer Guide - Pangea Backend API

**Last Updated:** January 23, 2025  
**Base URL:** `https://pangea-production-128d.up.railway.app/api`

---

## 📋 Quick Reference

### Essential Information
- **Base URL:** `https://pangea-production-128d.up.railway.app/api`
- **Authentication:** JWT tokens (expire after 7 days)
- **Architecture:** Read from client directly, write via Next.js API routes

### Working Endpoints (14 total)
✅ Auth: register, login, forgot-password  
✅ User: get profile  
✅ Assets: list all  
✅ Orders: all, open, history  
✅ Trades: all, history, statistics  
✅ Transactions: all  
✅ Wallet: verification-message  

---

## 🚀 Getting Started

### 1. Register a User

```typescript
const response = await fetch('https://pangea-production-128d.up.railway.app/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123',
    username: 'username',
    firstName: 'John',
    lastName: 'Doe'
  })
});

const { token, user } = await response.json();
// Save token: localStorage.setItem('token', token);
```

### 2. Login

```typescript
const response = await fetch('https://pangea-production-128d.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123'
  })
});

const { token, user } = await response.json();
```

### 3. Make Authenticated Requests

```typescript
const token = localStorage.getItem('token');

const response = await fetch('https://pangea-production-128d.up.railway.app/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const profile = await response.json();
```

---

## 🔐 Authentication

### Register
**POST** `/api/auth/register`

**Request:**
```typescript
{
  email: string;        // Required
  password: string;     // Required
  username: string;     // Required
  firstName?: string;   // Optional
  lastName?: string;    // Optional
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    username: string;
    avatarId: string;
    role: string;  // 'user' by default
  };
  token: string;
  expiresAt: string;
}
```

### Login
**POST** `/api/auth/login`

**Request:** `{ email: string, password: string }`  
**Response:** Same as register

### Using JWT Token
Include in header: `Authorization: Bearer <token>`

---

## ✅ Working Endpoints

### User Profile
```typescript
GET /api/user/profile
Headers: { Authorization: 'Bearer <token>' }
```

### Assets (Public - No Auth)
```typescript
GET /api/assets
// Returns: { assets: [...], total: number }
```

### Orders
```typescript
GET /api/orders          // All orders
GET /api/orders/open     // Open orders
GET /api/orders/history  // Order history
// All require: Authorization: Bearer <token>
```

### Trades
```typescript
GET /api/trades              // All trades
GET /api/trades/history      // Trade history
GET /api/trades/statistics   // Trade stats
// All require: Authorization: Bearer <token>
```

### Transactions
```typescript
GET /api/transactions
// Requires: Authorization: Bearer <token>
```

---

## 📐 Architecture Pattern

**Read Operations (GET):**
- ✅ Call directly from frontend
- Include JWT token in header

**Write Operations (POST/PUT/DELETE):**
- 🔄 Proxy through Next.js API routes
- Provides security and audit trail

### Example: Next.js API Route for Creating Order

```typescript
// pages/api/orders/create.ts
export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  const response = await fetch('https://pangea-production-128d.up.railway.app/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });
  
  const data = await response.json();
  res.status(response.status).json(data);
}
```

---

## 💻 TypeScript API Client

```typescript
class PangeaApi {
  private baseUrl = 'https://pangea-production-128d.up.railway.app/api';
  
  constructor(private token: string | null = null) {}
  
  setToken(token: string) {
    this.token = token;
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }
  
  // Auth
  async register(data: { email: string; password: string; username: string }) {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }
  
  async login(email: string, password: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }
  
  // User
  async getProfile() {
    return this.request('/user/profile');
  }
  
  // Orders
  async getOrders() {
    return this.request('/orders');
  }
  
  async getOpenOrders() {
    const data = await this.request<any>('/orders/open');
    return data.orders || [];
  }
  
  // Trades
  async getTrades() {
    return this.request('/trades');
  }
  
  async getTradeStatistics() {
    return this.request('/trades/statistics');
  }
  
  // Transactions
  async getTransactions() {
    return this.request('/transactions');
  }
  
  // Assets
  async getAssets() {
    return this.request('/assets');
  }
}

// Usage
const api = new PangeaApi();
await api.register({ email: '...', password: '...', username: '...' });
const orders = await api.getOrders();
```

---

## ⚠️ Known Issues

**Broken Endpoints:**
- ❌ `PUT /api/user/profile` - 500 error
- ❌ `GET /api/wallet/balance` - 500 error (OASIS API issue)
- ❌ `POST /api/wallet/generate` - 500 error (in progress)
- ❌ `POST /api/wallet/sync` - 500 error

**Not Tested Yet:**
- Most write endpoints (POST/PUT/DELETE)
- Some asset detail endpoints
- Wallet connect/verify endpoints

---

## 🔒 Creating Admin Account

If you need admin access:

1. **Register user first:**
```bash
curl -X POST https://pangea-production-128d.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"...","username":"admin"}'
```

2. **Run script:**
```bash
cd backend
ADMIN_EMAIL=admin@example.com npx ts-node scripts/create-admin-account.ts
```

3. **Re-login** to get new JWT with admin role

See `CREATE_ADMIN_ACCOUNT.md` for details.

---

## 🔗 Additional Documentation

- **API Routes Reference:** `API_ROUTES_REFERENCE.md` - Complete route matrix
- **API Usage Guide:** `API_USAGE_GUIDE.md` - Detailed examples
- **Endpoints Status:** `FRONTEND_ENDPOINTS_STATUS.md` - Current status
- **Admin Setup:** `CREATE_ADMIN_ACCOUNT.md` - How to create admin

---

## 📊 Quick Status

- ✅ **14 endpoints** working and ready
- ❌ **5 endpoints** broken (mostly wallet-related)
- ⏳ **22 endpoints** not tested yet

**You can start building with the 14 working endpoints now!**

---

**Questions? Check the detailed docs or Railway logs for errors.**
