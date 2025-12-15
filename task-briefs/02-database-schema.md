# Task Brief: Database Schema Implementation

**Phase:** 1 - Foundation  
**Priority:** Critical  
**Estimated Time:** 3-4 days  
**Dependencies:** Task 01 (Project Setup)

---

## Overview

Design and implement the complete database schema for Pangea Markets, including all tables, indexes, relationships, and migrations.

---

## Requirements

### 1. Core Tables

Implement the following database tables with proper relationships:

1. **users** - User accounts and authentication
2. **tokenized_assets** - RWA tokens with metadata
3. **orders** - Buy/sell orders
4. **trades** - Executed trades
5. **user_balances** - Token balances per user
6. **transactions** - Deposits/withdrawals
7. **order_book_snapshots** - Real-time order book data (optional)

### 2. Database Schema

See full schema in `../IMPLEMENTATION_PLAN.md` Section 2.

**Key Requirements:**
- Use UUID for primary keys
- Proper foreign key relationships
- Indexes on frequently queried columns
- Timestamps (created_at, updated_at) on all tables
- JSONB for flexible metadata storage

### 3. Migrations

- Use TypeORM migrations (or similar)
- Create initial migration with all tables
- Include seed data migration (optional, for development)

---

## Technical Specifications

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address_solana VARCHAR(44),
    wallet_address_ethereum VARCHAR(42),
    role VARCHAR(20) DEFAULT 'user',
    kyc_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

### Tokenized Assets Table

```sql
CREATE TABLE tokenized_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    description TEXT,
    asset_class VARCHAR(50) NOT NULL,
    asset_type VARCHAR(50),
    total_supply BIGINT NOT NULL,
    decimals INTEGER DEFAULT 0,
    token_standard VARCHAR(20),
    blockchain VARCHAR(20) NOT NULL,
    network VARCHAR(20) DEFAULT 'devnet',
    contract_address VARCHAR(255),
    mint_address VARCHAR(255),
    total_value_usd DECIMAL(18, 2),
    price_per_token_usd DECIMAL(18, 2),
    metadata_uri TEXT,
    image_uri TEXT,
    legal_documents_uri TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    issuer_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    listed_at TIMESTAMP,
    metadata JSONB
);
```

### Orders Table

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    order_type VARCHAR(20) NOT NULL,
    order_status VARCHAR(20) DEFAULT 'pending',
    price_per_token_usd DECIMAL(18, 2) NOT NULL,
    quantity BIGINT NOT NULL,
    total_value_usd DECIMAL(18, 2) NOT NULL,
    filled_quantity BIGINT DEFAULT 0,
    remaining_quantity BIGINT NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    filled_at TIMESTAMP,
    blockchain VARCHAR(20) NOT NULL,
    transaction_hash VARCHAR(255),
    is_market_order BOOLEAN DEFAULT false,
    is_limit_order BOOLEAN DEFAULT true
);
```

### Trades Table

```sql
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id VARCHAR(100) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    buy_order_id UUID REFERENCES orders(id),
    sell_order_id UUID REFERENCES orders(id),
    quantity BIGINT NOT NULL,
    price_per_token_usd DECIMAL(18, 2) NOT NULL,
    total_value_usd DECIMAL(18, 2) NOT NULL,
    platform_fee_usd DECIMAL(18, 2) DEFAULT 0,
    platform_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    blockchain VARCHAR(20) NOT NULL,
    transaction_hash VARCHAR(255) NOT NULL,
    block_number BIGINT,
    executed_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    settlement_status VARCHAR(20) DEFAULT 'pending'
);
```

### User Balances Table

```sql
CREATE TABLE user_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    balance BIGINT NOT NULL DEFAULT 0,
    available_balance BIGINT NOT NULL DEFAULT 0,
    locked_balance BIGINT NOT NULL DEFAULT 0,
    blockchain VARCHAR(20) NOT NULL,
    on_chain_balance BIGINT,
    last_synced_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, asset_id)
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    transaction_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    amount BIGINT NOT NULL,
    amount_usd DECIMAL(18, 2),
    blockchain VARCHAR(20) NOT NULL,
    transaction_hash VARCHAR(255),
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    block_number BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    metadata JSONB
);
```

### Indexes

Create indexes on:
- `users.email`
- `users.wallet_address_solana`
- `users.wallet_address_ethereum`
- `tokenized_assets.asset_id`
- `tokenized_assets.status`
- `tokenized_assets.contract_address`
- `orders.user_id`
- `orders.asset_id`
- `orders.order_status`
- `orders.order_type, order_status`
- `trades.buyer_id`
- `trades.seller_id`
- `trades.asset_id`
- `trades.transaction_hash`
- `user_balances.user_id`
- `user_balances.asset_id`
- `transactions.user_id`
- `transactions.status`
- `transactions.transaction_hash`

---

## Acceptance Criteria

- [ ] All tables created with correct schema
- [ ] All foreign key relationships defined
- [ ] All indexes created
- [ ] Migrations can run successfully
- [ ] Database can be reset and recreated from migrations
- [ ] TypeORM entities (or similar) created for all tables
- [ ] Relationships properly defined in ORM
- [ ] Seed data migration (optional, for development)

---

## Deliverables

1. Database migration files
2. TypeORM entities (or equivalent ORM models)
3. Database schema documentation
4. Migration rollback scripts

---

## References

- Full schema details: `../IMPLEMENTATION_PLAN.md` Section 2
- Database design patterns: PostgreSQL best practices

---

## Notes

- Use UUID for all primary keys
- Use DECIMAL(18, 2) for USD amounts to avoid floating point errors
- Use BIGINT for token amounts (raw units)
- Consider using database triggers for updated_at timestamps
- Add proper constraints (NOT NULL, UNIQUE, CHECK)
