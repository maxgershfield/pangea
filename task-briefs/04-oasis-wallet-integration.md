# Task Brief: OASIS Wallet Integration

**Phase:** 2 - Core Features  
**Priority:** High  
**Estimated Time:** 3-4 days  
**Dependencies:** Task 03 (OASIS Auth Integration), Task 02 (Database Schema)

---

## Overview

Integrate OASIS Wallet API for multi-chain wallet management, balance tracking, and transaction history. This handles wallet operations for both Solana and Ethereum.

---

## Requirements

### 1. OASIS Wallet API Integration

Integrate with OASIS Wallet API endpoints:

- `POST /api/wallet/avatar/{avatarId}/generate` - Generate wallet
- `GET /api/wallet/avatar/{avatarId}/wallets` - Get all wallets
- `GET /api/wallet/avatar/{avatarId}/default-wallet` - Get default wallet
- `POST /api/wallet/set_default_wallet` - Set default wallet
- `GET /api/wallet/balance/{walletId}` - Get balance
- `POST /api/wallet/refresh_balance` - Refresh balance
- `POST /api/wallet/send_token` - Send tokens
- `GET /api/wallet/transactions/{walletId}` - Transaction history
- `GET /api/wallet/wallet_by_public_key/{publicKey}` - Get wallet by address

### 2. Frontend Wallet Connection

Support wallet connection from frontend:
- **Phantom** for Solana
- **MetaMask** for Ethereum

### 3. Wallet Verification

Verify wallet ownership by:
- Requesting signature from user
- Verifying signature matches wallet address
- Linking wallet to user account

### 4. Balance Synchronization

Sync on-chain balances with local database:
- Periodic sync for all user wallets
- Real-time sync after transactions
- Store in `user_balances` table

---

## Technical Specifications

### OASIS Wallet Service

```typescript
// services/oasis-wallet.service.ts
import axios from 'axios';

class OasisWalletService {
  private baseUrl = process.env.OASIS_API_URL;
  private apiKey = process.env.OASIS_API_KEY;

  async generateWallet(avatarId: string, providerType: 'SolanaOASIS' | 'EthereumOASIS') {
    const response = await axios.post(
      `${this.baseUrl}/api/wallet/avatar/${avatarId}/generate`,
      {
        providerType,
        setAsDefault: true
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return response.data.result;
  }

  async getWallets(avatarId: string, providerType?: string) {
    let url = `${this.baseUrl}/api/wallet/avatar/${avatarId}/wallets`;
    if (providerType) {
      url += `?providerType=${providerType}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    return response.data.result;
  }

  async getBalance(walletId: string, providerType: string) {
    const response = await axios.get(
      `${this.baseUrl}/api/wallet/balance/${walletId}?providerType=${providerType}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return response.data.result;
  }

  async sendToken(request: {
    fromAvatarId: string;
    toAvatarId: string;
    amount: number;
    tokenSymbol: string;
    providerType: string;
    walletId: string;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/api/wallet/send_token`,
      request,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return response.data.result;
  }
}
```

### Wallet Connection Service

```typescript
// services/wallet-connection.service.ts
class WalletConnectionService {
  async connectPhantom(userId: string): Promise<string> {
    // Frontend will call this with wallet address
    // Verify ownership via signature
    // Link to user account
  }

  async connectMetaMask(userId: string): Promise<string> {
    // Similar to Phantom
  }

  async verifyOwnership(
    walletAddress: string,
    signature: string,
    message: string,
    blockchain: 'solana' | 'ethereum'
  ): Promise<boolean> {
    // Verify signature cryptographically
    // Return true if valid
  }
}
```

### Balance Sync Service

```typescript
// services/balance-sync.service.ts
class BalanceSyncService {
  async syncUserBalances(userId: string) {
    // 1. Get all wallets from OASIS
    // 2. Get balances for each wallet
    // 3. Update local user_balances table
  }

  async syncAssetBalance(userId: string, assetId: string) {
    // Sync balance for specific asset
  }
}
```

### Wallet Controller

```typescript
// controllers/wallet.controller.ts
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  @Get('balance')
  async getBalances(@Request() req) {
    // Get all balances for user
  }

  @Get('balance/:assetId')
  async getAssetBalance(@Request() req, @Param('assetId') assetId: string) {
    // Get balance for specific asset
  }

  @Post('connect')
  async connectWallet(@Request() req, @Body() dto: ConnectWalletDto) {
    // Connect Phantom or MetaMask
  }

  @Post('verify')
  async verifyWallet(@Request() req, @Body() dto: VerifyWalletDto) {
    // Verify wallet ownership
  }

  @Post('sync')
  async syncBalances(@Request() req) {
    // Manually trigger balance sync
  }
}
```

---

## Acceptance Criteria

- [ ] OASIS Wallet API client service created
- [ ] Wallet generation endpoint working
- [ ] Balance retrieval working
- [ ] Wallet connection (Phantom/MetaMask) working
- [ ] Wallet verification working
- [ ] Balance synchronization working
- [ ] Transaction history retrieval working
- [ ] Multi-chain support (Solana + Ethereum)
- [ ] Error handling for API failures
- [ ] Unit tests for wallet service

---

## Deliverables

1. OASIS Wallet API client service
2. Wallet connection service
3. Balance sync service
4. Wallet controller with all endpoints
5. Wallet verification logic
6. Unit tests

---

## References

- OASIS Wallet API: `../OASIS_API_REUSE_ANALYSIS.md` Section 3.2
- Wallet Integration Patterns: `../OASIS_API_REUSE_ANALYSIS.md` Section 2
- Main Implementation Plan: `../IMPLEMENTATION_PLAN.md` Section 5
- Meta-bricks Wallet Examples: `/Volumes/Storage 4/OASIS_CLEAN/meta-bricks-main/src/app/services/wallet.service.ts`

---

## Notes

- Support both Solana (Phantom) and Ethereum (MetaMask)
- Verify wallet ownership before linking to account
- Cache wallet data locally to reduce API calls
- Implement periodic balance sync (cron job)
- Handle network switching (testnet/mainnet)
- Store wallet addresses in user table for quick access
