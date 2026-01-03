import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { AdminGuard } from "../../auth/guards/admin.guard.js";
import { JwksJwtGuard } from "../../auth/guards/jwks-jwt.guard.js";
import { DeployRwaTokenDto } from "../dto/deploy-rwa-token.dto.js";
import  { SmartContractService } from "../services/smart-contract.service.js";

@ApiTags("Smart Contracts")
@ApiBearerAuth()
@Controller("smart-contracts")
@UseGuards(JwksJwtGuard, AdminGuard)
export class SmartContractsController {
	constructor(private readonly smartContractService: SmartContractService) {}

	@ApiOperation({ summary: 'Deploy RWA token contract' })
  @ApiResponse({ status: 200, description: 'RWA token deployed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Post('deploy-rwa-token')
  @HttpCode(HttpStatus.OK)
  async deployRwaToken(@Body() dto: DeployRwaTokenDto) {
    const result = await this.smartContractService.generateRwaToken({
      name: dto.name,
      symbol: dto.symbol,
      totalSupply: dto.totalSupply,
      metadataUri: dto.metadataUri || '',
      issuerWallet: dto.issuerWallet,
      decimals: dto.decimals,
    });

    return {
      success: true,
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
      programId: result.programId,
      message: 'RWA Token contract deployed successfully',
    };
  }

	@ApiOperation({ summary: "Deploy order book contract" })
	@ApiResponse({ status: 200, description: "Order book deployed successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({
		status: 403,
		description: "Forbidden - Admin access required",
	})
	@Post("deploy-order-book")
	@HttpCode(HttpStatus.OK)
	async deployOrderBook() {
		const result = await this.smartContractService.deployOrderBook();

		return {
			success: true,
			contractAddress: result.contractAddress,
			transactionHash: result.transactionHash,
			programId: result.programId,
			message: "Order Book contract deployed successfully",
		};
	}

	@ApiOperation({ summary: "Deploy trade execution contract" })
	@ApiResponse({
		status: 200,
		description: "Trade execution deployed successfully",
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({
		status: 403,
		description: "Forbidden - Admin access required",
	})
	@Post("deploy-trade-execution")
	@HttpCode(HttpStatus.OK)
	async deployTradeExecution() {
		const result = await this.smartContractService.deployTradeExecution();

		return {
			success: true,
			contractAddress: result.contractAddress,
			transactionHash: result.transactionHash,
			programId: result.programId,
			message: "Trade Execution contract deployed successfully",
		};
	}

	@ApiOperation({ summary: "Deploy vault contract" })
	@ApiResponse({ status: 200, description: "Vault deployed successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({
		status: 403,
		description: "Forbidden - Admin access required",
	})
	@Post("deploy-vault")
	@HttpCode(HttpStatus.OK)
	async deployVault() {
		const result = await this.smartContractService.deployVault();

		return {
			success: true,
			contractAddress: result.contractAddress,
			transactionHash: result.transactionHash,
			programId: result.programId,
			message: "Vault contract deployed successfully",
		};
	}

	@ApiOperation({ summary: "Get smart contract cache statistics" })
	@ApiResponse({ status: 200, description: "Cache statistics" })
	@Get("cache-stats")
	async getCacheStats() {
		const stats = await this.smartContractService.getCacheStats();
		return stats;
	}
}
