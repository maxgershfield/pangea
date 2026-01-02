import { Module } from '@nestjs/common';
import { SmartContractService } from './services/smart-contract.service.js';
import { SmartContractsController } from './controllers/smart-contracts.controller.js';

@Module({
  controllers: [SmartContractsController],
  providers: [SmartContractService],
  exports: [SmartContractService],
})
export class SmartContractsModule {}
