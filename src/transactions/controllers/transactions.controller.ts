import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../../auth/guards/admin.guard.js";
import { JwksJwtGuard } from "../../auth/guards/jwks-jwt.guard.js";
import { DepositDto } from "../dto/deposit.dto.js";
import { TransactionFiltersDto } from "../dto/transaction-filters.dto.js";
import {
	DepositResponseDto,
	TransactionConfirmResponseDto,
	TransactionListResponseDto,
	TransactionResponseDto,
	WithdrawalResponseDto,
} from "../dto/transaction-response.dto.js";
import { WithdrawalDto } from "../dto/withdrawal.dto.js";
import { TransactionsService } from "../services/transactions.service.js";

@ApiTags("Transactions")
@ApiBearerAuth()
@Controller("transactions")
@UseGuards(JwksJwtGuard)
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@Get()
	@ApiOperation({
		summary: "Get all transactions",
		description:
			"Retrieve transaction history for the authenticated user with optional filters. " +
			"Supports filtering by asset ID, transaction type (deposit/withdrawal), status, and date range. " +
			"Returns paginated results with transaction details including transaction hashes, amounts, and blockchain information.",
	})
	@ApiResponse({
		status: 200,
		description: "List of transactions retrieved successfully. Returns paginated results with total count.",
		type: TransactionListResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async findAll(@Request() req, @Query() filters: TransactionFiltersDto) {
		const serviceFilters = {
			...filters,
			startDate: filters.startDate ? new Date(filters.startDate) : undefined,
			endDate: filters.endDate ? new Date(filters.endDate) : undefined,
		};
		return this.transactionsService.findByUser(req.user.id, serviceFilters);
	}

	@Get("pending")
	@ApiOperation({
		summary: "Get pending transactions",
		description:
			"Retrieve all pending transactions for the authenticated user. " +
			"Pending transactions are those that have been initiated but not yet confirmed on the blockchain. " +
			"Use this endpoint to track transactions that are still processing.",
	})
	@ApiResponse({
		status: 200,
		description: "List of pending transactions retrieved successfully. Returns array of transaction records.",
		type: [TransactionResponseDto],
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async getPending(@Request() req) {
		return this.transactionsService.findPending(req.user.id);
	}

	@Get(":txId")
	@ApiOperation({
		summary: "Get transaction by ID",
		description:
			"Retrieve details of a specific transaction including status, transaction hash, and blockchain details. " +
			"The transaction status is fetched from the blockchain via OASIS API using `BlockchainService.getTransaction()`. " +
			"Returns transaction information including status (pending/confirmed/failed), block number, addresses, amount, and confirmations.",
	})
	@ApiParam({
		name: "txId",
		description: "Transaction ID (e.g., TXN-2024-001234) or UUID",
		example: "TXN-2024-001234",
	})
	@ApiResponse({
		status: 200,
		description: "Transaction details retrieved successfully. Includes transaction hash, status, blockchain details, and addresses.",
		type: TransactionResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 404, description: "Transaction not found" })
	async findOne(@Param("txId") txId: string, @Request() req) {
		return this.transactionsService.findOne(txId, req.user.id);
	}

	@Post("deposit")
	@ApiOperation({
		summary: "Initiate deposit",
		description:
			"Initiate a new deposit transaction for the authenticated user. " +
			"This endpoint generates a vault address where the user should send their tokens. " +
			"The deposit will be monitored and confirmed once tokens are received at the vault address. " +
			"Returns the vault address and transaction record. The user must send tokens to the vault address manually.",
	})
	@ApiResponse({
		status: 201,
		description:
			"Deposit initiated successfully. Returns transaction record with vault address where tokens should be sent.",
		type: DepositResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid deposit parameters" })
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async deposit(@Request() req, @Body() dto: DepositDto) {
		return this.transactionsService.initiateDeposit(dto, req.user.id);
	}

	@Post("withdraw")
	@ApiOperation({
		summary: "Initiate withdrawal",
		description:
			"Initiate a new withdrawal transaction for the authenticated user. " +
			"Withdraws tokens to an external wallet address or another user's avatar. " +
			"The system automatically detects if the `toAddress` is a wallet address or avatar ID. " +
			"Supports both Solana and Ethereum blockchains. " +
			"The withdrawal will lock your balance until the transaction completes or fails.",
	})
	@ApiResponse({
		status: 201,
		description: "Withdrawal initiated successfully. Returns transaction record with transaction hash.",
		type: WithdrawalResponseDto,
	})
	@ApiResponse({
		status: 400,
		description:
			"Invalid withdrawal parameters or insufficient balance. " +
			"Common errors: invalid address format, insufficient balance, invalid asset ID.",
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({
		status: 404,
		description: "Asset not found or user missing wallet for the specified blockchain",
	})
	async withdraw(@Request() req, @Body() dto: WithdrawalDto) {
		return this.transactionsService.initiateWithdrawal(dto, req.user.id);
	}

	@Post(":txId/confirm")
	@UseGuards(AdminGuard)
	@ApiOperation({
		summary: "Confirm transaction (Admin)",
		description: "Manually confirm a pending transaction. Requires admin privileges.",
	})
	@ApiParam({
		name: "txId",
		description: "Transaction ID to confirm",
		example: "TXN-2024-001234",
	})
	@ApiResponse({
		status: 200,
		description: "Transaction confirmed successfully",
		type: TransactionConfirmResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 403, description: "Forbidden - Admin access required" })
	@ApiResponse({ status: 404, description: "Transaction not found" })
	async confirm(@Param("txId") txId: string) {
		return this.transactionsService.confirmTransaction(txId);
	}
}
