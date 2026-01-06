import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("user")
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text", unique: true })
	@Index("idx_users_email")
	email: string;

	@Column({ type: "text", name: "password_hash", nullable: true })
	passwordHash: string; // Nullable if using OASIS auth only

	@Column({ type: "text", nullable: true })
	username: string;

	@Column({ type: "text", nullable: true })
	firstName: string;

	@Column({ type: "text", nullable: true })
	lastName: string;

	// Link to OASIS Avatar
	@Column({ type: "text", name: "avatar_id", unique: true, nullable: true })
	avatarId: string;

	// Wallet addresses (from OASIS Wallet API)
	@Column({ type: "text", name: "wallet_address_solana", nullable: true })
	walletAddressSolana: string;

	@Column({ type: "text", name: "wallet_address_ethereum", nullable: true })
	walletAddressEthereum: string;

	// User role
	@Column({ type: "text", default: "user" })
	role: string;

	// KYC status
	@Column({ type: "text", name: "kyc_status", default: "pending" })
	kycStatus: string;

	// Timestamps
	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@Column({ type: "timestamp", name: "last_login", nullable: true })
	lastLogin: Date;

	@Column({ type: "boolean", name: "is_active", default: true })
	isActive: boolean;
}
