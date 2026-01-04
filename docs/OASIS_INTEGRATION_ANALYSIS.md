# OASIS Integration Analysis

## Executive Summary

This document analyzes how **pangea-repo** currently integrates with **OASIS** and how to leverage OASIS blockchain capabilities to implement the stub methods identified in `STUB_IMPLEMENTATION_PLAN.md`.

**Key Finding:** OASIS provides a comprehensive blockchain abstraction layer that can handle most blockchain operations through its API, eliminating the need for direct blockchain SDK integration in many cases.

---

## Current OASIS Integration in Pangea-Repo

### 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Pangea Backend (NestJS)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │ OasisAuthService│  │OasisWalletService│  │OasisTokenMgr ││
│  │                 │  │                 │  │              ││
│  │ - Register      │  │ - Generate     │  │ - Get Token   ││
│  │ - Login         │  │ - Get Wallets  │  │ - Refresh    ││
│  │ - Get Profile   │  │ - Get Balance  │  │ - Cache      ││
│  └─────────────────┘  │ - Send Token   │  └──────────────┘│
│                       │ - Transactions │                  │
│                       └─────────────────┘                  │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/REST API
                        │ (Bearer Token Auth)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              OASIS API (api.oasisweb4.com)                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Avatar API   │  │ Wallet API   │  │ Keys API     │      │
│  │              │  │              │  │              │      │
│  │ - Register   │  │ - Generate   │  │ - Generate   │      │
│  │ - Authenticate│ │ - Get Wallets│  │ - Link Keys  │      │
│  │ - Get Avatar │  │ - Send Token │  │              │      │
│  └──────────────┘  │ - Balance    │  └──────────────┘      │
│                    │ - Transactions│                       │
│                    └──────────────┘                         │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         OASIS Blockchain Providers                   │   │
│  │  (SolanaOASIS, EthereumOASIS, etc.)                 │   │
│  │                                                       │   │
│  │  - Wallet Management                                  │   │
│  │  - Transaction Execution                              │   │
│  │  - Balance Queries                                    │   │
│  │  - Smart Contract Interaction                         │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### 2. Current Services

#### **OasisAuthService** (`src/auth/services/oasis-auth.service.ts`)
- **Purpose:** User authentication and avatar management
- **Endpoints Used:**
  - `POST /api/avatar/register` - Create OASIS avatar
  - `POST /api/avatar/authenticate` - Login
  - `GET /api/avatar/{avatarId}` - Get profile
  - `PUT /api/avatar/{avatarId}` - Update profile
- **Key Feature:** Handles nested OASIS response structures

#### **OasisWalletService** (`src/services/oasis-wallet.service.ts`)
- **Purpose:** Wallet management and operations
- **Endpoints Used:**
  - `POST /api/keys/generate_keypair_for_provider/{providerType}` - Generate keypair
  - `POST /api/keys/link_provider_private_key_to_avatar_by_id` - Link private key
  - `POST /api/keys/link_provider_public_key_to_avatar_by_id` - Link public key
  - `GET /api/wallet/avatar/{avatarId}/wallets/{showOnlyDefault}/{decryptPrivateKeys}` - Get wallets
  - `GET /api/wallet/balance/{walletId}?providerType={providerType}` - Get balance
  - `POST /api/wallet/send_token` - **Send tokens between avatars**
  - `GET /api/wallet/transactions/{walletId}` - Get transaction history
- **Key Feature:** Already has `sendToken()` method that can execute blockchain transactions!

#### **OasisTokenManagerService** (`src/services/oasis-token-manager.service.ts`)
- **Purpose:** Manage OASIS API authentication tokens
- **Features:**
  - Automatic token refresh
  - Redis caching
  - JWT expiration handling

#### **OasisLinkService** (`src/auth/services/oasis-link.service.ts`)
- **Purpose:** Link Better-Auth users to OASIS avatars
- **Features:**
  - Lazy avatar creation
  - User-to-avatar mapping

---

## OASIS Blockchain Capabilities

### 1. Available OASIS API Endpoints for Blockchain Operations

Based on the codebase analysis, OASIS provides these blockchain-related endpoints:

