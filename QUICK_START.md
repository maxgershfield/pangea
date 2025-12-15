# Pangea Markets - Quick Start Guide

## Project Overview

**Goal:** Build backend for RWA trading platform to connect frontend with smart contracts.

**Frontend:** ✅ Ready at https://pangea.rkund.com/home  
**Backend:** 🔨 To be built

---

## Key Requirements Summary

1. **API Endpoints**
   - Listed assets
   - Placing orders
   - Executing trades
   - Checking balances

2. **Wallet Integration**
   - Phantom (Solana testnet)
   - MetaMask (Ethereum testnet)

3. **Smart Contract Integration**
   - Deposits/withdrawals
   - Buy order creation
   - Listing subscription
   - Trade execution

4. **Admin Panel + Database**
   - Track tokenized assets
   - Track users
   - Track orders
   - Track trade history

---

## Technology Stack

- **Backend:** NestJS (TypeScript) or Express
- **Database:** PostgreSQL + Redis
- **Blockchain:** Solana (primary), Ethereum (secondary)
- **Smart Contracts:** Use existing SmartContractGenerator
- **Wallet:** Phantom + MetaMask

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Project setup
- Database schema
- Authentication
- Basic API structure

### Phase 2: Core Features (Week 3-4)
- Asset management
- Wallet integration
- Smart contract setup

### Phase 3: Trading (Week 5-6)
- Order management
- Order matching
- Trade execution

### Phase 4: Deposits/Withdrawals (Week 7)
- Deposit flow
- Withdrawal flow
- Transaction monitoring

### Phase 5: Admin Panel (Week 8)
- Admin dashboard
- User/asset management
- Analytics

### Phase 6: Testing & Polish (Week 9-10)
- Testing
- Security audit
- Documentation

---

## Getting Started

1. **Review the full plan:** `IMPLEMENTATION_PLAN.md`
2. **Set up development environment**
3. **Initialize project structure**
4. **Start Phase 1**

---

## Key Files

- `IMPLEMENTATION_PLAN.md` - Complete implementation plan
- `FRONTEND_ANALYSIS.md` - Frontend structure analysis
- `README.md` - Project overview

---

## Smart Contract Generator

Located at: `/Volumes/Storage 4/OASIS_CLEAN/SmartContractGenerator`

**API Endpoints:**
- `POST /api/v1/contracts/generate` - Generate contract from JSON
- `POST /api/v1/contracts/compile` - Compile contract
- `POST /api/v1/contracts/deploy` - Deploy contract

**Usage:**
```bash
# Generate contract
curl -X POST "http://localhost:5000/api/v1/contracts/generate" \
  -F 'Language=Solana' \
  -F 'JsonFile=@contract-spec.json'

# Compile
curl -X POST "http://localhost:5000/api/v1/contracts/compile" \
  -F 'Language=Rust' \
  -F 'Source=@contract.zip'

# Deploy
curl -X POST "http://localhost:5000/api/v1/contracts/deploy" \
  -F 'Language=Rust' \
  -F 'CompiledContractFile=@program.so'
```

---

## Database Schema Overview

**Core Tables:**
- `users` - User accounts
- `tokenized_assets` - RWA tokens
- `orders` - Buy/sell orders
- `trades` - Executed trades
- `user_balances` - Token balances
- `transactions` - Deposits/withdrawals

See `IMPLEMENTATION_PLAN.md` Section 2 for full schema.

---

## API Endpoints Overview

**Assets:**
- `GET /api/assets` - List assets
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets` - Create asset (admin)

**Orders:**
- `GET /api/orders` - User's orders
- `POST /api/orders` - Create order
- `DELETE /api/orders/:id` - Cancel order

**Trades:**
- `GET /api/trades` - User's trades
- `GET /api/trades/:id` - Trade details

**Wallet:**
- `GET /api/wallet/balance` - Get balances
- `POST /api/wallet/connect` - Connect wallet
- `POST /api/wallet/verify` - Verify ownership

**Transactions:**
- `GET /api/transactions` - Transaction history
- `POST /api/transactions/deposit` - Deposit
- `POST /api/transactions/withdraw` - Withdraw

See `IMPLEMENTATION_PLAN.md` Section 3 for complete API spec.

---

## Next Steps

1. ✅ Review implementation plan
2. 🔨 Set up project structure
3. 🔨 Initialize database
4. 🔨 Start Phase 1 implementation

---

**Questions?** Refer to `IMPLEMENTATION_PLAN.md` for detailed information.
