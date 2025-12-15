# OASIS API Reuse Analysis for Pangea Markets

**Date:** January 2025  
**Purpose:** Identify which OASIS APIs can be reused for Pangea Markets backend

---

## Executive Summary

The OASIS platform has extensive APIs that can significantly reduce development time for Pangea Markets. This analysis identifies which endpoints can be directly reused, which need adaptation, and which need to be built from scratch.

**Key Finding:** ~60-70% of required functionality can leverage existing OASIS APIs!

---

## 1. SmartContractGenerator API Usage

### Understanding the API

The SmartContractGenerator is a .NET 9.0 API that provides:

**Base URL:** `http://localhost:5000/api/v1/contracts`

**Key Endpoints:**

1. **Generate Contract**
   ```typescript
   POST /api/v1/contracts/generate
   Content-Type: multipart/form-data
   
   FormData:
   - JsonFile: File (JSON specification)
   - Language: 'Solidity' | 'Rust' | 'Scrypto'
   
   Optional Headers:
   - X-Payment-Token: string (for x402 payments)
   - X-Wallet-Address: string
   
   Response: File download (ZIP with generated contract)
   ```

2. **Compile Contract**
   ```typescript
   POST /api/v1/contracts/compile
   Content-Type: multipart/form-data
   
   FormData:
   - Source: File (contract source or ZIP)
   - Language: 'Solidity' | 'Rust' | 'Scrypto'
   
   Response: File download (ZIP with compiled artifacts)
   ```

3. **Deploy Contract**
   ```typescript
   POST /api/v1/contracts/deploy
   Content-Type: multipart/form-data
   
   FormData:
   - Language: 'Solidity' | 'Rust' | 'Scrypto'
   - CompiledContractFile: File (.so for Solana, .bin for Ethereum)
   - WalletKeypair: File (for Solana - JSON keypair)
   - Schema: File (for Ethereum/Radix - ABI/schema)
   
   Response: {
     contractAddress: string,
     transactionHash: string,
     // ... deployment details
   }
   ```

4. **AI Generation** (Bonus)
   ```typescript
   POST /api/v1/contracts/generate-ai
   Content-Type: application/json
   
   Body: {
     description: string,
     blockchain: 'solana' | 'ethereum' | 'radix',
     additionalContext?: string
   }
   ```

### Integration Pattern

```typescript
// services/smart-contract.service.ts
import axios from 'axios';
import FormData from 'form-data';

class SmartContractService {
  private baseUrl = process.env.SMART_CONTRACT_GENERATOR_URL || 'http://localhost:5000';
  
  async generateRwaToken(spec: RwaTokenSpec): Promise<string> {
    // 1. Create JSON spec file
    const jsonBlob = new Blob([JSON.stringify(spec)], { type: 'application/json' });
    const jsonFile = new File([jsonBlob], 'spec.json');
    
    // 2. Generate
    const formData = new FormData();
    formData.append('JsonFile', jsonFile);
    formData.append('Language', 'Rust'); // Solana
    
    const generateResponse = await axios.post(
      `${this.baseUrl}/api/v1/contracts/generate`,
      formData,
      { responseType: 'blob' }
    );
    
    // 3. Compile
    const compileFormData = new FormData();
    compileFormData.append('Source', generateResponse.data);
    compileFormData.append('Language', 'Rust');
    
    const compileResponse = await axios.post(
      `${this.baseUrl}/api/v1/contracts/compile`,
      compileFormData,
      { responseType: 'blob' }
    );
    
    // 4. Deploy
    const deployFormData = new FormData();
    deployFormData.append('Language', 'Rust');
    deployFormData.append('CompiledContractFile', compileResponse.data, 'program.so');
    deployFormData.append('WalletKeypair', keypairFile);
    
    const deployResponse = await axios.post(
      `${this.baseUrl}/api/v1/contracts/deploy`,
      deployFormData
    );
    
    return deployResponse.data.contractAddress;
  }
}
```

---

## 2. Wallet Integration (Phantom & MetaMask)

### From meta-bricks-main

