# Stub Implementation Plan

This document outlines what needs to be implemented for the stub methods identified in the codebase.

## Overview

**Total Stubs Found:** 5 main areas
- `BlockchainService` - 5 methods (critical for trade execution)
- `BalanceService` - 2 methods (payment token balance, lock balance)
- `OrdersService` - 1 TODO (payment token balance check)
- `WalletController` - 1 TODO (wallet linking)

---

## 1. BlockchainService Implementation

**File:** `src/blockchain/services/blockchain.service.ts`

### 1.1 `executeTrade()` - **CRITICAL**

**Current Status:** Returns mock transaction hash

**What Needs to be Implemented:**

1. **Dependencies Required:**
   ```bash
   npm install @solana/web3.js @solana/spl-token
   # ethers is already installed
   ```

2. **Configuration Needed:**
   - Add to `.env`:
     ```env
     SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
     SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
     ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
     ETHEREUM_DEVNET_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
     PLATFORM_WALLET_PRIVATE_KEY=<encrypted or env var>
     NETWORK=devnet|mainnet
     ```

3. **Implementation Steps:**

   **For Solana:**
   ```typescript
   async executeSolanaTrade(params: ExecuteTradeParams): Promise<string> {
     // 1. Connect to Solana RPC
     const connection = new Connection(
       process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
       'confirmed'
     );
     
     // 2. Get buyer/seller wallet addresses from OASIS
     const buyerWallet = await this.getUserWalletAddress(
       params.buyer.id, 
       'solana'
     );
     const sellerWallet = await this.getUserWalletAddress(
       params.seller.id, 
       'solana'
     );
     
     // 3. Get token mint address from asset
     const mintAddress = new PublicKey(params.asset.mintAddress);
     
     // 4. Get platform wallet (for fees)
     const platformWallet = Keypair.fromSecretKey(
       Buffer.from(process.env.PLATFORM_WALLET_PRIVATE_KEY, 'base64')
     );
     
     // 5. Build transaction:
     //    - Transfer tokens from seller to buyer
     //    - Transfer payment (USDC/SOL) from buyer to seller
     //    - Transfer platform fee to platform wallet
     
     // 6. Sign and send transaction
     const transaction = new Transaction().add(
       // Token transfer instruction
       createTransferCheckedInstruction(
         sellerTokenAccount,
         mintAddress,
         buyerTokenAccount,
         sellerWallet,
         params.quantity,
         decimals
       ),
       // Payment transfer instruction
       // Fee transfer instruction
     );
     
     const signature = await connection.sendTransaction(
       transaction,
       [sellerKeypair, buyerKeypair, platformWallet]
     );
     
     // 7. Wait for confirmation
     await connection.confirmTransaction(signature, 'confirmed');
     
     return signature;
   }
   ```

   **For Ethereum:**
   ```typescript
   async executeEthereumTrade(params: ExecuteTradeParams): Promise<string> {
     // 1. Connect to Ethereum provider
     const provider = new ethers.providers.JsonRpcProvider(
       process.env.ETHEREUM_RPC_URL
     );
     
     // 2. Get wallet addresses
     const buyerWallet = await this.getUserWalletAddress(
       params.buyer.id, 
       'ethereum'
     );
     const sellerWallet = await this.getUserWalletAddress(
       params.seller.id, 
       'ethereum'
     );
     
     // 3. Load smart contract ABI (Trade Execution Contract)
     const tradeContract = new ethers.Contract(
       params.asset.contractAddress,
       TRADE_EXECUTION_ABI,
       provider
     );
     
     // 4. Get signer (platform wallet or user wallet)
     const signer = new ethers.Wallet(
       process.env.PLATFORM_WALLET_PRIVATE_KEY,
       provider
     );
     
     // 5. Execute trade via contract
     const tx = await tradeContract.connect(signer).executeTrade(
       buyerWallet,
       sellerWallet,
       params.asset.contractAddress,
       params.quantity,
       params.price,
       {
         gasLimit: 500000,
       }
     );
     
     // 6. Wait for confirmation
     await tx.wait();
     
     return tx.hash;
   }
   ```

