# Task Brief: Admin Panel API

**Phase:** 5 - Admin Panel  
**Priority:** Medium  
**Estimated Time:** 6-7 days  
**Dependencies:** All previous tasks

---

## Overview

Implement the Admin Panel API for managing users, assets, orders, trades, and viewing platform statistics. This includes admin authentication, authorization, and comprehensive management endpoints.

---

## Requirements

### 1. Admin Authentication

- Admin role verification
- Admin-only endpoints protected
- Admin dashboard access

### 2. User Management

- View all users
- View user details
- Update user information
- KYC approval/rejection
- User activity logs
- Wallet address management

### 3. Asset Management

- View all assets
- Create/edit/delete assets
- Approve asset listings
- View asset statistics
- Manage asset metadata

### 4. Order Management

- View all orders
- Cancel orders (emergency)
- Order statistics
- Order analytics

### 5. Trade Management

- View all trades
- Trade analytics
- Settlement monitoring
- Trade statistics

### 6. Transaction Management

- Monitor deposits/withdrawals
- Approve withdrawals (if needed)
- Transaction history
- Transaction analytics

### 7. Platform Statistics

- Total volume
- Active users
- Asset listings
- Revenue/fees
- Trading activity

---

## Technical Specifications

### Admin Guard

```typescript
// guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return user && user.role === 'admin';
  }
}
```

### Admin Service

```typescript
// services/admin.service.ts
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TokenizedAsset)
    private assetRepository: Repository<TokenizedAsset>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>
  ) {}

  async getUsers(filters?: AdminUserFilters) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    if (filters?.kycStatus) {
      queryBuilder.where('user.kycStatus = :kycStatus', {
        kycStatus: filters.kycStatus
      });
    }
    
    if (filters?.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }
    
    return queryBuilder.getMany();
  }

  async updateUserKycStatus(userId: string, status: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });
    
    user.kycStatus = status;
    return this.userRepository.save(user);
  }

  async getPlatformStatistics() {
    const [
      totalUsers,
      activeUsers,
      totalAssets,
      totalOrders,
      totalTrades,
      totalVolume
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.assetRepository.count(),
      this.orderRepository.count(),
      this.tradeRepository.count(),
      this.tradeRepository
        .createQueryBuilder('trade')
        .select('SUM(trade.totalValueUsd)', 'total')
        .getRawOne()
    ]);
    
    return {
      totalUsers,
      activeUsers,
      totalAssets,
      totalOrders,
      totalTrades,
      totalVolume: totalVolume?.total || 0
    };
  }

  async getAssetStatistics(assetId: string) {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId }
    });
    
    const [totalTrades, totalVolume, averagePrice] = await Promise.all([
      this.tradeRepository.count({ where: { asset: { id: assetId } } }),
      this.tradeRepository
        .createQueryBuilder('trade')
        .where('trade.asset.id = :assetId', { assetId })
        .select('SUM(trade.totalValueUsd)', 'total')
        .getRawOne(),
      this.tradeRepository
        .createQueryBuilder('trade')
        .where('trade.asset.id = :assetId', { assetId })
        .select('AVG(trade.pricePerTokenUsd)', 'avg')
        .getRawOne()
    ]);
    
    return {
      asset,
      totalTrades,
      totalVolume: totalVolume?.total || 0,
      averagePrice: averagePrice?.avg || 0
    };
  }
}
```

### Admin Controller

```typescript
// controllers/admin.controller.ts
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getUsers(@Query() filters: AdminUserFiltersDto) {
    return this.adminService.getUsers(filters);
  }

  @Get('users/:userId')
  async getUser(@Param('userId') userId: string) {
    return this.adminService.getUser(userId);
  }

  @Put('users/:userId')
  async updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(userId, dto);
  }

  @Put('users/:userId/kyc')
  async updateKycStatus(
    @Param('userId') userId: string,
    @Body() dto: UpdateKycStatusDto
  ) {
    return this.adminService.updateUserKycStatus(userId, dto.status);
  }

  @Get('assets')
  async getAssets(@Query() filters: AdminAssetFiltersDto) {
    return this.adminService.getAssets(filters);
  }

  @Post('assets')
  async createAsset(@Body() dto: CreateAssetDto) {
    return this.adminService.createAsset(dto);
  }

  @Put('assets/:assetId')
  async updateAsset(@Param('assetId') assetId: string, @Body() dto: UpdateAssetDto) {
    return this.adminService.updateAsset(assetId, dto);
  }

  @Delete('assets/:assetId')
  async deleteAsset(@Param('assetId') assetId: string) {
    return this.adminService.deleteAsset(assetId);
  }

  @Get('orders')
  async getOrders(@Query() filters: AdminOrderFiltersDto) {
    return this.adminService.getOrders(filters);
  }

  @Delete('orders/:orderId')
  async cancelOrder(@Param('orderId') orderId: string) {
    return this.adminService.cancelOrder(orderId);
  }

  @Get('trades')
  async getTrades(@Query() filters: AdminTradeFiltersDto) {
    return this.adminService.getTrades(filters);
  }

  @Get('transactions')
  async getTransactions(@Query() filters: AdminTransactionFiltersDto) {
    return this.adminService.getTransactions(filters);
  }

  @Get('stats')
  async getPlatformStatistics() {
    return this.adminService.getPlatformStatistics();
  }

  @Get('analytics')
  async getAnalytics(@Query() filters: AnalyticsFiltersDto) {
    return this.adminService.getAnalytics(filters);
  }
}
```

---

## Acceptance Criteria

- [ ] Admin guard implemented
- [ ] All admin endpoints implemented
- [ ] User management working
- [ ] Asset management working
- [ ] Order management working
- [ ] Trade management working
- [ ] Transaction management working
- [ ] Platform statistics working
- [ ] Analytics endpoints working
- [ ] Admin-only access enforced
- [ ] Unit tests for admin service
- [ ] Integration tests for admin API

---

## Deliverables

1. Admin guard
2. Admin service with all business logic
3. Admin controller with all endpoints
4. Analytics service
5. Statistics calculation
6. DTOs for all admin operations
7. Unit and integration tests

---

## References

- Main Implementation Plan: `../IMPLEMENTATION_PLAN.md` Section 7
- API Specification: `../IMPLEMENTATION_PLAN.md` Section 3.7

---

## Notes

- All admin endpoints must be protected by AdminGuard
- Log all admin actions for audit trail
- Support filtering and pagination for all list endpoints
- Calculate statistics efficiently (consider caching)
- Support date range filtering for analytics
- Export functionality (CSV/JSON) for reports (optional)
- Real-time dashboard updates via WebSocket (optional)
