# Pangea Markets RWA Platform - Implementation Plan

**Project:** Backend Integration for Pangea Markets RWA Trading Platform  
**Date:** January 2025  
**Status:** Planning Phase

---

## Executive Summary

This document outlines the complete implementation plan for building the backend infrastructure for Pangea Markets, a Real World Asset (RWA) tokenization and trading platform. The frontend is complete and ready; this plan covers all backend components needed to make it fully functional.

### Key Requirements
- ✅ Full front-end/UI ready (Next.js at https://pangea.rkund.com/home)
- 🔨 API for listed assets, orders, trades, balances
- 🔨 Phantom/MetaMask wallet integration (testnet)
- 🔨 Smart contract integration (deposits, withdrawals, orders, trades)
- 🔨 Admin panel + database for assets, users, orders, trade history

---

## 1. Architecture Overview

### 1.1 System Architecture (Updated with OASIS Integration)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                           │
│              https://pangea.rkund.com/home                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API / WebSocket
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              PANGEA BACKEND API (NestJS/Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Trading API │  │  Orders API  │  │  Assets API  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Trades API  │  │  Admin API   │  │ Integration  │         │
│  └──────────────┘  └──────────────┘  └──────┬───────┘         │
└────────────────────────┬──────────────────────┼─────────────────┘
                         │                      │
         ┌───────────────┼───────────────┐      │
         │               │               │      │
┌────────▼────┐  ┌───────▼──────┐  ┌────▼──────┐
│  PostgreSQL │  │    Redis     │  │   OASIS   │
│  Database   │  │   (Cache)    │  │    API    │
│             │  │              │  │           │
│  - Orders   │  │  - Sessions  │  │  - Auth  │
│  - Trades   │  │  - Cache     │  │  - Wallet│
│  - Assets   │  │              │  │  - NFT   │
│  - Users    │  │              │  │  - Solana│
└─────────────┘  └──────────────┘  └────┬──────┘
                                         │
                         ┌───────────────┼───────────────┐
                         │               │               │
                  ┌──────▼──────┐  ┌────▼──────┐  ┌────▼──────┐
                  │ SmartContract│  │   Solana  │  │ Ethereum  │
                  │  Generator   │  │  (via    │  │  (via     │
                  │     API      │  │  OASIS)  │  │  OASIS)   │
                  └──────────────┘  └───────────┘  └───────────┘
```

**Key Change:** Using OASIS API for authentication, wallet management, and blockchain operations instead of building from scratch.

### 1.2 Technology Stack

#### Backend Framework
- **Node.js + Express** or **NestJS** (TypeScript)
  - Recommendation: **NestJS** for better structure, dependency injection, and scalability
  - Alternative: Express for faster initial development

#### Database
- **PostgreSQL** (Primary database)
  - Users, assets, orders, trades, transactions
  - ACID compliance for financial data
- **Redis** (Caching & Session Management)
  - Session storage
  - Real-time price feeds cache
  - Rate limiting

#### Blockchain Integration
- **Solana** (Primary - testnet)
  - @solana/web3.js for RPC interactions
  - @solana/spl-token for token operations
  - Anchor framework for program interactions
- **Ethereum** (Secondary - testnet)
  - ethers.js or web3.js
  - For ERC-721/ERC-1155 token support
- **Smart Contract Generator**
  - Use existing `/Volumes/Storage 4/OASIS_CLEAN/SmartContractGenerator`
  - .NET 9.0 API for contract generation/deployment
  - Integrate via HTTP API calls

#### Wallet Integration
- **Phantom Wallet** (Solana)
  - @solana/wallet-adapter-react
  - @solana/wallet-adapter-wallets
- **MetaMask** (Ethereum)
  - ethers.js wallet integration
  - EIP-1193 standard

#### Admin Panel
- **Next.js Admin Dashboard** (separate route or subdomain)
  - React Admin or custom dashboard
  - Protected by admin role middleware

---

## 2. Database Schema Design

### 2.1 Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address_solana VARCHAR(44),
    wallet_address_ethereum VARCHAR(42),
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'moderator'
    kyc_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet_solana ON users(wallet_address_solana);
CREATE INDEX idx_users_wallet_ethereum ON users(wallet_address_ethereum);
```

#### Tokenized Assets Table
```sql
CREATE TABLE tokenized_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id VARCHAR(100) UNIQUE NOT NULL, -- e.g., "BHE-2025-001"
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    description TEXT,
    
    -- Asset Classification
    asset_class VARCHAR(50) NOT NULL, -- 'real_estate', 'art', 'commodities', etc.
    asset_type VARCHAR(50), -- 'residential', 'commercial', etc.
    
    -- Tokenization Details
    total_supply BIGINT NOT NULL,
    decimals INTEGER DEFAULT 0,
    token_standard VARCHAR(20), -- 'SPL', 'ERC-721', 'ERC-1155', 'UAT'
    
    -- Blockchain Details
    blockchain VARCHAR(20) NOT NULL, -- 'solana', 'ethereum', 'radix'
    network VARCHAR(20) DEFAULT 'devnet', -- 'devnet', 'testnet', 'mainnet'
    contract_address VARCHAR(255),
    mint_address VARCHAR(255), -- Solana mint address
    
    -- Valuation
    total_value_usd DECIMAL(18, 2),
    price_per_token_usd DECIMAL(18, 2),
    
    -- Metadata
    metadata_uri TEXT, -- IPFS URI
    image_uri TEXT,
    legal_documents_uri TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'listed', 'trading', 'closed'
    issuer_id UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    listed_at TIMESTAMP,
    
    -- Additional JSON metadata
    metadata JSONB
);

CREATE INDEX idx_assets_asset_id ON tokenized_assets(asset_id);
CREATE INDEX idx_assets_status ON tokenized_assets(status);
CREATE INDEX idx_assets_blockchain ON tokenized_assets(blockchain);
CREATE INDEX idx_assets_contract_address ON tokenized_assets(contract_address);
```

#### Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    
    -- Order Details
    order_type VARCHAR(20) NOT NULL, -- 'buy', 'sell'
    order_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'open', 'filled', 'cancelled', 'expired'
    
    -- Pricing
    price_per_token_usd DECIMAL(18, 2) NOT NULL,
    quantity BIGINT NOT NULL,
    total_value_usd DECIMAL(18, 2) NOT NULL,
    
    -- Execution
    filled_quantity BIGINT DEFAULT 0,
    remaining_quantity BIGINT NOT NULL,
    
    -- Time-based
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    filled_at TIMESTAMP,
    
    -- Blockchain
    blockchain VARCHAR(20) NOT NULL,
    transaction_hash VARCHAR(255),
    
    -- Order matching
    is_market_order BOOLEAN DEFAULT false,
    is_limit_order BOOLEAN DEFAULT true
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_asset_id ON orders(asset_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_type_status ON orders(order_type, order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

#### Trades Table
```sql
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Participants
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    
    -- Trade Details
    buy_order_id UUID REFERENCES orders(id),
    sell_order_id UUID REFERENCES orders(id),
    
    -- Execution
    quantity BIGINT NOT NULL,
    price_per_token_usd DECIMAL(18, 2) NOT NULL,
    total_value_usd DECIMAL(18, 2) NOT NULL,
    
    -- Fees
    platform_fee_usd DECIMAL(18, 2) DEFAULT 0,
    platform_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Blockchain
    blockchain VARCHAR(20) NOT NULL,
    transaction_hash VARCHAR(255) NOT NULL,
    block_number BIGINT,
    
    -- Timestamps
    executed_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    
    -- Settlement
    settlement_status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'settled', 'failed'
);

CREATE INDEX idx_trades_buyer_id ON trades(buyer_id);
CREATE INDEX idx_trades_seller_id ON trades(seller_id);
CREATE INDEX idx_trades_asset_id ON trades(asset_id);
CREATE INDEX idx_trades_executed_at ON trades(executed_at DESC);
CREATE INDEX idx_trades_transaction_hash ON trades(transaction_hash);
```

#### User Balances Table
```sql
CREATE TABLE user_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    
    -- Balance
    balance BIGINT NOT NULL DEFAULT 0, -- Token balance (raw units)
    available_balance BIGINT NOT NULL DEFAULT 0, -- Available for trading
    locked_balance BIGINT NOT NULL DEFAULT 0, -- Locked in orders
    
    -- Blockchain
    blockchain VARCHAR(20) NOT NULL,
    on_chain_balance BIGINT, -- Verified on-chain balance
    
    -- Timestamps
    last_synced_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, asset_id)
);

CREATE INDEX idx_balances_user_id ON user_balances(user_id);
CREATE INDEX idx_balances_asset_id ON user_balances(asset_id);
```

#### Deposits/Withdrawals Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    
    -- Transaction Details
    transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    
    -- Amounts
    amount BIGINT NOT NULL,
    amount_usd DECIMAL(18, 2),
    
    -- Blockchain
    blockchain VARCHAR(20) NOT NULL,
    transaction_hash VARCHAR(255),
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    block_number BIGINT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_transaction_hash ON transactions(transaction_hash);
```

#### Order Book (for real-time matching)
```sql
CREATE TABLE order_book_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    
    -- Best Bid/Ask
    best_bid_price DECIMAL(18, 2),
    best_bid_quantity BIGINT,
    best_ask_price DECIMAL(18, 2),
    best_ask_quantity BIGINT,
    
    -- Market Stats
    last_trade_price DECIMAL(18, 2),
    volume_24h BIGINT,
    high_24h DECIMAL(18, 2),
    low_24h DECIMAL(18, 2),
    
    -- Timestamp
    snapshot_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orderbook_asset_id ON order_book_snapshots(asset_id);
CREATE INDEX idx_orderbook_snapshot_at ON order_book_snapshots(snapshot_at DESC);
```

---

## 3. API Endpoints Specification

### 3.1 Authentication Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/user/profile
PUT    /api/user/profile
```

### 3.2 Assets Endpoints

```
GET    /api/assets                    # List all assets (paginated)
GET    /api/assets/:assetId           # Get asset details
GET    /api/assets/:assetId/orders    # Get order book for asset
GET    /api/assets/:assetId/trades    # Get trade history
GET    /api/assets/:assetId/price     # Get current price
GET    /api/assets/search             # Search assets
POST   /api/assets                    # Create new asset (admin)
PUT    /api/assets/:assetId           # Update asset (admin)
DELETE /api/assets/:assetId           # Delete asset (admin)
```

### 3.3 Orders Endpoints

```
GET    /api/orders                    # Get user's orders
GET    /api/orders/:orderId           # Get order details
POST   /api/orders                    # Create new order (buy/sell)
PUT    /api/orders/:orderId           # Update order
DELETE /api/orders/:orderId           # Cancel order
GET    /api/orders/open               # Get open orders
GET    /api/orders/history            # Get order history
```

### 3.4 Trades Endpoints

```
GET    /api/trades                    # Get user's trades
GET    /api/trades/:tradeId           # Get trade details
GET    /api/trades/asset/:assetId     # Get trades for specific asset
GET    /api/trades/history            # Get trade history
```

### 3.5 Wallet/Balance Endpoints

```
GET    /api/wallet/balance            # Get all balances
GET    /api/wallet/balance/:assetId   # Get balance for specific asset
GET    /api/wallet/addresses          # Get wallet addresses
POST   /api/wallet/connect            # Connect wallet (Phantom/MetaMask)
POST   /api/wallet/verify             # Verify wallet ownership
```

### 3.6 Deposits/Withdrawals Endpoints

```
GET    /api/transactions              # Get transaction history
GET    /api/transactions/:txId        # Get transaction details
POST   /api/transactions/deposit      # Initiate deposit
POST   /api/transactions/withdraw     # Initiate withdrawal
GET    /api/transactions/pending      # Get pending transactions
```

### 3.7 Admin Endpoints

```
GET    /api/admin/users               # List all users
GET    /api/admin/users/:userId       # Get user details
PUT    /api/admin/users/:userId       # Update user
PUT    /api/admin/users/:userId/kyc    # Update KYC status

GET    /api/admin/assets              # List all assets (admin view)
POST   /api/admin/assets              # Create asset
PUT    /api/admin/assets/:assetId     # Update asset
DELETE /api/admin/assets/:assetId     # Delete asset

GET    /api/admin/orders              # List all orders
GET    /api/admin/trades              # List all trades
GET    /api/admin/transactions        # List all transactions

GET    /api/admin/stats               # Platform statistics
GET    /api/admin/analytics           # Analytics data
```

---

## 4. Smart Contract Integration

### 4.1 Using SmartContractGenerator

The existing SmartContractGenerator at `/Volumes/Storage 4/OASIS_CLEAN/SmartContractGenerator` provides:
- Contract generation from JSON specs
- Compilation for Solana/Ethereum/Radix
- Deployment to testnet/mainnet

#### Integration Approach

1. **Contract Templates**
   - Create JSON specifications for RWA contracts
   - Use UAT (Universal Asset Token) standard
   - Templates for: Token minting, Order book, Trade execution, Deposits/Withdrawals

2. **Contract Generation Flow**
   ```
   Frontend Request → Backend API → SmartContractGenerator API
   → Generate Contract → Compile → Deploy → Store Address in DB
   ```

3. **Required Contracts**

   **a) RWA Token Contract (Solana Anchor)**
   ```json
   {
     "contract_type": "rwa_token",
     "blockchain": "solana",
     "spec": {
       "name": "{{asset_name}}",
       "symbol": "{{asset_symbol}}",
       "total_supply": "{{total_supply}}",
       "decimals": 0,
       "metadata_uri": "{{ipfs_uri}}",
       "features": ["mint", "burn", "transfer", "freeze"]
     }
   }
   ```

   **b) Order Book Contract**
   ```json
   {
     "contract_type": "order_book",
     "blockchain": "solana",
     "spec": {
       "features": [
         "create_order",
         "cancel_order",
         "match_orders",
         "get_order_book",
         "get_user_orders"
       ]
     }
   }
   ```

   **c) Trade Execution Contract**
   ```json
   {
     "contract_type": "trade_execution",
     "blockchain": "solana",
     "spec": {
       "features": [
         "execute_trade",
         "settle_trade",
         "get_trade_history"
       ]
     }
   }
   ```

   **d) Vault/Deposit Contract**
   ```json
   {
     "contract_type": "vault",
     "blockchain": "solana",
     "spec": {
       "features": [
         "deposit",
         "withdraw",
         "get_balance",
         "transfer"
       ]
     }
   }
   ```

