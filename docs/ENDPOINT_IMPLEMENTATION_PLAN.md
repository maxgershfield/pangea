# Endpoint Implementation Plan

**Date:** 2025-01-04  
**Purpose:** Complete implementation plan to finish all stub endpoints using OASIS API

---

## 📖 Project Context

### About Pangea Markets

**Pangea Markets** is a real-world asset (RWA) trading platform that enables tokenized asset trading on blockchain networks (Solana and Ethereum). The platform allows users to:
- Trade tokenized real-world assets (real estate, commodities, etc.)
- Manage wallets and balances
- Execute trades through order matching
- Deposit and withdraw assets
- Monitor transactions and trade history

### Repository Location

**Repository Path:** `/Users/maxgershfield/OASIS_CLEAN/pangea-repo`  
**Repository Root:** `pangea-repo/`  
**Backend Code:** `pangea-repo/src/`  
**Documentation:** `pangea-repo/docs/`

### Technology Stack

- **Framework:** NestJS (Node.js/TypeScript)
- **Database:** PostgreSQL (via TypeORM)
- **Cache:** Redis
- **Authentication:** Better Auth (JWT-based, frontend handles auth, backend validates JWKs)
- **Blockchain Integration:** OASIS API (external service at `https://api.oasisweb4.com`)
- **Linting/Formatting:** Biome (NOT ESLint)
- **Blockchains:** Solana and Ethereum

### Architecture Overview

```
Pangea Backend (NestJS)
├── Authentication (Better Auth JWT validation)
├── Orders (Order creation, matching, execution)
├── Trades (Trade execution and history)
├── Transactions (Deposits, withdrawals)
├── Wallet (Wallet management via OASIS)
├── Assets (Asset management)
├── Blockchain Service (Trade/withdrawal execution) ← STUBS TO IMPLEMENT
└── OASIS Integration (OasisWalletService, OasisLinkService)

External Services:
└── OASIS API (https://api.oasisweb4.com)
    ├── Wallet management
    ├── Token transfers
    ├── Balance queries
    └── Transaction history
```

### Current Status

**Total Endpoints:** 70 endpoints across 11 controllers  
**Fully Implemented:** 50 endpoints (71%)  
**Partially Implemented/Stubs:** 17 endpoints (24%)  
**Placeholder/Dev Only:** 3 endpoints (4%)

**Key Integration:**
- ✅ Wallet operations fully integrated with OASIS
- ✅ Avatar management fully integrated with OASIS
- ⚠️ Trade execution uses stubs (needs implementation)
- ⚠️ Withdrawal execution uses stubs (needs implementation)
- ⚠️ Balance validation uses stubs (needs implementation)

### OASIS Integration

**OASIS API** is an external blockchain service that provides:
- Wallet generation and management
- Token transfers between avatars
- Balance queries
- Transaction history
- Multi-chain support (Solana, Ethereum, etc.)

**OASIS API Endpoint:** `https://api.oasisweb4.com`  
**Authentication:** Bearer token (JWT)  
**Integration:** Via `OasisWalletService` (already implemented in codebase)

**Key Services in Codebase:**
- `OasisWalletService` - Wallet operations (sendToken, getBalance, getWallets, etc.)
- `OasisLinkService` - Avatar linking and management
- `OasisAuthService` - Avatar authentication
- `OasisTokenManagerService` - Token refresh and management

### This Document's Purpose

This document provides a **complete implementation plan** to finish all stub endpoints using the OASIS API. Instead of implementing direct blockchain SDK calls, we'll leverage the existing OASIS integration which handles all blockchain complexity.

**Key Discovery:** Most of the functionality we need already exists in `OasisWalletService` - we just need to use it properly in the stub methods.

---

## 🎯 Executive Summary

**Key Discovery:** OASIS API already provides all the functionality we need! We just need to use `OasisWalletService.sendToken()` and related methods properly.

**Current Status:**
- ✅ `OasisWalletService.sendToken()` already exists and is implemented
- ✅ OASIS API endpoint `/api/wallet/send_token` is available
- ⚠️ `BlockchainService.executeTrade()` currently returns mock hash - needs to call `OasisWalletService.sendToken()`
- ⚠️ `BlockchainService.initiateWithdrawal()` currently returns mock hash - needs to call `OasisWalletService.sendToken()`
- ⚠️ Balance checking methods need to use `OasisWalletService.getBalance()`

