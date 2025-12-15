# Smart Contract Deployment - Ready to Go! 🚀

## ✅ What's Complete

1. **SmartContractGenerator API** - Running at `http://localhost:5000`
2. **All 4 Contract Types Implemented:**
   - ✅ RWA Token Contract
   - ✅ Order Book Contract
   - ✅ Trade Execution Contract
   - ✅ Vault Contract
3. **API Endpoints Ready:**
   - `POST /smart-contracts/deploy-rwa-token`
   - `POST /smart-contracts/deploy-order-book`
   - `POST /smart-contracts/deploy-trade-execution`
   - `POST /smart-contracts/deploy-vault`
   - `GET /smart-contracts/cache-stats`

## 🔧 Setup Required

### Option 1: Use Local Solana Keypair (Recommended for Testing)

1. **Find or Create Solana Keypair:**
   ```bash
   # Check for existing keypair
   ls ~/.config/solana/id.json
   
   # Or create a new one for devnet
   solana-keygen new --outfile ./wallet-keypair.json
   ```

2. **Configure Environment:**
   ```bash
   # Use the setup script
   node scripts/deploy-with-keypair.js ~/.config/solana/id.json
   
   # Or manually set in .env
   SOLANA_WALLET_KEYPAIR_PATH=/path/to/your/keypair.json
   ISSUER_WALLET=YOUR_WALLET_ADDRESS
   PLATFORM_WALLET=YOUR_WALLET_ADDRESS
   OASIS_API_URL=http://localhost:5003
   SMART_CONTRACT_GENERATOR_URL=http://localhost:5000
   ```

3. **Deploy Contracts:**
   ```bash
   # Start backend
   npm run start:dev
   
   # In another terminal, deploy contracts
   # (You'll need to authenticate first via /api/auth/login)
   ```

### Option 2: Use OASIS Wallet (When Authenticated)

Once you authenticate your OASIS_ADMIN avatar:

1. **Get Wallet from OASIS:**
   ```bash
   # After authentication, get wallets
   curl -X GET "http://localhost:5003/api/wallet/avatar/{AVATAR_ID}/wallets" \
     -H "Authorization: Bearer {JWT_TOKEN}"
   ```

2. **Extract Keypair** (if available via API) or use wallet address

3. **Deploy via API** using the wallet address

## 📝 Quick Start

### Step 1: Configure Keypair
```bash
cd /Volumes/Storage/OASIS_CLEAN/pangea/backend
node scripts/deploy-with-keypair.js ~/.config/solana/id.json
```

### Step 2: Start Backend
```bash
npm run start:dev
```

### Step 3: Deploy Contracts

**Via API (requires authentication):**
```bash
# Get JWT token first
TOKEN=$(curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"OASIS_ADMIN","password":"Uppermall1!"}' \
  | jq -r '.access_token')

# Deploy RWA Token
curl -X POST "http://localhost:3000/smart-contracts/deploy-rwa-token" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
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
  -H "Authorization: Bearer $TOKEN"

# Deploy Trade Execution
curl -X POST "http://localhost:3000/smart-contracts/deploy-trade-execution" \
  -H "Authorization: Bearer $TOKEN"

# Deploy Vault
curl -X POST "http://localhost:3000/smart-contracts/deploy-vault" \
  -H "Authorization: Bearer $TOKEN"
```

## ⚠️ Important Notes

1. **First Compilation:** Takes 20+ minutes (downloads Rust dependencies)
2. **Wallet Balance:** Ensure your Solana wallet has sufficient SOL for deployment fees
3. **Network:** Contracts deploy to Solana devnet by default
4. **Keypair Security:** Never commit keypair files to git

## 🔍 OASIS API Endpoints

- **Remote:** `http://api.oasisweb4.com`
- **Local:** `http://localhost:5003` or `http://localhost:5004`

Update `OASIS_API_URL` in `.env` to use the appropriate endpoint.

## 📊 Deployment Status

Once deployed, contract addresses will be returned in the API response. Store these addresses in your database for future reference.

## 🆘 Troubleshooting

### Authentication Issues
- Try different OASIS API endpoints (5003, 5004, or api.oasisweb4.com)
- Verify username/password
- Check if avatar exists in OASIS database

### Deployment Fails
- Verify SmartContractGenerator is running: `curl http://localhost:5000/swagger`
- Check wallet has sufficient SOL: `solana balance`
- Verify keypair path is correct
- Check logs for specific error messages

### Compilation Timeout
- First build takes 20+ minutes - be patient
- Subsequent builds use cache and are much faster
- Check SmartContractGenerator logs for progress

## ✅ Next Steps

1. Configure Solana keypair
2. Start NestJS backend
3. Deploy contracts via API
4. Store contract addresses in database
5. Update asset records with contract addresses

---

**Status:** 🟢 Ready for Deployment
**SmartContractGenerator:** ✅ Running
**Contracts:** ✅ Implemented
**API Endpoints:** ✅ Ready


