import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * User object returned in auth responses
 */
export class AuthUserDto {
	@ApiProperty({
		description: "Unique user identifier",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	id: string;

	@ApiProperty({
		description: "User email address",
		example: "user@example.com",
	})
	email: string;

	@ApiProperty({
		description: "Username",
		example: "johndoe",
	})
	username: string;

	@ApiPropertyOptional({
		description: "User first name",
		example: "John",
	})
	firstName?: string;

	@ApiPropertyOptional({
		description: "User last name",
		example: "Doe",
	})
	lastName?: string;

	@ApiProperty({
		description: "OASIS avatar identifier",
		example: "avatar_123456",
	})
	avatarId: string;

	@ApiProperty({
		description: "User role",
		example: "user",
		enum: ["user", "admin"],
	})
	role: string;
}

/**
 * Response returned from login and register endpoints
 */
export class AuthResponseDto {
	@ApiProperty({
		description: "Authenticated user details",
		type: AuthUserDto,
	})
	user: AuthUserDto;

	@ApiProperty({
		description: "JWT access token",
		example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	})
	token: string;

	@ApiProperty({
		description: "Token expiration timestamp",
		example: "2024-01-15T12:00:00.000Z",
	})
	expiresAt: Date;
}
