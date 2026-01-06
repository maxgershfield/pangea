# Tokenized RWA Assets

**Last Updated:** January 6, 2025

This document lists all tokenized assets currently in the database, matching the UI dashboard.

## Asset Overview

All assets are classified as **Private Equity** with various tech company subtypes. Each asset represents tokenized equity in a major technology company.

## Assets by Price (High to Low)

### 1. Coinbase (COIN)
- **Price:** $254.50
- **Symbol:** COIN
- **Type:** Fintech / Cryptocurrency Exchange
- **Description:** Leading cryptocurrency exchange platform, publicly traded on NASDAQ
- **Status:** Trading
- **Asset ID:** `RWA-COIN-001`

### 2. SpaceX (SPCX)
- **Price:** $97.00
- **Symbol:** SPCX
- **Type:** Aerospace
- **Description:** Aerospace manufacturer and space transportation company
- **Status:** Trading
- **Asset ID:** `RWA-SPCX-001`

### 3. Databricks (DBKS)
- **Price:** $73.50
- **Symbol:** DBKS
- **Type:** Data Tech / Analytics Platform
- **Description:** Unified analytics platform built on Apache Spark
- **Status:** Trading
- **Asset ID:** `RWA-DBKS-001`

### 4. X (X)
- **Price:** $30.00
- **Symbol:** X
- **Type:** Social Media
- **Description:** Social media platform and microblogging service (formerly Twitter)
- **Status:** Trading
- **Asset ID:** `RWA-X-001`

### 5. Stripe (STRIP)
- **Price:** $29.00
- **Symbol:** STRIP
- **Type:** Fintech / Payment Processing
- **Description:** Payment processing software and APIs for e-commerce
- **Status:** Trading
- **Asset ID:** `RWA-STRIP-001`

### 6. Plaid (PLAID)
- **Price:** $15.50
- **Symbol:** PLAID
- **Type:** Fintech / Financial Data API
- **Description:** APIs for connecting bank accounts to financial applications
- **Status:** Trading
- **Asset ID:** `RWA-PLAID-001`

### 7. Kraken (KRKN)
- **Price:** $12.00
- **Symbol:** KRKN
- **Type:** Fintech / Cryptocurrency Exchange
- **Description:** One of the world's largest cryptocurrency exchanges
- **Status:** Trading
- **Asset ID:** `RWA-KRKN-001`

### 8. Anthropic (ANTH)
- **Price:** $1.00
- **Symbol:** ANTH
- **Type:** AI Tech
- **Description:** AI safety company developing large language models (Claude AI)
- **Status:** Trading
- **Asset ID:** `RWA-ANTH-001`

## Asset Categories

### By Asset Type:
- **Fintech:** Coinbase, Stripe, Plaid, Kraken (4 assets)
- **Aerospace:** SpaceX (1 asset)
- **Data Tech:** Databricks (1 asset)
- **Social Media:** X (1 asset)
- **AI Tech:** Anthropic (1 asset)

### By Status:
- **Trading:** All 8 assets

## Database Schema

All assets are stored in the `tokenized_assets` table with the following key fields:
- `asset_id` - Unique identifier (e.g., RWA-COIN-001)
- `name` - Company name
- `symbol` - Trading symbol
- `price_per_token_usd` - Current token price
- `asset_class` - "private_equity" for all assets
- `asset_type` - Subtype (fintech, aerospace, etc.)
- `status` - Trading status
- `metadata` - JSONB field with company details (valuation, employees, etc.)

## UI Dashboard Mapping

These assets correspond to the following sections in the UI:

### Upcoming Sales:
- Kraken ($12.00) - CLOSED
- Stripe ($29.00) - CLOSED
- Anthropic ($1.00) - CLOSED
- Coinbase ($254.50) - 1W
- Plaid ($15.50) - 3W
- SpaceX ($97.00) - 3W
- Databricks ($73.50) - 5W

### Gainers:
- SpaceX (SPCX) - $97.00, +33.40%
- Kraken (KRKN) - $12.50, +20.50%
- Coinbase (COIN) - $254.50, +15.20%

### Losers:
- X (X) - $30.00, -15.50%
- Stripe (STRIP) - $29.00, -5.10%
- Databricks (DBKS) - $73.50, -2.30%

## Querying Assets

You can query these assets through:
1. **API Endpoints:** `/api/assets` or `/api/assets/:id`
2. **Database:** Direct SQL queries to `tokenized_assets` table
3. **MCP Server:** Use Cursor's Neon MCP integration

Example query:
```sql
SELECT name, symbol, price_per_token_usd, status 
FROM tokenized_assets 
WHERE status = 'trading'
ORDER BY price_per_token_usd DESC;
```

---

**Note:** Prices and metadata are seeded with realistic values but should be updated with live data in production.

