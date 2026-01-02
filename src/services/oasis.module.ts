import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../config/redis.module.js';
import { OasisTokenManagerService } from './oasis-token-manager.service.js';
import { OasisTokenRefreshJob } from './oasis-token-refresh.job.js';
import { OasisWalletService } from './oasis-wallet.service.js';

/**
 * Global OASIS services module
 * Provides token management and wallet services
 */
@Global()
@Module({
  imports: [ConfigModule, RedisModule],
  providers: [
    OasisTokenManagerService,
    OasisTokenRefreshJob,
    OasisWalletService,
  ],
  exports: [OasisTokenManagerService, OasisWalletService],
})
export class OasisModule {}
