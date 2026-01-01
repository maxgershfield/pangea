import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { UserRole } from "./update-user.dto.js";

export enum KycStatus {
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
}

export class AdminUserFiltersDto {
	@IsOptional()
	@IsEnum(KycStatus)
	kycStatus?: KycStatus;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@IsOptional()
	@IsString()
	search?: string; // Search by email, username, firstName, lastName

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 20;
}
