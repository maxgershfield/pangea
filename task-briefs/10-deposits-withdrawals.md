# Task Brief: Deposits & Withdrawals API

**Phase:** 4 - Deposits/Withdrawals  
**Priority:** High  
**Estimated Time:** 5-6 days  
**Dependencies:** Task 02 (Database Schema), Task 04 (OASIS Wallet Integration), Task 05 (Smart Contract Integration)

---

## Overview

Implement the Deposits and Withdrawals API for handling token deposits and withdrawals. This includes blockchain transaction monitoring, balance updates, and transaction history.

---

## Requirements

### 1. API Endpoints

Implement the following endpoints:

```
GET    /api/transactions              # Get transaction history
GET    /api/transactions/:txId        # Get transaction details
POST   /api/transactions/deposit      # Initiate deposit
POST   /api/transactions/withdraw     # Initiate withdrawal
GET    /api/transactions/pending       # Get pending transactions
POST   /api/transactions/:txId/confirm # Confirm transaction (admin)
```

### 2. Deposit Flow

1. User initiates deposit
2. Generate deposit address (vault contract)
3. User sends tokens to address
4. Monitor blockchain for transaction
5. Confirm transaction
6. Update user balance
7. Create transaction record

### 3. Withdrawal Flow

1. User initiates withdrawal
2. Validate user has sufficient balance
3. Lock balance
4. Execute withdrawal on blockchain
5. Wait for confirmation
6. Update balance
7. Create transaction record

### 4. Transaction Monitoring

- Monitor blockchain for deposits
- Track transaction status (pending, confirmed, failed)
- Update balances automatically
- Handle failed transactions

---

## Technical Specifications

### Transaction Entity

```typescript
// entities/transaction.entity.ts
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transactionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TokenizedAsset)
  @JoinColumn({ name: 'asset_id' })
  asset: TokenizedAsset;

  @Column()
  transactionType: 'deposit' | 'withdrawal';

  @Column({ default: 'pending' })
  status: string;

  @Column('bigint')
  amount: bigint;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  amountUsd: number;

  @Column()
  blockchain: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ nullable: true })
  fromAddress: string;

  @Column({ nullable: true })
  toAddress: string;

  @Column('bigint', { nullable: true })
  blockNumber: bigint;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column('jsonb', { nullable: true })
  metadata: any;
}
```

### Transactions Service

```typescript
// services/transactions.service.ts
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private balanceService: BalanceService,
    private blockchainService: BlockchainService,
    private vaultService: VaultService
  ) {}

  async initiateDeposit(dto: DepositDto, userId: string) {
    // 1. Get vault address for asset
    const vaultAddress = await this.vaultService.getVaultAddress(
      dto.assetId,
      dto.blockchain
    );
    
    // 2. Create transaction record
    const transaction = this.transactionRepository.create({
      transactionId: this.generateTransactionId(),
      user: { id: userId } as User,
      asset: { id: dto.assetId } as TokenizedAsset,
      transactionType: 'deposit',
      status: 'pending',
      amount: dto.amount,
      blockchain: dto.blockchain,
      toAddress: vaultAddress,
      metadata: {
        vaultAddress,
        expectedAmount: dto.amount
      }
    });
    
    return this.transactionRepository.save(transaction);
  }

  async initiateWithdrawal(dto: WithdrawalDto, userId: string) {
    // 1. Validate balance
    const balance = await this.balanceService.getBalance(
      userId,
      dto.assetId
    );
    
    if (balance.availableBalance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }
    
    // 2. Lock balance
    await this.balanceService.lockBalance(
      userId,
      dto.assetId,
      dto.amount
    );
    
    // 3. Execute withdrawal on blockchain
    const transactionHash = await this.blockchainService.withdraw({
      user: userId,
      asset: dto.assetId,
      amount: dto.amount,
      toAddress: dto.toAddress,
      blockchain: dto.blockchain
    });
    
    // 4. Create transaction record
    const transaction = this.transactionRepository.create({
      transactionId: this.generateTransactionId(),
      user: { id: userId } as User,
      asset: { id: dto.assetId } as TokenizedAsset,
      transactionType: 'withdrawal',
      status: 'processing',
      amount: dto.amount,
      blockchain: dto.blockchain,
      transactionHash,
      fromAddress: await this.getUserWalletAddress(userId, dto.blockchain),
      toAddress: dto.toAddress
    });
    
    return this.transactionRepository.save(transaction);
  }

  async confirmTransaction(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId }
    });
    
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    
    // 1. Verify on blockchain
    const blockchainTx = await this.blockchainService.getTransaction(
      transaction.transactionHash,
      transaction.blockchain
    );
    
    if (blockchainTx.status !== 'confirmed') {
      throw new BadRequestException('Transaction not confirmed on blockchain');
    }
    
    // 2. Update transaction
    transaction.status = 'completed';
    transaction.confirmedAt = new Date();
    transaction.blockNumber = blockchainTx.blockNumber;
    
    await this.transactionRepository.save(transaction);
    
    // 3. Update balance
    if (transaction.transactionType === 'deposit') {
      await this.balanceService.addBalance(
        transaction.user.id,
        transaction.asset.id,
        transaction.amount
      );
    } else if (transaction.transactionType === 'withdrawal') {
      await this.balanceService.subtractBalance(
        transaction.user.id,
        transaction.asset.id,
        transaction.amount
      );
      await this.balanceService.unlockBalance(
        transaction.user.id,
        transaction.asset.id,
        transaction.amount
      );
    }
    
    return transaction;
  }

  async monitorDeposits() {
    // Background job to monitor blockchain for deposits
    // Check vault addresses for new transactions
    // Create transaction records automatically
  }
}
```

