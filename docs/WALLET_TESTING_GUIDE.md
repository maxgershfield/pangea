# Wallet Operations Testing Guide

**Date:** 2025-01-04  
**For:** Rishav  
**Purpose:** Guide for testing wallet operations via Pangea Backend API

## Overview

This guide provides instructions for testing wallet operations through the Pangea backend API. All wallet endpoints integrate with the OASIS API for wallet generation, management, and blockchain operations.

## Prerequisites

1. **Pangea Backend Running**
   - Local: `http://localhost:3000`
   - Production: Check deployment status
   - Swagger UI: `http://localhost:3000/docs` (or `/api/docs`)

2. **OASIS API Running**
   - Production: `https://api.oasisweb4.com`
   - Local: `http://localhost:5003` (for local testing)

3. **Authentication**
   - All wallet endpoints require Better Auth JWT token
   - Authenticate via frontend or Better Auth API first
   - Include JWT token in `Authorization: Bearer <token>` header

## Available Endpoints

### 1. Generate Wallet

**Endpoint:** `POST /api/wallet/generate`

**Description:**  
Generates a new blockchain wallet for the authenticated user's OASIS avatar. This endpoint:
- Ensures an OASIS avatar exists for the user (creates one if needed)
- Generates a new keypair for the specified blockchain provider
- Links the wallet keys to the OASIS avatar
- Stores wallet information in OASIS storage providers

**OASIS Integration:**
- Calls `OasisLinkService.ensureOasisAvatar()` to ensure avatar exists
- Calls `OasisWalletService.generateWallet()` to create wallet via OASIS API
- Wallet stored using OASIS storage providers (SQLite for private keys, MongoDB for public keys)

**Request Body:**
```json
{
  "providerType": "SolanaOASIS",  // or "EthereumOASIS"
  "setAsDefault": true            // Optional, default: true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Wallet generated successfully for SolanaOASIS",
  "wallet": {
    "walletId": "550e8400-e29b-41d4-a716-446655440000",
    "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "providerType": "SolanaOASIS",
    "isDefaultWallet": true,
    "balance": 0
  }
}
```

**Testing via Swagger UI:**
1. Navigate to `http://localhost:3000/docs`
2. Click "Authorize" button (lock icon)
3. Enter JWT token: `Bearer <your-jwt-token>`
4. Navigate to `/api/wallet/generate`
5. Click "Try it out"
6. Enter request body (JSON above)
7. Click "Execute"

**Testing via curl:**
```bash
curl -X POST http://localhost:3000/api/wallet/generate \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "providerType": "SolanaOASIS",
    "setAsDefault": true
  }'
```

---

### 2. Get Wallet Balances

**Endpoint:** `GET /api/wallet/balance`

**Description:**  
Retrieves all wallet balances for the authenticated user. This endpoint:
- Ensures an OASIS avatar exists for the user
- Retrieves all wallets linked to the OASIS avatar
- Fetches balances for each wallet from the blockchain

**OASIS Integration:**
- Calls `OasisLinkService.ensureOasisAvatar()` to ensure avatar exists
- Calls `OasisWalletService.getWallets()` to get wallets from OASIS API
- Calls `OasisWalletService.getBalance()` for each wallet

**Response (200):**
```json
{
  "success": true,
  "hasWallets": true,
  "balances": [
    {
      "walletId": "550e8400-e29b-41d4-a716-446655440000",
      "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      "providerType": "SolanaOASIS",
      "balance": 0.5,
      "tokenSymbol": "SOL"
    }
  ]
}
```

**Testing via Swagger UI:**
1. Authorize with JWT token
2. Navigate to `GET /api/wallet/balance`
3. Click "Try it out"
4. Click "Execute"

**Testing via curl:**
```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

### 3. Get Asset Balance

**Endpoint:** `GET /api/wallet/balance/:assetId`

**Description:**  
Retrieves balance for a specific asset. The assetId is used to determine the blockchain provider.

**OASIS Integration:**
- Calls `BalanceSyncService.syncAssetBalance()` which uses OASIS wallets

**Response (200):**
```json
{
  "success": true,
  "balance": {
    "assetId": "550e8400-e29b-41d4-a716-446655440000",
    "balance": 100.5,
    "tokenSymbol": "SOL"
  }
}
```

---

### 4. Sync Wallet Balances

**Endpoint:** `POST /api/wallet/sync`

**Description:**  
Manually triggers balance synchronization for all user wallets. Refreshes balances from the blockchain.

**OASIS Integration:**
- Calls `BalanceSyncService.syncUserBalances()` which uses OASIS wallets

**Response (200):**
```json
{
  "success": true,
  "message": "Balances synced successfully",
  "balances": [...]
}
```

---

### 5. Get Wallet Transactions

**Endpoint:** `GET /api/wallet/transactions/:walletId`

**Description:**  
Retrieves transaction history for a specific wallet.

**OASIS Integration:**
- Calls `OasisWalletService.getTransactions()` which queries blockchain via OASIS API

**Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "transactionId": "...",
      "transactionHash": "...",
      "type": "send",
      "amount": 10.5,
      "status": "confirmed",
      "timestamp": "2025-01-04T14:00:00Z"
    }
  ]
}
```

