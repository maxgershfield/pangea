# DTO OASIS Integration Documentation Guide

**Purpose:** Document OASIS service integration points in DTO descriptions so developers understand when and how OASIS is called.

---

## OASIS Integration Points Map

### 1. **User Registration/Login** → OASIS Avatar Creation
**Trigger:** User registers or logs in via Better Auth  
**OASIS Action:** Creates/links OASIS avatar  
**Service:** `OasisAuthService`, `OasisLinkService`

### 2. **Wallet Operations** → OASIS Wallet Service
**Trigger:** User generates/connects wallet, checks balance  
**OASIS Action:** Creates wallet, gets balance, sends tokens  
**Service:** `OasisWalletService`

### 3. **Order Creation** → OASIS Wallet Lookup (Future)
**Trigger:** User creates buy/sell order  
**OASIS Action:** May need to verify wallet balance via OASIS  
**Service:** `OasisWalletService` (via `getUserWalletAddress`)

### 4. **Trade Execution** → OASIS Token Transfer
**Trigger:** Orders matched, trade executed  
**OASIS Action:** Sends tokens between avatars via OASIS  
**Service:** `OasisWalletService.sendToken()`

### 5. **Deposit/Withdrawal** → OASIS Wallet Lookup
**Trigger:** User initiates deposit/withdrawal  
**OASIS Action:** Gets wallet address from OASIS  
**Service:** `OasisWalletService.getWallets()`

### 6. **Balance Queries** → OASIS Balance Sync
**Trigger:** User checks balance, balance sync  
**OASIS Action:** Fetches balance from OASIS wallet  
**Service:** `OasisWalletService.getBalance()`

---

## Documentation Template for DTOs

### Template Structure:
```typescript
@ApiProperty({
  description: `
    [Field Description]
    
    OASIS Integration:
    - Trigger: [What event/action triggers OASIS call]
    - OASIS Service: [Which OASIS service is called]
    - OASIS Action: [What OASIS does]
    - Data Source: [Local DB vs OASIS API]
  `,
  example: "...",
})
```

---

## Examples

### Example 1: Order DTO - Documenting Trade Execution

```typescript
export class CreateOrderDto {
  @ApiProperty({
    description: `
      Asset ID for the order.
      
      OASIS Integration:
      - When order is matched and trade executes, OASIS is called to transfer tokens
      - Trigger: Order matching service finds a match
      - OASIS Service: OasisWalletService.sendToken()
      - OASIS Action: Transfers asset tokens from seller to buyer via OASIS API
      - Note: Requires both buyer and seller to have OASIS avatars with wallets
    `,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  assetId: string;
}
```

### Example 2: Transaction DTO - Documenting Wallet Lookup

```typescript
export class DepositDto {
  @ApiPropertyOptional({
    description: `
      Source wallet address (optional - will be fetched from OASIS if not provided).
      
      OASIS Integration:
      - Trigger: User initiates deposit
      - OASIS Service: OasisWalletService.getWallets() or getUserWalletAddress()
      - OASIS Action: Looks up user's OASIS avatar and retrieves wallet address
      - Fallback: If OASIS wallet not found, checks user.walletAddressSolana/Ethereum
      - Error: If no wallet found in OASIS or user entity, throws BadRequestException
    `,
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  })
  fromAddress?: string;
}
```

### Example 3: Wallet DTO - Documenting Avatar Creation

```typescript
export class GenerateWalletDto {
  @ApiProperty({
    description: `
      Blockchain provider type for wallet generation.
      
      OASIS Integration:
      - Trigger: User requests wallet generation
      - OASIS Service: OasisLinkService.ensureOasisAvatar() → OasisWalletService.generateWallet()
      - OASIS Action: 
        1. Ensures user has OASIS avatar (creates if missing)
        2. Generates keypair via OASIS Keys API
        3. Links private/public keys to avatar
        4. Creates wallet in OASIS system
      - Data Source: Wallet stored in OASIS, linked to user's avatarId
    `,
    enum: ['SolanaOASIS', 'EthereumOASIS'],
    example: 'SolanaOASIS',
  })
  providerType: 'SolanaOASIS' | 'EthereumOASIS';
}
```

### Example 4: Asset Response DTO - Documenting Data Source

```typescript
export class AssetResponseDto {
  @ApiProperty({
    description: `
      Asset contract address on blockchain.
      
      OASIS Integration:
      - Data Source: Stored locally in pangea database
      - OASIS Relationship: Contract may be deployed via SmartContractService (which uses external API, not OASIS)
      - Note: Asset metadata is local, but tokens are managed via OASIS wallets
    `,
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  })
  contractAddress?: string;
}
```

---

## Key Integration Points to Document

### 1. **Avatar Creation/Linking**
- **When:** User registration, first wallet generation
- **OASIS Service:** `OasisLinkService.ensureOasisAvatar()`
- **Action:** Creates OASIS avatar if missing, links to Better-Auth user