### 4.2 Smart Contract Service Layer

Create a service to interact with SmartContractGenerator:

```typescript
// services/smart-contract.service.ts
class SmartContractService {
  private generatorApiUrl = 'http://localhost:5000/api/v1/contracts';
  
  async generateRwaToken(assetSpec: RwaTokenSpec): Promise<ContractAddress> {
    // Call SmartContractGenerator API
    // POST /api/v1/contracts/generate
    // POST /api/v1/contracts/compile
    // POST /api/v1/contracts/deploy
  }
  
  async deployOrderBook(): Promise<ContractAddress> {
    // Deploy order book contract
  }
  
  async deployTradeExecution(): Promise<ContractAddress> {
    // Deploy trade execution contract
  }
}
```

### 4.3 Blockchain Interaction Service

```typescript
// services/blockchain.service.ts
class BlockchainService {
  // Solana
  async getBalance(walletAddress: string, mintAddress: string): Promise<bigint>
  async transferTokens(from: string, to: string, amount: bigint, mint: string)
  async createOrder(orderData: OrderData): Promise<string>
  async executeTrade(tradeData: TradeData): Promise<string>
  async deposit(amount: bigint, mint: string): Promise<string>
  async withdraw(amount: bigint, mint: string): Promise<string>
  
  // Ethereum (if needed)
  async getBalanceEthereum(walletAddress: string, contractAddress: string)
  // ... similar methods
}
```

