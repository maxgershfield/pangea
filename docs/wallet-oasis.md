# OASIS Wallet Integration

Wallet generation and management using OASIS API.

---

## Overview

Pangea uses OASIS Web4 for wallet infrastructure:
- Multi-chain support (Solana, Ethereum)
- Key management via OASIS Keys API
- Wallet linking to Avatars

**Code:**
- `src/wallet/wallet.controller.ts` - API endpoints
- `src/services/oasis-wallet.service.ts` - OASIS integration
- `src/services/wallet-connection.service.ts` - Signature verification

---

## Wallet Generation

```http
POST /api/wallet/generate
Body: { providerType: "SolanaOASIS" | "EthereumOASIS", setAsDefault?: boolean }

Response: { walletId, walletAddress, providerType, balance }
```

**Flow:**
1. Generate keypair via OASIS Keys API
2. Link private key to avatar (creates wallet)
3. Link public key with wallet address

---

## Connect External Wallet

```http
# 1. Get verification message
GET /api/wallet/verification-message?walletAddress=xxx&blockchain=solana

# 2. User signs message in Phantom/MetaMask

# 3. Submit signature
POST /api/wallet/connect
Body: { walletAddress, signature, message, blockchain: 'solana'|'ethereum' }
```

**Code:** `src/services/wallet-connection.service.ts` - Verifies signatures

---

## Get Balances

```http
GET /api/wallet/balance
Authorization: Bearer <token>

Response: { balances: [{ walletId, walletAddress, providerType, balance, tokenSymbol }] }
```

---

## OASIS API Integration

**Token Management:**
- Tokens cached in Redis (1 hour TTL)
- Auto-refreshed when expired
- Injected into OASIS API requests

**Code:**
- `src/services/oasis-token-manager.service.ts` - Token caching/refresh
- `src/services/oasis-wallet.service.ts` - Wallet operations

---

## Provider Types

- `SolanaOASIS` - Solana wallets (Phantom)
- `EthereumOASIS` - Ethereum wallets (MetaMask)

---

## Environment Variables

```env
OASIS_API_URL=https://api.oasisweb4.com
OASIS_ADMIN_USERNAME=OASIS_ADMIN
OASIS_ADMIN_PASSWORD=your-password
REDIS_URL=redis://localhost:6379  # For token caching
```

---

**For implementation details, see the code in `src/wallet/` and `src/services/oasis-*.service.ts`.**
