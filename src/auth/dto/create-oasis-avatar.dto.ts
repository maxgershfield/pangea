import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

/**
 * Request body for creating OASIS avatar
 * All fields are optional - will use token claims if not provided
 */
export class CreateOasisAvatarDto {
	@ApiPropertyOptional({
		description: "User email (uses token claim if not provided)",
		example: "user@example.com",
	})
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({
		description: "Username for the avatar",
		example: "johndoe",
	})
	@IsOptional()
	@IsString()
	username?: string;

	@ApiPropertyOptional({
		description: "User first name",
		example: "John",
	})
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({
		description: "User last name",
		example: "Doe",
	})
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiPropertyOptional({
		description: "Full name (will be split into firstName/lastName)",
		example: "John Doe",
	})
	@IsOptional()
	@IsString()
	name?: string;
}

/**
 * Response for OASIS avatar creation
 * Returns all fields frontend needs to create/update user record
 */
export class CreateOasisAvatarResponseDto {
	@ApiProperty({
		description: "Whether the operation was successful",
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: "Result message",
		example: "OASIS avatar created and linked successfully",
	})
	message: string;

	@ApiProperty({
		description: "Created avatar ID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	avatarId: string;

	@ApiProperty({
		description: "User ID the avatar is linked to",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	userId: string;

	@ApiProperty({
		description: "OASIS username",
		example: "johndoe",
	})
	username: string;

	@ApiProperty({
		description: "User email",
		example: "user@example.com",
	})
	email: string;

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
}