---

## 5. Wallet Integration

### 5.1 Frontend Wallet Connection

The frontend will handle wallet connection using:
- **Phantom** for Solana
- **MetaMask** for Ethereum

### 5.2 Backend Wallet Verification

```typescript
// POST /api/wallet/verify
// Verify wallet ownership by requesting signature
async verifyWalletOwnership(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  // Verify signature matches wallet address
  // Update user record with wallet address
}
```

### 5.3 Wallet Service

```typescript
// services/wallet.service.ts
class WalletService {
  async connectPhantom(userId: string, walletAddress: string)
  async connectMetaMask(userId: string, walletAddress: string)
  async verifyOwnership(walletAddress: string, signature: string)
  async syncBalances(userId: string) // Sync on-chain balances with DB
}
```

---

## 6. Order Matching & Trade Execution

### 6.1 Order Matching Engine

```typescript
// services/order-matching.service.ts
class OrderMatchingService {
  async matchOrders(assetId: string): Promise<Trade[]>
  async processOrder(order: Order): Promise<void>
  async cancelOrder(orderId: string): Promise<void>
}
```

**Matching Logic:**
1. New order arrives
2. Check for matching orders (opposite side, compatible price)
3. Execute matches (price-time priority)
4. Update order status
5. Create trade records
6. Update balances
7. Emit events (WebSocket)