**Phantom Integration Pattern:**
```typescript
// Check if Phantom is installed
if (typeof window !== 'undefined' && window.solana?.isPhantom) {
  // Connect
  const response = await window.solana.connect({ onlyIfTrusted: false });
  const publicKey = response.publicKey.toString();
  
  // Use for transactions
  const transaction = new Transaction().add(
    // ... transaction instructions
  );
  
  const signature = await window.solana.signAndSendTransaction(transaction);
}
```

**MetaMask Integration Pattern:**
```typescript
// Check if MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
  // Request account access
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  
  const walletAddress = accounts[0];
  
  // Send transaction
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: walletAddress,
      to: recipientAddress,
      value: amount,
      data: '0x'
    }]
  });
}
```

### Recommended Implementation

```typescript
// services/wallet.service.ts
export class WalletService {
  async connectPhantom(): Promise<string> {
    if (!window.solana?.isPhantom) {
      throw new Error('Phantom wallet not installed');
    }
    
    const response = await window.solana.connect();
    return response.publicKey.toString();
  }
  
  async connectMetaMask(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    return accounts[0];
  }
  
  async verifyOwnership(
    walletAddress: string,
    signature: string,
    message: string,
    blockchain: 'solana' | 'ethereum'
  ): Promise<boolean> {
    // Verify signature matches wallet address
    // This can be done on-chain or using cryptographic verification
  }
}
```

---

## 3. OASIS API Reuse Analysis

### ✅ Directly Reusable APIs (High Priority)

#### 3.1 Authentication & User Management

**Avatar API** - 80+ endpoints available

**Reusable Endpoints:**
```http
POST   /api/avatar/register                    # User registration
POST   /api/avatar/authenticate                 # User login
POST   /api/avatar/refresh-token               # Refresh JWT token
GET    /api/avatar/{avatarId}                  # Get user profile
PUT    /api/avatar/{avatarId}                  # Update user profile
POST   /api/avatar/forgot-password             # Password reset
POST   /api/avatar/reset-password              # Reset password
GET    /api/avatar/verify-email                # Email verification
```

**Usage:**
- ✅ Can replace custom auth implementation
- ✅ Already supports JWT tokens
- ✅ Has email verification
- ✅ Password reset flow included

**Adaptation Needed:**
- Map OASIS "Avatar" concept to Pangea "User"
- May need to add wallet address fields to Avatar model

---

#### 3.2 Wallet Management

**Wallet API** - 25+ endpoints available

**Reusable Endpoints:**
```http
POST   /api/wallet/avatar/{avatarId}/generate   # Generate wallet
GET    /api/wallet/avatar/{avatarId}/wallets    # Get all wallets
GET    /api/wallet/avatar/{avatarId}/default-wallet  # Get default wallet
POST   /api/wallet/set_default_wallet          # Set default wallet
GET    /api/wallet/balance/{walletId}           # Get balance
POST   /api/wallet/refresh_balance              # Refresh balance
POST   /api/wallet/send_token                   # Send tokens
GET    /api/wallet/transactions/{walletId}      # Transaction history
GET    /api/wallet/wallet_by_public_key/{publicKey}  # Get wallet by address
```

**Supported Providers:**
- `SolanaOASIS` - Solana
- `EthereumOASIS` - Ethereum
- `ArbitrumOASIS` - Arbitrum
- `PolygonOASIS` - Polygon
- `BaseOASIS` - Base

**Usage:**
- ✅ Multi-chain wallet support
- ✅ Balance tracking
- ✅ Transaction history
- ✅ Token transfers

**Adaptation Needed:**
- May need to add RWA-specific token operations
- Order book integration (new)

---

#### 3.3 NFT/Token Operations

**NFT API** - 20+ endpoints available

**Reusable Endpoints:**
```http
POST   /api/nft/mint                           # Mint NFT/token
GET    /api/nft/{nftId}                        # Get NFT details
GET    /api/nft/avatar/{avatarId}/nfts         # Get user's NFTs
POST   /api/nft/send-nft                       # Transfer NFT
GET    /api/nft/search                         # Search NFTs
```

**Usage:**
- ✅ Token minting (can be adapted for RWA tokens)
- ✅ Token transfers
- ✅ Metadata management
- ✅ Cross-chain support

**Adaptation Needed:**
- RWA tokens may need different metadata structure
- Order book integration (new)
- Trading operations (new)

---

