# Manual Testing Guide for Implemented Features

**Date:** 2025-01-04  
**Purpose:** Guide for manually testing the 5 agent implementations

---

## 🎯 Overview

This guide helps you manually test the implemented features:
- **Agent 1:** Trade Execution (`BlockchainService.executeTrade()`)
- **Agent 2:** Withdrawals (`BlockchainService.withdraw()`)
- **Agent 3:** Payment Token Balance (`BalanceService.getPaymentTokenBalance()`)
- **Agent 4:** Order Validation (`OrdersService.validateOrder()`)
- **Agent 5:** Transaction Status (`BlockchainService.getTransaction()`)

---

## 📋 Prerequisites

1. **Services Running:**
   - Pangea Backend: `http://localhost:3000`
   - OASIS API: `http://localhost:5003`

2. **Authentication:**
   - JWT token from Better Auth
   - User with OASIS avatar
   - Wallet generated for user

3. **Test Data:**
   - Test asset in database
   - User with sufficient balance (for buy orders)
   - User with asset tokens (for sell orders)

---

## 🧪 Testing Options

### Option 1: Swagger UI (Recommended for Manual Testing)

1. **Open Swagger UI:**
   ```
   http://localhost:3000/api/docs
   ```

2. **Authenticate:**
   - Click the "Authorize" button (lock icon at top)
   - Enter: `Bearer <your-jwt-token>`
   - Click "Authorize"

3. **Test Endpoints:**
   - Navigate to the endpoint you want to test
   - Click "Try it out"
   - Fill in request body
   - Click "Execute"
   - Review response

---

## 🎯 Testing Each Implementation

### Test 1: Order Validation (Agent 4) + Payment Token Balance (Agent 3)

**What it tests:**
- `OrdersService.validateOrder()` - Validates buy orders have sufficient balance
- `BalanceService.getPaymentTokenBalance()` - Gets payment token balance from OASIS

**Endpoint:** `POST /api/orders`

**Steps:**

1. **Open Swagger UI:**
   ```
   http://localhost:3000/api/docs
   ```

2. **Authenticate** (click Authorize, enter JWT token)

3. **Navigate to:** `POST /api/orders`

4. **Test Case 1: Create Buy Order (Should Validate Balance)**
   ```json
   {
     "assetId": "your-test-asset-id",
     "orderType": "buy",
     "quantity": 1,
     "pricePerTokenUsd": 100,
     "blockchain": "solana"
   }
   ```

   **Expected Results:**
   - ✅ If user has sufficient balance: Order created (201)
   - ❌ If insufficient balance: BadRequestException (400) with message about insufficient balance

5. **Test Case 2: Create Sell Order (Should Validate Asset Balance)**
   ```json
   {
     "assetId": "your-test-asset-id",
     "orderType": "sell",
     "quantity": 1,
     "pricePerTokenUsd": 100,
     "blockchain": "solana"
   }
   ```

   **Expected Results:**
   - ✅ If user has sufficient asset tokens: Order created (201)
   - ❌ If insufficient asset tokens: BadRequestException (400)

**What to Verify:**
- ✅ Buy orders check payment token balance via OASIS API
- ✅ Error messages are clear and informative
- ✅ Balance validation works correctly

---

### Test 2: Trade Execution (Agent 1)

**What it tests:**
- `BlockchainService.executeTrade()` - Executes trades on blockchain via OASIS

**Endpoint:** N/A (Internal, triggered by order matching)

**Steps:**

1. **Create Matching Orders:**
   - Create a **sell order** (user A)
   - Create a **buy order** (user B) that matches the sell order

2. **Orders should match automatically:**
   - Order matching service will match the orders
   - Trade execution will be triggered
   - `BlockchainService.executeTrade()` will be called

3. **Verify Trade Execution:**
   - Check trade records in database
   - Verify transaction hash is stored (not mock)
   - Verify transaction hash is from OASIS API

**What to Verify:**
- ✅ Trade executes successfully
- ✅ Transaction hash returned from OASIS API (real hash, not mock)
- ✅ Trade record stores transaction hash
- ✅ Tokens transferred on blockchain (verify on blockchain explorer)

---

### Test 3: Withdrawals (Agent 2)

**What it tests:**
- `BlockchainService.withdraw()` - Withdraws tokens to external address via OASIS

**Endpoint:** `POST /api/transactions/withdraw`

**Steps:**

1. **Open Swagger UI:**
   ```
   http://localhost:3000/api/docs
   ```

2. **Authenticate** (click Authorize, enter JWT token)

3. **Navigate to:** `POST /api/transactions/withdraw`

4. **Create Withdrawal:**
   ```json
   {
     "assetId": "your-test-asset-id",
     "amount": "1000000000",
     "toAddress": "external-wallet-address",
     "blockchain": "solana"
   }
   ```

   **Expected Results:**
   - ✅ If successful: Transaction hash returned (from OASIS API)
   - ⚠️ If OASIS doesn't support external addresses: Error with helpful message
   - ❌ If insufficient balance: Error

