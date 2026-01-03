import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
	@ApiProperty({
		description: "User email address or username",
		example: "user@example.com",
	})
	@IsString()
	email: string;

	@ApiProperty({
		description: "User password (minimum 6 characters)",
		example: "password123",
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	password: string;
}
