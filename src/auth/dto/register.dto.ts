import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
	@ApiProperty({
		description: "User email address",
		example: "user@example.com",
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: "User password (minimum 6 characters)",
		example: "password123",
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	password: string;

	@ApiProperty({
		description: "Unique username for the account",
		example: "johndoe",
	})
	@IsString()
	username: string;

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
}