**Strategy:** Instead of implementing direct blockchain SDK calls, we'll use OASIS API which handles all blockchain complexity.

---

## 👥 Agent Briefs

This document contains independent briefs for different developers/agents to work on different parts in parallel. Each brief includes:
- Complete context needed
- Current code location
- What needs to change
- Dependencies and requirements
- Testing instructions

**⚠️ Important:** Use **Biome** for linting and formatting, NOT ESLint. Run `npm run lint` before committing.

---

## 📋 Agent 1: Trade Execution Implementation

**Developer:** [Your Name]  
**Priority:** ⚠️ CRITICAL (Blocks trade execution)  
**Estimated Time:** 2-3 days  
**Dependencies:** None (can start immediately)

### Context

**Goal:** Implement `BlockchainService.executeTrade()` to execute trades on blockchain using OASIS API.

**Current Status:**
- File: `src/blockchain/services/blockchain.service.ts`
- Method: `executeTrade()` (lines ~28-60)
- Current behavior: Returns mock transaction hash
- Called by: `OrderMatchingService.executeMatch()` when orders are matched

**OASIS API Available:**
- `OasisWalletService.sendToken()` - Already implemented, calls `/api/wallet/send_token`
- `OasisWalletService.getDefaultWallet()` - Gets default wallet for avatar
- User entities have `avatarId` field that links to OASIS avatars

### Current Code

```typescript
// src/blockchain/services/blockchain.service.ts
async executeTrade(params: ExecuteTradeParams): Promise<string> {
  const { buyer, seller, asset, quantity, price } = params;
  
  this.logger.log(`Executing trade on blockchain: ${asset.blockchain}...`);
  
  // TODO: Implement actual blockchain execution
  const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  await this.waitForConfirmation(transactionHash, asset.blockchain);
  
  return transactionHash;
}
```

### What Needs to Change

1. **Inject `OasisWalletService`** into `BlockchainService` constructor
2. **Update `executeTrade()` method** to:
   - Get avatar IDs from buyer and seller User entities
   - Get default wallets for buyer and seller avatars
   - Determine provider type (SolanaOASIS or EthereumOASIS) from asset blockchain
   - Get token symbol from asset (use `asset.symbol` or `asset.id`)
   - Call `OasisWalletService.sendToken()` to send tokens from seller to buyer
   - Return transaction hash from OASIS API response

