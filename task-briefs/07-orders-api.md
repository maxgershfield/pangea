# Task Brief: Orders API Implementation

**Phase:** 3 - Trading  
**Priority:** Critical  
**Estimated Time:** 5-6 days  
**Dependencies:** Task 02 (Database Schema), Task 06 (Assets API)

---

## Overview

Implement the Orders API for creating, managing, and canceling buy/sell orders. This includes order validation, status management, and integration with the order matching engine.

---

## Requirements

### 1. API Endpoints

Implement the following endpoints:

```
GET    /api/orders                    # Get user's orders
GET    /api/orders/:orderId          # Get order details
POST   /api/orders                    # Create new order (buy/sell)
PUT    /api/orders/:orderId          # Update order
DELETE /api/orders/:orderId          # Cancel order
GET    /api/orders/open               # Get open orders
GET    /api/orders/history            # Get order history
GET    /api/orders/asset/:assetId     # Get orders for specific asset
```

### 2. Order Types

Support:
- **Limit Orders** - Execute at specific price or better
- **Market Orders** - Execute immediately at best available price

### 3. Order Validation

- Validate user has sufficient balance
- Validate order parameters (price, quantity)
- Validate asset exists and is tradeable
- Validate order doesn't exceed available balance

### 4. Order Status Management

Track order status:
- `pending` - Order created, awaiting processing
- `open` - Order active in order book
- `partially_filled` - Partially executed
- `filled` - Fully executed
- `cancelled` - User cancelled
- `expired` - Order expired
- `rejected` - Order rejected (validation failed)

---

## Technical Specifications

### Order Entity

```typescript
// entities/order.entity.ts
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TokenizedAsset)
  @JoinColumn({ name: 'asset_id' })
  asset: TokenizedAsset;

  @Column()
  orderType: 'buy' | 'sell';

  @Column({ default: 'pending' })
  orderStatus: string;

  @Column('decimal', { precision: 18, scale: 2 })
  pricePerTokenUsd: number;

  @Column('bigint')
  quantity: bigint;

  @Column('bigint', { default: 0 })
  filledQuantity: bigint;

  @Column('bigint')
  remainingQuantity: bigint;

  @Column('decimal', { precision: 18, scale: 2 })
  totalValueUsd: number;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column()
  blockchain: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ default: false })
  isMarketOrder: boolean;

  @Column({ default: true })
  isLimitOrder: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  filledAt: Date;
}
```

### Orders Service

```typescript
// services/orders.service.ts
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private balanceService: BalanceService,
    private orderMatchingService: OrderMatchingService
  ) {}

  async create(dto: CreateOrderDto, userId: string) {
    // 1. Validate order
    await this.validateOrder(dto, userId);
    
    // 2. Lock balance if sell order
    if (dto.orderType === 'sell') {
      await this.balanceService.lockBalance(
        userId,
        dto.assetId,
        dto.quantity
      );
    }
    
    // 3. Create order
    const order = this.orderRepository.create({
      ...dto,
      user: { id: userId } as User,
      orderId: this.generateOrderId(),
      remainingQuantity: dto.quantity,
      orderStatus: 'pending'
    });
    
    const savedOrder = await this.orderRepository.save(order);
    
    // 4. Trigger order matching
    await this.orderMatchingService.processOrder(savedOrder);
    
    return savedOrder;
  }

  async validateOrder(dto: CreateOrderDto, userId: string) {
    // Validate asset exists
    const asset = await this.assetRepository.findOne({
      where: { id: dto.assetId }
    });
    
    if (!asset || asset.status !== 'trading') {
      throw new BadRequestException('Asset not available for trading');
    }
    
    // Validate balance
    if (dto.orderType === 'sell') {
      const balance = await this.balanceService.getBalance(
        userId,
        dto.assetId
      );
      
      if (balance.availableBalance < dto.quantity) {
        throw new BadRequestException('Insufficient balance');
      }
    } else if (dto.orderType === 'buy') {
      // Validate user has enough funds (USDC or SOL)
      const totalCost = dto.pricePerTokenUsd * Number(dto.quantity);
      // Check payment token balance
    }
    
    // Validate price and quantity
    if (dto.pricePerTokenUsd <= 0 || dto.quantity <= 0) {
      throw new BadRequestException('Invalid price or quantity');
    }
  }

  async cancel(orderId: string, userId: string) {
    const order = await this.orderRepository.findOne({
      where: { orderId, user: { id: userId } }
    });
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    if (order.orderStatus !== 'open' && order.orderStatus !== 'pending') {
      throw new BadRequestException('Order cannot be cancelled');
    }
    
    // Unlock balance if sell order
    if (order.orderType === 'sell') {
      await this.balanceService.unlockBalance(
        userId,
        order.asset.id,
        order.remainingQuantity
      );
    }
    
    order.orderStatus = 'cancelled';
    return this.orderRepository.save(order);
  }

  async findByUser(userId: string, filters?: OrderFilters) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.user.id = :userId', { userId });
    
    if (filters?.status) {
      queryBuilder.andWhere('order.orderStatus = :status', { 
        status: filters.status 
      });
    }
    
    return queryBuilder.getMany();
  }
}
```

### Orders Controller

```typescript
// controllers/orders.controller.ts
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async findAll(@Request() req, @Query() filters: OrderFiltersDto) {
    return this.ordersService.findByUser(req.user.id, filters);
  }

  @Get(':orderId')
  async findOne(@Param('orderId') orderId: string, @Request() req) {
    return this.ordersService.findOne(orderId, req.user.id);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto, req.user.id);
  }

  @Put(':orderId')
  async update(
    @Param('orderId') orderId: string,
    @Request() req,
    @Body() dto: UpdateOrderDto
  ) {
    return this.ordersService.update(orderId, dto, req.user.id);
  }

  @Delete(':orderId')
  async cancel(@Param('orderId') orderId: string, @Request() req) {
    return this.ordersService.cancel(orderId, req.user.id);
  }

  @Get('open')
  async getOpenOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.id, { status: 'open' });
  }

  @Get('history')
  async getHistory(@Request() req, @Query() filters: OrderFiltersDto) {
    return this.ordersService.getHistory(req.user.id, filters);
  }
}
```

---

## Acceptance Criteria

- [ ] All order endpoints implemented
- [ ] Order creation with validation
- [ ] Order cancellation working
- [ ] Balance locking for sell orders
- [ ] Order status management
- [ ] Order history retrieval
- [ ] Support for limit and market orders
- [ ] Integration with order matching engine
- [ ] Error handling for invalid orders
- [ ] Unit tests for orders service
- [ ] Integration tests for orders API

---

## Deliverables

1. Order entity/model
2. Orders service with business logic
3. Orders controller with all endpoints
4. Order validation logic
5. Balance locking/unlocking logic
6. DTOs for request/response
7. Unit and integration tests

---

## References

- Database Schema: `../IMPLEMENTATION_PLAN.md` Section 2.1 (Orders Table)
- API Specification: `../IMPLEMENTATION_PLAN.md` Section 3.3
- Order Matching: Task Brief 08

---

## Notes

- Generate unique order IDs (e.g., "ORD-2025-001")
- Lock balances immediately when creating sell orders
- Unlock balances when orders are cancelled or filled
- Support order expiration
- Track filled vs remaining quantity
- Store transaction hash after blockchain execution
- Consider using database transactions for order creation
