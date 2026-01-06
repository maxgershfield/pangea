# Rishav's Avatar & Wallet Setup Guide

**Date:** 2025-01-04  
**Purpose:** Step-by-step guide for linking an avatar, creating wallets, and conducting blockchain operations

---

## 📋 Current Status

### ✅ What's Implemented

1. **Avatar Linking** - Automatically handled when you use wallet endpoints
2. **Wallet Generation** - Fully implemented via `/api/wallet/generate`
3. **Blockchain Operations** - Implemented:
   - ✅ Withdrawals (`BlockchainService.withdraw()`)
   - ✅ Trade Execution (`BlockchainService.executeTrade()`)
   - ✅ Transaction Status (`BlockchainService.getTransaction()`)

### ⚠️ Important Notes

- **Avatar linking is automatic** - When you call wallet endpoints, the system automatically creates/links an OASIS avatar if one doesn't exist
- **Withdrawals may have limitations** - OASIS API may only support avatar-to-avatar transfers. External address withdrawals may need additional implementation (Option B from implementation plan)
- **All operations require authentication** - You need a valid JWT token from Better Auth

---

## 🚀 Quick Start Guide

### Step 1: Authenticate & Get JWT Token

First, you need to authenticate and get a JWT token. This depends on your frontend setup, but typically:

```bash
# Example: Login via Better Auth
POST /api/auth/login
{
  "email": "rishav@example.com",
  "password": "your-password"
}

# Response will include JWT token
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save this token** - you'll need it for all subsequent requests.

---

### Step 2: Link Avatar (Automatic)

**Good news:** Avatar linking happens automatically! When you call any wallet endpoint, the system will:

1. Check if you have an OASIS avatar linked
2. If not, create one automatically using your email and name
3. Link it to your Better Auth user ID

**No manual step required** - just proceed to wallet generation.

---

### Step 3: Generate Wallet

Generate a blockchain wallet for your avatar. You can create wallets for both Solana and Ethereum.

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

**Save the `walletAddress`** - you'll need it for blockchain operations.

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
2. Gets their default wallets
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

Withdraw tokens to an external address:

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

**✅ How OASIS sendToken() Works:**

The OASIS API `sendToken()` function supports **both** avatar-to-avatar transfers and external wallet address transfers:

1. **Sending to Avatar ID:**
   - If you provide an avatar ID (UUID format), OASIS will look up that avatar's wallet address
   - Example: `"toAddress": "550e8400-e29b-41d4-a716-446655440000"` (avatar ID)

2. **Sending to External Wallet Address:**
   - If you provide a wallet address (Solana or Ethereum format), OASIS will send directly to that address
   - Example: `"toAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"` (Solana address)
   - Example: `"toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"` (Ethereum address)

**Automatic Detection:**
- The system automatically detects whether `toAddress` is a UUID (avatar ID) or a wallet address
- If it's a UUID, it uses `toAvatarId` parameter
- If it's a wallet address, it uses `toWalletAddress` parameter
- This means you can use either format without worrying about the implementation details

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

## 📝 Complete Workflow Example

Here's a complete workflow from authentication to withdrawal:

### 1. Authenticate
```bash
# Login and get JWT token
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
POST /api/transactions/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
{
  "assetId": "asset-uuid",
  "amount": 1.5,
  "toAddress": "external-wallet-address",
  "blockchain": "solana"
}
```

---

## 🔍 Troubleshooting

### Error: "User not found or missing avatarId"

**Solution:** This means avatar linking failed. Check:
1. Are you authenticated? (JWT token valid?)
2. Does your user have an email?
3. Check backend logs for OASIS API errors

### Error: "User missing default wallet"

**Solution:** Generate a wallet first:
```bash
POST /api/wallet/generate
{
  "providerType": "SolanaOASIS",  # or "EthereumOASIS"
  "setAsDefault": true
}
```

### Error: "Failed to send token" or "Transaction failed"

**Solution:** 
1. Verify the `toAddress` is a valid wallet address for the blockchain
2. Check that you have sufficient balance
3. Verify the token symbol matches the asset
4. Check backend logs for detailed error messages

### Error: "Insufficient balance"

**Solution:** 
1. Check your balance: `GET /api/wallet/balance`
2. Make sure you have enough tokens
3. For testnet, you may need to fund your wallet manually

---

## 📚 API Endpoints Reference

### Wallet Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wallet/generate` | POST | Generate new wallet |
| `/api/wallet/balance` | GET | Get all wallet balances |
| `/api/wallet/balance/:assetId` | GET | Get specific asset balance |
| `/api/wallet/sync` | POST | Sync wallet balances |
| `/api/wallet/transactions/:walletId` | GET | Get wallet transaction history |

### Transaction Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions/withdraw` | POST | Withdraw tokens |
| `/api/transactions/deposit` | POST | Initiate deposit |
| `/api/transactions` | GET | Get user transactions |
| `/api/transactions/:transactionId` | GET | Get specific transaction |

### Order Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | POST | Create order |
| `/api/orders` | GET | Get user orders |
| `/api/orders/:orderId` | GET | Get specific order |

---

## 🎯 What's Ready Today

✅ **Avatar Linking** - Automatic, no manual steps needed  
✅ **Wallet Generation** - Fully working for Solana and Ethereum  
✅ **Balance Checking** - Get balances for all wallets  
✅ **Trade Execution** - Automatic when orders match  
✅ **Withdrawal Execution** - Implemented (may need testing with external addresses)  
✅ **Transaction Status** - Check transaction status via OASIS API  

---

## 📖 How sendToken() Works

### Understanding OASIS API sendToken()

The `sendToken()` function in OASIS API is flexible and supports multiple destination types:

#### 1. **Avatar-to-Avatar Transfers**
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

#### 2. **External Wallet Address Transfers**
When you provide a wallet address directly, OASIS will:
- Send tokens directly to that address
- No avatar lookup required
- Works with any valid blockchain address

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

#### 3. **Automatic Detection in Our Implementation**

Our `BlockchainService.withdraw()` method automatically detects the address type:

```typescript
// If toAddress is a UUID (avatar ID format)
const isWalletAddress = !toAddress.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

// Uses appropriate parameter based on detection
if (isWalletAddress) {
  // Send to external wallet address
  toWalletAddress: toAddress
} else {
  // Send to avatar (OASIS will look up wallet)
  toAvatarId: toAddress
}
```

**This means:**
- ✅ You can use either avatar IDs or wallet addresses
- ✅ The system handles the conversion automatically
- ✅ No need to know which format to use - just provide the address

---

## ⚠️ Known Limitations

1. **Testnet vs Mainnet** - Make sure you're using the correct network. Check your OASIS API configuration.

2. **Token Decimals** - The system assumes standard decimals (9 for Solana, 18 for Ethereum). Custom token decimals may need adjustment.

3. **Address Format Validation** - Make sure wallet addresses are valid for the blockchain (Solana addresses are base58, Ethereum addresses are hex with 0x prefix).

---

## 🚀 Next Steps

1. **Test Avatar Linking** - Call any wallet endpoint and verify avatar is created
2. **Generate Wallets** - Create Solana and Ethereum wallets
3. **Test Withdrawals** - Try withdrawing to another user's avatar ID first
4. **Test Trades** - Create matching orders and verify trade execution
5. **Monitor Logs** - Check backend logs for any OASIS API errors

---

**Last Updated:** 2025-01-04  
**Status:** Ready for Testing