#### 3.4 Solana Integration

**Solana API** - Direct blockchain operations

**Reusable Endpoints:**
```http
GET    /api/solana/wallet/{address}/balance     # Get SOL balance
POST   /api/solana/wallet                       # Create wallet
GET    /api/solana/wallet/{address}/transactions # Get transactions
POST   /api/solana/transaction/send            # Send transaction
GET    /api/solana/transaction/{signature}      # Get transaction status
GET    /api/solana/token/{mint}/balance         # Get token balance
POST   /api/solana/token/transfer               # Transfer token
```

**Usage:**
- ✅ Direct Solana blockchain operations
- ✅ Transaction management
- ✅ Token operations

**Adaptation Needed:**
- May need custom RWA-specific operations

---

### ⚠️ Partially Reusable APIs (Medium Priority)

#### 3.5 Data Management

**Data API** - 30+ endpoints

**Potentially Useful:**
```http
POST   /api/data/save-holon                    # Save data
GET    /api/data/load-holon/{id}              # Load data
POST   /api/data/search                        # Search data
```

**Usage:**
- Could store asset metadata
- Could store order/trade history
- May be overkill for PostgreSQL-based system

**Decision:** Use PostgreSQL directly for better performance and control

---

#### 3.6 Files API

**Files API** - 6+ endpoints

**Potentially Useful:**
```http
POST   /api/files/upload                       # Upload files
GET    /api/files/{fileId}                     # Get file
```

**Usage:**
- Could store asset images/documents
- May integrate with IPFS

**Decision:** Consider for document storage, but may use direct IPFS integration

---

### ❌ Not Applicable APIs

- **Karma API** - Reputation system (not needed for trading)
- **Social API** - Social features (not needed)
- **Chat/Messaging API** - Communication (not needed)
- **Competition API** - Gaming (not needed)
- **Map API** - Location services (not needed for RWA trading)

---

## 4. Recommended Architecture

### Option A: Full OASIS Integration (Recommended for Speed)

```
Pangea Frontend
    ↓
Pangea Backend API (Thin Layer)
    ↓
OASIS API (Avatar, Wallet, NFT, Solana)
    ↓
Blockchain + SmartContractGenerator
```

**Pros:**
- ✅ Fastest development (60-70% reuse)
- ✅ Proven, tested APIs
- ✅ Multi-chain support built-in
- ✅ Authentication ready

**Cons:**
- ⚠️ Dependency on OASIS API
- ⚠️ May need custom endpoints for trading-specific logic
- ⚠️ Less control over data model

---

### Option B: Hybrid Approach (Recommended for Flexibility)

```
Pangea Frontend
    ↓
Pangea Backend API
    ├── Custom: Orders, Trades, Assets (PostgreSQL)
    ├── OASIS: Authentication (Avatar API)
    ├── OASIS: Wallet Management (Wallet API)
    └── OASIS: Blockchain Operations (Solana API)
    ↓
SmartContractGenerator + Blockchains
```

**Pros:**
- ✅ Best of both worlds
- ✅ Custom trading logic
- ✅ Reuse proven auth/wallet APIs
- ✅ Full control over trading data

**Cons:**
- ⚠️ More development time
- ⚠️ Need to sync data between systems

---

### Option C: Custom Implementation (Not Recommended)

Build everything from scratch.

**Pros:**
- ✅ Full control

**Cons:**
- ❌ Much longer development time
- ❌ Reinventing the wheel
- ❌ More bugs to fix

---

## 5. Implementation Recommendations

### Phase 1: Use OASIS for Foundation

1. **Authentication**
   - Use Avatar API for user registration/login
   - Map Avatar to User in Pangea database
   - Store wallet addresses in Avatar metadata or separate table

2. **Wallet Management**
   - Use Wallet API for wallet generation
   - Use Wallet API for balance queries
   - Use Wallet API for transaction history

3. **Blockchain Operations**
   - Use Solana API for blockchain interactions
   - Use SmartContractGenerator for contract deployment

### Phase 2: Build Custom Trading Layer

1. **Orders & Trades**
   - Custom PostgreSQL tables
   - Custom API endpoints
   - Order matching engine

2. **Assets**
   - Custom PostgreSQL tables
   - Link to OASIS NFT API for token operations
   - Custom metadata structure