4. **Required Smart Contracts:**
   - **Trade Execution Contract** (already deployed via `SmartContractService`)
   - Contract must have `executeTrade()` method
   - Contract address should be stored in asset metadata

5. **Error Handling:**
   - Handle insufficient balance errors
   - Handle network errors (retry logic)
   - Handle transaction failures (revert handling)

---

### 1.2 `waitForConfirmation()` - **CRITICAL**

**Current Status:** Simulates 1 second delay

**What Needs to be Implemented:**

```typescript
private async waitForConfirmation(
  transactionHash: string,
  blockchain: string,
  maxWaitTime: number = 60000 // 60 seconds
): Promise<void> {
  const startTime = Date.now();
  
  if (blockchain === 'solana') {
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    );
    
    const signature = new PublicKey(transactionHash);
    
    // Poll for confirmation
    while (Date.now() - startTime < maxWaitTime) {
      const status = await connection.getSignatureStatus(signature);
      
      if (status?.value?.confirmationStatus === 'confirmed' || 
          status?.value?.confirmationStatus === 'finalized') {
        this.logger.log(`Transaction ${transactionHash} confirmed`);
        return;
      }
      
      if (status?.value?.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
    }
    
    throw new Error(`Transaction confirmation timeout: ${transactionHash}`);
  } else if (blockchain === 'ethereum') {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
    
    // Wait for transaction receipt
    const receipt = await provider.waitForTransaction(
      transactionHash,
      1, // 1 confirmation
      maxWaitTime
    );
    
    if (receipt.status === 0) {
      throw new Error(`Transaction reverted: ${transactionHash}`);
    }
    
    this.logger.log(`Transaction ${transactionHash} confirmed`);
  }
}
```

---

### 1.3 `withdraw()` - **HIGH PRIORITY**

**Current Status:** Returns mock transaction hash

**What Needs to be Implemented:**

```typescript
async withdraw(params: {
  user: string;
  asset: string;
  amount: bigint;
  toAddress: string;
  blockchain: string;
}): Promise<string> {
  // 1. Get vault address for asset
  const vaultAddress = await this.vaultService.getVaultAddress(
    params.asset,
    params.blockchain
  );
  
  // 2. Get user wallet address
  const userWallet = await this.getUserWalletAddress(params.user, params.blockchain);
  
  if (params.blockchain === 'solana') {
    // 3. Connect to Solana
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    
    // 4. Load vault program
    const vaultProgram = new Program(VAULT_IDL, vaultAddress, { connection });
    
    // 5. Call withdraw instruction
    const tx = await vaultProgram.methods
      .withdraw(new BN(params.amount.toString()))
      .accounts({
        vault: vaultAddress,
        user: userWallet,
        destination: params.toAddress,
        authority: process.env.PLATFORM_WALLET,
      })
      .rpc();
    
    return tx;
  } else if (params.blockchain === 'ethereum') {
    // 3. Load vault contract
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
    const vaultContract = new ethers.Contract(
      vaultAddress,
      VAULT_ABI,
      provider
    );
    
    // 4. Get signer
    const signer = new ethers.Wallet(
      process.env.PLATFORM_WALLET_PRIVATE_KEY,
      provider
    );
    
    // 5. Call withdraw
    const tx = await vaultContract.connect(signer).withdraw(
      params.toAddress,
      params.amount,
      { gasLimit: 300000 }
    );
    
    await tx.wait();
    return tx.hash;
  }
}
```

**Dependencies:**
- Vault contract must be deployed (already handled by `VaultService`)
- Vault contract ABI/IDL needed

---

### 1.4 `getTransaction()` - **MEDIUM PRIORITY**

**Current Status:** Returns mock data

