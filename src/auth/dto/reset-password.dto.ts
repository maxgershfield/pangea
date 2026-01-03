import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

/**
 * Request body for password reset
 */
export class ResetPasswordDto {
	@ApiProperty({
		description: "Password reset token from email link",
		example: "abc123def456",
	})
	@IsString()
	token: string;

	@ApiProperty({
		description: "New password (minimum 6 characters)",
		example: "newpassword123",
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	newPassword: string;
}

/**
 * Response for password reset
 */
export class ResetPasswordResponseDto {
	@ApiProperty({
		description: "Confirmation message",
		example: "Password reset successfully",
	})
	message: string;
}
