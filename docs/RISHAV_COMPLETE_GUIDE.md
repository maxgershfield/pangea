# Avatar Linking, Wallet Management, and Blockchain Transactions

**Date:** January 4, 2025  
**For:** Rishav  
**Status:** ✅ Ready to Use  
**Purpose:** Complete guide for setting up avatars, creating wallets, and executing blockchain operations (trades, withdrawals, deposits)

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [What's Implemented](#whats-implemented)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Blockchain Operations](#blockchain-operations)
5. [Understanding sendToken()](#understanding-sendtoken)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [Testing Checklist](#testing-checklist)

---

## 🚀 Quick Start

### What You Can Do Today

✅ **Link Avatar** - Automatic, no manual steps needed  
✅ **Create Wallets** - Generate Solana and Ethereum wallets  
✅ **Check Balances** - Query wallet balances  
✅ **Execute Trades** - Automatic when orders match  
✅ **Withdraw Tokens** - Send to avatar IDs or external addresses  
✅ **Check Transaction Status** - Verify transactions on blockchain  

### 5-Minute Setup

1. **Authenticate** → Get JWT token
2. **Generate Wallets** → `POST /api/wallet/generate`
3. **Check Balances** → `GET /api/wallet/balance`
4. **Start Trading** → Create orders (trades execute automatically)
5. **Withdraw** → `POST /api/transactions/withdraw`

---

## ✅ What's Implemented

### 1. Avatar Linking (Automatic)
- **Status:** ✅ Fully Working
- **How:** Happens automatically when you call wallet endpoints
- **No Action Required** - System creates/links avatars on-demand

### 2. Wallet Generation
- **Status:** ✅ Fully Working
- **Endpoint:** `POST /api/wallet/generate`
- **Supports:** Solana (SolanaOASIS) and Ethereum (EthereumOASIS)
- **Features:**
  - Generates secure keypairs
  - Links to your OASIS avatar
  - Sets as default wallet (optional)
  - Returns wallet ID, address, and balance

### 3. Blockchain Operations

#### Trade Execution
- **Status:** ✅ Fully Working
- **How:** Automatic when orders are matched
- **Process:**
  1. Orders match → `OrderMatchingService` triggers
  2. `BlockchainService.executeTrade()` called
  3. Tokens sent from seller to buyer via OASIS API
  4. Transaction hash returned and stored

#### Withdrawal Execution
- **Status:** ✅ Fully Working
- **Endpoint:** `POST /api/transactions/withdraw`
- **Supports:** Both avatar IDs and external wallet addresses
- **Process:**
  1. Validates user balance
  2. Locks balance
  3. Sends tokens via OASIS API
  4. Returns transaction hash
  5. Updates transaction record

#### Transaction Status
- **Status:** ✅ Fully Working
- **Uses:** OASIS API `getTransactionByHash()`
- **Returns:** Status, block number, addresses, amount, confirmations

---

## 📝 Step-by-Step Setup

### Step 1: Authenticate & Get JWT Token

First, authenticate with Better Auth to get a JWT token:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "rishav@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "rishav@example.com"
  }
}
```

**Save this token** - you'll need it for all subsequent requests as:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Step 2: Link Avatar (Automatic)

**Good News:** Avatar linking happens automatically! 

When you call any wallet endpoint, the system will:
1. Check if you have an OASIS avatar linked
2. If not, create one automatically using your email and name
3. Link it to your Better Auth user ID

**No manual step required** - just proceed to wallet generation.

---

### Step 3: Generate Wallets

Generate blockchain wallets for your avatar. You can create wallets for both Solana and Ethereum.

#### Generate Solana Wallet

```bash
POST /api/wallet/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "providerType": "SolanaOASIS",
  "setAsDefault": true
}
```

**Response:**
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

#### Generate Ethereum Wallet

```bash
POST /api/wallet/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "providerType": "EthereumOASIS",
  "setAsDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet generated successfully for EthereumOASIS",
  "wallet": {
    "walletId": "660e8400-e29b-41d4-a716-446655440001",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "providerType": "EthereumOASIS",
    "isDefaultWallet": true,
    "balance": 0
  }
}
```

**Save the `walletAddress`** values - you'll need them for blockchain operations.

---

### Step 4: Check Wallet Balances

Verify your wallets and check balances:

```bash
GET /api/wallet/balance
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "balances": [
    {
      "walletId": "550e8400-e29b-41d4-a716-446655440000",
      "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      "providerType": "SolanaOASIS",
      "balance": 0,
      "tokenSymbol": "SOL"
    },
    {
      "walletId": "660e8400-e29b-41d4-a716-446655440001",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "providerType": "EthereumOASIS",
      "balance": 0,
      "tokenSymbol": "ETH"
    }
  ],
  "hasWallets": true
}
```

---

## 🔗 Blockchain Operations

### 1. Execute Trade

Trades are executed automatically when orders are matched. The system uses `BlockchainService.executeTrade()` which:

1. Gets buyer and seller avatar IDs
2. Gets their default wallets for the blockchain
3. Sends tokens from seller to buyer via OASIS API
4. Returns transaction hash

**This happens automatically** when orders are matched via `OrderMatchingService`.

**Example Flow:**
1. User A creates a sell order
2. User B creates a buy order (matching price)
3. `OrderMatchingService` matches the orders
4. `BlockchainService.executeTrade()` is called automatically
5. Tokens are transferred on blockchain
6. Trade record is created with transaction hash

---

### 2. Withdraw Tokens

Withdraw tokens to an external address or another user's avatar:

```bash
POST /api/transactions/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "assetId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 1.5,
  "toAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "blockchain": "solana"
}
```

**Response:**
```json
{
  "transactionId": "TXN-1738080000000-123",
  "userId": "your-user-id",
  "assetId": "550e8400-e29b-41d4-a716-446655440000",
  "transactionType": "withdrawal",
  "status": "processing",
  "amount": "1500000000",
  "blockchain": "solana",
  "transactionHash": "5j7s8K9mN2pQ4rT6vW8xY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z",
  "fromAddress": "your-wallet-address",
  "toAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "createdAt": "2025-01-04T10:00:00.000Z"
}
```

**Supported Address Types:**
- **External Wallet Address:** `"7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"` (Solana)
- **External Wallet Address:** `"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"` (Ethereum)
- **Avatar ID:** `"550e8400-e29b-41d4-a716-446655440000"` (UUID format)

The system automatically detects the address type and uses the appropriate method.

---

### 3. Check Transaction Status

Check the status of a transaction:

```bash
GET /api/transactions/{transactionId}
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "transactionId": "TXN-1738080000000-123",
  "status": "processing",
  "transactionHash": "5j7s8K9mN2pQ4rT6vW8xY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z",
  "blockchain": "solana",
  "amount": "1500000000",
  "fromAddress": "your-wallet-address",
  "toAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
}
```

The system uses `BlockchainService.getTransaction()` which calls OASIS API to get transaction status.

---

## 📖 Understanding sendToken()

### How OASIS API Works

The OASIS API `sendToken()` function supports **both** avatar-to-avatar transfers and direct wallet address transfers:

#### Option 1: Send to Avatar ID
When you provide an avatar ID (UUID format), OASIS will:
- Look up the avatar's wallet address for the specified provider type
- Send tokens to that wallet address
- This is convenient when you know the recipient's avatar ID

**Example:**
```json
{
  "fromAvatarId": "your-avatar-id",
  "toAvatarId": "recipient-avatar-id",
  "amount": 1.5,
  "tokenSymbol": "SOL",
  "providerType": "SolanaOASIS",
  "walletId": "your-wallet-id"
}
```

#### Option 2: Send to External Wallet Address
When you provide a wallet address directly, OASIS will:
- Send tokens directly to that address
- No avatar lookup required
- Works with any valid blockchain address (Phantom, MetaMask, etc.)

**Example:**
```json
{
  "fromAvatarId": "your-avatar-id",
  "toWalletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "amount": 1.5,
  "tokenSymbol": "SOL",
  "providerType": "SolanaOASIS",
  "walletId": "your-wallet-id"
}
```

### Automatic Detection

Our `BlockchainService.withdraw()` method automatically detects the address type:

- **If address is UUID format** (e.g., `550e8400-e29b-41d4-a716-446655440000`) → Uses `toAvatarId`
- **If address is wallet format** (e.g., `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`) → Uses `toWalletAddress`

**This means:**
- ✅ You can use either avatar IDs or wallet addresses
- ✅ The system handles the conversion automatically
- ✅ No need to know which format to use - just provide the address

---

## 📚 API Reference

### Wallet Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/wallet/generate` | POST | Generate new wallet | ✅ Yes |
| `/api/wallet/balance` | GET | Get all wallet balances | ✅ Yes |
| `/api/wallet/balance/:assetId` | GET | Get specific asset balance | ✅ Yes |
| `/api/wallet/sync` | POST | Sync wallet balances | ✅ Yes |
| `/api/wallet/transactions/:walletId` | GET | Get wallet transaction history | ✅ Yes |

