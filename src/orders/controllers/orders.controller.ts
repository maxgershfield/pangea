import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/session-auth.decorators.js";
import { JwksJwtGuard } from "../../auth/guards/jwks-jwt.guard.js";
import {
	CreateOrderDto,
	OrderFiltersDto,
	OrderListResponseDto,
	OrderResponseDto,
	OrderSuccessResponseDto,
	UpdateOrderDto,
} from "../dto/index.js";
import { OrdersService } from "../services/orders.service.js";

@ApiTags("Orders")
@ApiBearerAuth()
@Controller("orders")
@UseGuards(JwksJwtGuard)
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@ApiOperation({
		summary: "Get open orders",
		description: "Returns all open (unfilled) orders for the authenticated user",
	})
	@ApiResponse({
		status: 200,
		description: "List of open orders",
		type: [OrderResponseDto],
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@Get("open")
	async getOpenOrders(@CurrentUser() user: { id: string }) {
		return this.ordersService.getOpenOrders(user.id);
	}

	@ApiOperation({
		summary: "Get order history",
		description: "Returns paginated order history for the authenticated user",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated order history",
		type: OrderListResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@Get("history")
	async getHistory(@CurrentUser() user: { id: string }, @Query() filters: OrderFiltersDto) {
		return this.ordersService.getHistory(user.id, filters);
	}

	@ApiOperation({
		summary: "Get orders by asset",
		description: "Returns all orders for a specific asset (order book data)",
	})
	@ApiParam({
		name: "assetId",
		description: "UUID of the asset",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiResponse({
		status: 200,
		description: "List of orders for the asset",
		type: OrderListResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 404, description: "Asset not found" })
	@Get("asset/:assetId")
	async getOrdersByAsset(
		@Param("assetId") assetId: string,
		@Query() filters: { page?: number; limit?: number }
	) {
		return this.ordersService.findByAsset(assetId, filters);
	}

	@ApiOperation({
		summary: "List user orders",
		description: "Returns paginated list of orders for the authenticated user with optional filters",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated order list",
		type: OrderListResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@Get()
	async findAll(@CurrentUser() user: { id: string }, @Query() filters: OrderFiltersDto) {
		return this.ordersService.findByUser(user.id, filters);
	}

	@ApiOperation({
		summary: "Create order",
		description: "Creates a new buy or sell order for the authenticated user",
	})
	@ApiResponse({
		status: 201,
		description: "Order created successfully",
		type: OrderResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid order data" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 404, description: "Asset not found" })
	@ApiResponse({ status: 422, description: "Insufficient balance" })
	@Post()
	async create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: { id: string }) {
		return this.ordersService.create(createOrderDto, user.id);
	}

	@ApiOperation({
		summary: "Get order details",
		description: "Returns details of a specific order owned by the authenticated user",
	})
	@ApiParam({
		name: "orderId",
		description: "Order ID (not UUID)",
		example: "ORD-2024-001234",
	})
	@ApiResponse({
		status: 200,
		description: "Order details",
		type: OrderResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 404, description: "Order not found" })
	@Get(":orderId")
	async findOne(@Param("orderId") orderId: string, @CurrentUser() user: { id: string }) {
		return this.ordersService.findOne(orderId, user.id);
	}

	@ApiOperation({
		summary: "Update order",
		description: "Updates an existing order (only pending/open orders can be modified)",
	})
	@ApiParam({
		name: "orderId",
		description: "Order ID to update",
		example: "ORD-2024-001234",
	})
	@ApiResponse({
		status: 200,
		description: "Order updated successfully",
		type: OrderResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid update data" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 404, description: "Order not found" })
	@ApiResponse({ status: 409, description: "Order cannot be modified (already filled/cancelled)" })
	@Put(":orderId")
	async update(
		@Param("orderId") orderId: string,
		@Body() updateOrderDto: UpdateOrderDto,
		@CurrentUser() user: { id: string }
	) {
		return this.ordersService.update(orderId, updateOrderDto, user.id);
	}

	@ApiOperation({
		summary: "Cancel order",
		description: "Cancels an existing order (only pending/open orders can be cancelled)",
	})
	@ApiParam({
		name: "orderId",
		description: "Order ID to cancel",
		example: "ORD-2024-001234",
	})
	@ApiResponse({
		status: 200,
		description: "Order cancelled successfully",
		type: OrderSuccessResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 404, description: "Order not found" })
	@ApiResponse({ status: 409, description: "Order cannot be cancelled (already filled/cancelled)" })
	@Delete(":orderId")
	async cancel(@Param("orderId") orderId: string, @CurrentUser() user: { id: string }) {
		return this.ordersService.cancel(orderId, user.id);
	}
}
