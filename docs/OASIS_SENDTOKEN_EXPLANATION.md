# OASIS sendToken() Function Explanation

**Date:** 2025-01-04  
**Purpose:** Detailed explanation of how `sendToken()` works with avatar IDs and external wallet addresses

---

## 📖 Overview

The OASIS API `sendToken()` function is flexible and supports **both** avatar-to-avatar transfers and direct wallet address transfers. This document explains how it works and how our implementation uses it.

---

## 🔍 How OASIS API Works

### Backend Implementation (C#)

Looking at the OASIS backend code (`WalletManager.cs`), the `SendTokenAsync()` method accepts an `IWalletTransactionRequest` that can contain:

- `ToWalletAddress` - Direct wallet address (can be external)
- `ToAvatarId` - Avatar UUID (OASIS will look up the wallet)
- `ToAvatarUsername` - Avatar username (OASIS will look up the wallet)
- `ToAvatarEmail` - Avatar email (OASIS will look up the wallet)

**The Logic:**
```csharp
if (string.IsNullOrEmpty(request.ToWalletAddress))
{
    // Try to look up wallet from avatar ID/username/email
    if (request.ToAvatarId != Guid.Empty)
        walletsResult = await LoadProviderWalletsForAvatarByIdAsync(...);
    // ... then get wallet address
    request.ToWalletAddress = wallet.WalletAddress;
}

// Finally, send to the wallet address
result = await oasisBlockchainProvider.SendTransactionAsync(
    request.FromWalletAddress, 
    request.ToWalletAddress,  // Direct wallet address
    request.Amount, 
    request.MemoText
);
```

**Key Insight:** OASIS API always sends to a wallet address. If you provide `ToAvatarId`, it looks up the wallet first. If you provide `ToWalletAddress`, it uses it directly.

---

## 💻 Our TypeScript Implementation

### Updated Interface

```typescript
export interface SendTokenRequest {
  fromAvatarId: string;
  toAvatarId?: string;        // Optional: Avatar UUID
  toWalletAddress?: string;   // Optional: Direct wallet address
  amount: number;
  tokenSymbol: string;
  providerType: string;
  walletId: string;
}
```

### Updated sendToken() Method

```typescript
async sendToken(request: SendTokenRequest): Promise<{ transactionHash: string; success: boolean }> {
  // Validate that at least one destination is provided
  if (!request.toAvatarId && !request.toWalletAddress) {
    throw new Error("Either toAvatarId or toWalletAddress must be provided");
  }

  // Prepare request body
  const requestBody: any = {
    fromAvatarId: request.fromAvatarId,
    amount: request.amount,
    tokenSymbol: request.tokenSymbol,
    providerType: request.providerType,
    walletId: request.walletId,
  };

  // Add destination - prefer wallet address if both are provided
  if (request.toWalletAddress) {
    requestBody.toWalletAddress = request.toWalletAddress;  // External address
  } else if (request.toAvatarId) {
    requestBody.toAvatarId = request.toAvatarId;           // Avatar ID
  }

  // Send to OASIS API
  const response = await this.axiosInstance.post("/api/wallet/send_token", requestBody);
  // ...
}
```

---

## 🎯 Automatic Address Detection

### In withdraw() Method

Our `BlockchainService.withdraw()` method automatically detects the address type:

```typescript
// Detect if toAddress is a UUID (avatar ID) or wallet address
const isWalletAddress = !toAddress.match(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
);

// Use appropriate parameter
const result = await this.oasisWalletService.sendToken({
  fromAvatarId: user.avatarId,
  toWalletAddress: isWalletAddress ? toAddress : undefined,  // External address
  toAvatarId: isWalletAddress ? undefined : toAddress,       // Avatar ID
  amount: amountNumber,
  tokenSymbol,
  providerType,
  walletId: matchingWallet.walletId,
});
```

**Detection Logic:**
- If `toAddress` matches UUID format → treat as avatar ID
- If `toAddress` doesn't match UUID format → treat as wallet address

---

## 📝 Usage Examples

### Example 1: Send to Avatar ID

```typescript
await oasisWalletService.sendToken({
  fromAvatarId: "550e8400-e29b-41d4-a716-446655440000",
  toAvatarId: "660e8400-e29b-41d4-a716-446655440001",  // Avatar ID
  amount: 1.5,
  tokenSymbol: "SOL",
  providerType: "SolanaOASIS",
  walletId: "wallet-id"
});
```

**What happens:**
1. OASIS API receives `toAvatarId`
2. OASIS looks up avatar's Solana wallet address
3. OASIS sends tokens to that wallet address

### Example 2: Send to External Wallet Address

```typescript
await oasisWalletService.sendToken({
  fromAvatarId: "550e8400-e29b-41d4-a716-446655440000",
  toWalletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",  // External address
  amount: 1.5,
  tokenSymbol: "SOL",
  providerType: "SolanaOASIS",
  walletId: "wallet-id"
});
```

**What happens:**
1. OASIS API receives `toWalletAddress`
2. OASIS sends tokens directly to that address
3. No avatar lookup needed

### Example 3: Using withdraw() (Automatic Detection)

```typescript
// User provides external address
await blockchainService.withdraw({
  user: "user-id",
  asset: "asset-id",
  amount: BigInt(1500000000),
  toAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",  // Detected as wallet address
  blockchain: "solana"
});

// User provides avatar ID
await blockchainService.withdraw({
  user: "user-id",
  asset: "asset-id",
  amount: BigInt(1500000000),
  toAddress: "550e8400-e29b-41d4-a716-446655440000",  // Detected as avatar ID
  blockchain: "solana"
});
```

---

## ✅ Benefits

1. **Flexibility:** Supports both avatar IDs and external addresses
2. **Convenience:** Avatar IDs are easier to use (no need to know wallet address)
3. **Compatibility:** External addresses work with any wallet (Phantom, MetaMask, etc.)
4. **Automatic:** Our system detects the address type automatically
5. **No Extra Code:** OASIS API handles both cases - no need for direct blockchain SDK

---

## 🔧 Technical Details

### Address Format Detection

**UUID Format (Avatar ID):**
- Pattern: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Example: `550e8400-e29b-41d4-a716-446655440000`
- Regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`

**Wallet Address Formats:**
- **Solana:** Base58 encoded, typically 32-44 characters
  - Example: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`
- **Ethereum:** Hex string with 0x prefix, 42 characters
  - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### OASIS API Request Format

**For Avatar ID:**
```json
{
  "fromAvatarId": "550e8400-e29b-41d4-a716-446655440000",
  "toAvatarId": "660e8400-e29b-41d4-a716-446655440001",
  "amount": 1.5,
  "tokenSymbol": "SOL",
  "providerType": "SolanaOASIS",
  "walletId": "wallet-id"
}
```

**For External Address:**
```json
{
  "fromAvatarId": "550e8400-e29b-41d4-a716-446655440000",
  "toWalletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "amount": 1.5,
  "tokenSymbol": "SOL",
  "providerType": "SolanaOASIS",
  "walletId": "wallet-id"
}
```

---

## 🎯 Summary

- ✅ OASIS API supports both avatar IDs and external wallet addresses
- ✅ Our implementation automatically detects the address type
- ✅ No need for direct blockchain SDK (Option B) - OASIS handles it all
- ✅ Works seamlessly for both internal (avatar-to-avatar) and external transfers
- ✅ Users can provide either format - the system handles it automatically

---

**Last Updated:** 2025-01-04  
**Status:** Fully Implemented and Documented





