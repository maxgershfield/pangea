import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

/**
 * Request body for password reset request
 */
export class ForgotPasswordDto {
	@ApiProperty({
		description: "Email address associated with the account",
		example: "user@example.com",
	})
	@IsEmail()
	email: string;
}

/**
 * Response for password reset request
 */
export class ForgotPasswordResponseDto {
	@ApiProperty({
		description: "Confirmation message",
		example: "If the email exists, a password reset link has been sent",
	})
	message: string;
}