### Phase 3: Integration

1. **Sync Data**
   - Sync wallet balances from OASIS
   - Sync transaction history
   - Link OASIS wallets to Pangea users

2. **Smart Contracts**
   - Use SmartContractGenerator for contract deployment
   - Store contract addresses in Pangea database
   - Use OASIS Solana API for contract interactions

---

## 6. Code Examples

### Using OASIS Avatar API for Authentication

```typescript
// services/auth.service.ts
import axios from 'axios';

class AuthService {
  private oasisApiUrl = process.env.OASIS_API_URL || 'https://api.oasisplatform.world';
  
  async register(email: string, password: string, username: string) {
    const response = await axios.post(
      `${this.oasisApiUrl}/api/avatar/register`,
      {
        email,
        password,
        username
      }
    );
    
    return response.data;
  }
  
  async login(email: string, password: string) {
    const response = await axios.post(
      `${this.oasisApiUrl}/api/avatar/authenticate`,
      {
        email,
        password
      }
    );
    
    // Store JWT token
    localStorage.setItem('token', response.data.result.token);
    
    return response.data;
  }
}
```

### Using OASIS Wallet API

```typescript
// services/wallet.service.ts
class WalletService {
  private oasisApiUrl = process.env.OASIS_API_URL;
  
  async generateWallet(avatarId: string, providerType: 'SolanaOASIS' | 'EthereumOASIS') {
    const response = await axios.post(
      `${this.oasisApiUrl}/api/wallet/avatar/${avatarId}/generate`,
      {
        providerType,
        setAsDefault: true
      },
      {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      }
    );
    
    return response.data.result;
  }
  
  async getBalance(walletId: string, providerType: string) {
    const response = await axios.get(
      `${this.oasisApiUrl}/api/wallet/balance/${walletId}?providerType=${providerType}`,
      {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      }
    );
    
    return response.data.result;
  }
}
```

### Using SmartContractGenerator

```typescript
// services/smart-contract.service.ts
class SmartContractService {
  private scGenUrl = process.env.SMART_CONTRACT_GENERATOR_URL || 'http://localhost:5000';
  
  async deployRwaToken(assetSpec: RwaTokenSpec): Promise<string> {
    // 1. Generate
    const generated = await this.generateContract(assetSpec);
    
    // 2. Compile
    const compiled = await this.compileContract(generated);
    
    // 3. Deploy
    const deployed = await this.deployContract(compiled);
    
    return deployed.contractAddress;
  }
  
  private async generateContract(spec: any): Promise<Blob> {
    const formData = new FormData();
    formData.append('JsonFile', new File([JSON.stringify(spec)], 'spec.json'));
    formData.append('Language', 'Rust');
    
    const response = await fetch(`${this.scGenUrl}/api/v1/contracts/generate`, {
      method: 'POST',
      body: formData
    });
    
    return await response.blob();
  }
  
  // ... compile and deploy methods
}
```

---

## 7. Summary & Next Steps

### What Can Be Reused (60-70%)

✅ **Authentication** - Avatar API (80+ endpoints)  
✅ **Wallet Management** - Wallet API (25+ endpoints)  
✅ **Blockchain Operations** - Solana API  
✅ **Token Operations** - NFT API (20+ endpoints)  
✅ **Smart Contract Generation** - SmartContractGenerator API

### What Needs to Be Built (30-40%)

🔨 **Order Management** - Custom PostgreSQL + API  
🔨 **Trade Execution** - Custom matching engine  
🔨 **Asset Management** - Custom RWA-specific structure  
🔨 **Admin Panel** - Custom dashboard

### Recommended Approach

**Hybrid Model:**
- Use OASIS for authentication, wallets, blockchain ops
- Build custom trading layer (orders, trades, assets)
- Integrate SmartContractGenerator for contracts

### Next Steps

1. ✅ Review OASIS API documentation
2. 🔨 Set up OASIS API integration
3. 🔨 Design custom trading layer
4. 🔨 Implement integration layer
5. 🔨 Test end-to-end flow

---

**Status:** Analysis Complete  
**Recommendation:** Use Hybrid Approach (Option B)  
**Estimated Time Savings:** 60-70% of development time