### 6.2 Trade Execution Flow

```
1. User creates order → Backend validates → Store in DB
2. Order matching engine finds match
3. Validate balances (buyer has funds, seller has tokens)
4. Execute on blockchain (smart contract call)
5. Wait for confirmation
6. Update database (orders, trades, balances)
7. Notify users via WebSocket
```

---

## 7. Admin Panel

### 7.1 Admin Dashboard Features

- **User Management**
  - View all users
  - KYC approval/rejection
  - User activity logs
  - Wallet address management

- **Asset Management**
  - Create/edit/delete assets
  - Approve asset listings
  - View asset statistics
  - Manage asset metadata

- **Order Management**
  - View all orders
  - Cancel orders (emergency)
  - Order statistics

- **Trade Management**
  - View all trades
  - Trade analytics
  - Settlement monitoring

- **Transaction Management**
  - Monitor deposits/withdrawals
  - Approve withdrawals (if needed)
  - Transaction history

- **Platform Statistics**
  - Total volume
  - Active users
  - Asset listings
  - Revenue/fees

### 7.2 Admin API Endpoints

All admin endpoints should:
- Require `admin` role
- Use JWT authentication
- Include audit logging

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up project structure (NestJS/Express)
- [ ] Database schema implementation
- [ ] Basic authentication (JWT)
- [ ] User registration/login
- [ ] Database migrations
- [ ] Basic API structure

