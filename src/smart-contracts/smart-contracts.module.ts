import { Module } from "@nestjs/common";
import { SmartContractsController } from "./controllers/smart-contracts.controller.js";
import { SmartContractService } from "./services/smart-contract.service.js";

@Module({
	controllers: [SmartContractsController],
	providers: [SmartContractService],
	exports: [SmartContractService],
})
export class SmartContractsModule {}