**What Needs to be Implemented:**

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
  if (blockchain === 'solana') {
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    const signature = new PublicKey(transactionHash);
    
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!tx) {
      return { status: 'pending' };
    }
    
    const slot = tx.slot;
    const currentSlot = await connection.getSlot();
    const confirmations = currentSlot - slot;
    
    return {
      status: tx.meta?.err ? 'failed' : 'confirmed',
      blockNumber: BigInt(slot),
      confirmations: confirmations > 0 ? confirmations : 0,
      // Extract from/to addresses from transaction instructions
    };
  } else if (blockchain === 'ethereum') {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
    
    const receipt = await provider.getTransactionReceipt(transactionHash);
    
    if (!receipt) {
      // Check if pending
      const tx = await provider.getTransaction(transactionHash);
      return tx ? { status: 'pending' } : { status: 'failed' };
    }
    
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;
    
    return {
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      blockNumber: BigInt(receipt.blockNumber),
      fromAddress: receipt.from,
      toAddress: receipt.to,
      confirmations,
    };
  }
}
```

---

### 1.5 `monitorVaultDeposits()` - **MEDIUM PRIORITY**

**Current Status:** Returns empty array

**What Needs to be Implemented:**

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
  if (blockchain === 'solana') {
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    
    // Get program accounts for the vault
    const accounts = await connection.getProgramAccounts(
      new PublicKey(vaultAddress),
      {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: vaultAddress, // Filter by vault address
            },
          },
        ],
      }
    );
    
    // Parse account data to extract transactions
    // This is complex - may need to use webhook or polling service
    
    // Alternative: Use Solana transaction history API
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(vaultAddress),
      { limit: 100 }
    );
    
    const transactions = [];
    for (const sig of signatures) {
      const tx = await connection.getTransaction(sig.signature);
      if (tx && tx.meta && !tx.meta.err) {
        // Parse transaction to extract deposit info
        transactions.push({
          transactionHash: sig.signature,
          fromAddress: '', // Extract from transaction
          toAddress: vaultAddress,
          amount: BigInt(0), // Extract from transaction
          blockNumber: BigInt(sig.slot),
          timestamp: new Date(sig.blockTime * 1000),
        });
      }
    }
    
    return transactions;
  } else if (blockchain === 'ethereum') {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
    
    // Get current block
    const currentBlock = await provider.getBlockNumber();
    const startBlock = sinceBlock 
      ? Number(sinceBlock) 
      : currentBlock - 1000; // Last 1000 blocks
    
    const transactions = [];
    
    // Scan blocks for transactions to vault
    for (let i = startBlock; i <= currentBlock; i++) {
      const block = await provider.getBlockWithTransactions(i);
      
      for (const tx of block.transactions) {
        if (tx.to?.toLowerCase() === vaultAddress.toLowerCase()) {
          const receipt = await provider.getTransactionReceipt(tx.hash);
          
          if (receipt && receipt.status === 1) {
            transactions.push({
              transactionHash: tx.hash,
              fromAddress: tx.from,
              toAddress: tx.to!,
              amount: tx.value,
              blockNumber: BigInt(receipt.blockNumber),
              timestamp: new Date(block.timestamp * 1000),
            });
          }
        }
      }
    }
    
    return transactions;
  }
  
  return [];
}
```

**Note:** This method is expensive. Consider:
- Using webhooks/events instead of polling
- Implementing caching
- Using a blockchain indexing service (The Graph, Alchemy, etc.)

---

## 2. BalanceService Implementation

**File:** `src/orders/services/balance.service.ts`

### 2.1 `lockBalance()` - **HIGH PRIORITY**

**Current Status:** TODO comment, not implemented

**What Needs to be Implemented:**

```typescript
async lockBalance(
  userId: string,
  assetId: string,
  quantity: bigint,
): Promise<void> {
  this.logger.log(
    `Locking balance: user ${userId}, asset ${assetId}, quantity ${quantity}`,
  );

  const balance = await this.getBalance(userId, assetId);

  if (balance.availableBalance < quantity) {
    throw new BadRequestException('Insufficient available balance');
  }

  balance.availableBalance -= quantity;
  balance.lockedBalance += quantity;

  await this.balanceRepository.save(balance);
  
  this.logger.log(
    `Balance locked: ${quantity} for user ${userId}, asset ${assetId}`
  );
}
```

