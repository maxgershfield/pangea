# Database Access Guide for Rishav

**Last Updated:** January 6, 2025

## Neon Database Connection

### Connection Details

**Project ID:** `crimson-glitter-19569216`  
**Project Name:** `pangea-platform`  
**Database:** `neondb`  
**Branch:** `production` (default)

### Connection String

```
postgresql://neondb_owner:npg_5oJxXkB7abUz@ep-sweet-art-a41b7p8i-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### How to Access the Database

#### Option 1: Neon Console (Web UI)
1. Go to https://console.neon.tech
2. Log in with your account
3. Select project: **pangea-platform** (ID: `crimson-glitter-19569216`)
4. Click on **SQL Editor** in the left sidebar
5. Run queries directly in the browser

#### Option 2: PostgreSQL Client (psql, DBeaver, TablePlus, etc.)
Use the connection string above with any PostgreSQL client.

**Example with psql:**
```bash
psql "postgresql://neondb_owner:npg_5oJxXkB7abUz@ep-sweet-art-a41b7p8i-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

#### Option 3: Cursor MCP (Already Set Up)
The Neon MCP server is already configured in Cursor. You can query the database directly through Cursor's AI assistant.

**Example queries:**
- "Show me all tokenized assets"
- "Count the users in the database"
- "List all active sessions"

### Verify Data is Present

Run this query to see all tokenized assets:

```sql
SELECT 
  asset_id, 
  name, 
  symbol, 
  price_per_token_usd, 
  asset_class,
  status,
  created_at
FROM tokenized_assets 
ORDER BY price_per_token_usd DESC;
```

**Expected Result:** 8 assets
1. Coinbase (COIN) - $254.50
2. SpaceX (SPCX) - $97.00
3. Databricks (DBKS) - $73.50
4. X (X) - $30.00
5. Stripe (STRIP) - $29.00
6. Plaid (PLAID) - $15.50
7. Kraken (KRKN) - $12.00
8. Anthropic (ANTH) - $1.00

### Database Branches

The project has two branches:
- **production** (default) - `br-winter-haze-a4uas6eh` - **This is where the data is**
- **development** - `br-curly-mode-a41df9nv` - Empty branch

**Important:** Make sure you're querying the **production** branch (default). The data was seeded into the production branch.

### Check Current Branch

In Neon Console:
1. Look at the branch selector in the top right
2. Make sure "production" is selected

In SQL:
```sql
-- This will show which database/branch you're connected to
SELECT current_database();
-- Should return: neondb
```

### Troubleshooting

**If you can't see the data:**

1. **Check the branch:**
   - Make sure you're on the "production" branch
   - The development branch is empty

2. **Check the database name:**
   - Should be `neondb` (not `postgres` or anything else)

3. **Verify connection:**
   - Test the connection string in a PostgreSQL client
   - Check if you can see the `tokenized_assets` table:
     ```sql
     SELECT COUNT(*) FROM tokenized_assets;
     ```
     Should return: `8`

4. **Check table exists:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'tokenized_assets';
   ```

5. **Check permissions:**
   - Make sure you're logged in as the project owner
   - The connection string uses `neondb_owner` role

### Quick Verification Queries

```sql
-- Count all assets
SELECT COUNT(*) as total_assets FROM tokenized_assets;

-- List all assets with details
SELECT asset_id, name, symbol, price_per_token_usd, asset_class 
FROM tokenized_assets 
ORDER BY price_per_token_usd DESC;

-- Check users
SELECT COUNT(*) as total_users FROM "user";

-- Check active sessions
SELECT COUNT(*) as active_sessions 
FROM session 
WHERE expires_at > NOW();
```

### Railway PostgreSQL Removal

**Status:** Railway PostgreSQL can be safely removed.

**Verification:**
- ✅ All data has been migrated to Neon
- ✅ Railway application is using Neon DATABASE_URL
- ✅ No writes to Railway Postgres (confirmed by Rishav)

**Steps to Remove:**
1. Go to Railway dashboard
2. Find the PostgreSQL service
3. Delete/Remove the service
4. This will free up resources and costs

**Note:** The Railway NestJS application should continue working as it's now using the Neon DATABASE_URL environment variable.

---

**Need Help?**
- Check Neon Console: https://console.neon.tech
- Project: pangea-platform (crimson-glitter-19569216)
- Database: neondb
- Branch: production (default)

