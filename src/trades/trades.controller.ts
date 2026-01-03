import { Controller, Get, Param, ParseUUIDPipe, Query, Request, UseGuards } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { JwksJwtGuard } from "../auth/guards/jwks-jwt.guard.js";
import { TradeListResponseDto, TradeResponseDto, TradeStatisticsDto } from "./dto/index.js";
import { TradeFiltersDto } from "./dto/trade-filters.dto.js";
import { TradesService } from "./trades.service.js";

@ApiTags("Trades")
@ApiBearerAuth()
@Controller("trades")
@UseGuards(JwksJwtGuard)
export class TradesController {
	constructor(private readonly tradesService: TradesService) {}

	@Get()
	@ApiOperation({
		summary: "Get all trades",
		description: "Retrieve all trades for the authenticated user with optional filters",
	})
	@ApiResponse({
		status: 200,
		description: "List of trades retrieved successfully",
		type: TradeListResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async findAll(@Request() req, @Query() filters: TradeFiltersDto): Promise<TradeListResponseDto> {
		const tradeFilters = this.mapFiltersDtoToFilters(filters);
		return this.tradesService.findByUser(req.user.id, tradeFilters);
	}

	@Get("history")
	@ApiOperation({
		summary: "Get trade history",
		description: "Retrieve trade history for the authenticated user (alias for GET /trades)",
	})
	@ApiResponse({
		status: 200,
		description: "Trade history retrieved successfully",
		type: TradeListResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async getHistory(
		@Request() req,
		@Query() filters: TradeFiltersDto
	): Promise<TradeListResponseDto> {
		const tradeFilters = this.mapFiltersDtoToFilters(filters);
		return this.tradesService.findByUser(req.user.id, tradeFilters);
	}

	@Get("statistics")
	@ApiOperation({
		summary: "Get trade statistics",
		description: "Retrieve trade statistics for the authenticated user, optionally filtered by asset",
	})
	@ApiQuery({
		name: "assetId",
		required: false,
		description: "Filter statistics by asset UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "Trade statistics retrieved successfully",
		type: TradeStatisticsDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	async getStatistics(
		@Request() req,
		@Query("assetId") assetId?: string
	): Promise<TradeStatisticsDto> {
		return this.tradesService.getStatistics(req.user.id, assetId);
	}

	@Get("asset/:assetId")
	@ApiOperation({
		summary: "Get trades by asset",
		description: "Retrieve all trades for a specific asset",
	})
	@ApiParam({
		name: "assetId",
		description: "Asset UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "Trades for asset retrieved successfully",
		type: TradeListResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 404, description: "Asset not found" })
	async findByAsset(
		@Param("assetId", ParseUUIDPipe) assetId: string,
		@Query() filters: TradeFiltersDto
	): Promise<TradeListResponseDto> {
		const tradeFilters = this.mapFiltersDtoToFilters(filters);
		return this.tradesService.findByAsset(assetId, tradeFilters);
	}

	@Get(":tradeId")
	@ApiOperation({
		summary: "Get trade by ID",
		description: "Retrieve details of a specific trade by its ID",
	})
	@ApiParam({
		name: "tradeId",
		description: "Trade ID (e.g., TRD-2024-001234) or UUID",
		example: "TRD-2024-001234",
	})
	@ApiResponse({
		status: 200,
		description: "Trade details retrieved successfully",
		type: TradeResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 404, description: "Trade not found" })
	async findOne(@Param("tradeId") tradeId: string, @Request() req): Promise<TradeResponseDto> {
		const trade = await this.tradesService.findOne(tradeId, req.user.id);
		return this.tradesService.mapTradeToResponse(trade);
	}

	private mapFiltersDtoToFilters(filters: TradeFiltersDto) {
		return {
			assetId: filters.assetId,
			status: filters.status,
			settlementStatus: filters.settlementStatus,
			startDate: filters.startDate ? new Date(filters.startDate) : undefined,
			endDate: filters.endDate ? new Date(filters.endDate) : undefined,
			page: filters.page,
			limit: filters.limit,
		};
	}
}
