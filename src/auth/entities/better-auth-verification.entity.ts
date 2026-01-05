import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

/**
 * Better-Auth Verification Entity (for email verification, password reset, etc.)
 */
@Entity("verification")
export class BetterAuthVerification {
	@PrimaryColumn({ type: "text" })
	id: string;

	@Column({ type: "varchar", length: 255 })
	identifier: string;

	@Column({ type: "varchar", length: 255 })
	value: string;

	@Column({ type: "datetime", name: "expires_at" })
	expiresAt: Date;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;
}
