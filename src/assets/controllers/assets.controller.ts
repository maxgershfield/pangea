import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	Request,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Public } from "../../auth/decorators/public.decorator.js";
import { AdminGuard } from "../../auth/guards/admin.guard.js";
import { JwksJwtGuard } from "../../auth/guards/jwks-jwt.guard.js";
import {
	AssetListResponseDto,
	AssetPriceResponseDto,
	AssetResponseDto,
	AssetTradeEntryDto,
	CreateAssetDto,
	FindAssetsDto,
	OrderBookResponseDto,
	UpdateAssetDto,
} from "../dto/index.js";
import { AssetsService } from "../services/assets.service.js";

@ApiTags("Assets")
@Controller("assets")
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@ApiOperation({
		summary: "List all assets",
		description: "Returns a paginated list of tokenized assets with optional filters",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated asset list",
		type: AssetListResponseDto,
	})
	@Get()
	@Public()
	async findAll(@Query() query: FindAssetsDto) {
		return this.assetsService.findAll(query);
	}

	@ApiOperation({
		summary: "Search assets",
		description: "Search assets by name, symbol, or description",
	})
	@ApiQuery({
		name: "q",
		description: "Search query string",
		example: "real estate",
		required: true,
	})
	@ApiResponse({
		status: 200,
		description: "Matching assets",
		type: [AssetResponseDto],
	})
	@Get("search")
	@Public()
	async search(@Query("q") query: string) {
		return this.assetsService.search(query);
	}

	@ApiOperation({
		summary: "Get asset details",
		description: "Returns detailed information about a specific asset",
	})
	@ApiParam({
		name: "assetId",
		description: "Asset ID or UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "Asset details",
		type: AssetResponseDto,
	})
	@ApiResponse({ status: 404, description: "Asset not found" })
	@Get(":assetId")
	@Public()
	async findOne(@Param("assetId") assetId: string) {
		return this.assetsService.findOne(assetId);
	}

	@ApiOperation({
		summary: "Get order book",
		description: "Returns the current order book (bids and asks) for an asset",
	})
	@ApiParam({
		name: "assetId",
		description: "Asset ID or UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "Order book data",
		type: OrderBookResponseDto,
	})
	@ApiResponse({ status: 404, description: "Asset not found" })
	@Get(":assetId/orders")
	@Public()
	async getOrderBook(@Param("assetId") assetId: string) {
		return this.assetsService.getOrderBook(assetId);
	}

	@ApiOperation({
		summary: "Get trade history",
		description: "Returns recent trades for an asset",
	})
	@ApiParam({
		name: "assetId",
		description: "Asset ID or UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiQuery({
		name: "limit",
		description: "Maximum number of trades to return",
		required: false,
		example: 50,
	})
	@ApiResponse({
		status: 200,
		description: "Trade history",
		type: [AssetTradeEntryDto],
	})
	@ApiResponse({ status: 404, description: "Asset not found" })
	@Get(":assetId/trades")
	@Public()
	async getTradeHistory(@Param("assetId") assetId: string, @Query("limit") limit?: number) {
		return this.assetsService.getTradeHistory(assetId, limit);
	}

	@ApiOperation({
		summary: "Get current price",
		description: "Returns the current price and 24h change for an asset",
	})
	@ApiParam({
		name: "assetId",
		description: "Asset ID or UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "Current price data",
		type: AssetPriceResponseDto,
	})
	@ApiResponse({ status: 404, description: "Asset not found" })
	@Get(":assetId/price")
	@Public()
	async getCurrentPrice(@Param("assetId") assetId: string) {
		return this.assetsService.getCurrentPrice(assetId);
	}

	@ApiOperation({
		summary: "Create asset",
		description: "Creates a new tokenized asset (admin only)",
	})
	@ApiResponse({
		status: 201,
		description: "Asset created successfully",
		type: AssetResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid asset data" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - Admin access required" })
	@ApiBearerAuth()
	@Post()
	@UseGuards(JwksJwtGuard, AdminGuard)
	async create(@Request() req, @Body() dto: CreateAssetDto) {
		return this.assetsService.create(dto, req.user.id);
	}

	@ApiOperation({
		summary: "Update asset",
		description: "Updates an existing asset (admin only)",
	})
	@ApiParam({
		name: "assetId",
		description: "Asset ID or UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "Asset updated successfully",
		type: AssetResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid update data" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - Admin access required" })
	@ApiResponse({ status: 404, description: "Asset not found" })
	@ApiBearerAuth()
	@Put(":assetId")
	@UseGuards(JwksJwtGuard, AdminGuard)
	async update(@Param("assetId") assetId: string, @Body() dto: UpdateAssetDto) {
		return this.assetsService.update(assetId, dto);
	}

	@ApiOperation({
		summary: "Delete asset",
		description: "Soft-deletes an asset by setting status to 'closed' (admin only)",
	})
	@ApiParam({
		name: "assetId",
		description: "Asset ID or UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({ status: 204, description: "Asset deleted successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - Admin access required" })
	@ApiResponse({ status: 404, description: "Asset not found" })
	@ApiBearerAuth()
	@Delete(":assetId")
	@UseGuards(JwksJwtGuard, AdminGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param("assetId") assetId: string) {
		await this.assetsService.delete(assetId);
	}
}
