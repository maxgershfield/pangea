# Task Brief: Smart Contract Generator Integration

**Phase:** 2 - Core Features  
**Priority:** High  
**Estimated Time:** 4-5 days  
**Dependencies:** Task 01 (Project Setup)

---

## Overview

Integrate with the existing SmartContractGenerator API to generate, compile, and deploy smart contracts for RWA tokens, order books, trade execution, and vaults.

---

## Requirements

### 1. SmartContractGenerator API Integration

Integrate with SmartContractGenerator endpoints:

- `POST /api/v1/contracts/generate` - Generate contract from JSON spec
- `POST /api/v1/contracts/compile` - Compile contract
- `POST /api/v1/contracts/deploy` - Deploy contract to blockchain
- `GET /api/v1/contracts/cache-stats` - Get compilation cache stats

### 2. Contract Types

Support generation of:
- **RWA Token Contract** - For tokenized assets
- **Order Book Contract** - For managing orders
- **Trade Execution Contract** - For executing trades
- **Vault Contract** - For deposits/withdrawals

### 3. Contract Service

Create a service that:
- Generates JSON specifications for contracts
- Calls SmartContractGenerator API
- Handles the generate → compile → deploy flow
- Stores contract addresses in database
- Handles errors and retries

---

## Technical Specifications

### Smart Contract Service

```typescript
// services/smart-contract.service.ts
import axios from 'axios';
import FormData from 'form-data';

class SmartContractService {
  private baseUrl = process.env.SMART_CONTRACT_GENERATOR_URL || 'http://localhost:5000';

  async generateRwaToken(spec: {
    name: string;
    symbol: string;
    totalSupply: number;
    metadataUri: string;
    issuerWallet: string;
  }): Promise<string> {
    // 1. Create JSON spec
    const contractSpec = {
      contract_type: 'rwa_token',
      blockchain: 'solana',
      language: 'Rust',
      framework: 'Anchor',
      spec: {
        name: spec.name,
        symbol: spec.symbol,
        total_supply: spec.totalSupply,
        decimals: 0,
        metadata_uri: spec.metadataUri,
        features: ['mint', 'burn', 'transfer', 'freeze'],
        authority: spec.issuerWallet,
        freeze_authority: spec.issuerWallet
      }
    };

    // 2. Generate
    const jsonBlob = new Blob([JSON.stringify(contractSpec)], { 
      type: 'application/json' 
    });
    const jsonFile = new File([jsonBlob], 'spec.json');
    
    const generateFormData = new FormData();
    generateFormData.append('JsonFile', jsonFile);
    generateFormData.append('Language', 'Rust');
    
    const generateResponse = await axios.post(
      `${this.baseUrl}/api/v1/contracts/generate`,
      generateFormData,
      { responseType: 'blob' }
    );

    // 3. Compile
    const compileFormData = new FormData();
    compileFormData.append('Source', generateResponse.data);
    compileFormData.append('Language', 'Rust');
    
    const compileResponse = await axios.post(
      `${this.baseUrl}/api/v1/contracts/compile`,
      compileFormData,
      { responseType: 'blob', timeout: 1200000 } // 20 minutes
    );

    // 4. Deploy
    const deployFormData = new FormData();
    deployFormData.append('Language', 'Rust');
    deployFormData.append('CompiledContractFile', compileResponse.data, 'program.so');
    deployFormData.append('WalletKeypair', keypairFile); // From environment or user
    
    const deployResponse = await axios.post(
      `${this.baseUrl}/api/v1/contracts/deploy`,
      deployFormData
    );

    return deployResponse.data.contractAddress;
  }

  async deployOrderBook(): Promise<string> {
    // Similar flow for order book contract
  }

  async deployTradeExecution(): Promise<string> {
    // Similar flow for trade execution contract
  }

  async deployVault(): Promise<string> {
    // Similar flow for vault contract
  }
}
```

### Contract Specifications

Create JSON specifications for each contract type. See `../CONTRACT_SPECIFICATIONS.md` for details.

### Contract Controller

```typescript
// controllers/smart-contracts.controller.ts
@Controller('smart-contracts')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SmartContractsController {
  @Post('deploy-rwa-token')
  async deployRwaToken(@Body() dto: DeployRwaTokenDto) {
    // Deploy RWA token contract
  }

  @Post('deploy-order-book')
  async deployOrderBook() {
    // Deploy order book contract
  }

  @Post('deploy-trade-execution')
  async deployTradeExecution() {
    // Deploy trade execution contract
  }

  @Post('deploy-vault')
  async deployVault() {
    // Deploy vault contract
  }
}
```

---

## Acceptance Criteria

- [ ] SmartContractGenerator API client service created
- [ ] RWA token contract generation working
- [ ] Order book contract generation working
- [ ] Trade execution contract generation working
- [ ] Vault contract generation working
- [ ] Full generate → compile → deploy flow working
- [ ] Contract addresses stored in database
- [ ] Error handling for API failures
- [ ] Retry logic for failed deployments
- [ ] Unit tests for contract service

---

## Deliverables

1. SmartContractGenerator API client service
2. Contract specification templates (JSON)
3. Contract service with all contract types
4. Smart contracts controller
5. Database models for contract addresses
6. Error handling and retry logic
7. Unit tests

---

## References

- SmartContractGenerator API: `../OASIS_API_REUSE_ANALYSIS.md` Section 1
- Contract Specifications: `../CONTRACT_SPECIFICATIONS.md`
- SmartContractGenerator Location: `/Volumes/Storage 4/OASIS_CLEAN/SmartContractGenerator`
- API Client Example: `/Volumes/Storage 4/OASIS_CLEAN/SmartContractGenerator/ScGen.UI/lib/api-client.ts`

---

## Notes

- Use FormData for file uploads
- Handle long compilation times (20+ minutes for first build)
- Store contract addresses in `tokenized_assets` table
- Support both Solana (Rust) and Ethereum (Solidity)
- Use testnet for development, mainnet for production
- Handle wallet keypair securely (never expose in API responses)
- Consider using environment variables for deployment wallet
