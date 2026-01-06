# Filter DTO Fixes - Corrected Implementations

**Date:** January 2026  
**Issue:** AI-generated descriptions and missing enums in filter DTOs  
**Status:** Ready for Implementation

---

## Summary of Issues Found

1. ✅ **OrderFiltersDto** - Missing enum, generic description
2. ✅ **TradeFiltersDto** - Missing enums for status and settlementStatus, wrong example
3. ✅ **TransactionFiltersDto** - Missing enum for status, no Swagger docs
4. ✅ **Admin DTOs** - Have enums but missing Swagger docs, some missing status values

---

## Fix 1: OrderFiltersDto

### Current Issues:
- ❌ `status` is just a string (no enum validation)
- ❌ Description doesn't list all valid statuses
- ❌ Missing 'rejected' and 'expired' in AdminOrderFiltersDto enum

### Valid Order Statuses (from code analysis):
- `pending` - Order created but not yet processed
- `open` - Order active and available for matching
- `partially_filled` - Order partially executed
- `filled` - Order fully executed
- `cancelled` - Order cancelled by user
- `rejected` - Order rejected (validation failed)
- `expired` - Order expired (if has expiration date)

### Fixed Implementation:

```typescript
import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum OrderType {
  BUY = 'buy',
  SELL = 'sell',
}

export class OrderFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by order status. Valid values: pending (order created, awaiting processing), open (active and available for matching), partially_filled (partially executed), filled (fully executed), cancelled (cancelled by user), rejected (validation failed), expired (expired due to expiration date)',
    enum: OrderStatus,
    example: OrderStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by order type. Valid values: buy (purchase order), sell (sell order)',
    enum: OrderType,
    example: OrderType.BUY,
  })
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @ApiPropertyOptional({
    description: 'Filter by asset UUID. Returns only orders for the specified asset.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination. Starts at 1.',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page. Maximum 100.',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
```

---

## Fix 2: TradeFiltersDto

### Current Issues:
- ❌ `status` is just a string (no enum validation)
- ❌ `settlementStatus` is just a string (no enum validation)
- ❌ Wrong example ('completed' should be 'confirmed' or 'settled')
- ❌ Descriptions don't list valid values

### Valid Trade Statuses (from AdminTradeFiltersDto):
- `pending` - Trade created but not confirmed
- `confirmed` - Trade confirmed on blockchain
- `settled` - Trade fully settled
- `failed` - Trade failed

### Valid Settlement Statuses (from code analysis):
- `pending` - Settlement pending
- `settled` - Settlement completed
- (May have others - need to verify)

### Fixed Implementation:

```typescript
import { IsOptional, IsString, IsUUID, IsDateString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TradeStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SETTLED = 'settled',
  FAILED = 'failed',
}

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  // Add more if they exist in the codebase
}

export class TradeFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by asset UUID. Returns only trades for the specified asset.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiPropertyOptional({
    description: 'Filter by trade status. Valid values: pending (trade created, awaiting confirmation), confirmed (confirmed on blockchain), settled (fully settled), failed (trade failed)',
    enum: TradeStatus,
    example: TradeStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @ApiPropertyOptional({
    description: 'Filter by settlement status. Valid values: pending (settlement pending), settled (settlement completed)',
    enum: SettlementStatus,
    example: SettlementStatus.SETTLED,
  })
  @IsOptional()
  @IsEnum(SettlementStatus)
  settlementStatus?: SettlementStatus;

  @ApiPropertyOptional({
    description: 'Start date for filtering trades (ISO 8601 format). Returns trades executed on or after this date.',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering trades (ISO 8601 format). Returns trades executed on or before this date.',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination. Starts at 1.',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page. Maximum 100.',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export interface TradeFilters {
  assetId?: string;
  status?: TradeStatus;
  settlementStatus?: SettlementStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
```

---

## Fix 3: TransactionFiltersDto

### Current Issues:
- ❌ `status` has comment but no enum validation
- ❌ No Swagger documentation
- ⚠️ `transactionType` has enum but `status` doesn't

### Valid Transaction Statuses (from AdminTransactionFiltersDto):
- `pending` - Transaction pending
- `processing` - Transaction being processed
- `completed` - Transaction completed successfully
- `failed` - Transaction failed

### Fixed Implementation:

```typescript
import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class TransactionFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by asset UUID. Returns only transactions for the specified asset.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction type. Valid values: deposit (funds deposited to platform), withdrawal (funds withdrawn from platform)',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filter by transaction status. Valid values: pending (awaiting processing), processing (currently being processed), completed (successfully completed), failed (transaction failed)',
    enum: TransactionStatus,
    example: TransactionStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Start date for filtering transactions (ISO 8601 format). Returns transactions created on or after this date.',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering transactions (ISO 8601 format). Returns transactions created on or before this date.',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination. Starts at 1.',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page. Maximum 100.',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export interface TransactionFilters {
  assetId?: string;
  transactionType?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
```

---

## Fix 4: AdminOrderFiltersDto

### Current Issues:
- ❌ Missing 'rejected' and 'expired' statuses
- ❌ No Swagger documentation

### Fixed Implementation:

```typescript
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum OrderStatus {
	PENDING = "pending",
	OPEN = "open",
	PARTIALLY_FILLED = "partially_filled",
	FILLED = "filled",
	CANCELLED = "cancelled",
	REJECTED = "rejected",
	EXPIRED = "expired",
}

export enum OrderType {
	BUY = "buy",
	SELL = "sell",
}

export class AdminOrderFiltersDto {
	@ApiPropertyOptional({
		description: 'Filter by order status. Valid values: pending, open, partially_filled, filled, cancelled, rejected, expired',
		enum: OrderStatus,
		example: OrderStatus.OPEN,
	})
	@IsOptional()
	@IsEnum(OrderStatus)
	orderStatus?: OrderStatus;

	@ApiPropertyOptional({
		description: 'Filter by order type. Valid values: buy, sell',
		enum: OrderType,
		example: OrderType.BUY,
	})
	@IsOptional()
	@IsEnum(OrderType)
	orderType?: OrderType;

	@ApiPropertyOptional({
		description: 'Filter by user UUID. Returns only orders for the specified user.',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	userId?: string;

	@ApiPropertyOptional({
		description: 'Filter by asset UUID. Returns only orders for the specified asset.',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	assetId?: string;

	@ApiPropertyOptional({
		description: 'Page number for pagination. Starts at 1.',
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of items per page. Maximum 100.',
		example: 20,
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 20;
}
```

---

## Fix 5: AdminTradeFiltersDto

### Current Issues:
- ❌ No Swagger documentation
- ⚠️ Missing `settlementStatus` filter (exists in regular TradeFiltersDto)

### Fixed Implementation:

```typescript
import { Type } from "class-transformer";
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum TradeStatus {
	PENDING = "pending",
	CONFIRMED = "confirmed",
	SETTLED = "settled",
	FAILED = "failed",
}

export enum SettlementStatus {
	PENDING = "pending",
	SETTLED = "settled",
}

export class AdminTradeFiltersDto {
	@ApiPropertyOptional({
		description: 'Filter by trade status. Valid values: pending, confirmed, settled, failed',
		enum: TradeStatus,
		example: TradeStatus.CONFIRMED,
	})
	@IsOptional()
	@IsEnum(TradeStatus)
	status?: TradeStatus;

	@ApiPropertyOptional({
		description: 'Filter by settlement status. Valid values: pending, settled',
		enum: SettlementStatus,
		example: SettlementStatus.SETTLED,
	})
	@IsOptional()
	@IsEnum(SettlementStatus)
	settlementStatus?: SettlementStatus;

	@ApiPropertyOptional({
		description: 'Filter by asset UUID. Returns only trades for the specified asset.',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	assetId?: string;

	@ApiPropertyOptional({
		description: 'Filter by buyer UUID. Returns only trades where this user is the buyer.',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	buyerId?: string;

	@ApiPropertyOptional({
		description: 'Filter by seller UUID. Returns only trades where this user is the seller.',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	sellerId?: string;

	@ApiPropertyOptional({
		description: 'Start date for filtering trades (ISO 8601 format). Returns trades executed on or after this date.',
		example: '2024-01-01T00:00:00.000Z',
		format: 'date-time',
	})
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional({
		description: 'End date for filtering trades (ISO 8601 format). Returns trades executed on or before this date.',
		example: '2024-12-31T23:59:59.000Z',
		format: 'date-time',
	})
	@IsOptional()
	@IsDateString()
	endDate?: string;

	@ApiPropertyOptional({
		description: 'Page number for pagination. Starts at 1.',
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of items per page. Maximum 100.',
		example: 20,
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 20;
}
```

