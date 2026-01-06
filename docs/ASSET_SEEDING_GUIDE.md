# Tokenized Asset Seeding Guide

This guide explains how to seed the `tokenized_assets` table with realistic RWA (Real-World Asset) data.

## Overview

The seeding script creates 8 diverse tokenized assets across multiple asset classes:
- **Real Estate** (Commercial & Residential)
- **Art** (Fine Art Collections)
- **Commodities** (Precious Metals & Energy)
- **Infrastructure** (Transportation)
- **Private Equity** (Tech Startups)
- **Agriculture** (Farmland)

## Prerequisites

1. ✅ Database connection configured (Neon Postgres)
2. ✅ Migrations run: `npm run migration:run`
3. ✅ At least one user exists in the database (for issuer relationship)

## Running the Seeder

### Basic Usage

```bash
npm run seed:assets
```

Or directly:

```bash
tsx scripts/seed-tokenized-assets.ts
```

### What It Does

1. **Connects to Database** - Uses your `DATABASE_URL` from `.env`
2. **Finds an Issuer** - Uses the first user in the database, or creates a system user
3. **Checks for Existing Assets** - Skips if assets already exist (prevents duplicates)
4. **Creates 8 Assets** - Seeds diverse RWA data across multiple categories

## Seeded Assets

### 1. Manhattan Office Tower (Real Estate - Commercial)
- **Symbol:** MOT
- **Value:** $250M
- **Tokens:** 1B (ERC-20 on Ethereum)
- **Status:** Trading

### 2. Luxury Apartment Complex - Miami Beach (Real Estate - Residential)
- **Symbol:** MBC
- **Value:** $85M
- **Tokens:** 500M (ERC-20 on Ethereum)
- **Status:** Trading

### 3. Contemporary Art Collection - Banksy Series (Art)
- **Symbol:** BKSY
- **Value:** $12.5M
- **Tokens:** 100M (ERC-1155 on Ethereum)
- **Status:** Trading

### 4. Gold Bullion Reserve (Commodities - Precious Metals)
- **Symbol:** GLDR
- **Value:** $20M
- **Tokens:** 1B (SPL on Solana)
- **Status:** Trading

### 5. Solar Farm Portfolio - California (Commodities - Energy)
- **Symbol:** SOLR
- **Value:** $120M
- **Tokens:** 2B (SPL on Solana)
- **Status:** Trading

### 6. Toll Road - Highway 101 Extension (Infrastructure)
- **Symbol:** HWY101
- **Value:** $180M
- **Tokens:** 1.5B (ERC-20 on Ethereum)
- **Status:** Trading

### 7. Tech Startup Equity - AI SaaS Platform (Private Equity)
- **Symbol:** AISAS
- **Value:** $22.5M
- **Tokens:** 300M (ERC-20 on Ethereum)
- **Status:** Listed

### 8. Organic Farm Portfolio - Midwest (Agriculture)
- **Symbol:** ORGF
- **Value:** $35M
- **Tokens:** 1B (SPL on Solana)
- **Status:** Trading

## Asset Structure

Each asset includes:

- **Basic Info:** Name, symbol, description
- **Classification:** Asset class and type
- **Tokenization:** Total supply, decimals, token standard
- **Blockchain:** Network, contract/mint address
- **Valuation:** Total value USD, price per token
- **Metadata:** Location, size, revenue, etc.
- **Status:** draft, listed, trading, or closed

## Customization

### Adding More Assets

Edit `scripts/seed-tokenized-assets.ts` and add to the `seedAssets` array:

```typescript
{
  assetId: "RWA-XXX-001",
  name: "Your Asset Name",
  symbol: "SYMB",
  // ... other fields
}
```

### Modifying Existing Assets

Update the `seedAssets` array in the script before running.

### Clearing Existing Assets

To re-seed, first clear existing assets:

```sql
-- WARNING: This deletes all assets!
DELETE FROM tokenized_assets;
```

Or create a clear script:

```typescript
// scripts/clear-assets.ts
import { AppDataSource } from "../src/config/data-source.js";
import { TokenizedAsset } from "../src/assets/entities/tokenized-asset.entity.js";

async function clearAssets() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(TokenizedAsset);
  await repo.delete({});
  console.log("✅ All assets cleared");
  await AppDataSource.destroy();
}

clearAssets();
```

## Verification

After seeding, verify the data:

```sql
-- Count assets by class
SELECT asset_class, COUNT(*) 
FROM tokenized_assets 
GROUP BY asset_class;

-- View all assets
SELECT 
  asset_id, 
  name, 
  symbol, 
  asset_class, 
  total_value_usd, 
  status 
FROM tokenized_assets 
ORDER BY total_value_usd DESC;

-- Check issuer relationships
SELECT 
  ta.name, 
  u.email as issuer_email 
FROM tokenized_assets ta 
JOIN users u ON ta.issuer_id = u.id;
```

## Integration with Frontend

Once seeded, the frontend can:

1. **Fetch Assets:**
   ```
   GET /api/assets
   ```

2. **Get Asset Details:**
   ```
   GET /api/assets/:id
   ```

3. **Display in UI:**
   - Asset cards with images
   - Price per token
   - Total value
   - Trading status

## Troubleshooting

### Error: "No users found in database"

**Solution:** The seeder will create a system user, but it's better to have a real user first:

1. Register a user via Better-Auth (frontend)
2. Or create a user manually in the database

### Error: "Duplicate asset_id"

**Solution:** Assets already exist. Either:
- Clear existing assets (see above)
- Or modify the script to update instead of insert

### Error: "Database connection failed"

**Solution:**
1. Check your `DATABASE_URL` in `.env`
2. Verify Neon database is active (not paused)
3. Test connection: `npm run migration:run`

### Error: "Foreign key constraint failed"

**Solution:** The `issuer_id` must reference an existing user. Ensure:
1. Users table has at least one record
2. The user ID is a valid UUID

## Next Steps

After seeding:

1. ✅ **Verify in Database** - Check assets were created
2. ✅ **Test API Endpoints** - Fetch assets via `/api/assets`
3. ✅ **Update Frontend** - Replace mock data with real API calls
4. ✅ **Test Trading** - Create orders and trades with real assets

## Example API Response

```json
{
  "id": "uuid-here",
  "assetId": "RWA-RE-001",
  "name": "Manhattan Office Tower",
  "symbol": "MOT",
  "assetClass": "real_estate",
  "totalValueUsd": 250000000,
  "pricePerTokenUsd": 0.25,
  "status": "trading",
  "blockchain": "ethereum",
  "metadata": {
    "location": "New York, NY, USA",
    "squareFeet": 500000,
    "floors": 45
  }
}
```

---

**Last Updated:** January 6, 2025  
**Status:** ✅ Ready to Use




