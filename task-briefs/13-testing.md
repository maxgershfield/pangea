# Task Brief: Testing Suite

**Phase:** 6 - Quality Assurance  
**Priority:** High  
**Estimated Time:** 5-6 days  
**Dependencies:** All previous tasks

---

## Overview

Implement comprehensive testing suite including unit tests, integration tests, and end-to-end tests for all components of the Pangea Markets backend.

---

## Requirements

### 1. Unit Tests

Test individual services and components:
- Authentication service
- Wallet service
- Assets service
- Orders service
- Trades service
- Order matching service
- Transactions service
- Admin service

### 2. Integration Tests

Test API endpoints:
- Authentication endpoints
- Assets endpoints
- Orders endpoints
- Trades endpoints
- Transactions endpoints
- Admin endpoints

### 3. End-to-End Tests

Test complete flows:
- User registration → Wallet connection → Deposit → Order → Trade
- Asset creation → Listing → Trading
- Withdrawal flow

### 4. Test Coverage

- Aim for 80%+ code coverage
- Test all error cases
- Test edge cases
- Test validation logic

---

## Technical Specifications

### Test Setup

```typescript
// test/setup.ts
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(/* mock external services */)
    .useValue(/* mock implementations */)
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
```

### Example Unit Test

```typescript
// test/services/orders.service.spec.ts
describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should create an order', async () => {
    const dto = {
      assetId: 'asset-1',
      orderType: 'buy',
      pricePerTokenUsd: 100,
      quantity: 10,
    };

    const result = await service.create(dto, 'user-1');

    expect(result).toBeDefined();
    expect(result.orderType).toBe('buy');
    expect(repository.save).toHaveBeenCalled();
  });

  it('should validate insufficient balance', async () => {
    // Test validation logic
  });
});
```

### Example Integration Test

```typescript
// test/integration/orders.e2e-spec.ts
describe('Orders API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get token
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = response.body.token;
  });

  it('/api/orders (POST) should create an order', () => {
    return request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        assetId: 'asset-1',
        orderType: 'buy',
        pricePerTokenUsd: 100,
        quantity: 10,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('orderId');
        expect(res.body.orderType).toBe('buy');
      });
  });
});
```

---

## Acceptance Criteria

- [ ] Unit tests for all services
- [ ] Integration tests for all endpoints
- [ ] End-to-end tests for main flows
- [ ] Test coverage ≥ 80%
- [ ] All tests passing
- [ ] CI/CD integration (optional)
- [ ] Test documentation

---

## Deliverables

1. Unit test suite
2. Integration test suite
3. End-to-end test suite
4. Test utilities and mocks
5. Test coverage report
6. CI/CD configuration (optional)

---

## References

- NestJS Testing: https://docs.nestjs.com/fundamentals/testing
- Jest Documentation: https://jestjs.io/docs/getting-started

---

## Notes

- Use Jest as testing framework
- Mock external services (OASIS API, blockchain)
- Use test database for integration tests
- Clean up test data after each test
- Use factories for test data generation
- Add performance tests for critical paths (optional)
