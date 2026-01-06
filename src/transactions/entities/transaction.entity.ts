import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { TokenizedAsset } from "../../assets/entities/tokenized-asset.entity.js";
import { BetterAuthUser } from "../../auth/entities/better-auth-user.entity.js";

@Entity("transactions")
export class Transaction {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text", unique: true, name: "transaction_id", length: 100 })
	transactionId: string;

	@ManyToOne(() => BetterAuthUser)
	@JoinColumn({ name: "user_id" })
	@Index("idx_transactions_user_id")
	user: BetterAuthUser;

	@Column({ name: "user_id", type: "text" })
	userId: string;

	@ManyToOne(() => TokenizedAsset)
	@JoinColumn({ name: "asset_id" })
	asset: TokenizedAsset;

	@Column({ name: "asset_id", type: "uuid" })
	assetId: string;

	// Transaction Details
	@Column({ type: "text", name: "transaction_type", length: 20 })
	@Index("idx_transactions_type")
	transactionType: string; // 'deposit', 'withdrawal'

	@Column({ type: "text", length: 20, default: "pending" })
	@Index("idx_transactions_status")
	status: string; // 'pending', 'processing', 'completed', 'failed'

	// Amounts
	@Column({ type: "bigint" })
	amount: bigint;

	@Column("decimal", {
		precision: 18,
		scale: 2,
		nullable: true,
		name: "amount_usd",
	})
	amountUsd: number;

	// Blockchain
	@Column({ type: "text", length: 20 })
	blockchain: string;

	@Column({ type: "text", name: "transaction_hash", length: 255, nullable: true })
	@Index("idx_transactions_transaction_hash")
	transactionHash: string;

	@Column({ type: "text", name: "from_address", length: 255, nullable: true })
	fromAddress: string;

	@Column({ type: "text", name: "to_address", length: 255, nullable: true })
	toAddress: string;

	@Column({ name: "block_number", type: "bigint", nullable: true })
	blockNumber: bigint;

	// Timestamps
	@CreateDateColumn({ name: "created_at", type: "timestamp" })
	createdAt: Date;

	@Column({ type: "timestamp", name: "confirmed_at", nullable: true })
	confirmedAt: Date;

	// Metadata
	@Column("jsonb", { nullable: true })
	metadata: Record<string, any>;
}
