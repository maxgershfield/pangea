# Pangea Markets Backend

**Real World Asset (RWA) Tokenization and Trading Platform**

A production-ready NestJS backend for trading tokenized real-world assets on Solana and Ethereum blockchains.

---

## 🎯 What is Pangea Markets?

Pangea Markets enables users to:
- **Tokenize** real-world assets (real estate, commodities, etc.) as blockchain tokens
- **Trade** these tokens on a decentralized order book
- **Deposit/Withdraw** tokens via smart contract vaults
- **View** real-time order books and trade executions via WebSocket

---

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────────┐
│  Frontend (UI)  │  Next.js at pangea.rkund.com
└────────┬────────┘
         │ REST API + WebSocket
         ↓
┌────────────────────────────────────┐
│   Pangea Backend (NestJS)          │
│                                    │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Auth       │  │   Orders    │ │
│  │   (OASIS)    │  │   Matching  │ │
│  └──────────────┘  └─────────────┘ │
│                                    │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Wallet     │  │  WebSocket  │ │
│  │   (Phantom)  │  │  (Real-time)│ │
│  └──────────────┘  └─────────────┘ │
└────────┬───────────────────┬───────┘
         │                   │
         ↓                   ↓
┌─────────────────┐  ┌──────────────────┐
│   PostgreSQL    │  │    OASIS API     │
│  (Orders/Trades)│  │  (Auth/Wallets)  │
└─────────────────┘  └──────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│   Smart Contracts (Solana/Ethereum) │
│   - RWA Token Contract              │
│   - Order Book Contract             │
│   - Trade Execution Contract        │
│   - Vault Contract                  │
└─────────────────────────────────────┘
```

### Key Design Decisions

1. **Hybrid Architecture**: Uses OASIS API for foundation (auth, wallets, blockchain ops) + custom trading layer
2. **Price-Time Priority**: Orders matched by best price, then earliest timestamp
3. **Real-time Updates**: WebSocket for order book changes, trades, and balance updates
4. **Smart Contract Ready**: Integration code complete, contracts deployable via SmartContractGenerator API

---

## 🔄 Core Flows

### 1. Authentication Flow

```
User → POST /api/auth/register
  ↓
Backend → OASIS Avatar API (register user)
  ↓
Backend → Sync user to local PostgreSQL
  ↓
Backend → Generate Pangea JWT token
  ↓
User ← JWT token (use for all subsequent requests)
```

**Key Points:**
- Uses OASIS Avatar API for authentication (not building from scratch)
- Generates Pangea-specific JWT tokens (not OASIS tokens)
- Syncs user data to local database for fast queries
- Pattern: "Shipex Pro" - OASIS for auth verification, custom tokens for Pangea

**Files:**
- `src/auth/services/auth.service.ts` - OASIS avatar creation and linking
- `src/auth/services/oasis-link.service.ts` - OASIS avatar linking service
- `src/auth/guards/jwks-jwt.guard.ts` - Better Auth JWT validation via JWKS

---

### 2. Wallet Connection Flow

```
User → Connect Phantom/MetaMask in frontend
  ↓
Frontend → Get wallet address + signature
  ↓
Frontend → POST /api/wallet/connect
  ↓
Backend → Verify signature (tweetnacl for Solana, ethers for Ethereum)
  ↓
Backend → Link wallet to user account
  ↓
User ← Wallet connected, can now deposit/withdraw
```

**Key Points:**
- Supports both Phantom (Solana) and MetaMask (Ethereum)
- Signature verification ensures wallet ownership
- Wallet addresses stored in user entity
- Can query balances via OASIS Wallet API

**Files:**
- `src/wallet/wallet.controller.ts` - Wallet endpoints
- `src/services/wallet-connection.service.ts` - Signature verification (Phantom/MetaMask)
- `src/services/oasis-wallet.service.ts` - OASIS wallet API integration
- `src/services/balance-sync.service.ts` - Balance synchronization

---

### 3. Order Creation & Matching Flow

```
User → POST /api/orders (create buy/sell order)
  ↓
Backend → Validate order (price, quantity, balance)
  ↓
Backend → Lock balance (for sell orders)
  ↓
Backend → Save order to database (status: 'pending')
  ↓
Backend → OrderMatchingService.processOrder()
  ↓
  ├─→ Find matching orders (opposite type, same asset, price overlap)
  ├─→ Sort by price-time priority
  ├─→ Execute match:
  │   ├─→ Transfer balances (buyer ← seller)
  │   ├─→ Create trade record
  │   ├─→ Update order status (filled/partially_filled)
  │   ├─→ Emit WebSocket events (trade:executed, order:updated)
  │   └─→ Update blockchain (via smart contracts - pending deployment)
  └─→ If no match: Set order status to 'open'
  ↓