#### **Wallet Operations:**
```http
POST /api/wallet/send_token
Body: {
  fromAvatarId: string,
  toAvatarId: string,
  amount: number,
  tokenSymbol: string,
  providerType: string,
  walletId: string
}
Response: {
  transactionHash: string,
  success: boolean
}
```

#### **Balance Operations:**
```http
GET /api/wallet/balance/{walletId}?providerType={providerType}
Response: {
  balance: number,
  tokenSymbol: string,
  providerType: string
}
```

#### **Transaction History:**
```http
GET /api/wallet/transactions/{walletId}?limit={limit}&offset={offset}
Response: Transaction[]
```

### 2. OASIS Blockchain Providers

OASIS has built-in providers for:
- **SolanaOASIS** - Full Solana blockchain integration
- **EthereumOASIS** - Full Ethereum/EVM blockchain integration
- **BaseOASIS**, **PolygonOASIS**, **ArbitrumOASIS**, etc. - EVM-compatible chains

Each provider implements:
- Wallet management
- Transaction execution
- Balance queries
- Smart contract interaction (via OASIS API)

### 3. Key Insight: OASIS Handles Blockchain Complexity

**Instead of directly using:**
- `@solana/web3.js` 
- `ethers.js`
- Direct RPC calls

**We can use:**
- OASIS API endpoints that abstract blockchain operations
- OASIS handles wallet signing, transaction building, and confirmation
- OASIS manages provider-specific differences

---

## Implementation Strategy: Using OASIS for Stub Methods

### Strategy 1: Use OASIS API (Recommended for Most Cases)

**Advantages:**
- ✅ No need to manage blockchain SDKs
- ✅ No need to handle private keys directly
- ✅ OASIS handles provider differences
- ✅ Built-in error handling and retries
- ✅ Already integrated in pangea-repo

**Disadvantages:**
- ❌ Less control over transaction details
- ❌ Dependency on OASIS API availability
- ❌ May have rate limits

### Strategy 2: Direct Blockchain SDK (For Advanced Cases)

**Use when:**
- Need fine-grained control
- OASIS API doesn't support specific operation
- Performance is critical

---

## Detailed Implementation Plan

### 1. `BlockchainService.executeTrade()` - **USE OASIS API**

**Current Stub:** Returns mock transaction hash

**OASIS-Based Implementation:**

```typescript
async executeTrade(params: ExecuteTradeParams): Promise<string> {
  const { buyer, seller, asset, quantity, price } = params;

  this.logger.log(
    `Executing trade via OASIS: ${asset.blockchain}, asset ${asset.id}, quantity ${quantity}, price ${price}`,
  );

  // 1. Get buyer and seller avatar IDs
  const buyerAvatarId = await this.getAvatarId(buyer.id);
  const sellerAvatarId = await this.getAvatarId(seller.id);

  if (!buyerAvatarId || !sellerAvatarId) {
    throw new Error('Buyer or seller does not have OASIS avatar');
  }

  // 2. Get wallets for both avatars
  const buyerWallets = await this.oasisWalletService.getWallets(
    buyerAvatarId,
    asset.blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS'
  );
  const sellerWallets = await this.oasisWalletService.getWallets(
    sellerAvatarId,
    asset.blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS'
  );

  if (buyerWallets.length === 0 || sellerWallets.length === 0) {
    throw new Error('Buyer or seller does not have wallet for this blockchain');
  }

  const buyerWallet = buyerWallets[0];
  const sellerWallet = sellerWallets[0];

  // 3. Calculate payment amount (in payment token, e.g., USDC)
  const totalPayment = price * quantity;
  
  // 4. Send payment token from buyer to seller (via OASIS)
  // This executes the payment part of the trade
  const paymentResult = await this.oasisWalletService.sendToken({
    fromAvatarId: buyerAvatarId,
    toAvatarId: sellerAvatarId,
    amount: totalPayment,
    tokenSymbol: asset.blockchain === 'solana' ? 'USDC' : 'USDC', // Payment token
    providerType: asset.blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS',
    walletId: buyerWallet.walletId,
  });

  // 5. Send asset tokens from seller to buyer (via OASIS)
  // This executes the asset transfer part of the trade
  const assetTransferResult = await this.oasisWalletService.sendToken({
    fromAvatarId: sellerAvatarId,
    toAvatarId: buyerAvatarId,
    amount: quantity,
    tokenSymbol: asset.symbol || asset.id, // Asset token symbol
    providerType: asset.blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS',
    walletId: sellerWallet.walletId,
  });

  // 6. Return the transaction hash (use payment transaction as primary)
  this.logger.log(
    `Trade executed via OASIS. Payment tx: ${paymentResult.transactionHash}, Asset tx: ${assetTransferResult.transactionHash}`
  );

  return paymentResult.transactionHash;
}
```