### Phase 2: Core Features (Week 3-4)
- [ ] Asset CRUD endpoints
- [ ] Wallet connection/verification
- [ ] Balance tracking
- [ ] Smart contract integration setup
- [ ] Connect to SmartContractGenerator API

### Phase 3: Trading Features (Week 5-6)
- [ ] Order creation/management
- [ ] Order matching engine
- [ ] Trade execution
- [ ] Blockchain transaction handling
- [ ] Real-time updates (WebSocket)

### Phase 4: Deposits/Withdrawals (Week 7)
- [ ] Deposit flow
- [ ] Withdrawal flow
- [ ] Transaction monitoring
- [ ] Balance synchronization

### Phase 5: Admin Panel (Week 8)
- [ ] Admin authentication/authorization
- [ ] User management UI
- [ ] Asset management UI
- [ ] Order/trade monitoring
- [ ] Analytics dashboard

### Phase 6: Testing & Polish (Week 9-10)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation

---

## 9. Project Structure

```
pangea/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/              # User management
│   │   ├── assets/             # Asset management
│   │   ├── orders/             # Order management
│   │   ├── trades/             # Trade execution
│   │   ├── wallet/             # Wallet integration
│   │   ├── transactions/       # Deposits/withdrawals
│   │   ├── admin/              # Admin endpoints
│   │   ├── blockchain/         # Blockchain services
│   │   ├── smart-contracts/    # Smart contract integration
│   │   ├── common/             # Shared utilities
│   │   └── config/             # Configuration
│   ├── tests/
│   ├── migrations/             # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── admin-panel/                # Admin dashboard (Next.js)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
│
├── contracts/                  # Smart contract specs
│   ├── rwa-token.json
│   ├── order-book.json
│   ├── trade-execution.json
│   └── vault.json
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── SMART_CONTRACTS.md
│
├── README.md
├── IMPLEMENTATION_PLAN.md
└── FRONTEND_ANALYSIS.md
```