Background Job (every 5 seconds) → Check for new matches
```

**Key Points:**
- **Price-Time Priority**: Best price first, then earliest timestamp
- **Automatic Matching**: Happens immediately on order creation + background cron job
- **Balance Locking**: Sell orders lock tokens until filled/cancelled
- **Real-time Events**: WebSocket emits trade and order updates

**Files:**
- `src/orders/controllers/orders.controller.ts` - Order endpoints
- `src/orders/services/orders.service.ts` - Order creation/management
- `src/orders/services/order-matching.service.ts` - Matching algorithm
- `src/orders/services/websocket.service.ts` - WebSocket gateway for real-time updates
- `src/orders/jobs/order-matching.job.ts` - Background matching job

---

### 4. Deposit/Withdrawal Flow

#### Deposit:
```
User → POST /api/transactions/deposit
  ↓
Backend → Get vault address for asset/blockchain
  ↓
Backend → Create transaction record (status: 'pending')
  ↓
User ← Vault address (send tokens here)
  ↓
User → Sends tokens to vault (on blockchain)
  ↓
Background Job (every 5 min) → Monitor blockchain for deposits
  ↓
Backend → Detect deposit transaction
  ↓
Backend → Update user balance
  ↓
Backend → Update transaction status ('completed')
  ↓
Backend → Emit WebSocket event (balance:update)
```

#### Withdrawal:
```
User → POST /api/transactions/withdraw
  ↓
Backend → Validate balance (user has enough tokens)
  ↓
Backend → Lock balance
  ↓
Backend → Execute withdrawal on blockchain (via smart contract)
  ↓
Backend → Update balance
  ↓
Backend → Update transaction status
  ↓
Backend → Emit WebSocket event (balance:update)
```

**Key Points:**
- **Vault Contracts**: Each asset has a vault contract for deposits
- **Blockchain Monitoring**: Background job watches for deposit transactions
- **Balance Sync**: Automatically updates user balances after transactions

**Files:**
- `src/transactions/services/transactions.service.ts` - Deposit/withdrawal logic
- `src/transactions/services/vault.service.ts` - Vault address management
- `src/transactions/jobs/deposit-monitoring.job.ts` - Blockchain monitoring

---

### 5. Real-time Updates (WebSocket)

```
User → Connect to ws://localhost:3000/trading (with JWT token)
  ↓
Backend → Authenticate WebSocket connection
  ↓
User → Subscribe to channels:
  ├─→ subscribe:orderbook {assetId} → Get order book updates
  ├─→ subscribe:trades {assetId} → Get trade feed
  └─→ subscribe:user → Get user-specific events
  ↓
Backend → Emits events:
  ├─→ orderbook:update → When orders added/removed/filled
  ├─→ trade:executed → When trades happen
  ├─→ order:updated → When order status changes
  ├─→ balance:update → When balances change
  └─→ price:update → When asset price changes
```

**Key Points:**
- **JWT Authentication**: WebSocket connections require valid JWT
- **Room-based**: Efficient broadcasting to subscribed users only
- **Automatic Cleanup**: Unsubscribes on disconnect

**Files:**
- `src/orders/services/websocket.service.ts` - WebSocket gateway
- Events emitted from: `order-matching.service.ts`, `transactions.service.ts`, `balance-sync.service.ts`

---

## 📦 Project Structure

```
pangea-backend/
├── src/
│   ├── auth/              # Authentication (OASIS integration)
│   │   ├── services/      # Auth logic, OASIS API client
│   │   ├── guards/        # JWT auth guard, admin guard
│   │   └── strategies/    # Passport JWT strategy
│   │
│   ├── users/             # User entities
│   │   └── entities/      # User, UserBalance entities
│   │
│   ├── assets/            # Tokenized assets (RWA tokens)
│   │   ├── controllers/   # Asset CRUD endpoints
│   │   ├── services/      # Asset management, price calculation
│   │   └── entities/      # TokenizedAsset entity
│   │
│   ├── orders/            # Order management & matching
│   │   ├── controllers/   # Order endpoints
│   │   ├── services/      # Order creation, matching engine
│   │   ├── jobs/          # Background matching jobs
│   │   └── entities/      # Order, OrderBookSnapshot entities
│   │
│   ├── trades/            # Trade history
│   │   ├── controllers/   # Trade endpoints
│   │   ├── services/      # Trade queries, statistics
│   │   └── entities/      # Trade entity
│   │
│   ├── wallet/            # Wallet integration
│   │   ├── controllers/   # Wallet connection endpoints
│   │   └── dto/           # Wallet DTOs
│   │
│   ├── transactions/      # Deposits/withdrawals
│   │   ├── controllers/   # Transaction endpoints
│   │   ├── services/      # Deposit/withdrawal logic, vault service
│   │   ├── jobs/          # Deposit monitoring job
│   │   └── entities/      # Transaction entity
│   │
│   ├── admin/             # Admin panel
│   │   ├── controllers/   # Admin endpoints
│   │   └── services/      # User/asset/order management, analytics
│   │
│   ├── smart-contracts/   # Smart contract integration
│   │   ├── controllers/   # Contract deployment endpoints
│   │   └── services/      # SmartContractGenerator API client
│   │
│   ├── blockchain/        # Blockchain operations
│   │   └── services/      # Blockchain service (stub for future)
│   │
│   ├── services/          # Shared services
│   │   ├── wallet-connection.service.ts  # Phantom/MetaMask verification
│   │   ├── oasis-wallet.service.ts      # OASIS Wallet API client
│   │   └── balance-sync.service.ts      # Balance synchronization
│   │
│   ├── config/            # Configuration
│   │   ├── database.config.ts    # PostgreSQL config
│   │   ├── redis.module.ts      # Redis config
│   │   └── data-source.ts       # TypeORM data source
│   │
│   └── app.module.ts       # Root module (imports all feature modules)
│
├── docs/                  # Documentation
├── migrations/            # Database migrations
├── scripts/               # Deployment scripts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (see `package.json` engines)
- PostgreSQL 14+
- Redis 6+
- OASIS API access (defaults to `https://api.oasisweb4.com`)

