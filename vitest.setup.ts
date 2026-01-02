import 'reflect-metadata';
import { vi } from 'vitest';

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

vi.mock('ioredis', () => {
  const MockRedisClass = MockRedis;
  return {
    default: MockRedisClass,
    Redis: MockRedisClass,
  };
});

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