**Dependencies Needed:**
- Inject `OasisWalletService`
- Inject `OasisLinkService` (for avatar ID lookup)

---

### 2. `BlockchainService.withdraw()` - **USE OASIS API**

**Current Stub:** Returns mock transaction hash

**OASIS-Based Implementation:**

```typescript
async withdraw(params: {
  user: string;
  asset: string;
  amount: bigint;
  toAddress: string;
  blockchain: string;
}): Promise<string> {
  const { user, asset, amount, toAddress, blockchain } = params;

  this.logger.log(
    `Executing withdrawal via OASIS: asset ${asset}, amount ${amount}, to ${toAddress}`,
  );

  // 1. Get user avatar ID
  const avatarId = await this.oasisLinkService.getAvatarId(user);
  if (!avatarId) {
    throw new Error(`User ${user} does not have OASIS avatar`);
  }

  // 2. Get user's wallet
  const providerType = blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS';
  const wallets = await this.oasisWalletService.getWallets(avatarId, providerType);
  
  if (wallets.length === 0) {
    throw new Error(`User ${user} does not have ${blockchain} wallet`);
  }

  const wallet = wallets[0];

  // 3. Get recipient avatar ID (if exists) or use address
  // For external addresses, we may need a different approach
  // OASIS send_token requires avatar IDs, so we might need:
  // - Option A: Create a temporary avatar for external address
  // - Option B: Use direct blockchain SDK for external withdrawals
  // - Option C: Check if OASIS has a direct withdrawal endpoint

  // For now, assuming we can send to external address via OASIS
  // If not, fall back to direct blockchain SDK
  try {
    // Try to find recipient avatar by address
    const recipientWallet = await this.oasisWalletService.getWalletByPublicKey(toAddress);
    
    if (recipientWallet) {
      // Recipient has OASIS avatar, use send_token
      const result = await this.oasisWalletService.sendToken({
        fromAvatarId: avatarId,
        toAvatarId: recipientWallet.avatarId,
        amount: Number(amount),
        tokenSymbol: asset, // Asset symbol
        providerType: providerType,
        walletId: wallet.walletId,
      });
      
      return result.transactionHash;
    } else {
      // External address - need direct blockchain SDK
      return await this.withdrawToExternalAddress(params, wallet, providerType);
    }
  } catch (error) {
    // Fallback to direct blockchain SDK
    return await this.withdrawToExternalAddress(params, wallet, providerType);
  }
}

// Fallback method using direct blockchain SDK
private async withdrawToExternalAddress(
  params: { amount: bigint; toAddress: string; blockchain: string },
  wallet: Wallet,
  providerType: string
): Promise<string> {
  // This would use direct SDK (@solana/web3.js or ethers)
  // See STUB_IMPLEMENTATION_PLAN.md for direct SDK implementation
  throw new Error('External address withdrawal requires direct blockchain SDK - not yet implemented');
}
```

---

### 3. `BlockchainService.getTransaction()` - **USE OASIS API**

**Current Stub:** Returns mock data

**OASIS-Based Implementation:**

