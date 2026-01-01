/**
 * Vitest Setup File for NestJS + TypeORM
 *
 * This file runs before each test file.
 * IMPORTANT: reflect-metadata must be imported first for TypeORM decorators.
 */

// 1. TypeORM decorator metadata support - must be first
import 'reflect-metadata';

// 2. Vitest utilities
import { vi } from 'vitest';

// 3. Create mock Redis class
class MockRedis {
  private store = new Map<string, string>();

  get = vi.fn((key: string) => Promise.resolve(this.store.get(key) ?? null));
  set = vi.fn((key: string, value: string) => {
    this.store.set(key, value);
    return Promise.resolve('OK');
  });
  del = vi.fn((key: string) => {
    this.store.delete(key);
    return Promise.resolve(1);
  });
  ping = vi.fn().mockResolvedValue('PONG');
  on = vi.fn().mockReturnThis();
  once = vi.fn().mockReturnThis();
  quit = vi.fn().mockResolvedValue('OK');
  disconnect = vi.fn();
  status = 'ready';
}

// 4. Mock ioredis - export both default and named Redis
vi.mock('ioredis', () => {
  const MockRedisClass = MockRedis;
  return {
    default: MockRedisClass,
    Redis: MockRedisClass,
  };
});

// 5. Mock axios for external API calls (OASIS, blockchain, etc.)
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});
