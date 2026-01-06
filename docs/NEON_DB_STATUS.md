# Neon Database Status

**Last Updated:** January 6, 2025  
**Project ID:** `crimson-glitter-19569216`  
**Database:** `neondb`

## Connection Status

✅ **MCP Server Connected** - Neon MCP server is authenticated and working via OAuth

## Database Tables

### Better-Auth Tables (Managed by Better Auth)
- `user` - User accounts (includes `avatar_id` field for OASIS integration)
- `session` - Active user sessions
- `account` - OAuth account links
- `verification` - Email verification tokens
- `jwks` - JSON Web Key Set for JWT

### Application Tables
- `tokenized_assets` - RWA (Real-World Assets) tokenized assets
- `orders` - Trading orders
- `trades` - Executed trades
- `transactions` - Blockchain transactions
- `user_balances` - User token balances
- `order_book_snapshots` - Order book state snapshots
- `migrations` - Database migration history

## Better-Auth Sessions

**Active Sessions (5 found):**

1. **Session ID:** `g1KiOlUxaKZ4CxSF1T5CPzJxbAS6Cipe`
   - **User ID:** `WwQ6xaplRFHG7dslGlYmEIi90B4PSzDr`
   - **Token:** `HiUnrPJ7aeR3PbQyh4ruzK7BMKytqPXC`
   - **Expires:** January 13, 2026 at 13:03:45 UTC

2. **Session ID:** `kRF00qavyzdSqET6QJdZjP1HkkcrBUxR`
   - **User ID:** `GcCas3ZtrwBJ9wbnCzZUcMh9U1mhHeSh`
   - **Token:** `hhr3yZHYwAXQq50LerESS821CqOYFJnK`
   - **Expires:** January 12, 2026 at 21:26:42 UTC

3. **Session ID:** `CM7YmmUVt7NtNqVbHbbD4c5xkk7iGlUL`
   - **User ID:** `GcCas3ZtrwBJ9wbnCzZUcMh9U1mhHeSh`
   - **Token:** `20BTLJujKfh0niPsisFc7IHQdD3NT36C`
   - **Expires:** January 12, 2026 at 19:15:51 UTC

4. **Session ID:** `yYUle3bAynCwfPIAFROsGYSzIQByJuGT`
   - **User ID:** `GcCas3ZtrwBJ9wbnCzZUcMh9U1mhHeSh`
   - **Token:** `gzwSkq2Vk5JpDRh1QtHgebOQaiSSaxZb`
   - **Expires:** January 12, 2026 at 17:58:37 UTC

5. **Session ID:** `ib0o6tKLXtuh6QuMNNyzZghvpGvrNvVU`
   - **User ID:** `GcCas3ZtrwBJ9wbnCzZUcMh9U1mhHeSh`
   - **Token:** `CpigHVIK1bZNcP4WxHBLAtoQCKhzIxSU`
   - **Expires:** January 12, 2026 at 16:36:55 UTC

**Note:** These tokens can be used for API authentication with Better Auth. The most recent token (expires Jan 13) is recommended for testing.

## Tokenized Assets Status

**Current Count:** 8 assets ✅

**Assets (Tech Companies / Private Equity):**
1. **Coinbase (COIN)** - $254.50 - Cryptocurrency Exchange
2. **SpaceX (SPCX)** - $97.00 - Aerospace
3. **Databricks (DBKS)** - $73.50 - Data Analytics Platform
4. **X (X)** - $30.00 - Social Media (formerly Twitter)
5. **Stripe (STRIP)** - $29.00 - Payment Processing
6. **Plaid (PLAID)** - $15.50 - Financial Data API
7. **Kraken (KRKN)** - $12.00 - Cryptocurrency Exchange
8. **Anthropic (ANTH)** - $1.00 - AI Research

**Asset Class:** All assets are classified as `private_equity` with various subtypes (fintech, ai_tech, aerospace, data_tech, social_media)

**Seeding Complete:** Assets were seeded directly via SQL using the Neon MCP server to match the UI dashboard requirements.

## User Table Structure

The `user` table includes:
- Standard Better Auth fields (id, email, name, etc.)
- **`avatar_id`** - Links to OASIS avatar (for blockchain operations)
- **`wallet_address_solana`** - Solana wallet address
- **`wallet_address_ethereum`** - Ethereum wallet address
- **`kyc_status`** - KYC verification status
- **`role`** - User role (default: 'user')

## Tokenized Assets Table Structure

The `tokenized_assets` table includes:
- Asset identification (asset_id, name, symbol)
- Asset classification (asset_class, asset_type)
- Token details (total_supply, decimals, token_standard)
- Blockchain info (blockchain, network, contract_address, mint_address)
- Valuation (total_value_usd, price_per_token_usd)
- Metadata (metadata_uri, image_uri, legal_documents_uri)
- Status and timestamps
- Foreign key to `user` table (issuer_id)

## Querying the Database

You can now query the database through Cursor using the Neon MCP server:

**Examples:**
- "Show me all users with avatar_id set"
- "Query the tokenized_assets table"
- "Find active sessions expiring soon"
- "Count users by role"

## MCP Server Status

✅ **Connected** - 27 tools, 1 prompt, 4 resources available

The Neon MCP server provides tools for:
- Running SQL queries
- Managing database branches
- Performing migrations
- Listing projects and databases
- And more...

---

**Connection Details:**
- **MCP Server:** `https://mcp.neon.tech/mcp`
- **Authentication:** OAuth (completed)
- **Project ID:** `crimson-glitter-19569216`
- **Database:** `neondb`