**Note:** The entity already exists (`UserBalance`), so this should work immediately.

---

### 2.2 `getPaymentTokenBalance()` - **HIGH PRIORITY**

**Current Status:** Returns `BigInt(0)`

**What Needs to be Implemented:**

```typescript
async getPaymentTokenBalance(
  userId: string,
  blockchain: string,
): Promise<bigint> {
  this.logger.log(
    `Getting payment token balance for user ${userId} on ${blockchain}`,
  );

  // 1. Get user's avatar ID
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user || !user.avatarId) {
    throw new NotFoundException(`User ${userId} not found or has no avatar`);
  }

  // 2. Get user's wallet address
  const walletAddress = blockchain === 'solana' 
    ? user.walletAddressSolana 
    : user.walletAddressEthereum;

  if (!walletAddress) {
    // Try to get from OASIS
    const wallets = await this.oasisWalletService.getWallets(user.avatarId);
    const wallet = wallets.find(w => 
      w.providerType === (blockchain === 'solana' ? 'SolanaOASIS' : 'EthereumOASIS')
    );
    
    if (!wallet) {
      return BigInt(0);
    }
    
    walletAddress = wallet.walletAddress;
  }

  // 3. Query blockchain for balance
  if (blockchain === 'solana') {
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    const publicKey = new PublicKey(walletAddress);
    
    // Get SOL balance
    const balance = await connection.getBalance(publicKey);
    
    // If USDC is needed, query SPL token account
    // const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mainnet
    // const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    //   publicKey,
    //   { mint: usdcMint }
    // );
    // const usdcBalance = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
    
    return BigInt(balance);
  } else if (blockchain === 'ethereum') {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
    
    // Get ETH balance
    const balance = await provider.getBalance(walletAddress);
    
    // If USDC is needed, query ERC20 contract
    // const usdcContract = new ethers.Contract(
    //   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC mainnet
    //   ['function balanceOf(address) view returns (uint256)'],
    //   provider
    // );
    // const usdcBalance = await usdcContract.balanceOf(walletAddress);
    
    return balance;
  }

  return BigInt(0);
}
```

**Dependencies:**
- Need to inject `OasisWalletService` and `User` repository
- Need to determine payment token (USDC vs native token)

---

## 3. OrdersService TODO

**File:** `src/orders/services/orders.service.ts`

### 3.1 Payment Token Balance Check (Line 153)

**Current Status:** TODO comment, warning logged

**What Needs to be Implemented:**

```typescript
// In validateOrder() method, replace the TODO:
else if (dto.orderType === 'buy') {
  // Validate user has enough funds (USDC or native token)
  const totalCost = dto.pricePerTokenUsd * dto.quantity;
  
  const paymentBalance = await this.balanceService.getPaymentTokenBalance(
    userId,
    dto.blockchain || 'solana',
  );
  
  // Convert totalCost to payment token units (assuming 6 decimals for USDC)
  const requiredAmount = BigInt(Math.floor(totalCost * 1_000_000));
  
  if (paymentBalance < requiredAmount) {
    throw new BadRequestException(
      `Insufficient payment balance. Required: ${totalCost} USD, Available: ${Number(paymentBalance) / 1_000_000} USD`
    );
  }
}
```

**Note:** This depends on `BalanceService.getPaymentTokenBalance()` being implemented.

---

## 4. WalletController TODO

**File:** `src/wallet/wallet.controller.ts`

### 4.1 Wallet Linking (Line 264)

**Current Status:** TODO comment

**What Needs to be Implemented:**

```typescript
// In connectWallet() method, after wallet verification:
// TODO: Link wallet to user account in database
await this.userService.linkWallet(
  userId, 
  dto.walletAddress, 
  dto.blockchain
);

// Or if using User entity directly:
const user = await this.userRepository.findOne({ where: { id: userId } });
if (user) {
  if (dto.blockchain === 'solana') {
    user.walletAddressSolana = dto.walletAddress;
  } else if (dto.blockchain === 'ethereum') {
    user.walletAddressEthereum = dto.walletAddress;
  }
  await this.userRepository.save(user);
}
```