### Transactions Controller

```typescript
// controllers/transactions.controller.ts
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  async findAll(@Request() req, @Query() filters: TransactionFiltersDto) {
    return this.transactionsService.findByUser(req.user.id, filters);
  }

  @Get(':txId')
  async findOne(@Param('txId') txId: string, @Request() req) {
    return this.transactionsService.findOne(txId, req.user.id);
  }

  @Post('deposit')
  async deposit(@Request() req, @Body() dto: DepositDto) {
    return this.transactionsService.initiateDeposit(dto, req.user.id);
  }

  @Post('withdraw')
  async withdraw(@Request() req, @Body() dto: WithdrawalDto) {
    return this.transactionsService.initiateWithdrawal(dto, req.user.id);
  }

  @Get('pending')
  async getPending(@Request() req) {
    return this.transactionsService.findPending(req.user.id);
  }

  @Post(':txId/confirm')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async confirm(@Param('txId') txId: string) {
    return this.transactionsService.confirmTransaction(txId);
  }
}
```

---

## Acceptance Criteria

- [ ] All transaction endpoints implemented
- [ ] Deposit initiation working
- [ ] Withdrawal initiation working
- [ ] Transaction confirmation working
- [ ] Balance updates after confirmation
- [ ] Transaction monitoring (background job)
- [ ] Transaction history retrieval
- [ ] Error handling for failed transactions
- [ ] Unit tests for transactions service
- [ ] Integration tests for transactions API

---

## Deliverables

1. Transaction entity/model
2. Transactions service with business logic
3. Transactions controller with all endpoints
4. Blockchain monitoring service
5. Vault integration
6. Background job for monitoring
7. Unit and integration tests

---

## References

- Database Schema: `../IMPLEMENTATION_PLAN.md` Section 2.1 (Transactions Table)
- API Specification: `../IMPLEMENTATION_PLAN.md` Section 3.6
- Smart Contract Integration: Task Brief 05
- OASIS Wallet Integration: Task Brief 04

---

## Notes

- Generate unique transaction IDs (e.g., "TXN-2025-001")
- Lock balances during withdrawal process
- Monitor blockchain for deposit confirmations
- Handle failed transactions (unlock balances, update status)
- Support multiple blockchains (Solana, Ethereum)
- Consider using webhooks for blockchain events
- Add rate limiting for withdrawal requests
- Require admin approval for large withdrawals (optional)
