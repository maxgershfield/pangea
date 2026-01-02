/**
 * Shared Test Utilities
 *
 * Provides preconfigured test module with:
 * - SQLite in-memory database
 * - ConfigModule with test defaults
 * - wtModule for token generation
 * - Mock Redis client
 */
import 'reflect-metadata';
import { vi } from 'vitest';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { Provider, Type, DynamicModule } from '@nestjs/common';

// Entity imports
import { User } from '../src/users/entities/user.entity.js';
import { UserBalance } from '../src/users/entities/user-balance.entity.js';
import { TokenizedAsset } from '../src/assets/entities/tokenized-asset.entity.js';
import { Order } from '../src/orders/entities/order.entity.js';
import { OrderBookSnapshot } from '../src/orders/entities/order-book-snapshot.entity.js';
import { Trade } from '../src/trades/entities/trade.entity.js';
import { Transaction } from '../src/transactions/entities/transaction.entity.js';
import { BetterAuthUser } from '../src/auth/entities/better-auth-user.entity.js';
import { BetterAuthSession } from '../src/auth/entities/better-auth-session.entity.js';
import { BetterAuthAccount } from '../src/auth/entities/better-auth-account.entity.js';
import { BetterAuthVerification } from '../src/auth/entities/better-auth-verification.entity.js';

// All entities for TypeORM
export const ALL_ENTITIES = [
  User,
  UserBalance,
  TokenizedAsset,
  Order,
  OrderBookSnapshot,
  Trade,
  Transaction,
  BetterAuthUser,
  BetterAuthSession,
  BetterAuthAccount,
  BetterAuthVerification,
];

// Test configuration values
export const TEST_CONFIG = {
  JWT_SECRET: 'test-secret-key-for-testing-only',
  JWT_EXPIRES_IN: '1h',
  OASIS_API_URL: 'https://mock.oasis.api',
  OASIS_API_KEY: 'test-api-key',
  DATABASE_URL: ':memory:',
  REDIS_URL: 'redis://localhost:6379',
};

// Mock Redis client factory
export function createMockRedisClient() {
  const store = new Map<string, string>();
  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    set: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve('OK');
    }),
    del: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve(1);
    }),
    ping: vi.fn().mockResolvedValue('PONG'),
    on: vi.fn(),
    quit: vi.fn().mockResolvedValue('OK'),
    disconnect: vi.fn(),
  };
}

// Shared mock Redis instance
export const mockRedisClient = createMockRedisClient();

interface CreateTestModuleOptions {
  providers?: Provider[];
  imports?: (Type<unknown> | DynamicModule)[];
  controllers?: Type<unknown>[];
  withDatabase?: boolean;
}

/**
 * Creates a pre-configured testing module builder with common dependencies.
 *
 * @example
 * ```typescript
 * const module = await createTestingModule({
 *   providers: [MyService],
 *   controllers: [MyController],
 * }).compile();
 * ```
 */
export function createTestingModule(
  options: CreateTestModuleOptions = {},
): TestingModuleBuilder {
  const {
    providers = [],
    imports = [],
    controllers = [],
    withDatabase = true,
  } = options;

  const baseImports = [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => TEST_CONFIG],
    }),
    JwtModule.register({
      secret: TEST_CONFIG.JWT_SECRET,
      signOptions: { expiresIn: TEST_CONFIG.JWT_EXPIRES_IN },
    }),
  ];

  // Only add TypeORM if database is needed
  if (withDatabase) {
    baseImports.push(
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        entities: ALL_ENTITIES,
        synchronize: true,
        dropSchema: true,
      }),
      TypeOrmModule.forFeature(ALL_ENTITIES),
    );
  }

  return Test.createTestingModule({
    imports: [...baseImports, ...imports],
    controllers,
    providers: [
      // Provide mock Redis client
      {
        provide: 'REDIS_CLIENT',
        useValue: mockRedisClient,
      },
      ...providers,
    ],
  });
}

// ============================================================================
// Test Fixtures
// ============================================================================

let userCounter = 0;
let assetCounter = 0;

/**
 * Creates a mock User object for testing.
 */
export function createTestUser(overrides: Partial<User> = {}): Partial<User> {
  userCounter++;
  return {
    id: `user-${userCounter}`,
    email: `test${userCounter}@example.com`,
    username: `testuser${userCounter}`,
    passwordHash: 'hashed-password',
    role: 'user',
    kycStatus: 'pending',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock TokenizedAsset object for testing.
 */
export function createTestAsset(
  overrides: Partial<TokenizedAsset> = {},
): Partial<TokenizedAsset> {
  assetCounter++;
  return {
    id: `asset-${assetCounter}`,
    assetId: `ASSET${assetCounter}`,
    name: `Test Asset ${assetCounter}`,
    symbol: `TST${assetCounter}`,
    assetClass: 'securities',
    totalSupply: BigInt(1_000_000),
    decimals: 8,
    blockchain: 'solana',
    network: 'devnet',
    status: 'trading',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock Order object for testing.
 */
export function createTestOrder(overrides: Partial<Order> = {}): Partial<Order> {
  return {
    id: `order-${Date.now()}`,
    orderId: `ORD${Date.now()}`,
    orderType: 'buy',
    orderStatus: 'open',
    pricePerTokenUsd: 10.0,
    quantity: BigInt(100),
    filledQuantity: BigInt(0),
    remainingQuantity: BigInt(100),
    totalValueUsd: 1000.0,
    isMarketOrder: false,
    isLimitOrder: true,
    blockchain: 'solana',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock Trade object for testing.
 */
export function createTestTrade(overrides: Partial<Trade> = {}): Partial<Trade> {
  return {
    id: `trade-${Date.now()}`,
    tradeId: `TRD${Date.now()}`,
    quantity: BigInt(50),
    pricePerTokenUsd: 10.5,
    totalValueUsd: 525.0,
    platformFeeUsd: 5.25,
    platformFeePercentage: 1.0,
    blockchain: 'solana',
    transactionHash: `0x${Date.now().toString(16)}`,
    status: 'completed',
    settlementStatus: 'settled',
    executedAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Resets counters between test files.
 * Call this in beforeEach if you need consistent IDs.
 */
export function resetTestCounters(): void {
  userCounter = 0;
  assetCounter = 0;
}
