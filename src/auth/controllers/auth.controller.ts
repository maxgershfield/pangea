import {
	Body,
	Controller,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateOasisAvatarDto, CreateOasisAvatarResponseDto } from "../dto/index.js";
import { JwksJwtGuard } from "../guards/jwks-jwt.guard.js";
import { AuthService } from "../services/auth.service.js";

/**
 * Authentication Controller
 *
 * IMPORTANT: User authentication (login, register, password reset) is handled
 * by Better Auth in the frontend. This controller only provides supplementary
 * endpoints for OASIS integration.
 *
 * Auth Flow:
 * 1. User authenticates via Better Auth (frontend /api/auth/*)
 * 2. Frontend obtains JWT from Better Auth (/api/auth/token)
 * 3. Frontend calls backend with JWT in Authorization header
 * 4. Backend validates JWT via JWKS (/api/auth/jwks)
 * 5. After first login, frontend calls /auth/create-oasis-avatar to link OASIS identity
 */
@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Create OASIS avatar for authenticated Better Auth user
	 *
	 * This endpoint creates an OASIS avatar and links it to the user's
	 * Better Auth account. Should be called after first login/registration.
	 */
	@Post("create-oasis-avatar")
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(JwksJwtGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: "Create OASIS avatar",
		description:
			"Creates an OASIS avatar for the authenticated Better Auth user. " +
			"This links the user's account to the OASIS blockchain identity system, " +
			"enabling wallet and asset management features. Should be called after " +
			"initial registration or first login.",
	})
	@ApiResponse({
		status: 201,
		description: "OASIS avatar created and linked successfully",
		type: CreateOasisAvatarResponseDto,
	})
	@ApiResponse({ status: 400, description: "Email is required" })
	@ApiResponse({ status: 401, description: "Unauthorized - valid JWT required" })
	@ApiResponse({ status: 409, description: "OASIS avatar already exists for this user" })
	async createOasisAvatar(
		@Request() req: { user: import("../guards/jwks-jwt.guard.js").UserContext },
		@Body() body?: CreateOasisAvatarDto
	): Promise<CreateOasisAvatarResponseDto> {
		// Extract user info from Better Auth token (populated by JwksJwtGuard)
		const userId = req.user.id;
		const email = body?.email || req.user.email;
		const name = body?.name || req.user.name;

		if (!email) {
			throw new HttpException(
				"Email is required (either in token or request body)",
				HttpStatus.BAD_REQUEST
			);
		}

		// Split name into firstName/lastName if provided
		let firstName = body?.firstName;
		let lastName = body?.lastName;
		if (name && !firstName && !lastName) {
			const nameParts = name.split(" ");
			firstName = nameParts[0] || "";
			lastName = nameParts.slice(1).join(" ") || "";
		}

		// Create OASIS avatar and link to user
		const avatarId = await this.authService.createOasisAvatarForUser({
			userId,
			email,
			username: body?.username || email.split("@")[0],
			firstName: firstName || "",
			lastName: lastName || "",
		});

		return {
			success: true,
			message: "OASIS avatar created and linked successfully",
			avatarId,
			userId,
		};
	}
}