---

## Fix 6: AdminTransactionFiltersDto

### Current Issues:
- ❌ No Swagger documentation

### Fixed Implementation:

```typescript
import { Type } from "class-transformer";
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum TransactionType {
	DEPOSIT = "deposit",
	WITHDRAWAL = "withdrawal",
}

export enum TransactionStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
}

export class AdminTransactionFiltersDto {
	@ApiPropertyOptional({
		description: 'Filter by transaction type. Valid values: deposit, withdrawal',
		enum: TransactionType,
		example: TransactionType.DEPOSIT,
	})
	@IsOptional()
	@IsEnum(TransactionType)
	transactionType?: TransactionType;

	@ApiPropertyOptional({
		description: 'Filter by transaction status. Valid values: pending, processing, completed, failed',
		enum: TransactionStatus,
		example: TransactionStatus.PENDING,
	})
	@IsOptional()
	@IsEnum(TransactionStatus)
	status?: TransactionStatus;

	@ApiPropertyOptional({
		description: 'Filter by user UUID. Returns only transactions for the specified user.',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	userId?: string;

	@ApiPropertyOptional({
		description: 'Filter by asset UUID. Returns only transactions for the specified asset.',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	})
	@IsOptional()
	@IsUUID()
	assetId?: string;

	@ApiPropertyOptional({
		description: 'Start date for filtering transactions (ISO 8601 format). Returns transactions created on or after this date.',
		example: '2024-01-01T00:00:00.000Z',
		format: 'date-time',
	})
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional({
		description: 'End date for filtering transactions (ISO 8601 format). Returns transactions created on or before this date.',
		example: '2024-12-31T23:59:59.000Z',
		format: 'date-time',
	})
	@IsOptional()
	@IsDateString()
	endDate?: string;

	@ApiPropertyOptional({
		description: 'Page number for pagination. Starts at 1.',
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of items per page. Maximum 100.',
		example: 20,
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 20;
}
```

---

## Key Changes Summary

### OrderFiltersDto
- ✅ Added `OrderStatus` enum with all 7 statuses
- ✅ Added `OrderType` enum
- ✅ Updated descriptions with all valid values
- ✅ Added enum validation

### TradeFiltersDto
- ✅ Added `TradeStatus` enum (pending, confirmed, settled, failed)
- ✅ Added `SettlementStatus` enum (pending, settled)
- ✅ Fixed example from 'completed' to 'confirmed'
- ✅ Updated descriptions

### TransactionFiltersDto
- ✅ Added `TransactionStatus` enum
- ✅ Added Swagger documentation
- ✅ Consistent with AdminTransactionFiltersDto

### Admin DTOs
- ✅ Added Swagger documentation
- ✅ Fixed missing status values (rejected, expired)
- ✅ Added settlementStatus to AdminTradeFiltersDto

---

## Verification Checklist

Before implementing, verify:

- [ ] All enum values match actual database values
- [ ] All enum values are used in service code
- [ ] No typos in enum values (e.g., 'partially_filled' vs 'partially-filled')
- [ ] Frontend expects these exact values
- [ ] Database schema supports all enum values
- [ ] Migration scripts handle all status values

---

## Testing After Fixes

1. **Test Enum Validation:**
   ```bash
   # Should reject invalid status
   curl -X GET "/api/orders?status=invalid" 
   # Should accept valid status
   curl -X GET "/api/orders?status=open"
   ```

2. **Test Swagger UI:**
   - Visit `/api/docs`
   - Check that all filter fields show enums
   - Verify descriptions are accurate
   - Test "Try it out" functionality

3. **Test Service Integration:**
   - Verify filters work with actual service methods
   - Check that enum values match database queries

---

## Implementation Order

1. **OrderFiltersDto** (Highest Priority - main contract)
2. **TransactionFiltersDto** (High Priority - has comment but no validation)
3. **TradeFiltersDto** (Medium Priority - wrong example)
4. **Admin DTOs** (Lower Priority - already have enums, just need Swagger docs)

---

## Notes

- **Settlement Status:** Need to verify if there are more values than 'pending' and 'settled'
- **Status Consistency:** Consider creating shared enum files to avoid duplication
- **Backward Compatibility:** These changes are breaking if frontend uses invalid status strings
- **Migration:** May need to update existing code that uses string literals instead of enums