---

## 10. Key Technical Decisions

### 10.1 Why NestJS?
- Built-in dependency injection
- Modular architecture
- TypeScript-first
- Excellent for large-scale APIs
- Built-in validation, guards, interceptors

### 10.2 Why PostgreSQL?
- ACID compliance (critical for financial data)
- JSONB support for flexible metadata
- Excellent performance
- Strong ecosystem

### 10.3 Why Solana Primary?
- Fast transactions
- Low fees
- Good for tokenization
- Phantom wallet integration
- SmartContractGenerator supports it

### 10.4 Smart Contract Strategy
- Use SmartContractGenerator for initial deployment
- Store contract addresses in database
- Interact via RPC calls
- Monitor transactions for state updates

### 10.5 Why Use OASIS API? (NEW)
- **60-70% code reuse** - Massive time savings
- **Proven, tested APIs** - Authentication, wallets, blockchain ops
- **Multi-chain support** - Solana, Ethereum, Arbitrum, Polygon, Base
- **Wallet management** - 25+ wallet endpoints ready to use
- **Authentication** - 80+ avatar endpoints for user management
- **Blockchain operations** - Direct Solana/Ethereum integration
- **Reduced development time** - Focus on trading-specific logic

**See:** `OASIS_API_REUSE_ANALYSIS.md` for complete analysis

---

## 11. Security Considerations

1. **Authentication**
   - JWT with refresh tokens
   - Rate limiting
   - Password hashing (bcrypt)

2. **Authorization**
   - Role-based access control (RBAC)
   - Admin-only endpoints protected

3. **Wallet Security**
   - Signature verification for wallet ownership
   - Never store private keys
   - All transactions signed client-side

4. **API Security**
   - Input validation
   - SQL injection prevention (ORM)
   - CORS configuration
   - Rate limiting

5. **Financial Security**
   - Balance validation before trades
   - Transaction confirmation before DB updates
   - Audit logging for all financial operations

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Service layer logic
- Utility functions
- Validation logic

### 12.2 Integration Tests
- API endpoints
- Database operations
- Blockchain interactions (testnet)

### 12.3 E2E Tests
- Complete user flows
- Order creation → matching → execution
- Deposit → trade → withdrawal

### 12.4 Test Coverage Goals
- 80%+ code coverage
- All critical paths tested
- Edge cases covered

---

## 13. Deployment

### 13.1 Development
- Local PostgreSQL
- Local Redis
- Solana devnet
- SmartContractGenerator API (local or remote)

### 13.2 Staging
- Cloud PostgreSQL (AWS RDS)
- Cloud Redis (AWS ElastiCache)
- Solana devnet/testnet
- Docker containers

### 13.3 Production
- Production database (backed up)
- Production Redis cluster
- Solana mainnet (when ready)
- Monitoring & alerting
- CI/CD pipeline

---

## 14. Monitoring & Logging

- **Application Logs**: Winston/Pino
- **Error Tracking**: Sentry
- **Performance**: APM tools
- **Database**: Query monitoring
- **Blockchain**: Transaction monitoring
- **Alerts**: Critical errors, failed transactions

---

## 15. Next Steps

1. **Review this plan** with team
2. **Set up development environment**
3. **Initialize project structure**
4. **Create database schema**
5. **Start Phase 1 implementation**

---

## 16. Resources & References

- SmartContractGenerator: `/Volumes/Storage 4/OASIS_CLEAN/SmartContractGenerator`
- UAT Specification: `/Volumes/Storage 4/OASIS_CLEAN/UAT/UNIVERSAL_ASSET_TOKEN_SPECIFICATION.md`
- Frontend: https://pangea.rkund.com/home
- Solana Docs: https://docs.solana.com/
- Anchor Framework: https://www.anchor-lang.com/
- NestJS Docs: https://docs.nestjs.com/

---

**Document Status:** Ready for Review  
**Last Updated:** January 2025
