# Task Brief: Assets API Implementation

**Phase:** 2 - Core Features  
**Priority:** High  
**Estimated Time:** 4-5 days  
**Dependencies:** Task 02 (Database Schema), Task 05 (Smart Contract Integration)

---

## Overview

Implement the Assets API for managing tokenized real-world assets (RWA). This includes CRUD operations, asset listing, search, and integration with smart contracts.

---

## Requirements

### 1. API Endpoints

Implement the following endpoints:

```
GET    /api/assets                    # List all assets (paginated)
GET    /api/assets/:assetId           # Get asset details
GET    /api/assets/:assetId/orders    # Get order book for asset
GET    /api/assets/:assetId/trades    # Get trade history
GET    /api/assets/:assetId/price     # Get current price
GET    /api/assets/search             # Search assets
POST   /api/assets                    # Create new asset (admin)
PUT    /api/assets/:assetId           # Update asset (admin)
DELETE /api/assets/:assetId           # Delete asset (admin)
```

### 2. Asset Management

- Create tokenized assets
- Link to smart contract addresses
- Store metadata (IPFS URIs, images, legal documents)
- Track asset status (draft, listed, trading, closed)
- Calculate and update prices

### 3. Integration Points

- Link to smart contracts (mint addresses)
- Link to OASIS NFT API for token operations
- Store metadata in database and IPFS
- Calculate prices from order book

---

## Technical Specifications

### Asset Entity

```typescript
// entities/tokenized-asset.entity.ts
@Entity('tokenized_assets')
export class TokenizedAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  assetId: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  assetClass: string; // 'real_estate', 'art', etc.

  @Column({ nullable: true })
  assetType: string;

  @Column('bigint')
  totalSupply: bigint;

  @Column({ default: 0 })
  decimals: number;

  @Column({ nullable: true })
  tokenStandard: string;

  @Column()
  blockchain: string;

  @Column({ default: 'devnet' })
  network: string;

  @Column({ nullable: true })
  contractAddress: string;

  @Column({ nullable: true })
  mintAddress: string;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  totalValueUsd: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  pricePerTokenUsd: number;

  @Column('text', { nullable: true })
  metadataUri: string;

  @Column('text', { nullable: true })
  imageUri: string;

  @Column('text', { nullable: true })
  legalDocumentsUri: string;

  @Column({ default: 'draft' })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issuer_id' })
  issuer: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  listedAt: Date;

  @Column('jsonb', { nullable: true })
  metadata: any;
}
```

### Assets Service

```typescript
// services/assets.service.ts
@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(TokenizedAsset)
    private assetRepository: Repository<TokenizedAsset>,
    private smartContractService: SmartContractService
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    assetClass?: string;
    blockchain?: string;
  }) {
    const { page = 1, limit = 20, ...filters } = query;
    
    const queryBuilder = this.assetRepository.createQueryBuilder('asset');
    
    if (filters.status) {
      queryBuilder.where('asset.status = :status', { status: filters.status });
    }
    
    if (filters.assetClass) {
      queryBuilder.andWhere('asset.assetClass = :assetClass', { 
        assetClass: filters.assetClass 
      });
    }
    
    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(assetId: string) {
    return this.assetRepository.findOne({
      where: { assetId },
      relations: ['issuer']
    });
  }

  async create(dto: CreateAssetDto, issuerId: string) {
    // 1. Create asset record
    const asset = this.assetRepository.create({
      ...dto,
      issuer: { id: issuerId } as User,
      assetId: this.generateAssetId()
    });
    
    // 2. Deploy smart contract if needed
    if (dto.deployContract) {
      const contractAddress = await this.smartContractService.generateRwaToken({
        name: dto.name,
        symbol: dto.symbol,
        totalSupply: dto.totalSupply,
        metadataUri: dto.metadataUri,
        issuerWallet: dto.issuerWallet
      });
      
      asset.contractAddress = contractAddress;
      asset.mintAddress = contractAddress; // For Solana
    }
    
    return this.assetRepository.save(asset);
  }

  async update(assetId: string, dto: UpdateAssetDto) {
    const asset = await this.findOne(assetId);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    
    Object.assign(asset, dto);
    return this.assetRepository.save(asset);
  }

  async getCurrentPrice(assetId: string) {
    // Get best bid/ask from order book
    // Calculate current price
  }

  async search(query: string) {
    // Full-text search on name, description, symbol
  }
}
```

### Assets Controller

```typescript
// controllers/assets.controller.ts
@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  async findAll(@Query() query: FindAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Get(':assetId')
  async findOne(@Param('assetId') assetId: string) {
    return this.assetsService.findOne(assetId);
  }

  @Get(':assetId/orders')
  async getOrderBook(@Param('assetId') assetId: string) {
    // Get order book for asset
  }

  @Get(':assetId/trades')
  async getTradeHistory(@Param('assetId') assetId: string) {
    // Get trade history
  }

  @Get(':assetId/price')
  async getCurrentPrice(@Param('assetId') assetId: string) {
    return this.assetsService.getCurrentPrice(assetId);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.assetsService.search(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Request() req, @Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto, req.user.id);
  }

  @Put(':assetId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('assetId') assetId: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(assetId, dto);
  }

  @Delete(':assetId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('assetId') assetId: string) {
    return this.assetsService.delete(assetId);
  }
}
```

---

## Acceptance Criteria

- [ ] All asset endpoints implemented
- [ ] Asset CRUD operations working
- [ ] Asset listing with pagination
- [ ] Asset search functionality
- [ ] Integration with smart contracts
- [ ] Price calculation from order book
- [ ] Order book retrieval for assets
- [ ] Trade history retrieval
- [ ] Admin-only endpoints protected
- [ ] Unit tests for assets service
- [ ] Integration tests for assets API

---

## Deliverables

1. Asset entity/model
2. Assets service with all business logic
3. Assets controller with all endpoints
4. DTOs for request/response validation
5. Integration with smart contract service
6. Unit and integration tests

---

## References

- Database Schema: `../IMPLEMENTATION_PLAN.md` Section 2.1 (Tokenized Assets Table)
- API Specification: `../IMPLEMENTATION_PLAN.md` Section 3.2
- Smart Contract Integration: Task Brief 05

---

## Notes

- Generate unique asset IDs (e.g., "BHE-2025-001")
- Support multiple asset classes (real estate, art, commodities)
- Store metadata in JSONB for flexibility
- Link to IPFS for images and documents
- Calculate prices from order book (best bid/ask)
- Support multiple blockchains (Solana primary, Ethereum secondary)