### 2. **Wallet Operations**
- **When:** Generate wallet, get balance, send tokens
- **OASIS Service:** `OasisWalletService`
- **Actions:**
  - `generateWallet()` - Creates wallet via OASIS Keys API
  - `getWallets()` - Fetches wallets from OASIS
  - `getBalance()` - Gets balance from OASIS
  - `sendToken()` - Executes blockchain transaction via OASIS

### 3. **Trade Execution**
- **When:** Orders matched, trade needs to execute
- **OASIS Service:** `OasisWalletService.sendToken()` (via `BlockchainService.executeTrade()`)
- **Action:** Transfers tokens between OASIS avatars

### 4. **Transaction Processing**
- **When:** Deposit/withdrawal initiated
- **OASIS Service:** `OasisWalletService.getWallets()`, `getUserWalletAddress()`
- **Action:** Retrieves wallet addresses from OASIS for transaction

### 5. **Balance Synchronization**
- **When:** Balance sync job, user checks balance
- **OASIS Service:** `OasisWalletService.getBalance()`, `BalanceSyncService`
- **Action:** Syncs balances from OASIS to local database

---

## Documentation Checklist

For each DTO field that relates to OASIS, document:

- [ ] **Trigger:** What event/action causes OASIS to be called?
- [ ] **OASIS Service:** Which service method is called?
- [ ] **OASIS Action:** What does OASIS do?
- [ ] **Data Source:** Is data from OASIS API or local database?
- [ ] **Dependencies:** What must exist first (e.g., avatar, wallet)?
- [ ] **Error Cases:** What happens if OASIS call fails?
- [ ] **Fallback:** Are there fallback mechanisms?

---

## Quick Reference: OASIS Service Methods

### OasisLinkService
- `ensureOasisAvatar()` - Creates/links avatar (lazy creation)
- `getAvatarId()` - Gets avatar ID for user

### OasisWalletService
- `generateWallet()` - Creates new wallet
- `getWallets()` - Gets all wallets for avatar
- `getDefaultWallet()` - Gets default wallet
- `getBalance()` - Gets wallet balance
- `sendToken()` - Sends tokens between avatars
- `getTransactions()` - Gets transaction history

### OasisAuthService
- `register()` - Creates OASIS avatar
- `login()` - Authenticates with OASIS
- `getUserProfile()` - Gets avatar profile

---

## Example: Complete DTO with OASIS Documentation

```typescript
export class CreateOrderDto {
  @ApiProperty({
    description: `
      Asset ID for the order.
      
      OASIS Integration:
      - When order is matched, OASIS transfers tokens between buyer/seller avatars
      - Trigger: OrderMatchingService.executeMatch() calls BlockchainService.executeTrade()
      - OASIS Service: OasisWalletService.sendToken() (via BlockchainService)
      - OASIS Action: Executes token transfer on blockchain via OASIS API
      - Requires: Both buyer and seller must have OASIS avatars with wallets
      - Data Source: Asset stored locally, but token transfer via OASIS
    `,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  assetId: string;

  @ApiProperty({
    description: `
      Order type: buy or sell.
      
      OASIS Integration:
      - For sell orders: Locks balance locally (no OASIS call yet)
      - When matched: OASIS transfers tokens from seller to buyer
      - For buy orders: Validates payment token balance (may query OASIS wallet)
    `,
    enum: ['buy', 'sell'],
    example: 'buy',
  })
  orderType: 'buy' | 'sell';
}
```

---

## Priority DTOs to Document

1. **Order DTOs** - Trade execution triggers OASIS
2. **Transaction DTOs** - Deposit/withdrawal use OASIS wallets
3. **Wallet DTOs** - Direct OASIS integration
4. **Asset Response DTOs** - Document data source (local vs OASIS)
5. **Trade DTOs** - Document OASIS token transfers

---

---

## Actual Integration Points Found in Code

### Wallet Controller (`src/wallet/wallet.controller.ts`)
- **`GET /api/wallet/balance`** → `ensureOasisAvatar()` → `getWallets()` → `getBalance()`
- **`POST /api/wallet/generate`** → `ensureOasisAvatar()` → `generateWallet()`
- **`GET /api/wallet/transactions/:walletId`** → `getTransactions()`

### Transactions Service (`src/transactions/services/transactions.service.ts`)
- **`initiateDeposit()`** → `getUserWalletAddress()` → `getDefaultWallet()` or `getWallets()`
- **`initiateWithdrawal()`** → `getUserWalletAddress()` → `getDefaultWallet()` or `getWallets()`

### Order Matching Service (`src/orders/services/order-matching.service.ts`)
- **`executeMatch()`** → `blockchainService.executeTrade()` → (will call `sendToken()` - currently stub)

### Auth Service (`src/auth/services/auth.service.ts`)
- **`register()`** → `oasisAuthService.register()`
- **`login()`** → `oasisAuthService.login()`
- **`createOasisAvatarForUser()`** → `oasisLinkService.createAndLinkAvatar()`

### Balance Sync Service (`src/services/balance-sync.service.ts`)
- **`syncUserBalances()`** → `getWallets()` → `getBalance()`

---

## Notes

- Keep descriptions concise but informative
- Focus on "when" and "what" OASIS does, not implementation details
- Use consistent format across all DTOs
- Update when OASIS integration changes