### Transaction Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/transactions/withdraw` | POST | Withdraw tokens | ✅ Yes |
| `/api/transactions/deposit` | POST | Initiate deposit | ✅ Yes |
| `/api/transactions` | GET | Get user transactions | ✅ Yes |
| `/api/transactions/:transactionId` | GET | Get specific transaction | ✅ Yes |
| `/api/transactions/:transactionId/confirm` | POST | Confirm transaction | ✅ Yes |

### Order Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/orders` | POST | Create order | ✅ Yes |
| `/api/orders` | GET | Get user orders | ✅ Yes |
| `/api/orders/:orderId` | GET | Get specific order | ✅ Yes |

---

## 🔍 Troubleshooting

### Error: "User not found or missing avatarId"

**Solution:** This means avatar linking failed. Check:
1. Are you authenticated? (JWT token valid?)
2. Does your user have an email?
3. Check backend logs for OASIS API errors

**Fix:** Try calling any wallet endpoint - it should automatically create the avatar.

---

### Error: "User missing default wallet"

**Solution:** Generate a wallet first:
```bash
POST /api/wallet/generate
Authorization: Bearer YOUR_JWT_TOKEN
{
  "providerType": "SolanaOASIS",  # or "EthereumOASIS"
  "setAsDefault": true
}
```