```typescript
async getTransaction(
  transactionHash: string,
  blockchain: string,
): Promise<{
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: bigint;
  fromAddress?: string;
  toAddress?: string;
  amount?: bigint;
  confirmations?: number;
}> {
  this.logger.log(
    `Getting transaction ${transactionHash} from OASIS`,
  );

  // Option 1: Query OASIS transaction history
  // Get all wallets and search their transaction history
  // This is less efficient but works if OASIS stores transaction data

  // Option 2: Use direct blockchain RPC (more efficient)
  // For now, we'll use a hybrid approach:
  // - Try to get from OASIS transaction history first
  // - Fall back to direct blockchain query if not found

  // Since OASIS API doesn't have a direct "get transaction by hash" endpoint,
  // we'll need to use direct blockchain SDK for this
  // See STUB_IMPLEMENTATION_PLAN.md for direct SDK implementation
  
  // For now, return a placeholder that indicates we need direct SDK
  return {
    status: 'pending',
    // Will need direct blockchain SDK implementation
  };
}
```

**Note:** OASIS API doesn't appear to have a direct "get transaction by hash" endpoint, so this will likely need direct blockchain SDK.

---

### 4. `BlockchainService.monitorVaultDeposits()` - **HYBRID APPROACH**

**Current Stub:** Returns empty array

**OASIS-Based Implementation:**

```typescript
async monitorVaultDeposits(
  vaultAddress: string,
  blockchain: string,
  sinceBlock?: bigint,
): Promise<Array<{
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: bigint;
  blockNumber: bigint;
  timestamp: Date;
}>> {
  this.logger.log(
    `Monitoring vault ${vaultAddress} on ${blockchain} for deposits`,
  );

  // Option 1: If vault is an OASIS avatar wallet
  // We can query OASIS transaction history
  try {
    const vaultWallet = await this.oasisWalletService.getWalletByPublicKey(vaultAddress);
    
    if (vaultWallet) {
      // Get transaction history from OASIS
      const transactions = await this.oasisWalletService.getTransactions(
        vaultWallet.walletId,
        100, // limit
        0    // offset
      );

      // Filter for incoming transactions (deposits)
      return transactions
        .filter(tx => tx.type === 'receive' || tx.type === 'deposit')
        .map(tx => ({
          transactionHash: tx.transactionHash,
          fromAddress: '', // May not be in OASIS response
          toAddress: vaultAddress,
          amount: BigInt(tx.amount),
          blockNumber: BigInt(0), // May not be in OASIS response
          timestamp: new Date(tx.timestamp),
        }));
    }
  } catch (error) {
    this.logger.warn(`Vault ${vaultAddress} not found in OASIS, using direct blockchain query`);
  }

  // Option 2: Direct blockchain query (for external vaults)
  // See STUB_IMPLEMENTATION_PLAN.md for direct SDK implementation
  return [];
}
```

---

### 5. `BalanceService.getPaymentTokenBalance()` - **USE OASIS API**

**Current Stub:** Returns `BigInt(0)`

**OASIS-Based Implementation:**

```typescript
async getPaymentTokenBalance(
  userId: string,
  blockchain: string,
): Promise<bigint> {
  this.logger.log(
    `Getting payment token balance for user ${userId} on ${blockchain}`,
  );

  // 1. Get user avatar ID
  const avatarId = await this.oasisLinkService.getAvatarId(userId);
  if (!avatarId) {
    return BigInt(0);
  }

  // 2. Get user's wallet
  const providerType = blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS';
  const wallets = await this.oasisWalletService.getWallets(avatarId, providerType);
  
  if (wallets.length === 0) {
    return BigInt(0);
  }

  const wallet = wallets[0];

  // 3. Get balance from OASIS
  // For payment tokens (USDC), we may need to:
  // - Query native token balance (SOL/ETH) first
  // - Query USDC balance separately if OASIS supports it
  
  try {
    // Get native token balance
    const balance = await this.oasisWalletService.getBalance(
      wallet.walletId,
      providerType
    );

    // For USDC, we might need a different approach:
    // - Check if OASIS API supports token-specific balance queries
    // - Or use direct blockchain SDK to query USDC token account
    
    // For now, return native token balance
    // TODO: Add USDC balance query when available
    return BigInt(Math.floor(balance.balance));
  } catch (error) {
    this.logger.error(`Failed to get balance: ${error.message}`);
    return BigInt(0);
  }
}
```

---

## Implementation Priority with OASIS

### Phase 1: High-Value OASIS Integrations (Easiest)

