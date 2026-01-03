import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";

/**
 * Better Auth User Entity
 *
 * This entity mirrors the Better Auth `user` table schema defined in the frontend
 * (packages/auth/src/db/schema.ts). The backend uses this to read and update
 * user records managed by Better Auth.
 *
 * IMPORTANT: Better Auth uses text primary keys (not UUID), so we use PrimaryColumn
 * instead of PrimaryGeneratedColumn.
 *
 * Schema alignment:
 * - Core fields: id, name, email, emailVerified, image, createdAt, updatedAt
 * - Pangea fields: username, firstName, lastName, role, kycStatus, walletAddressSolana, walletAddressEthereum
 * - OASIS integration: avatarId (added for OASIS avatar linking)
 */
@Entity("user")
export class BetterAuthUser {
	@PrimaryColumn({ type: "text" })
	id: string;

	@Column({ type: "text", unique: true })
	email: string;

	@Column({ name: "email_verified", type: "boolean", default: false })
	emailVerified: boolean;

	@Column({ type: "text", nullable: true })
	name: string | null;

	@Column({ type: "text", nullable: true })
	image: string | null;

	// Pangea-specific fields (matching frontend schema)
	@Column({ type: "text", nullable: true })
	username: string | null;

	@Column({ name: "first_name", type: "text", nullable: true })
	firstName: string | null;

	@Column({ name: "last_name", type: "text", nullable: true })
	lastName: string | null;

	@Column({ type: "text", default: "user" })
	role: string;

	@Column({ name: "kyc_status", type: "text", default: "none" })
	kycStatus: string;

	@Column({ name: "wallet_address_solana", type: "text", nullable: true })
	walletAddressSolana: string | null;

	@Column({ name: "wallet_address_ethereum", type: "text", nullable: true })
	walletAddressEthereum: string | null;

	// OASIS integration field
	// NOTE: This field needs to be added to the frontend schema as well
	@Column({ name: "avatar_id", type: "text", nullable: true })
	avatarId: string | null;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;
}
