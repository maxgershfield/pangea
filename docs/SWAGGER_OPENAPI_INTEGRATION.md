# Swagger/OpenAPI Integration

**Date:** 2025-01-04  
**Status:** ✅ Enhanced  
**Reference:** [NestJS OpenAPI Documentation](https://docs.nestjs.com/openapi/introduction)

---

## 📖 Overview

This document describes the Swagger/OpenAPI integration in the Pangea Markets backend API. The integration provides automatic API documentation generation using OpenAPI 3.0 specification.

---

## ✅ Current Status

Swagger/OpenAPI is **fully integrated** and **enhanced** in the codebase:

- ✅ `@nestjs/swagger` package installed (version 11.2.3)
- ✅ Swagger configuration in `src/main.ts`
- ✅ OpenAPI decorators used throughout controllers and DTOs
- ✅ Swagger UI available at `/docs` endpoint
- ✅ Enhanced configuration with better metadata and organization

---

## 🔧 Configuration

### Location

**File:** `src/main.ts`  
**Lines:** 41-64

### Enhanced Swagger Setup

```typescript
// Swagger/OpenAPI documentation
const config = new DocumentBuilder()
  .setTitle("Pangea Markets API")
  .setDescription(
    "RWA Trading Platform Backend API - Real-world asset (RWA) trading platform for tokenized assets on Solana and Ethereum blockchains"
  )
  .setVersion("1.0")
  .addBearerAuth(
    {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      name: "JWT",
      description: "Enter JWT token",
      in: "header",
    },
    "JWT-auth" // Matches @ApiBearerAuth() decorator
  )
  .addServer("http://localhost:3000/api", "Local development server")
  .addServer("https://api.pangeamarkets.com/api", "Production server")
  .addTag("Auth", "Authentication and user management endpoints")
  .addTag("Orders", "Order creation, management, and order book operations")
  .addTag("Trades", "Trade execution and trade history endpoints")
  .addTag("Transactions", "Deposit and withdrawal transaction endpoints")
  .addTag("Wallet", "Wallet management and balance queries via OASIS API")
  .addTag("Assets", "Asset management and asset information endpoints")
  .addTag("Smart Contracts", "Smart contract interaction endpoints")
  .setContact("Pangea Markets", "https://pangeamarkets.com", "support@pangeamarkets.com")
  .setLicense("MIT", "https://opensource.org/licenses/MIT")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("docs", app, document, {
  swaggerOptions: {
    persistAuthorization: true, // Persist auth token in browser
    tagsSorter: "alpha", // Sort tags alphabetically
    operationsSorter: "alpha", // Sort operations alphabetically
  },
  customSiteTitle: "Pangea Markets API Documentation",
  customCss: ".swagger-ui .topbar { display: none }", // Hide Swagger topbar
});
```

### Enhancements Made

1. **Enhanced Bearer Auth Configuration**
   - Detailed JWT authentication setup
   - Matches `@ApiBearerAuth()` decorator name
   - Better documentation for auth token input

2. **Server URLs**
   - Added local development server URL
   - Added production server URL (placeholder)
   - Allows testing against different environments

3. **API Tags**
   - Organized endpoints into logical groups
   - Added descriptions for each tag
   - Improves navigation in Swagger UI

4. **Contact & License Information**
   - Added contact information
   - Added MIT license reference
   - Professional API documentation

5. **Swagger UI Options**
   - `persistAuthorization`: Saves auth token in browser
   - `tagsSorter`: Alphabetical tag sorting
   - `operationsSorter`: Alphabetical operation sorting
   - Custom site title
   - Custom CSS to hide Swagger branding

---

## 📚 Documentation Access

### Swagger UI

**URL:** `http://localhost:3000/docs`  
**Description:** Interactive API documentation interface

### OpenAPI JSON Specification

**URL:** `http://localhost:3000/docs-json`  
**Description:** Raw OpenAPI 3.0 JSON specification

### OpenAPI YAML Specification

**URL:** `http://localhost:3000/docs-yaml`  
**Description:** Raw OpenAPI 3.0 YAML specification

---

## 🎨 OpenAPI Decorators

### Controller Decorators

Controllers use the following decorators from `@nestjs/swagger`:

```typescript
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

@ApiTags("Orders") // Groups endpoints under "Orders" tag
@ApiBearerAuth() // Requires JWT authentication
@Controller("orders")
export class OrdersController {
  @Get()
  @ApiOperation({
    summary: "Get all orders",
    description: "Returns paginated list of orders",
  })
  @ApiResponse({
    status: 200,
    description: "Successful response",
    type: OrderListResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll() {
    // Implementation
  }
}
```

### DTO Decorators

DTOs use `@ApiProperty` and `@ApiPropertyOptional` decorators:

```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OrderResponseDto {
  @ApiProperty({
    description: "Database UUID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string;

  @ApiPropertyOptional({
    description: "Optional field",
    example: "optional value",
  })
  optionalField?: string;
}
```

---

## 📝 Service Method Documentation

### JSDoc Comments for Service Methods

Since service methods are not HTTP endpoints, they cannot use OpenAPI decorators. However, we use comprehensive JSDoc comments that follow OpenAPI documentation patterns:

**Example:** `BalanceService.getPaymentTokenBalance()`

```typescript
/**
 * Get payment token balance (SOL, ETH) for a user from OASIS API
 *
 * @description
 * Retrieves the payment token balance (native blockchain tokens) for a user from the OASIS API.
 * This method is used internally for order validation to check if users have sufficient funds
 * to place buy orders. The balance is returned in the smallest unit (lamports for Solana,
 * wei for Ethereum) as a BigInt for precision with large numbers.
 *
 * @param {string} userId - The UUID of the user whose balance to retrieve
 * @param {string} blockchain - The blockchain type: "solana" or "ethereum"
 *
 * @returns {Promise<bigint>} The payment token balance in smallest units:
 *   - Solana: Balance in lamports (1 SOL = 1e9 lamports)
 *   - Ethereum: Balance in wei (1 ETH = 1e18 wei)
 *   - Returns BigInt(0) if user not found, missing avatarId, missing wallet, or on error
 *
 * @example
 * ```typescript
 * // Get Solana balance
 * const solBalance = await balanceService.getPaymentTokenBalance(userId, "solana");
 * // Returns: BigInt(1000000000) // 1 SOL in lamports
 * ```
 *
 * @see {@link OasisWalletService.getWallets} - Retrieves wallets for the avatar
 * @see {@link OasisWalletService.getBalance} - Retrieves balance from OASIS API
 *
 * @since 1.0.0
 * @category Payment
 * @tag Balance
 */
async getPaymentTokenBalance(userId: string, blockchain: string): Promise<bigint> {
  // Implementation
}
```

### JSDoc Benefits

1. **IDE Support**: Better autocomplete and IntelliSense
2. **Type Safety**: TypeScript integration
3. **Documentation Generation**: Can be used with tools like TypeDoc
4. **Code Navigation**: Better code navigation in IDEs
5. **Examples**: Includes usage examples

---

## 🏗️ Controllers with OpenAPI Documentation

The following controllers are documented with OpenAPI decorators:

1. **AuthController** (`src/auth/controllers/auth.controller.ts`)
   - User authentication endpoints
   - Avatar creation endpoints

2. **OrdersController** (`src/orders/controllers/orders.controller.ts`)
   - Order creation and management
   - Order book queries

3. **TradesController** (`src/trades/trades.controller.ts`)
   - Trade execution
   - Trade history

4. **TransactionsController** (`src/transactions/controllers/transactions.controller.ts`)
   - Deposits
   - Withdrawals

5. **WalletController** (`src/wallet/wallet.controller.ts`)
   - Wallet generation
   - Balance queries via OASIS API

6. **AssetsController** (`src/assets/controllers/assets.controller.ts`)
   - Asset management
   - Asset information

7. **SmartContractsController** (`src/smart-contracts/controllers/smart-contracts.controller.ts`)
   - Smart contract interactions

---

## 🔍 DTOs with OpenAPI Documentation

All DTOs use `@ApiProperty` and `@ApiPropertyOptional` decorators for automatic schema generation:

- `CreateOrderDto`
- `OrderResponseDto`
- `OrderListResponseDto`
- `OrderFiltersDto`
- `UpdateOrderDto`
- `TradeResponseDto`
- `TransactionResponseDto`
- `DepositDto`
- `WithdrawalDto`
- And more...

---

## 🚀 Usage

### Starting the Server

```bash
npm run start:dev
```

### Accessing Swagger UI

1. Start the server
2. Navigate to `http://localhost:3000/docs`
3. Click "Authorize" button to enter JWT token
4. Explore API endpoints interactively

### Testing Endpoints

1. Use the "Try it out" button on any endpoint
2. Enter request parameters
3. Click "Execute"
4. View response details

---

## 📦 Package Information

**Package:** `@nestjs/swagger`  
**Version:** `^11.2.3`  
**License:** MIT  
**Documentation:** [https://docs.nestjs.com/openapi/introduction](https://docs.nestjs.com/openapi/introduction)

---

## 🔗 Related Documentation

- **NestJS OpenAPI Guide:** [https://docs.nestjs.com/openapi/introduction](https://docs.nestjs.com/openapi/introduction)
- **OpenAPI Specification:** [https://swagger.io/specification/](https://swagger.io/specification/)
- **Payment Token Balance Implementation:** `PAYMENT_TOKEN_BALANCE_IMPLEMENTATION.md`
- **Endpoint Implementation Plan:** `ENDPOINT_IMPLEMENTATION_PLAN.md`

---

## ✅ Benefits

1. **Automatic Documentation**: API documentation is automatically generated from code
2. **Interactive Testing**: Test endpoints directly from the browser
3. **Type Safety**: DTOs ensure request/response schemas match
4. **Version Control**: Documentation is versioned with code
5. **Developer Experience**: Better IDE support and autocomplete
6. **Client Generation**: Can generate client SDKs from OpenAPI spec
7. **API Contracts**: Clear API contracts for frontend developers

---

**Last Updated:** 2025-01-04  
**Status:** ✅ Enhanced and Active