1. ✅ **`BalanceService.getPaymentTokenBalance()`** - Use `OasisWalletService.getBalance()`
2. ✅ **`BlockchainService.executeTrade()`** - Use `OasisWalletService.sendToken()` (with some modifications)
3. ✅ **`BlockchainService.withdraw()`** - Use `OasisWalletService.sendToken()` (for internal transfers)

### Phase 2: Hybrid Approach (OASIS + Direct SDK)

4. ⚠️ **`BlockchainService.getTransaction()`** - Direct SDK (OASIS doesn't have this endpoint)
5. ⚠️ **`BlockchainService.monitorVaultDeposits()`** - Hybrid (OASIS for known wallets, SDK for external)
6. ⚠️ **`BlockchainService.withdraw()`** - Hybrid (OASIS for internal, SDK for external addresses)

### Phase 3: Direct SDK Only

7. 🔧 **Transaction confirmation waiting** - Direct SDK (more control)
8. 🔧 **Advanced transaction monitoring** - Direct SDK (real-time)

---

## Required Service Injections

Update `BlockchainService` constructor:

```typescript
constructor(
  private readonly oasisWalletService: OasisWalletService,
  private readonly oasisLinkService: OasisLinkService,
  // Keep direct SDK clients for fallback/advanced operations
  // private readonly solanaConnection?: Connection,
  // private readonly ethereumProvider?: ethers.providers.JsonRpcProvider,
) {}
```

Update `BalanceService` constructor:

```typescript
constructor(
  @InjectRepository(UserBalance)
  private balanceRepository: Repository<UserBalance>,
  private readonly oasisWalletService: OasisWalletService,
  private readonly oasisLinkService: OasisLinkService,
) {}
```

---

## OASIS API Limitations & Workarounds

### 1. **No Direct Transaction Query by Hash**
- **Workaround:** Use direct blockchain SDK
- **Impact:** Medium - needed for transaction status checks

### 2. **Send Token Requires Avatar IDs**
- **Workaround:** For external addresses, use direct SDK
- **Impact:** Low - most transfers are between OASIS users

### 3. **Token-Specific Balance Queries**
- **Workaround:** May need direct SDK for USDC/ERC20 token balances
- **Impact:** Medium - needed for payment token validation

### 4. **Transaction Confirmation Waiting**
- **Workaround:** Use direct SDK for real-time confirmation
- **Impact:** Low - can poll OASIS transaction history

---

## Recommended Implementation Approach

### **Start with OASIS API (80% of use cases)**

1. Implement trade execution using `OasisWalletService.sendToken()`
2. Implement balance queries using `OasisWalletService.getBalance()`
3. Implement withdrawals for internal transfers

### **Add Direct SDK for Edge Cases (20% of use cases)**

4. Add direct SDK for external address withdrawals
5. Add direct SDK for transaction status queries
6. Add direct SDK for real-time monitoring

### **Benefits of This Approach:**

- ✅ Faster implementation (leverage existing OASIS integration)
- ✅ Less code to maintain (OASIS handles complexity)
- ✅ Better error handling (OASIS has retry logic)
- ✅ Multi-chain support (OASIS handles provider differences)
- ✅ Security (OASIS manages private keys)

---

## Next Steps

1. **Update `BlockchainService`** to inject OASIS services
2. **Implement `executeTrade()`** using `OasisWalletService.sendToken()`
3. **Implement `getPaymentTokenBalance()`** using `OasisWalletService.getBalance()`
4. **Test with OASIS devnet/testnet**
5. **Add direct SDK fallbacks** for edge cases
6. **Update `STUB_IMPLEMENTATION_PLAN.md`** with OASIS-based implementations

---

## Conclusion

**OASIS provides a powerful abstraction layer** that can handle most blockchain operations through its API. By leveraging the existing `OasisWalletService` integration, we can implement the stub methods with:

- **Less code** (no direct SDK management)
- **Better security** (OASIS handles keys)
- **Faster development** (API calls vs SDK setup)
- **Multi-chain support** (OASIS handles differences)

For edge cases (external addresses, advanced queries), we can add direct blockchain SDK implementations as fallbacks.


