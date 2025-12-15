# OASIS_ADMIN Authentication & Contract Deployment Guide

## Authentication Details

**Username:** `OASIS_ADMIN`  
**Password:** `Uppermall1!`  
**OASIS API URL:** `https://api.oasisplatform.world` (or your local OASIS API)

## Authentication Steps

### Option 1: Via NestJS API (Recommended)

Once your NestJS backend is running, you can authenticate and get wallet info:

```bash
# 1. Authenticate via OASIS
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "OASIS_ADMIN",
    "password": "Uppermall1!"
  }'

# This will return a JWT token for your Pangea backend
```

### Option 2: Direct OASIS API Authentication

```bash
# Authenticate with OASIS
curl -X POST "https://api.oasisplatform.world/api/avatar/authenticate" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "OASIS_ADMIN",
    "password": "Uppermall1!"
  }'

# Response will contain:
# - jwtToken: OASIS JWT token
# - avatarId: Your avatar ID
```

### Option 3: Get Solana Wallet After Authentication

```bash
# After getting JWT token, get wallets
curl -X GET "https://api.oasisplatform.world/api/wallet/avatar/{AVATAR_ID}/wallets" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# Find the Solana wallet (providerType: "SolanaOASIS")
# Note the wallet address and ID
```

## Setting Up for Contract Deployment

### 1. Get Solana Wallet Keypair

The OASIS API may not expose private keys directly for security. You have a few options:

**Option A: Use OASIS Wallet API (if keypair is available)**
```bash
curl -X GET "https://api.oasisplatform.world/api/wallet/{WALLET_ID}" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Option B: Use Local Solana Keypair**
If you have a local Solana keypair file:
```bash
# Set in .env
SOLANA_WALLET_KEYPAIR_PATH=/path/to/your/solana-keypair.json
```

**Option C: Generate New Keypair (for testing)**
```bash
solana-keygen new --outfile ./wallet-keypair.json
```

### 2. Configure Environment Variables

Add to `.env`:

```env
# OASIS API
OASIS_API_URL=https://api.oasisplatform.world

# Solana Wallet (for contract deployment)
SOLANA_WALLET_KEYPAIR_PATH=/path/to/wallet-keypair.json

# Platform Wallet (for fee collection)
PLATFORM_WALLET=YOUR_WALLET_ADDRESS

# Issuer Wallet (for RWA tokens)
ISSUER_WALLET=YOUR_WALLET_ADDRESS

# SmartContractGenerator API
SMART_CONTRACT_GENERATOR_URL=http://localhost:5000
```

### 3. Deploy Contracts

Once authenticated and configured, deploy contracts via API:

```bash
# Get your Pangea JWT token first (from login)
PANGEA_TOKEN="your-pangea-jwt-token"

# Deploy RWA Token
curl -X POST "http://localhost:3000/smart-contracts/deploy-rwa-token" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PANGEA_TOKEN" \
  -d '{
    "name": "Pangea RWA Token",
    "symbol": "PRWA",
    "totalSupply": 1000000,
    "metadataUri": "https://pangea.rkund.com/metadata/rwa-token.json",
    "issuerWallet": "YOUR_WALLET_ADDRESS",
    "decimals": 0
  }'

# Deploy Order Book
curl -X POST "http://localhost:3000/smart-contracts/deploy-order-book" \
  -H "Authorization: Bearer $PANGEA_TOKEN"

# Deploy Trade Execution
curl -X POST "http://localhost:3000/smart-contracts/deploy-trade-execution" \
  -H "Authorization: Bearer $PANGEA_TOKEN"

# Deploy Vault
curl -X POST "http://localhost:3000/smart-contracts/deploy-vault" \
  -H "Authorization: Bearer $PANGEA_TOKEN"
```

## Important Notes

1. **Compilation Time:** First compilation takes 20+ minutes (downloads Rust dependencies)
2. **Wallet Balance:** Ensure your Solana wallet has sufficient SOL for deployment fees
3. **Network:** Contracts deploy to Solana devnet by default
4. **Keypair Security:** Never commit keypair files to git. Use environment variables.

## Next Steps

1. ✅ SmartContractGenerator API is running at `http://localhost:5000`
2. ✅ All 4 contract types are implemented
3. ✅ API endpoints are ready
4. 🔨 Authenticate OASIS_ADMIN avatar
5. 🔨 Get Solana wallet keypair
6. 🔨 Configure environment variables
7. 🔨 Deploy contracts via API

## Troubleshooting

### Authentication Fails
- Verify OASIS API URL is correct
- Check username/password
- Ensure OASIS API is accessible from your network

### Wallet Not Found
- Generate a Solana wallet via OASIS API if needed
- Use local keypair file as fallback

### Deployment Fails
- Check SmartContractGenerator is running
- Verify wallet has sufficient SOL
- Check keypair file path is correct
- Review logs for specific error messages


