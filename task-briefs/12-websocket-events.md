# Task Brief: WebSocket Events & Real-time Updates

**Phase:** 4 - Real-time Features  
**Priority:** Medium  
**Estimated Time:** 3-4 days  
**Dependencies:** Task 07 (Orders API), Task 08 (Order Matching), Task 09 (Trades API)

---

## Overview

Implement WebSocket support for real-time updates including order book changes, trade executions, order status updates, and balance changes.

---

## Requirements

### 1. WebSocket Server

- Set up WebSocket server (Socket.io or native WebSocket)
- Handle client connections
- Authenticate WebSocket connections
- Room/channel management

### 2. Event Types

Implement the following events:

- **Order Book Updates** - When orders are added/removed/filled
- **Trade Executions** - When trades are executed
- **Order Status Updates** - When order status changes
- **Balance Updates** - When user balance changes
- **Price Updates** - When asset price changes

### 3. Client Subscriptions

- Subscribe to asset order books
- Subscribe to user-specific events
- Subscribe to trade feed
- Unsubscribe when client disconnects

---

## Technical Specifications

### WebSocket Gateway

```typescript
// gateways/trading.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TradingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe:orderbook')
  handleOrderBookSubscribe(
    @MessageBody() data: { assetId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.join(`orderbook:${data.assetId}`);
  }

  @SubscribeMessage('subscribe:trades')
  handleTradesSubscribe(
    @MessageBody() data: { assetId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.join(`trades:${data.assetId}`);
  }

  @SubscribeMessage('subscribe:user')
  handleUserSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    client.join(`user:${data.userId}`);
  }

  emitOrderBookUpdate(assetId: string, orderBook: any) {
    this.server.to(`orderbook:${assetId}`).emit('orderbook:update', orderBook);
  }

  emitTradeExecution(assetId: string, trade: any) {
    this.server.to(`trades:${assetId}`).emit('trade:executed', trade);
  }

  emitOrderUpdate(userId: string, order: any) {
    this.server.to(`user:${userId}`).emit('order:update', order);
  }

  emitBalanceUpdate(userId: string, balance: any) {
    this.server.to(`user:${userId}`).emit('balance:update', balance);
  }
}
```

### Event Emission in Services

```typescript
// services/orders.service.ts (update existing)
async create(dto: CreateOrderDto, userId: string) {
  // ... existing order creation logic
  
  // Emit order book update
  this.tradingGateway.emitOrderBookUpdate(
    order.asset.id,
    await this.getOrderBook(order.asset.id)
  );
  
  // Emit user order update
  this.tradingGateway.emitOrderUpdate(userId, order);
  
  return order;
}
```

```typescript
// services/order-matching.service.ts (update existing)
async executeMatch(buyOrder: Order, sellOrder: Order) {
  // ... existing match execution logic
  
  // Emit trade execution
  this.tradingGateway.emitTradeExecution(
    buyOrder.asset.id,
    trade
  );
  
  // Emit order updates
  this.tradingGateway.emitOrderUpdate(buyOrder.user.id, buyOrder);
  this.tradingGateway.emitOrderUpdate(sellOrder.user.id, sellOrder);
  
  // Emit balance updates
  this.tradingGateway.emitBalanceUpdate(buyOrder.user.id, {
    assetId: buyOrder.asset.id,
    balance: await this.getBalance(buyOrder.user.id, buyOrder.asset.id)
  });
  
  this.tradingGateway.emitBalanceUpdate(sellOrder.user.id, {
    assetId: sellOrder.asset.id,
    balance: await this.getBalance(sellOrder.user.id, sellOrder.asset.id)
  });
}
```

---

## Acceptance Criteria

- [ ] WebSocket server set up
- [ ] Client authentication working
- [ ] Room/channel management working
- [ ] Order book updates emitted
- [ ] Trade executions emitted
- [ ] Order status updates emitted
- [ ] Balance updates emitted
- [ ] Client subscriptions working
- [ ] Unsubscribe on disconnect
- [ ] Error handling for connection failures
- [ ] Unit tests for WebSocket gateway

---

## Deliverables

1. WebSocket gateway
2. Event emission in services
3. Client subscription handling
4. Authentication middleware
5. Error handling
6. Unit tests

---

## References

- Main Implementation Plan: `../IMPLEMENTATION_PLAN.md` Section 8
- Socket.io Documentation: https://socket.io/docs/v4/

---

## Notes

- Use Socket.io for easier implementation
- Authenticate connections using JWT
- Use rooms for efficient broadcasting
- Handle reconnection gracefully
- Rate limit event emissions
- Consider using Redis adapter for multi-server setup