### Installation

```bash
pnpm install
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=pangea

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OASIS API
OASIS_API_URL=http://localhost:5003
# or https://api.oasisplatform.world

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Smart Contract Generator
SMART_CONTRACT_GENERATOR_URL=http://localhost:5000

# Server
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

### Database Setup

```bash
# Create database
createdb pangea

# Run migrations
pnpm migration:run
```

### Start Development Server

```bash
pnpm start:dev
```

Server runs at `http://localhost:3000/api`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/create-oasis-avatar` - Create OASIS avatar for Better Auth user
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile

> **Note**: User authentication (login, register) is handled by Better Auth in the frontend. The backend provides OASIS integration endpoints.

### Assets
- `GET /api/assets` - List all assets (with filters)
- `GET /api/assets/search` - Search assets by query
- `GET /api/assets/:id` - Get asset details
- `GET /api/assets/:id/orderbook` - Get order book for asset
- `GET /api/assets/:id/price` - Get current price
- `GET /api/assets/:id/trades` - Get recent trades for asset

### Orders
- `POST /api/orders` - Create order (buy/sell)
- `GET /api/orders` - Get user's orders (with filters)
- `GET /api/orders/open` - Get open orders
- `GET /api/orders/history` - Get order history
- `GET /api/orders/asset/:assetId` - Get orders for specific asset
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Trades
- `GET /api/trades` - Get trade history
- `GET /api/trades/:id` - Get trade details
- `GET /api/trades/statistics` - Get trade statistics

### Wallet
- `POST /api/wallet/connect` - Connect Phantom/MetaMask wallet
- `POST /api/wallet/verify` - Verify wallet ownership
- `POST /api/wallet/generate` - Generate new OASIS wallet
- `GET /api/wallet/balance` - Get all wallet balances
- `GET /api/wallet/balance/:assetId` - Get balance for specific asset
- `POST /api/wallet/sync` - Manually sync balances
- `GET /api/wallet/verification-message` - Get message for wallet signing

### Transactions
- `POST /api/transactions/deposit` - Initiate deposit
- `POST /api/transactions/withdraw` - Initiate withdrawal
- `GET /api/transactions` - Get transaction history

### WebSocket
- Connect to: `ws://localhost:3000/trading`
- Events: `trade:executed`, `orderbook:update`, `order:updated`, `balance:update`

See [API Reference](./docs/api-reference.md) and [API Endpoints](./docs/api-endpoints.md) for complete API documentation.

---

## 🔧 Key Technologies

- **NestJS** - TypeScript framework
- **PostgreSQL + TypeORM** - Database and ORM
- **Redis** - Caching and sessions
- **Socket.io** - WebSocket real-time updates
- **JWT** - Authentication tokens
- **OASIS API** - Authentication, wallet management, blockchain operations
- **SmartContractGenerator API** - Smart contract generation and deployment

---

## 📊 Current Status

**Progress: 78.6% Complete (11/14 tasks, 1 partial)**

### ✅ Completed
- Project setup and infrastructure
- Database schema (7 tables)
- OASIS authentication integration
- Wallet integration (Phantom/MetaMask)
- Assets API
- Orders API
- Order matching engine
- Trades API
- Deposits/withdrawals
- Admin panel
- WebSocket real-time updates

### 🔄 In Progress
- Smart contract deployment (integration ready, contracts not deployed yet)

### ⏳ Remaining
- Testing suite
- Deployment & DevOps

See [CHANGELOG.md](./docs/CHANGELOG.md) for recent changes and updates.

---

## 📚 Additional Documentation

See the [`/docs`](./docs/README.md) directory for comprehensive documentation:

- **[Getting Started](./docs/getting-started.md)** - Installation, environment setup
- **[API Reference](./docs/api-reference.md)** - Endpoint documentation
- **[Architecture Overview](./docs/architecture-overview.md)** - System design, security
- **[Deployment Guide](./docs/deployment-railway.md)** - Railway deployment

> **Note**: Context documentation, implementation notes, and temporary guides have been archived outside the repo to keep the codebase clean and searchable. See `../pangea-docs-archive/` for archived files.

---

## 🤝 Contributing

This project follows a modular NestJS architecture. See the [Architecture Overview](./docs/architecture-overview.md) for design patterns and guidelines.

---

**Built with ❤️ for Pangea Markets**
