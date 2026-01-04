# OASIS API: Transaction-by-Hash Endpoint Brief

**Date:** 2025-01-04  
**Status:** 📋 Implementation Request  
**Priority:** ⚠️ MEDIUM (Required for Pangea Markets transaction confirmation)  
**Estimated Time:** 2-3 days

---

## 📖 Overview

### Purpose

Add a new endpoint to OASIS API that retrieves transaction details by transaction hash/signature for Solana and Ethereum blockchains. This endpoint is needed by **Pangea Markets** backend to verify transaction confirmations.

### Context

**Pangea Markets** is a real-world asset (RWA) trading platform that integrates with OASIS API. When trades are executed, the Pangea backend needs to verify that transactions have been confirmed on the blockchain before marking trades as complete.

**Current Situation:**
- ✅ OASIS API has `/api/wallet/transactions/{walletId}` - returns transaction history for a wallet
- ❌ OASIS API does NOT have an endpoint to get a specific transaction by hash
- ⚠️ Pangea Markets needs to verify transaction status by hash (not by wallet)

**Architecture Note:**
- OASIS API backend uses **SolNET** (C#/.NET) for Solana operations
- OASIS API backend uses **ethers.NET** (or similar) for Ethereum operations
- Pangea Markets backend (NestJS/TypeScript) calls OASIS API via HTTP/REST

---

## 🎯 Requirements

### Endpoint Specification

**Endpoint:** `GET /api/wallet/transaction/{transactionHash}`

**Query Parameters:**
- `transactionHash` (string, required, path parameter): The transaction hash/signature
- `blockchain` (string, optional, query parameter): Blockchain type (`solana` or `ethereum`). If not provided, auto-detect from hash format
- `providerType` (string, optional, query parameter): Provider type (`SolanaOASIS` or `EthereumOASIS`). Used if blockchain detection fails

**Authentication:** Bearer token (JWT) - same as other wallet endpoints

**Response Format:**
```json
{
  "result": {
    "transactionHash": "0x... or base58...",
    "status": "confirmed | pending | failed",
    "blockchain": "solana | ethereum",
    "blockNumber": 123456789,
    "slot": 123456789,  // Solana only
    "confirmations": 42,
    "fromAddress": "0x... or base58...",
    "toAddress": "0x... or base58...",
    "amount": "1000000000",  // In smallest unit (lamports/wei)
    "fee": "5000",  // Transaction fee
    "timestamp": "2025-01-04T12:00:00Z",
    "success": true,  // Transaction succeeded (Ethereum: receipt.status === 1)
    "error": null  // Error message if transaction failed
  },
  "isLoaded": true,
  "message": "Transaction retrieved successfully"
}
```

**Error Responses:**

1. **Transaction Not Found (404)**
```json
{
  "result": null,
  "isLoaded": false,
  "message": "Transaction not found",
  "reason": "Transaction hash not found on blockchain or not yet confirmed"
}
```

2. **Invalid Transaction Hash (400)**
```json
{
  "result": null,
  "isLoaded": false,
  "message": "Invalid transaction hash format",
  "reason": "Transaction hash format is invalid for the specified blockchain"
}
```

3. **Blockchain Not Supported (400)**
```json
{
  "result": null,
  "isLoaded": false,
  "message": "Unsupported blockchain",
  "reason": "Blockchain type must be 'solana' or 'ethereum'"
}
```

---

## 🔧 Implementation Details

### Location

**Controller:** `ONODE/NextGenSoftware.OASIS.API.ONODE.WebAPI/Controllers/WalletController.cs`

**Manager:** Add method to `WalletManager` (if transaction query logic should be centralized)

**Provider Implementation:**
- **Solana:** Use `SolNET` library (`Solnet.Rpc.IRpcClient.GetTransactionAsync()`)
- **Ethereum:** Use `Nethereum` or `ethers.NET` library (whichever is currently used in OASIS API)

### Implementation Approach

#### Option 1: Direct Provider Calls (Recommended)

Add endpoint directly in `WalletController` that:
1. Determines blockchain type from hash format or query parameter
2. Activates appropriate provider (SolanaOASIS or EthereumOASIS)
3. Calls provider-specific method to get transaction
4. Returns standardized response

#### Option 2: WalletManager Method

Add method to `WalletManager`:
- `GetTransactionByHashAsync(string transactionHash, ProviderType providerType)`
- This would handle provider activation and delegation

**Recommendation:** Use Option 1 for simplicity, or Option 2 if you want to keep transaction logic centralized in WalletManager.

### Solana Implementation (Using SolNET)

```csharp
// In WalletController or SolanaOASIS provider
[Authorize]
[HttpGet("transaction/{transactionHash}")]
[ProducesResponseType(typeof(OASISResult<TransactionResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(typeof(OASISResult<string>), StatusCodes.Status404NotFound)]
[ProducesResponseType(typeof(OASISResult<string>), StatusCodes.Status400BadRequest)]
public async Task<OASISResult<TransactionResponse>> GetTransactionByHashAsync(
    string transactionHash,
    [FromQuery] string blockchain = null,
    [FromQuery] ProviderType? providerType = null)
{
    var result = new OASISResult<TransactionResponse>();
    
    try
    {
        // 1. Determine provider type
        ProviderType targetProvider = providerType ?? ProviderType.SolanaOASIS;
        
        if (!string.IsNullOrEmpty(blockchain))
        {
            targetProvider = blockchain.ToLower() switch
            {
                "solana" => ProviderType.SolanaOASIS,
                "ethereum" => ProviderType.EthereumOASIS,
                _ => throw new ArgumentException("Unsupported blockchain type")
            };
        }
        
        // 2. Activate provider
        var providerResult = await OASISBootLoader.OASISBootLoader.GetAndActivateProviderAsync(targetProvider);
        if (providerResult.IsError)
        {
            OASISErrorHandling.HandleError(ref result, providerResult.Message);
            return result;
        }
        
        // 3. Get transaction (delegate to provider-specific implementation)
        var transactionResult = await GetTransactionFromProviderAsync(transactionHash, targetProvider);
        
        if (transactionResult.IsError)
        {
            OASISErrorHandling.HandleError(ref result, transactionResult.Message);
            return result;
        }
        
        result.Result = transactionResult.Result;
        result.IsLoaded = true;
        result.Message = "Transaction retrieved successfully";
    }
    catch (Exception ex)
    {
        OASISErrorHandling.HandleError(ref result, $"Error retrieving transaction: {ex.Message}", ex);
    }
    
    return result;
}

private async Task<OASISResult<TransactionResponse>> GetTransactionFromProviderAsync(
    string transactionHash,
    ProviderType providerType)
{
    var result = new OASISResult<TransactionResponse>();
    
    try
    {
        if (providerType == ProviderType.SolanaOASIS)
        {
            // Solana implementation using SolNET
            var solanaProvider = ProviderManager.Instance.GetStorageProvider(ProviderType.SolanaOASIS) as SolanaOASIS;
            if (solanaProvider == null)
            {
                OASISErrorHandling.HandleError(ref result, "Solana provider not available");
                return result;
            }
            
            // Get RPC client (assuming SolanaOASIS exposes this or we can access it)
            var rpcClient = solanaProvider.GetRpcClient(); // You may need to add this method
            
            // Get transaction signature status
            var signatureStatus = await rpcClient.GetSignatureStatusAsync(transactionHash);
            
            if (!signatureStatus.WasSuccessful || signatureStatus.Result == null)
            {
                OASISErrorHandling.HandleError(ref result, "Transaction not found or not confirmed");
                return result;
            }
            
            // Get full transaction
            var transactionResult = await rpcClient.GetTransactionAsync(transactionHash, Commitment.Confirmed);
            
            if (!transactionResult.WasSuccessful || transactionResult.Result == null)
            {
                OASISErrorHandling.HandleError(ref result, "Transaction not found");
                return result;
            }
            
            var tx = transactionResult.Result;
            var status = signatureStatus.Result.Value?.Err == null ? "confirmed" : "failed";
            
            // Extract addresses
            string fromAddress = null;
            string toAddress = null;
            if (tx.Transaction?.Message?.AccountKeys?.Count > 0)
            {
                fromAddress = tx.Transaction.Message.AccountKeys[0].PublicKey;
                if (tx.Transaction.Message.AccountKeys.Count > 1)
                {
                    toAddress = tx.Transaction.Message.AccountKeys[1].PublicKey;
                }
            }
            
            // Calculate amount (simplified - may need more complex parsing for token transfers)
            long? amount = null;
            if (tx.Meta != null && tx.Meta.PreBalances != null && tx.Meta.PostBalances != null && 
                tx.Meta.PreBalances.Count > 0 && tx.Meta.PostBalances.Count > 0)
            {
                amount = tx.Meta.PreBalances[0] - tx.Meta.PostBalances[0];
            }
            
            result.Result = new TransactionResponse
            {
                TransactionHash = transactionHash,
                Status = status,
                Blockchain = "solana",
                BlockNumber = null, // Solana uses slots
                Slot = (ulong?)tx.Slot,
                Confirmations = signatureStatus.Result.Value?.Confirmations ?? 0,
                FromAddress = fromAddress,
                ToAddress = toAddress,
                Amount = amount?.ToString(),
                Fee = tx.Meta?.Fee?.ToString(),
                Timestamp = DateTime.UtcNow, // Solana transactions don't have explicit timestamps
                Success = signatureStatus.Result.Value?.Err == null,
                Error = signatureStatus.Result.Value?.Err?.ToString()
            };
            
            result.IsLoaded = true;
        }
        else if (providerType == ProviderType.EthereumOASIS)
        {
            // Ethereum implementation (using Nethereum or ethers.NET)
            // Similar pattern - get transaction receipt and transaction details
            // Implementation depends on which Ethereum library OASIS API uses
        }
    }
    catch (Exception ex)
    {
        OASISErrorHandling.HandleError(ref result, $"Error retrieving transaction from provider: {ex.Message}", ex);
    }
    
    return result;
}
```

### Response Model

Create a new response model (or use existing if appropriate):

```csharp
public class TransactionResponse
{
    public string TransactionHash { get; set; }
    public string Status { get; set; } // "confirmed", "pending", "failed"
    public string Blockchain { get; set; } // "solana", "ethereum"
    public ulong? BlockNumber { get; set; } // Ethereum block number
    public ulong? Slot { get; set; } // Solana slot number
    public int Confirmations { get; set; }
    public string FromAddress { get; set; }
    public string ToAddress { get; set; }
    public string Amount { get; set; } // In smallest unit (string to avoid precision issues)
    public string Fee { get; set; }
    public DateTime? Timestamp { get; set; }
    public bool Success { get; set; }
    public string Error { get; set; }
}
```

---

## 📋 Implementation Checklist

### Phase 1: Setup
- [ ] Create `TransactionResponse` model class
- [ ] Determine if WalletManager should handle this or keep in Controller
- [ ] Check which Ethereum library OASIS API uses (Nethereum, ethers.NET, etc.)

### Phase 2: Solana Implementation
- [ ] Add endpoint to `WalletController.cs`
- [ ] Implement Solana transaction retrieval using SolNET
- [ ] Handle transaction status (confirmed, pending, failed)
- [ ] Extract transaction details (addresses, amount, fee, etc.)
- [ ] Handle errors (transaction not found, invalid hash, etc.)

### Phase 3: Ethereum Implementation
- [ ] Implement Ethereum transaction retrieval
- [ ] Get transaction receipt (for status)
- [ ] Get transaction details (for addresses, amount, etc.)
- [ ] Handle errors appropriately

### Phase 4: Integration
- [ ] Add endpoint to API documentation
- [ ] Add Swagger/OpenAPI annotations
- [ ] Add unit tests
- [ ] Add integration tests

### Phase 5: Testing
- [ ] Test with confirmed Solana transaction
- [ ] Test with pending Solana transaction
- [ ] Test with failed Solana transaction
- [ ] Test with confirmed Ethereum transaction
- [ ] Test with pending Ethereum transaction
- [ ] Test with failed Ethereum transaction
- [ ] Test with invalid transaction hash
- [ ] Test with transaction not found
- [ ] Test blockchain auto-detection

---

## 🧪 Testing

### Unit Tests

Test the endpoint with various scenarios:

1. **Valid Solana Transaction (Confirmed)**
   - Use a known confirmed transaction hash from Solana mainnet/devnet
   - Verify all fields are populated correctly
   - Verify status is "confirmed"

2. **Valid Ethereum Transaction (Confirmed)**
   - Use a known confirmed transaction hash from Ethereum mainnet/sepolia
   - Verify all fields are populated correctly
   - Verify status is "confirmed"

3. **Transaction Not Found**
   - Use invalid/non-existent transaction hash
   - Verify 404 response
   - Verify appropriate error message

4. **Invalid Hash Format**
   - Use malformed transaction hash
   - Verify 400 response
   - Verify error message

5. **Pending Transaction**
   - Use a recent transaction hash that might be pending
   - Verify status is "pending"
   - Verify appropriate fields are populated

### Integration Tests

Test with real blockchain networks (testnet recommended):

- **Solana Devnet:**
  - Create a test transaction
  - Query transaction status
  - Verify response matches blockchain explorer

- **Ethereum Sepolia:**
  - Create a test transaction
  - Query transaction status
  - Verify response matches blockchain explorer

### Manual Testing

Use tools like:
- **Solana Explorer:** https://explorer.solana.com/
- **Etherscan:** https://sepolia.etherscan.io/

Compare OASIS API response with blockchain explorer to verify accuracy.

---

## 📚 References

### SolNET Documentation
- **SolNET.Rpc:** https://github.com/bmresearch/Solnet
- **GetTransactionAsync:** `IRpcClient.GetTransactionAsync(string signature, Commitment commitment)`
- **GetSignatureStatusAsync:** `IRpcClient.GetSignatureStatusAsync(string signature)`

### Ethereum Library (TBD - depends on what OASIS uses)
- **Nethereum:** https://nethereum.com/
- **ethers.NET:** https://github.com/enzohv/ethers.net

### Existing OASIS Code Patterns
- `WalletController.cs` - Existing wallet endpoints
- `SolanaRepository.cs` - Example of SolNET usage in OASIS
- Transaction history endpoint patterns

---

## 🔗 Integration with Pangea Markets

Once this endpoint is implemented, Pangea Markets will:

1. **Add method to `OasisWalletService`:**
   ```typescript
   async getTransactionByHash(
     transactionHash: string,
     blockchain: string
   ): Promise<TransactionResponse>
   ```

2. **Update `BlockchainService.getTransaction()`:**
   ```typescript
   async getTransaction(transactionHash: string, blockchain: string) {
     return await this.oasisWalletService.getTransactionByHash(
       transactionHash,
       blockchain
     );
   }
   ```

3. **Use in transaction confirmation:**
   - `TransactionsService.confirmTransaction()` already calls `BlockchainService.getTransaction()`
   - No changes needed in Pangea backend once endpoint is available

---

## ✅ Success Criteria

- [ ] Endpoint returns transaction details for Solana transactions
- [ ] Endpoint returns transaction details for Ethereum transactions
- [ ] Endpoint handles transaction not found (404)
- [ ] Endpoint handles invalid hash format (400)
- [ ] Response format matches specification
- [ ] Unit tests pass
- [ ] Integration tests pass with testnet
- [ ] Documentation updated
- [ ] Swagger/OpenAPI annotations added
- [ ] Pangea Markets integration tested

---

## 🚨 Considerations

### Performance
- Transaction queries are read-only and relatively fast
- Consider caching if needed (but probably not necessary)
- RPC calls to blockchain networks may have rate limits

### Error Handling
- Handle network errors gracefully
- Distinguish between "transaction not found" and "network error"
- Provide clear error messages

### Blockchain-Specific Notes

**Solana:**
- Uses "slots" instead of block numbers
- Transaction status can be: "finalized", "confirmed", "processed"
- Transactions can fail but still be on-chain

**Ethereum:**
- Uses block numbers
- Transaction receipt has status: 0 (failed) or 1 (success)
- Pending transactions may not have a receipt yet

### Security
- No sensitive operations (read-only)
- Standard authentication required (same as other wallet endpoints)
- Transaction hashes are public information

---

**Last Updated:** 2025-01-04  
**Status:** 📋 Ready for Implementation

