# Task Brief: Order Matching Engine

**Phase:** 3 - Trading  
**Priority:** Critical  
**Estimated Time:** 6-7 days  
**Dependencies:** Task 07 (Orders API), Task 09 (Trades API)

---

## Overview

Implement the order matching engine that matches buy and sell orders based on price-time priority, executes trades, and updates order statuses.

---

## Requirements

### 1. Matching Algorithm

Implement price-time priority matching:
- **Price Priority:** Better prices execute first
- **Time Priority:** Earlier orders at same price execute first
- Match buy orders with sell orders
- Partial fills supported

### 2. Matching Logic

1. New order arrives
2. Find matching orders (opposite side, compatible price)
3. Execute matches (price-time priority)
4. Update order statuses
5. Create trade records
6. Update balances
7. Emit events (WebSocket)

### 3. Trade Execution

- Validate balances before execution
- Execute on blockchain (smart contract call)
- Wait for transaction confirmation
- Update database (orders, trades, balances)
- Notify users via WebSocket

---

## Technical Specifications

### Order Matching Service

```typescript
// services/order-matching.service.ts
@Injectable()
export class OrderMatchingService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private tradesService: TradesService,
    private balanceService: BalanceService,
    private blockchainService: BlockchainService
  ) {}

  async processOrder(order: Order) {
    // 1. Find matching orders
    const matches = await this.findMatchingOrders(order);
    
    if (matches.length === 0) {
      // No matches, set order to open
      order.orderStatus = 'open';
      await this.orderRepository.save(order);
      return;
    }
    
    // 2. Execute matches
    for (const match of matches) {
      if (order.remainingQuantity === 0) break;
      
      await this.executeMatch(order, match);
    }
    
    // 3. Update order status
    if (order.remainingQuantity === 0) {
      order.orderStatus = 'filled';
      order.filledAt = new Date();
    } else if (order.filledQuantity > 0) {
      order.orderStatus = 'partially_filled';
    } else {
      order.orderStatus = 'open';
    }
    
    await this.orderRepository.save(order);
  }

  async findMatchingOrders(order: Order): Promise<Order[]> {
    const oppositeType = order.orderType === 'buy' ? 'sell' : 'buy';
    
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.asset.id = :assetId', { assetId: order.asset.id })
      .andWhere('order.orderType = :type', { type: oppositeType })
      .andWhere('order.orderStatus = :status', { status: 'open' })
      .orderBy('order.pricePerTokenUsd', order.orderType === 'buy' ? 'ASC' : 'DESC')
      .addOrderBy('order.createdAt', 'ASC');
    
    // For buy orders, find sell orders at or below buy price
    // For sell orders, find buy orders at or above sell price
    if (order.orderType === 'buy') {
      queryBuilder.andWhere('order.pricePerTokenUsd <= :price', {
        price: order.pricePerTokenUsd
      });
    } else {
      queryBuilder.andWhere('order.pricePerTokenUsd >= :price', {
        price: order.pricePerTokenUsd
      });
    }
    
    return queryBuilder.getMany();
  }

  async executeMatch(buyOrder: Order, sellOrder: Order) {
    // 1. Calculate trade quantity
    const tradeQuantity = Math.min(
      Number(buyOrder.remainingQuantity),
      Number(sellOrder.remainingQuantity)
    );
    
    // 2. Use sell order price (price-time priority)
    const tradePrice = sellOrder.pricePerTokenUsd;
    const totalValue = tradePrice * tradeQuantity;
    
    // 3. Validate balances
    await this.validateBalances(buyOrder, sellOrder, tradeQuantity);
    
    // 4. Execute on blockchain
    const transactionHash = await this.blockchainService.executeTrade({
      buyer: buyOrder.user,
      seller: sellOrder.user,
      asset: buyOrder.asset,
      quantity: tradeQuantity,
      price: tradePrice
    });
    
    // 5. Create trade record
    const trade = await this.tradesService.create({
      buyerId: buyOrder.user.id,
      sellerId: sellOrder.user.id,
      assetId: buyOrder.asset.id,
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      quantity: tradeQuantity,
      pricePerTokenUsd: tradePrice,
      totalValueUsd: totalValue,
      blockchain: buyOrder.blockchain,
      transactionHash
    });
    
    // 6. Update orders
    buyOrder.filledQuantity += BigInt(tradeQuantity);
    buyOrder.remainingQuantity -= BigInt(tradeQuantity);
    
    sellOrder.filledQuantity += BigInt(tradeQuantity);
    sellOrder.remainingQuantity -= BigInt(tradeQuantity);
    
    if (sellOrder.remainingQuantity === 0) {
      sellOrder.orderStatus = 'filled';
      sellOrder.filledAt = new Date();
    } else {
      sellOrder.orderStatus = 'partially_filled';
    }
    
    await this.orderRepository.save([buyOrder, sellOrder]);
    
    // 7. Update balances
    await this.balanceService.transfer(
      sellOrder.user.id,
      buyOrder.user.id,
      buyOrder.asset.id,
      tradeQuantity
    );
    
    // 8. Emit WebSocket events
    this.emitTradeEvent(trade);
    this.emitOrderUpdate(buyOrder);
    this.emitOrderUpdate(sellOrder);
    
    return trade;
  }

  async validateBalances(buyOrder: Order, sellOrder: Order, quantity: number) {
    // Validate seller has tokens
    const sellerBalance = await this.balanceService.getBalance(
      sellOrder.user.id,
      sellOrder.asset.id
    );
    
    if (sellerBalance.availableBalance < quantity) {
      throw new Error('Seller has insufficient balance');
    }
    
    // Validate buyer has funds (USDC or SOL)
    const totalCost = sellOrder.pricePerTokenUsd * quantity;
    // Check payment token balance
  }
}
```

### Background Job (Optional)

```typescript
// jobs/order-matching.job.ts
@Injectable()
export class OrderMatchingJob {
  constructor(private orderMatchingService: OrderMatchingService) {}

  @Cron('*/5 * * * * *') // Every 5 seconds
  async matchOrders() {
    // Find pending orders and process them
    const pendingOrders = await this.orderRepository.find({
      where: { orderStatus: 'pending' }
    });
    
    for (const order of pendingOrders) {
      await this.orderMatchingService.processOrder(order);
    }
  }
}
```

---

## Acceptance Criteria

- [ ] Order matching algorithm implemented
- [ ] Price-time priority working correctly
- [ ] Partial fills supported
- [ ] Trade execution on blockchain
- [ ] Order status updates
- [ ] Balance updates after trades
- [ ] Trade records created
- [ ] WebSocket events emitted
- [ ] Error handling for failed matches
- [ ] Unit tests for matching logic
- [ ] Integration tests for full flow

---

## Deliverables

1. Order matching service
2. Matching algorithm implementation
3. Trade execution logic
4. Balance update logic
5. WebSocket event emission
6. Background job (optional)
7. Unit and integration tests

---

## References

- Main Implementation Plan: `../IMPLEMENTATION_PLAN.md` Section 6
- Orders API: Task Brief 07
- Trades API: Task Brief 09

---

## Notes

- Use price-time priority (standard exchange algorithm)
- Support partial fills
- Execute trades on blockchain before updating database
- Wait for transaction confirmation
- Handle failed transactions (rollback database changes)
- Emit real-time events via WebSocket
- Consider using a queue system for high-volume matching
- Add rate limiting to prevent abuse
