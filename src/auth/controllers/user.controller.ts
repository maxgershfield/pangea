import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../decorators/session-auth.decorators.js";
import { UpdateProfileDto, UserProfileDto } from "../dto/user-profile.dto.js";
import { BetterAuthUser } from "../entities/better-auth-user.entity.js";
import { JwksJwtGuard, UserContext } from "../guards/jwks-jwt.guard.js";
import { AuthService } from "../services/auth.service.js";

@ApiTags("User")
@ApiBearerAuth()
@Controller("user")
@UseGuards(JwksJwtGuard)
export class UserController {
	constructor(private readonly authService: AuthService) {}

	@Get("profile")
	@ApiOperation({
		summary: "Get user profile",
		description:
			"Retrieve the profile of the currently authenticated user from the Better Auth user table",
	})
	@ApiResponse({
		status: 200,
		description: "User profile retrieved successfully",
		type: UserProfileDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 404, description: "User not found" })
	async getProfile(@CurrentUser() user: UserContext): Promise<BetterAuthUser> {
		return this.authService.getProfile(user.id);
	}

	@Put("profile")
	@ApiOperation({
		summary: "Update user profile",
		description:
			"Update the profile of the currently authenticated user in the Better Auth user table",
	})
	@ApiResponse({
		status: 200,
		description: "User profile updated successfully",
		type: UserProfileDto,
	})
	@ApiResponse({ status: 400, description: "Invalid update data" })
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing JWT token" })
	@ApiResponse({ status: 404, description: "User not found" })
	async updateProfile(
		@CurrentUser() user: UserContext,
		@Body() updateData: UpdateProfileDto
	): Promise<BetterAuthUser> {
		return this.authService.updateProfile(user.id, updateData);
	}
}