**Dependencies:**
- Need to inject `User` repository or `UserService`
- User entity already has `walletAddressSolana` and `walletAddressEthereum` fields

---

## Implementation Priority

### Phase 1: Critical (Required for Trade Execution)
1. ✅ `BlockchainService.executeTrade()` - **MUST HAVE**
2. ✅ `BlockchainService.waitForConfirmation()` - **MUST HAVE**
3. ✅ `BalanceService.lockBalance()` - **MUST HAVE**

### Phase 2: High Priority (Required for Withdrawals)
4. ✅ `BlockchainService.withdraw()` - **HIGH**
5. ✅ `BalanceService.getPaymentTokenBalance()` - **HIGH**
6. ✅ `OrdersService.validateOrder()` payment check - **HIGH**

### Phase 3: Medium Priority (Required for Monitoring)
7. ✅ `BlockchainService.getTransaction()` - **MEDIUM**
8. ✅ `BlockchainService.monitorVaultDeposits()` - **MEDIUM**

### Phase 4: Nice to Have
9. ✅ `WalletController.connectWallet()` linking - **LOW**

---

## Required Environment Variables

Add to `.env`:

```env
# Blockchain RPC Endpoints
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETHEREUM_DEVNET_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Network Configuration
NETWORK=devnet  # or mainnet

# Platform Wallet (for signing transactions)
PLATFORM_WALLET_PRIVATE_KEY=<base64-encoded-private-key>
PLATFORM_WALLET_ADDRESS=<wallet-address>

# Payment Tokens
USDC_SOLANA_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
USDC_ETHEREUM_ADDRESS=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```

---

## Required NPM Packages

```bash
npm install @solana/web3.js @solana/spl-token
# ethers is already installed
```

---

## Smart Contract ABIs/IDLs

You'll need:
1. **Trade Execution Contract ABI/IDL** - For executing trades
2. **Vault Contract ABI/IDL** - For deposits/withdrawals
3. **Order Book Contract ABI/IDL** - (Optional, if using on-chain order book)

These should be generated when contracts are deployed via `SmartContractService`.

---

## Testing Strategy

1. **Unit Tests:**
   - Mock blockchain RPC calls
   - Test error handling
   - Test edge cases (insufficient balance, network errors)

2. **Integration Tests:**
   - Use devnet/testnet
   - Test end-to-end trade execution
   - Test withdrawal flow

3. **E2E Tests:**
   - Test with real devnet transactions
   - Monitor transaction confirmations
   - Test vault deposit monitoring

---

## Security Considerations

1. **Private Key Management:**
   - Never commit private keys to git
   - Use environment variables or key management service (AWS KMS, HashiCorp Vault)
   - Consider using hardware wallets for production

2. **Transaction Validation:**
   - Validate all inputs before executing transactions
   - Check balances before executing trades
   - Implement rate limiting

3. **Error Handling:**
   - Handle network failures gracefully
   - Implement retry logic with exponential backoff
   - Log all transaction attempts

4. **Gas/Fee Management:**
   - Set appropriate gas limits
   - Monitor gas prices
   - Implement fee estimation

---

## Next Steps

1. **Set up development environment:**
   - Configure RPC endpoints
   - Set up devnet wallets
   - Deploy test contracts

2. **Implement Phase 1 (Critical):**
   - Start with `executeTrade()` for one blockchain (Solana recommended)
   - Test thoroughly on devnet
   - Then implement for Ethereum

3. **Implement Phase 2:**
   - Withdrawal functionality
   - Payment token balance checking

4. **Implement Phase 3:**
   - Transaction monitoring
   - Vault deposit detection

5. **Production Deployment:**
   - Use mainnet RPC endpoints
   - Set up monitoring and alerting
   - Implement proper error handling and logging


