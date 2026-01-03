import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

/**
 * User profile response DTO
 *
 * Matches the Better Auth user table schema with Pangea-specific fields.
 */
export class UserProfileDto {
	@ApiProperty({
		description: "User ID (Better Auth format)",
		example: "abc123xyz",
	})
	id: string;

	@ApiProperty({
		description: "User email address",
		example: "user@example.com",
	})
	email: string;

	@ApiProperty({
		description: "Whether email has been verified",
		example: true,
	})
	emailVerified: boolean;

	@ApiPropertyOptional({
		description: "Full name",
		example: "John Doe",
	})
	name?: string | null;

	@ApiPropertyOptional({
		description: "Profile image URL",
		example: "https://example.com/avatar.jpg",
	})
	image?: string | null;

	@ApiPropertyOptional({
		description: "Username",
		example: "johndoe",
	})
	username?: string | null;

	@ApiPropertyOptional({
		description: "First name",
		example: "John",
	})
	firstName?: string | null;

	@ApiPropertyOptional({
		description: "Last name",
		example: "Doe",
	})
	lastName?: string | null;

	@ApiProperty({
		description: "User role",
		enum: ["user", "admin"],
		example: "user",
		default: "user",
	})
	role: string;

	@ApiProperty({
		description: "KYC verification status",
		enum: ["none", "pending", "verified", "rejected"],
		example: "none",
		default: "none",
	})
	kycStatus: string;

	@ApiPropertyOptional({
		description: "Solana wallet address",
		example: "5KtP...xyz",
	})
	walletAddressSolana?: string | null;

	@ApiPropertyOptional({
		description: "Ethereum wallet address",
		example: "0x...",
	})
	walletAddressEthereum?: string | null;

	@ApiPropertyOptional({
		description: "OASIS Avatar ID (set after calling /auth/create-oasis-avatar)",
		example: "550e8400-e29b-41d4-a716-446655440001",
	})
	avatarId?: string | null;

	@ApiProperty({
		description: "Account creation timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	createdAt: Date;

	@ApiProperty({
		description: "Last update timestamp",
		example: "2024-01-15T10:30:00.000Z",
	})
	updatedAt: Date;
}

/**
 * Update profile request DTO
 */
export class UpdateProfileDto {
	@ApiPropertyOptional({
		description: "First name",
		example: "John",
	})
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({
		description: "Last name",
		example: "Doe",
	})
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiPropertyOptional({
		description: "Email address",
		example: "user@example.com",
	})
	@IsOptional()
	@IsEmail()
	email?: string;
}
