# Task Brief: Trades API Implementation

**Phase:** 3 - Trading  
**Priority:** High  
**Estimated Time:** 3-4 days  
**Dependencies:** Task 02 (Database Schema), Task 08 (Order Matching)

---

## Overview

Implement the Trades API for retrieving trade history, trade details, and trade analytics. Trades are created by the order matching engine.

---

## Requirements

### 1. API Endpoints

Implement the following endpoints:

```
GET    /api/trades                    # Get user's trades
GET    /api/trades/:tradeId           # Get trade details
GET    /api/trades/asset/:assetId     # Get trades for specific asset
GET    /api/trades/history            # Get trade history with filters
GET    /api/trades/statistics         # Get trade statistics
```

### 2. Trade Retrieval

- Get all trades for a user
- Get trades for specific asset
- Filter by date range, status, etc.
- Pagination support

### 3. Trade Statistics

- Total volume
- Number of trades
- Average trade size
- Price statistics

---

## Technical Specifications

### Trade Entity

```typescript
// entities/trade.entity.ts
@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tradeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @ManyToOne(() => TokenizedAsset)
  @JoinColumn({ name: 'asset_id' })
  asset: TokenizedAsset;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'buy_order_id' })
  buyOrder: Order;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'sell_order_id' })
  sellOrder: Order;

  @Column('bigint')
  quantity: bigint;

  @Column('decimal', { precision: 18, scale: 2 })
  pricePerTokenUsd: number;

  @Column('decimal', { precision: 18, scale: 2 })
  totalValueUsd: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  platformFeeUsd: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  platformFeePercentage: number;

  @Column()
  blockchain: string;

  @Column()
  transactionHash: string;

  @Column('bigint', { nullable: true })
  blockNumber: bigint;

  @CreateDateColumn()
  executedAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 'pending' })
  settlementStatus: string;
}
```

### Trades Service

```typescript
// services/trades.service.ts
@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>
  ) {}

  async create(dto: CreateTradeDto) {
    const trade = this.tradeRepository.create({
      ...dto,
      tradeId: this.generateTradeId()
    });
    
    return this.tradeRepository.save(trade);
  }

  async findByUser(userId: string, filters?: TradeFilters) {
    const queryBuilder = this.tradeRepository
      .createQueryBuilder('trade')
      .where('(trade.buyer.id = :userId OR trade.seller.id = :userId)', { userId });
    
    if (filters?.assetId) {
      queryBuilder.andWhere('trade.asset.id = :assetId', { 
        assetId: filters.assetId 
      });
    }
    
    if (filters?.status) {
      queryBuilder.andWhere('trade.status = :status', { 
        status: filters.status 
      });
    }
    
    if (filters?.startDate) {
      queryBuilder.andWhere('trade.executedAt >= :startDate', {
        startDate: filters.startDate
      });
    }
    
    if (filters?.endDate) {
      queryBuilder.andWhere('trade.executedAt <= :endDate', {
        endDate: filters.endDate
      });
    }
    
    queryBuilder
      .orderBy('trade.executedAt', 'DESC')
      .skip((filters?.page - 1) * (filters?.limit || 20))
      .take(filters?.limit || 20);
    
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 20
    };
  }

  async findByAsset(assetId: string, filters?: TradeFilters) {
    const queryBuilder = this.tradeRepository
      .createQueryBuilder('trade')
      .where('trade.asset.id = :assetId', { assetId })
      .orderBy('trade.executedAt', 'DESC');
    
    // Apply filters similar to findByUser
    
    return queryBuilder.getMany();
  }

  async getStatistics(userId: string, assetId?: string) {
    const queryBuilder = this.tradeRepository
      .createQueryBuilder('trade')
      .select('COUNT(trade.id)', 'totalTrades')
      .addSelect('SUM(trade.totalValueUsd)', 'totalVolume')
      .addSelect('AVG(trade.totalValueUsd)', 'averageTradeSize')
      .addSelect('MIN(trade.pricePerTokenUsd)', 'minPrice')
      .addSelect('MAX(trade.pricePerTokenUsd)', 'maxPrice')
      .where('(trade.buyer.id = :userId OR trade.seller.id = :userId)', { userId });
    
    if (assetId) {
      queryBuilder.andWhere('trade.asset.id = :assetId', { assetId });
    }
    
    return queryBuilder.getRawOne();
  }
}
```

### Trades Controller

```typescript
// controllers/trades.controller.ts
@Controller('trades')
@UseGuards(JwtAuthGuard)
export class TradesController {
  constructor(private tradesService: TradesService) {}

  @Get()
  async findAll(@Request() req, @Query() filters: TradeFiltersDto) {
    return this.tradesService.findByUser(req.user.id, filters);
  }

  @Get(':tradeId')
  async findOne(@Param('tradeId') tradeId: string, @Request() req) {
    return this.tradesService.findOne(tradeId, req.user.id);
  }

  @Get('asset/:assetId')
  async findByAsset(@Param('assetId') assetId: string, @Query() filters: TradeFiltersDto) {
    return this.tradesService.findByAsset(assetId, filters);
  }

  @Get('history')
  async getHistory(@Request() req, @Query() filters: TradeFiltersDto) {
    return this.tradesService.findByUser(req.user.id, filters);
  }

  @Get('statistics')
  async getStatistics(@Request() req, @Query('assetId') assetId?: string) {
    return this.tradesService.getStatistics(req.user.id, assetId);
  }
}
```

---

## Acceptance Criteria

- [ ] All trade endpoints implemented
- [ ] Trade retrieval by user working
- [ ] Trade retrieval by asset working
- [ ] Trade filtering working
- [ ] Trade statistics working
- [ ] Pagination working
- [ ] Trade details include all relevant information
- [ ] Unit tests for trades service
- [ ] Integration tests for trades API

---

## Deliverables

1. Trade entity/model
2. Trades service with business logic
3. Trades controller with all endpoints
4. Trade statistics calculation
5. DTOs for request/response
6. Unit and integration tests

---

## References

- Database Schema: `../IMPLEMENTATION_PLAN.md` Section 2.1 (Trades Table)
- API Specification: `../IMPLEMENTATION_PLAN.md` Section 3.4
- Order Matching: Task Brief 08

---

## Notes

- Generate unique trade IDs (e.g., "TRD-2025-001")
- Include platform fees in trade records
- Track settlement status separately from execution status
- Support filtering by date range, asset, status
- Calculate statistics efficiently (consider caching)
- Include buyer and seller information in responses