---

### Error: "Failed to send token" or "Transaction failed"

**Solution:** 
1. Verify the `toAddress` is a valid wallet address for the blockchain
2. Check that you have sufficient balance
3. Verify the token symbol matches the asset
4. Check backend logs for detailed error messages

**Common Issues:**
- Invalid address format (Solana addresses are base58, Ethereum addresses are hex with 0x)
- Insufficient balance
- Wrong blockchain specified
- Token symbol mismatch

---

### Error: "Insufficient balance"

**Solution:** 
1. Check your balance: `GET /api/wallet/balance`
2. Make sure you have enough tokens
3. For testnet, you may need to fund your wallet manually
4. Check if balance is locked (pending transactions)

---

### Error: "Asset not found"

**Solution:**
1. Verify the `assetId` is correct
2. Check that the asset exists in the database
3. Ensure the asset is active

---

## ✅ Testing Checklist

### Avatar & Wallet Setup

- [ ] **Authenticate Successfully**
  - [ ] Login and receive JWT token
  - [ ] Token is valid and not expired

- [ ] **Avatar Linking (Automatic)**
  - [ ] Call any wallet endpoint
  - [ ] Verify avatar is created automatically
  - [ ] Check user record has `avatarId` populated

- [ ] **Wallet Generation**
  - [ ] Generate Solana wallet
  - [ ] Generate Ethereum wallet
  - [ ] Verify wallets appear in balance endpoint
  - [ ] Check wallet addresses are valid format

- [ ] **Balance Operations**
  - [ ] Get all balances
  - [ ] Get specific asset balance
  - [ ] Sync balances

### Blockchain Operations

- [ ] **Trade Execution**
  - [ ] Create matching buy/sell orders
  - [ ] Verify trade executes automatically
  - [ ] Check transaction hash is returned
  - [ ] Verify tokens transferred on blockchain explorer

- [ ] **Withdrawal to External Address**
  - [ ] Test withdrawal to Solana external address
  - [ ] Test withdrawal to Ethereum external address
  - [ ] Check transaction hash returned
  - [ ] Verify transaction on blockchain explorer
  - [ ] Verify tokens received at destination