---

### 6. Connect External Wallet

**Endpoint:** `POST /api/wallet/connect`

**Description:**  
Connects an external wallet (Phantom or MetaMask) to the user account. Currently marked as TODO in the implementation.

**Request Body:**
```json
{
  "blockchain": "solana",  // or "ethereum"
  "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "signature": "...",
  "message": "..."
}
```

**Status:** ⚠️ Implementation pending

---

### 7. Verify Wallet

**Endpoint:** `POST /api/wallet/verify`

**Description:**  
Verifies wallet ownership by validating a signature.

**Request Body:**
```json
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "blockchain": "solana",
  "signature": "...",
  "message": "..."
}
```

---

### 8. Get Verification Message

**Endpoint:** `GET /api/wallet/verification-message`

**Description:**  
Gets a message to be signed by the wallet for verification.

**Query Parameters:**
- `walletAddress`: Wallet address
- `blockchain`: Blockchain type (solana/ethereum)

---

## Testing Checklist

### Basic Wallet Operations

- [ ] **Generate Solana Wallet**
  - POST `/api/wallet/generate` with `providerType: "SolanaOASIS"`
  - Verify wallet ID and address returned
  - Check wallet appears in GET `/api/wallet/balance`

- [ ] **Generate Ethereum Wallet**
  - POST `/api/wallet/generate` with `providerType: "EthereumOASIS"`
  - Verify wallet ID and address returned
  - Check wallet appears in GET `/api/wallet/balance`

- [ ] **Get All Balances**
  - GET `/api/wallet/balance`
  - Verify all wallets returned
  - Check balance values (may be 0 for new wallets)

- [ ] **Sync Balances**
  - POST `/api/wallet/sync`
  - Verify balances updated
  - Check response includes all wallets

- [ ] **Get Transactions**
  - Generate a wallet first
  - GET `/api/wallet/transactions/:walletId`
  - Verify transactions array returned (may be empty for new wallets)

### Error Handling

- [ ] **Unauthorized Access**
  - Call endpoints without JWT token
  - Verify 401 Unauthorized response

- [ ] **Invalid Wallet ID**
  - GET `/api/wallet/transactions/00000000-0000-0000-0000-000000000000`
  - Verify 404 Not Found response

- [ ] **Invalid Provider Type**
  - POST `/api/wallet/generate` with invalid providerType
  - Verify 400 Bad Request response

---

## OASIS API Endpoints Used

The Pangea backend integrates with these OASIS API endpoints:

1. **Avatar Management:**
   - `POST /api/avatar/register` - Create OASIS avatar
   - `POST /api/avatar/authenticate` - Authenticate with OASIS

2. **Wallet Operations:**
   - `POST /api/keys/generate_keypair_for_provider/:providerType` - Generate keypair
   - `POST /api/keys/link_provider_private_key_to_avatar_by_id` - Link private key
   - `POST /api/keys/link_provider_public_key_to_avatar_by_id` - Link public key
   - `GET /api/wallet/avatar/:avatarId/wallets` - Get wallets for avatar

3. **Balance Operations:**
   - Balance queries handled via blockchain providers
   - OASIS API manages wallet storage and retrieval

---

## Swagger UI Testing

**Recommended Approach:**

1. **Start Pangea Backend:**
   ```bash
   cd /Users/maxgershfield/OASIS_CLEAN/pangea-repo
   npm run start:dev
   ```

2. **Access Swagger UI:**
   - Navigate to: `http://localhost:3000/docs`
   - All wallet endpoints are under "Wallet" tag

3. **Authenticate:**
   - Click "Authorize" button (lock icon at top)
   - Enter: `Bearer <your-jwt-token>`
   - Get JWT token from Better Auth (via frontend or API)

4. **Test Endpoints:**
   - Use "Try it out" button for each endpoint
   - View request/response schemas
   - See detailed OpenAPI documentation

---

## Notes

- **Wallet Storage:** Private keys require local storage (SQLite), public keys stored in MongoDB
- **Default Wallet:** First wallet for each provider type is set as default
- **Balance Updates:** Balances are fetched from blockchain on demand
- **Transactions:** Transaction history is queried from blockchain providers
- **Error Handling:** All endpoints return standardized error responses

---

## Support

For questions or issues:
- Check OASIS API logs for wallet-related errors
- Verify JWT token is valid and not expired
- Check OASIS API is accessible (https://api.oasisweb4.com)
- Review NFTMANAGER_FIXES.md for OASIS API changes