**What to Verify:**
- ✅ Transaction hash returned (real hash, not mock)
- ✅ Withdrawal executes on blockchain (verify on blockchain explorer)
- ✅ Error handling for external addresses (if OASIS doesn't support)

---

### Test 4: Transaction Status (Agent 5)

**What it tests:**
- `BlockchainService.getTransaction()` - Gets transaction status from OASIS API

**Endpoint:** `POST /api/transactions/:txId/confirm`

**Steps:**

1. **Open Swagger UI:**
   ```
   http://localhost:3000/api/docs
   ```

2. **Authenticate** (click Authorize, enter JWT token)

3. **Navigate to:** `POST /api/transactions/{txId}/confirm`

4. **Confirm Transaction:**
   - Use a transaction ID that has a transaction hash
   - Call the confirm endpoint

   **Expected Results:**
   - ✅ Transaction status queried from OASIS API
   - ✅ Transaction confirmed if status is "confirmed"
   - ✅ Transaction status updated in database

**What to Verify:**
- ✅ Transaction status retrieved from OASIS API (not mock)
- ✅ Transaction confirmation works correctly
- ✅ Transaction status matches blockchain status

---

## 🔧 Using curl for Manual Testing

### 1. Get JWT Token (if available)

```bash
# Example (adjust based on your auth setup)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

### 2. Test Order Validation

```bash
JWT_TOKEN="your-jwt-token"
ASSET_ID="your-asset-id"

curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "'$ASSET_ID'",
    "orderType": "buy",
    "quantity": 1,
    "pricePerTokenUsd": 100,
    "blockchain": "solana"
  }'
```

### 3. Test Withdrawal

```bash
JWT_TOKEN="your-jwt-token"
ASSET_ID="your-asset-id"
TO_ADDRESS="external-wallet-address"

curl -X POST http://localhost:3000/api/transactions/withdraw \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "'$ASSET_ID'",
    "amount": "1000000000",
    "toAddress": "'$TO_ADDRESS'",
    "blockchain": "solana"
  }'
```

### 4. Test Transaction Confirmation

```bash
JWT_TOKEN="your-jwt-token"
TX_ID="your-transaction-id"

curl -X POST http://localhost:3000/api/transactions/$TX_ID/confirm \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📝 Test Checklist

### Order Validation (Agent 4) ✅
- [ ] Create buy order with sufficient balance → Should succeed
- [ ] Create buy order with insufficient balance → Should fail with clear error
- [ ] Create sell order with sufficient assets → Should succeed
- [ ] Create sell order with insufficient assets → Should fail with clear error
- [ ] Verify error messages are user-friendly

### Payment Token Balance (Agent 3) ✅
- [ ] Balance query works (tested via order validation)
- [ ] Returns correct balance from OASIS API
- [ ] Handles missing wallet gracefully (returns 0)

### Trade Execution (Agent 1) ✅
- [ ] Matching orders trigger trade execution
- [ ] Transaction hash returned (real hash, not mock)
- [ ] Trade record stores transaction hash
- [ ] Tokens transferred on blockchain (verify on explorer)

### Withdrawals (Agent 2) ✅
- [ ] Withdrawal executes successfully
- [ ] Transaction hash returned (real hash, not mock)
- [ ] Error handling for external addresses (if needed)
- [ ] Withdrawal verified on blockchain explorer

### Transaction Status (Agent 5) ✅
- [ ] Transaction status retrieved from OASIS API
- [ ] Status matches blockchain status
- [ ] Transaction confirmation works correctly
- [ ] Error handling works correctly

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" (401)
**Solution:** Make sure you have a valid JWT token and include it in the Authorization header

### Issue: "User not found" or "Avatar not found"
**Solution:** 
- Ensure user has OASIS avatar (create via `/api/auth/create-oasis-avatar`)
- Ensure user has wallet (generate via `/api/wallet/generate`)

### Issue: "Asset not found"
**Solution:** Create test assets in the database first

### Issue: "Insufficient balance"
**Solution:** 
- For buy orders: Ensure user has sufficient payment tokens (SOL/ETH)
- For sell orders: Ensure user has sufficient asset tokens

### Issue: Trade not executing
**Solution:**
- Verify orders are matching (check order matching service logs)
- Check that both users have wallets and OASIS avatars
- Verify OASIS API is accessible and working

---

## 📊 Expected Results Summary

| Test | Endpoint | Expected Status | Key Verification |
|------|----------|----------------|------------------|
| Order Validation (Buy) | POST /api/orders | 201 or 400 | Balance validated via OASIS |
| Order Validation (Sell) | POST /api/orders | 201 or 400 | Asset balance validated |
| Trade Execution | Order Matching | Trade created | Real transaction hash |
| Withdrawal | POST /api/transactions/withdraw | 201 | Real transaction hash |
| Transaction Status | POST /api/transactions/:txId/confirm | 200 | Status from OASIS API |

---

## 🎉 Success Criteria

All implementations are working correctly if:
- ✅ Orders validate balances correctly
- ✅ Trades execute with real transaction hashes
- ✅ Withdrawals return real transaction hashes
- ✅ Transaction status queries return real status from OASIS API
- ✅ Error handling is clear and helpful
- ✅ All transaction hashes are real (not mock values)

---

**Last Updated:** 2025-01-04  
**Status:** Ready for manual testing