3. **Update module** (`src/blockchain/blockchain.module.ts`) to:
   - Import module that provides `OasisWalletService` (check if it's global or needs import)

### Implementation Steps

1. **Check OASIS Service Import:**
   ```bash
   # Check if OasisWalletService is available globally or needs import
   grep -r "OasisWalletService" src/app.module.ts
   grep -r "@Global" src/**/*.module.ts
   ```

2. **Update BlockchainService:**
   ```typescript
   // Add to imports
   import { OasisWalletService } from "../../services/oasis-wallet.service.js";
   
   // Add to constructor
   constructor(
     private readonly oasisWalletService: OasisWalletService,
   ) {}
   
   // Update executeTrade method (see Implementation Code below)
   ```

3. **Update BlockchainModule (if needed):**
   ```typescript
   // Check if OasisWalletService is global - if not, import the module
   // Most likely it's global, so no changes needed
   ```

### Implementation Code

```typescript
async executeTrade(params: ExecuteTradeParams): Promise<string> {
  const { buyer, seller, asset, quantity, price } = params;
  
  this.logger.log(`Executing trade: ${asset.id}, quantity ${quantity}, price ${price}`);
  
  try {
    // 1. Get OASIS avatar IDs for buyer and seller
    const buyerAvatarId = buyer.avatarId;
    const sellerAvatarId = seller.avatarId;
    
    if (!buyerAvatarId || !sellerAvatarId) {
      throw new Error(`Buyer or seller missing avatarId. Buyer: ${buyerAvatarId}, Seller: ${sellerAvatarId}`);
    }
    
    // 2. Get default wallets for buyer and seller
    const buyerWallet = await this.oasisWalletService.getDefaultWallet(buyerAvatarId);
    const sellerWallet = await this.oasisWalletService.getDefaultWallet(sellerAvatarId);
    
    if (!buyerWallet || !sellerWallet) {
      throw new Error(`Buyer or seller missing wallet. Buyer: ${buyerWallet?.walletId}, Seller: ${sellerWallet?.walletId}`);
    }
    
    // 3. Determine provider type from asset blockchain
    const providerType = asset.blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS';
    
    // 4. Determine token symbol (from asset)
    const tokenSymbol = asset.symbol || asset.id; // Use asset symbol or ID as token identifier
    
    // 5. Send tokens from seller to buyer via OASIS
    const result = await this.oasisWalletService.sendToken({
      fromAvatarId: sellerAvatarId,
      toAvatarId: buyerAvatarId,
      amount: quantity,
      tokenSymbol: tokenSymbol,
      providerType: providerType,
      walletId: sellerWallet.walletId,
    });
    
    this.logger.log(`Trade executed successfully. Transaction hash: ${result.transactionHash}`);
    
    return result.transactionHash;
  } catch (error) {
    this.logger.error(`Failed to execute trade: ${error.message}`, error.stack);
    throw error;
  }
}
```

### Testing Instructions

1. **Unit Test:**
   ```typescript
   // Mock OasisWalletService
   // Test with valid buyer/seller with avatarIds
   // Test error handling (missing avatarId, missing wallet)
   ```

2. **Integration Test:**
   - Create test orders (buy and sell) for same asset
   - Ensure both users have OASIS avatars and wallets
   - Match orders (should call executeTrade)
   - Verify transaction hash is returned
   - Check trade record has transaction hash

3. **Manual Test:**
   - Use testnet (Solana devnet or Ethereum sepolia)
   - Create matched orders
   - Verify transaction hash on blockchain explorer
   - Verify tokens transferred correctly

### Files to Modify

- `src/blockchain/services/blockchain.service.ts`
- `src/blockchain/blockchain.module.ts` (if OasisWalletService not global)

### Dependencies

- `OasisWalletService` (already exists in codebase)
- User entities must have `avatarId` field populated
- Asset entity needs `symbol` field (or use `id` as fallback)

### Success Criteria

- ✅ `executeTrade()` calls `OasisWalletService.sendToken()`
- ✅ Transaction hash is returned from OASIS API
- ✅ Trade records store transaction hash
- ✅ Trades execute successfully on testnet

---

## 📋 Agent 2: Withdrawal Implementation

**Developer:** [Your Name]  
**Priority:** ⚠️ HIGH (Blocks withdrawals)  
**Estimated Time:** 2-3 days  
**Dependencies:** None (can start immediately, but may need to verify OASIS API supports external addresses)

### Context

**Goal:** Implement `BlockchainService.withdraw()` to execute withdrawals to external addresses using OASIS API.

**Current Status:**
- File: `src/blockchain/services/blockchain.service.ts`
- Method: `withdraw()` (lines ~97-125)
- Current behavior: Returns mock transaction hash
- Called by: `TransactionsService.initiateWithdrawal()` when user requests withdrawal

**✅ RESOLVED:** OASIS `sendToken()` supports both avatar-to-avatar transfers AND external wallet addresses!

**How it works:**
- OASIS API accepts both `toAvatarId` (UUID) and `toWalletAddress` (direct address) parameters
- If `toWalletAddress` is provided, OASIS sends directly to that address
- If `toAvatarId` is provided, OASIS looks up the avatar's wallet and sends to it
- Our implementation automatically detects address type and uses the appropriate parameter

### Current Code

```typescript
// src/blockchain/services/blockchain.service.ts
async withdraw(params: {
  user: string; // userId
  asset: string; // assetId
  amount: bigint;
  toAddress: string; // withdrawal address
  blockchain: string;
}): Promise<string> {
  // TODO: Implement actual blockchain withdrawal
  const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  await this.waitForConfirmation(transactionHash, blockchain);
  return transactionHash;
}
```

### What Needs to Change

1. **Inject dependencies** into `BlockchainService`:
   - `OasisWalletService` (if not already injected)
   - `UserRepository` (to get user entity and avatarId)
   - `AssetRepository` (to get asset entity and token symbol)

2. **Update `withdraw()` method** to:
   - Get user entity and avatarId
   - Get asset entity and token symbol
   - Get user's default wallet
   - **Determine if OASIS supports external addresses** (see Implementation Options below)
   - Call appropriate method to send tokens to external address
   - Return transaction hash

3. **Update module** if needed for dependency injection

### Implementation Solution (RESOLVED)

**✅ Option A: OASIS API Supports External Addresses** - **IMPLEMENTED**

OASIS API `sendToken()` endpoint accepts both:
- `toAvatarId`: Avatar UUID (OASIS looks up wallet address)
- `toWalletAddress`: Direct wallet address (sends to external address)

**Our Implementation:**
- Updated `SendTokenRequest` interface to support both `toAvatarId` and `toWalletAddress` (both optional)
- Updated `sendToken()` method to send appropriate parameter to OASIS API
- Updated `withdraw()` method to automatically detect address type:
  - If address is UUID format → use `toAvatarId`
  - If address is wallet format → use `toWalletAddress`
- No need for Option B (direct blockchain SDK) - OASIS handles it all!

### Implementation Code (✅ IMPLEMENTED)

```typescript
async withdraw(params: {
  user: string;
  asset: string;
  amount: bigint;
  toAddress: string;
  blockchain: string;
}): Promise<string> {
  const { user: userId, asset: assetId, amount, toAddress, blockchain } = params;
  
  this.logger.log(`Initiating withdrawal: user ${userId}, asset ${assetId}, amount ${amount}, to ${toAddress}`);
  
  try {
    // 1. Get user entity
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.avatarId) {
      throw new Error(`User ${userId} not found or missing avatarId`);
    }
    
    // 2. Get asset to determine token symbol
    const asset = await this.assetRepository.findOne({ where: { id: assetId } });
    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }
    
    // 3. Get user's wallet for the blockchain
    const providerType = blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS';
    const wallets = await this.oasisWalletService.getWallets(user.avatarId, providerType);
    const matchingWallet = wallets.find((w) => w.providerType === providerType);
    
    if (!matchingWallet) {
      throw new Error(`User ${userId} missing ${providerType} wallet`);
    }
    
    // 4. Detect address type and send tokens via OASIS
    // OASIS API supports both avatar IDs and external wallet addresses
    const isWalletAddress = !toAddress.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    const tokenSymbol = asset.symbol || assetId;
    const decimals = asset.decimals || (blockchain === 'solana' ? 9 : 18);
    const amountNumber = Number(amount) / 10 ** decimals;
    
    const result = await this.oasisWalletService.sendToken({
      fromAvatarId: user.avatarId,
      toWalletAddress: isWalletAddress ? toAddress : undefined,  // External address
      toAvatarId: isWalletAddress ? undefined : toAddress,       // Avatar ID
      amount: amountNumber,
      tokenSymbol,
      providerType,
      walletId: matchingWallet.walletId,
    });
    
    this.logger.log(`Withdrawal executed successfully. Transaction hash: ${result.transactionHash}`);
    return result.transactionHash;
  } catch (error) {
    this.logger.error(`Failed to execute withdrawal: ${error.message}`, error.stack);
    throw error;
  }
}
```

**Key Points:**
- ✅ Automatically detects if `toAddress` is a wallet address or avatar ID
- ✅ Uses `toWalletAddress` for external addresses (Solana/Ethereum format)
- ✅ Uses `toAvatarId` for avatar IDs (UUID format)
- ✅ OASIS API handles both cases seamlessly

### Testing Instructions

1. **Test with External Wallet Address:**
   ```bash
   # Test withdrawal to external Solana address
   POST /api/transactions/withdraw
   {
     "assetId": "asset-uuid",
     "amount": 1.5,
     "toAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",  # External Solana address
     "blockchain": "solana"
   }
   
   # Test withdrawal to external Ethereum address
   POST /api/transactions/withdraw
   {
     "assetId": "asset-uuid",
     "amount": 0.1,
     "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",  # External Ethereum address
     "blockchain": "ethereum"
   }
   ```

2. **Test with Avatar ID:**
   ```bash
   # Test withdrawal to another user's avatar
   POST /api/transactions/withdraw
   {
     "assetId": "asset-uuid",
     "amount": 1.5,
     "toAddress": "550e8400-e29b-41d4-a716-446655440000",  # Avatar ID (UUID)
     "blockchain": "solana"
   }
   ```

3. **Integration Test:**
   - Create test withdrawal request with external address
   - Verify transaction hash returned
   - Check transaction record has hash
   - Verify tokens sent to external address on blockchain explorer
   - Test with both Solana and Ethereum addresses

4. **Manual Test:**
   - Use testnet
   - Withdraw to external testnet address
   - Verify on blockchain explorer (Solscan, Etherscan)
   - Verify transaction shows correct recipient address

### Files to Modify

- `src/blockchain/services/blockchain.service.ts`
- `src/blockchain/blockchain.module.ts` (for dependency injection)

### Dependencies

- `OasisWalletService` - ✅ Updated to support both `toAvatarId` and `toWalletAddress`
- `UserRepository` (TypeORM repository) - ✅ Injected
- `AssetRepository` (TypeORM repository via DataSource) - ✅ Injected
- OASIS API - ✅ Confirmed supports external addresses via `toWalletAddress` parameter

### Success Criteria

- ✅ Withdrawals execute successfully
- ✅ Transaction hash is returned and stored
- ✅ Tokens sent to external address (verify on blockchain explorer)
- ✅ Supports both avatar IDs and external wallet addresses
- ✅ Automatic address type detection works correctly

---

## 📋 Agent 3: Payment Token Balance Implementation

**Developer:** [Your Name]  
**Priority:** ⚠️ MEDIUM (Required for order validation)  
**Estimated Time:** 1-2 days  
**Dependencies:** None (can start immediately)

### Context

**Goal:** Implement `BalanceService.getPaymentTokenBalance()` to get user's payment token balance (SOL, ETH) using OASIS API.

**Current Status:**
- File: `src/orders/services/balance.service.ts`
- Method: `getPaymentTokenBalance()` (lines ~114-120)
- Current behavior: Returns `BigInt(0)` (stub)
- Called by: `OrdersService.validateOrder()` when validating buy orders

**OASIS API Available:**
- `OasisWalletService.getBalance()` - Gets wallet balance
- `OasisWalletService.getDefaultWallet()` - Gets default wallet for avatar

**Note:** This gets native token balance (SOL, ETH). For USDC/ERC-20 payment tokens, additional work may be needed later.

### Current Code

```typescript
// src/orders/services/balance.service.ts
async getPaymentTokenBalance(userId: string, blockchain: string): Promise<bigint> {
  this.logger.log(`Getting payment token balance for user ${userId} on ${blockchain}`);
  
  // TODO: Implement actual query for payment token balance
  return BigInt(0);
}
```

### What Needs to Change

1. **Inject dependencies** into `BalanceService`:
   - `OasisWalletService` (check if already available or needs import)
   - `UserRepository` (to get user entity and avatarId)

2. **Update `getPaymentTokenBalance()` method** to:
   - Get user entity and avatarId
   - Get provider type from blockchain (SolanaOASIS or EthereumOASIS)
   - Get user's default wallet for the blockchain
   - Call `OasisWalletService.getBalance()` to get balance
   - Convert balance to BigInt (handle decimals correctly)
   - Return balance as BigInt

3. **Update module** if needed for dependency injection

### Implementation Code

```typescript
async getPaymentTokenBalance(userId: string, blockchain: string): Promise<bigint> {
  this.logger.log(`Getting payment token balance for user ${userId} on ${blockchain}`);
  
  try {
    // 1. Get user entity
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.avatarId) {
      this.logger.warn(`User ${userId} not found or missing avatarId. Returning 0 balance.`);
      return BigInt(0);
    }
    
    // 2. Get provider type
    const providerType = blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS';
    
    // 3. Get default wallet
    const wallet = await this.oasisWalletService.getDefaultWallet(user.avatarId);
    if (!wallet || wallet.providerType !== providerType) {
      this.logger.warn(`User ${userId} missing default ${providerType} wallet. Returning 0 balance.`);
      return BigInt(0);
    }
    
    // 4. Get balance from OASIS
    const balance = await this.oasisWalletService.getBalance(wallet.walletId, providerType);
    
    // 5. Convert to BigInt (assuming balance is in native token units)
    // For Solana: balance is in lamports (1 SOL = 1e9 lamports)
    // For Ethereum: balance is in wei (1 ETH = 1e18 wei)
    const decimals = blockchain === 'solana' ? 9 : 18;
    const balanceBigInt = BigInt(Math.floor(balance.balance * 10 ** decimals));
    
    return balanceBigInt;
  } catch (error) {
    this.logger.error(`Failed to get payment token balance: ${error.message}`, error.stack);
    // Return 0 on error to allow order creation (can be refined later)
    return BigInt(0);
  }
}
```

### Testing Instructions

1. **Unit Test:**
   - Mock `OasisWalletService.getBalance()` and `getDefaultWallet()`
   - Test with user that has wallet (should return balance)
   - Test with user without wallet (should return 0)
   - Test error handling

2. **Integration Test:**
   - Create user with OASIS avatar and wallet
   - Get payment token balance
   - Verify correct balance returned (compare with blockchain explorer)

3. **Manual Test:**
   - Use testnet wallet
   - Verify balance matches blockchain explorer

### Files to Modify

- `src/orders/services/balance.service.ts`
- `src/orders/orders.module.ts` (if needed for dependency injection)

### Dependencies

- `OasisWalletService`
- `UserRepository` (TypeORM repository)

### Success Criteria

- ✅ Returns correct balance for users with wallets
- ✅ Returns 0 for users without wallets (gracefully)
- ✅ Handles errors gracefully
- ✅ Balance matches blockchain explorer

---

## 📋 Agent 4: Order Validation Implementation

**Developer:** [Your Name]  
**Priority:** ⚠️ MEDIUM (Required for order validation)  
**Estimated Time:** 1 day  
**Dependencies:** Agent 3 must complete `BalanceService.getPaymentTokenBalance()` first

### Context

**Goal:** Implement payment token balance validation in `OrdersService.validateOrder()` for buy orders.

**Current Status:**
- File: `src/orders/services/orders.service.ts`
- Method: `validateOrder()` (lines ~128-136)
- Current behavior: TODO comment, warning logged
- Called by: `OrdersService.create()` before creating order

**Dependencies:**
- `BalanceService.getPaymentTokenBalance()` must be implemented first (Agent 3)

### Current Code

```typescript
// src/orders/services/orders.service.ts
else if (dto.orderType === 'buy') {
  // Validate user has enough funds (USDC or native token)
  const totalCost = dto.pricePerTokenUsd * dto.quantity;
  // TODO: Check payment token balance when payment system is implemented
  this.logger.warn(`Buy order validation: Payment token balance check not yet implemented...`);
}
```

### What Needs to Change

1. **Update `validateOrder()` method** to:
   - Get payment token balance using `BalanceService.getPaymentTokenBalance()`
   - Calculate required amount (total cost)
   - Compare balance with required amount
   - Throw `BadRequestException` if insufficient balance

**Note:** This is a simplified implementation. Production may need:
- Determine payment token (USDC vs native SOL/ETH)
- Get current USD price of native token
- Support multiple payment tokens
- Handle token decimals correctly

### Implementation Code

```typescript
else if (dto.orderType === 'buy') {
  // Validate user has enough funds (USDC or native token)
  const totalCost = dto.pricePerTokenUsd * dto.quantity;
  
  // Get payment token balance
  const blockchain = dto.blockchain || 'solana'; // Default to solana
  const paymentBalance = await this.balanceService.getPaymentTokenBalance(
    userId,
    blockchain,
  );
  
  // Convert totalCost to payment token units
  // This is a simplification - assumes native token payment
  // In production, we'd need to:
  // 1. Determine if payment token is USDC or native token
  // 2. Get current USD price of native token if using native
  // 3. Convert totalCost appropriately
  const decimals = blockchain === 'solana' ? 9 : 18; // SOL or ETH decimals
  const requiredAmount = BigInt(Math.floor(totalCost * 10 ** decimals)); // Simplified - assumes 1 USD = 1 native token unit
  
  if (paymentBalance < requiredAmount) {
    const availableUsd = Number(paymentBalance) / 10 ** decimals;
    throw new BadRequestException(
      `Insufficient payment balance. Required: ${totalCost} USD, Available: ${availableUsd} USD`
    );
  }
}
```

### Testing Instructions

1. **Unit Test:**
   - Mock `BalanceService.getPaymentTokenBalance()`
   - Test with sufficient balance (order should be created)
   - Test with insufficient balance (should throw BadRequestException)
   - Test with missing wallet (should throw error or handle gracefully)

2. **Integration Test:**
   - Create user with wallet and balance
   - Create buy order with sufficient balance (should succeed)
   - Create buy order with insufficient balance (should fail)
   - Verify error message

### Files to Modify

- `src/orders/services/orders.service.ts`

### Dependencies

- `BalanceService.getPaymentTokenBalance()` (must be implemented first by Agent 3)

### Success Criteria

- ✅ Buy orders validated for payment balance
- ✅ Orders rejected if insufficient balance
- ✅ Clear error messages for users
- ✅ Orders created if sufficient balance

---

## 📋 Agent 5: Transaction Status Implementation (Optional)

**Developer:** [Your Name]  
**Priority:** ⚠️ LOW (Nice to have, not critical)  
**Estimated Time:** 2-3 days  
**Dependencies:** None (can start anytime)

### Context

**Goal:** Implement `BlockchainService.getTransaction()` to get transaction status from blockchain.

**Current Status:**
- File: `src/blockchain/services/blockchain.service.ts`
- Method: `getTransaction()` (lines ~130-153)
- Current behavior: Returns mock status
- Called by: Transaction confirmation flows

**Options:**
1. Check if OASIS API has transaction status endpoint
2. Use direct blockchain RPC (`@solana/web3.js` or `ethers.js`)

### Implementation Options

**Option A: OASIS API** (preferred if available)
- Check OASIS API for transaction status endpoint
- Use OASIS service method if available

**Option B: Direct Blockchain RPC** (if OASIS doesn't have endpoint)
- Install `@solana/web3.js` for Solana
- Install `ethers` for Ethereum (may already be installed)
- Use RPC providers to query transaction status

### Recommended Approach

1. First check OASIS API documentation for transaction status endpoint
2. If available: Use Option A
3. If not: Use Option B with blockchain RPC

### Files to Modify

- `src/blockchain/services/blockchain.service.ts`
- `package.json` (if installing blockchain SDKs)

### Testing

- Test with confirmed transaction
- Test with pending transaction
- Test with failed transaction
- Test with invalid transaction hash

---

## 📊 Implementation Timeline

### Week 1: Critical Stubs
- **Agent 1:** Trade Execution (Days 1-3)
- **Agent 2:** Withdrawals (Days 1-3, parallel with Agent 1)

### Week 2: Balance & Validation
- **Agent 3:** Payment Token Balance (Days 1-2)
- **Agent 4:** Order Validation (Day 3, after Agent 3)

### Week 3: Optional
- **Agent 5:** Transaction Status (if needed)

---

## 📝 Shared Notes & Considerations

### Development Standards

**Linting & Formatting:**
- ⚠️ **Use Biome for linting and formatting, NOT ESLint**
- Biome is configured for this project
- Run `npm run lint` to check code
- Run `npm run format` to format code
- Run `npm run lint:fix` to auto-fix issues

**Code Style:**
- Follow existing code patterns in the codebase
- Use TypeScript strict mode
- Use async/await for async operations
- Use proper error handling and logging

### OASIS API Context

**Available Services:**
- `OasisWalletService.sendToken()` - Send tokens between avatars
- `OasisWalletService.getBalance()` - Get wallet balance
- `OasisWalletService.getDefaultWallet()` - Get default wallet
- `OasisWalletService.getWallets()` - Get all wallets for avatar

**OASIS API Limitations:**
- External address withdrawals: May only support avatar-to-avatar transfers
- Transaction status: May not have dedicated endpoint
- Token balances: May only return native token (SOL, ETH), not ERC-20/SPL tokens

### Common Dependencies

**Modules:**
- `OasisWalletService` is global (provided by `OasisModule` marked `@Global()`)
- User entities have `avatarId` field
- Asset entities have `symbol` field

**Repositories:**
- `UserRepository` - TypeORM repository for User entity
- `AssetRepository` - Available via DataSource in services

### Testing Strategy

**Unit Tests:**
- Mock OASIS services
- Test error handling
- Test edge cases

**Integration Tests:**
- Use testnet (Solana devnet, Ethereum sepolia)
- Verify transactions on blockchain explorers
- Test end-to-end flows

**Manual Testing:**
- Test with real OASIS API (testnet)
- Verify on blockchain explorers
- Test error scenarios

---

## ✅ Success Criteria Summary

### Agent 1 (Trade Execution)
- ✅ Trades execute on blockchain
- ✅ Transaction hashes stored in trade records

### Agent 2 (Withdrawals)
- ✅ Withdrawals execute to external addresses
- ✅ Transaction hashes stored in transaction records

### Agent 3 (Balance)
- ✅ Payment token balance queries work
- ✅ Returns correct balances

### Agent 4 (Order Validation)
- ✅ Buy orders validated for balance
- ✅ Orders rejected if insufficient balance

### Agent 5 (Transaction Status)
- ✅ Transaction status queries work (if implemented)

---

**Last Updated:** 2025-01-04