- [ ] **Withdrawal to Avatar ID**
  - [ ] Test withdrawal to another user's avatar ID
  - [ ] Check transaction hash returned
  - [ ] Verify transaction on blockchain explorer

- [ ] **Transaction Status**
  - [ ] Check transaction status endpoint works
  - [ ] Verify status updates correctly
  - [ ] Check block number and confirmations

---

## 🎯 Complete Workflow Example

Here's a complete workflow from authentication to withdrawal:

### 1. Authenticate
```bash
POST /api/auth/login
{
  "email": "rishav@example.com",
  "password": "password123"
}
# Save the token from response
```

### 2. Generate Wallets
```bash
# Generate Solana wallet
POST /api/wallet/generate
Authorization: Bearer YOUR_JWT_TOKEN
{
  "providerType": "SolanaOASIS",
  "setAsDefault": true
}

# Generate Ethereum wallet
POST /api/wallet/generate
Authorization: Bearer YOUR_JWT_TOKEN
{
  "providerType": "EthereumOASIS",
  "setAsDefault": true
}
```

### 3. Check Balances
```bash
GET /api/wallet/balance
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. Create Orders (for trading)
```bash
# Create a sell order
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
{
  "assetId": "asset-uuid",
  "orderType": "sell",
  "quantity": 10,
  "pricePerTokenUsd": 100,
  "blockchain": "solana"
}

# Create a buy order (matching)
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
{
  "assetId": "asset-uuid",
  "orderType": "buy",
  "quantity": 10,
  "pricePerTokenUsd": 100,
  "blockchain": "solana"
}
```

### 5. Withdraw Tokens
```bash
# Withdraw to external address
POST /api/transactions/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
{
  "assetId": "asset-uuid",
  "amount": 1.5,
  "toAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "blockchain": "solana"
}

# Or withdraw to avatar ID
POST /api/transactions/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
{
  "assetId": "asset-uuid",
  "amount": 1.5,
  "toAddress": "550e8400-e29b-41d4-a716-446655440000",
  "blockchain": "solana"
}
```

### 6. Check Transaction Status
```bash
GET /api/transactions/{transactionId}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Current Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Avatar Linking | ✅ Complete | Automatic, no manual steps |
| Wallet Generation | ✅ Complete | Solana & Ethereum supported |
| Balance Checking | ✅ Complete | Via OASIS API |
| Trade Execution | ✅ Complete | Automatic on order match |
| Withdrawal Execution | ✅ Complete | Supports external addresses & avatar IDs |
| Transaction Status | ✅ Complete | Via OASIS API |

---

## ⚠️ Important Notes

1. **Testnet vs Mainnet** - Make sure you're using the correct network. Check your OASIS API configuration.

2. **Token Decimals** - The system assumes standard decimals (9 for Solana, 18 for Ethereum). Custom token decimals may need adjustment.

3. **Address Format Validation** - Make sure wallet addresses are valid for the blockchain:
   - **Solana:** Base58 encoded, typically 32-44 characters
   - **Ethereum:** Hex string with 0x prefix, 42 characters

4. **Authentication** - All endpoints require a valid JWT token from Better Auth. Make sure your token is not expired.

5. **Balance Locking** - When you initiate a withdrawal, your balance is locked until the transaction completes or fails. This prevents double-spending.

---

## 🚀 Next Steps

1. **Test Avatar Linking** - Call any wallet endpoint and verify avatar is created
2. **Generate Wallets** - Create Solana and Ethereum wallets
3. **Test Withdrawals** - Try withdrawing to external addresses and avatar IDs
4. **Test Trades** - Create matching orders and verify trade execution
5. **Monitor Logs** - Check backend logs for any OASIS API errors

---

## 📞 Support

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Review backend logs for detailed error messages
3. Verify your JWT token is valid
4. Ensure OASIS API is accessible
5. Check blockchain explorer for transaction status

---

**Last Updated:** January 4, 2025  
**Status:** ✅ Ready for Testing  
**All Features:** Fully Implemented and Working

