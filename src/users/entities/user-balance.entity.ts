import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm";
import { TokenizedAsset } from "../../assets/entities/tokenized-asset.entity.js";
import { BetterAuthUser } from "../../auth/entities/better-auth-user.entity.js";

@Entity("user_balances")
@Unique(["userId", "assetId"])
export class UserBalance {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => BetterAuthUser)
	@JoinColumn({ name: "user_id" })
	@Index("idx_balances_user_id")
	user: BetterAuthUser;

	@Column({ name: "user_id", type: "text" })
	userId: string;

	@ManyToOne(() => TokenizedAsset)
	@JoinColumn({ name: "asset_id" })
	@Index("idx_balances_asset_id")
	asset: TokenizedAsset;

	@Column({ name: "asset_id", type: "uuid" })
	assetId: string;

	// Balance
	@Column({ type: "bigint", default: 0 })
	balance: bigint; // Token balance (raw units)

	@Column({ name: "available_balance", type: "bigint", default: 0 })
	availableBalance: bigint; // Available for trading

	@Column({ name: "locked_balance", type: "bigint", default: 0 })
	lockedBalance: bigint; // Locked in orders

	// Blockchain
	@Column({ type: "text", length: 20 })
	blockchain: string;

	@Column({ name: "on_chain_balance", type: "bigint", nullable: true })
	onChainBalance: bigint; // Verified on-chain balance

	// Timestamps
	@Column({ type: "timestamp", name: "last_synced_at", nullable: true })
	lastSyncedAt: Date;

	@UpdateDateColumn({ name: "updated_at", type: "timestamp" })
	updatedAt: Date;
}
