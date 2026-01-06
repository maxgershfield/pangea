import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { TokenizedAsset } from "../../assets/entities/tokenized-asset.entity.js";
import { BetterAuthUser } from "../../auth/entities/better-auth-user.entity.js";

@Entity("orders")
export class Order {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text", unique: true, name: "order_id" })
	orderId: string;

	@ManyToOne(() => BetterAuthUser)
	@JoinColumn({ name: "user_id" })
	@Index("idx_orders_user_id")
	user: BetterAuthUser;

	@Column({ name: "user_id", type: "text" })
	userId: string;

	@ManyToOne(() => TokenizedAsset)
	@JoinColumn({ name: "asset_id" })
	@Index("idx_orders_asset_id")
	asset: TokenizedAsset;

	@Column({ name: "asset_id", type: "uuid" })
	assetId: string;

	@Column({ type: "text", name: "order_type" })
	orderType: "buy" | "sell";

	@Column({ type: "text", name: "order_status", default: "pending" })
	@Index("idx_orders_status")
	@Index("idx_orders_type_status")
	orderStatus: string;

	@Column("decimal", {
		precision: 18,
		scale: 2,
		name: "price_per_token_usd",
	})
	pricePerTokenUsd: number;

	@Column("bigint")
	quantity: bigint;

	@Column("bigint", { default: 0, name: "filled_quantity" })
	filledQuantity: bigint;

	@Column("bigint", { name: "remaining_quantity" })
	remainingQuantity: bigint;

	@Column("decimal", {
		precision: 18,
		scale: 2,
		name: "total_value_usd",
	})
	totalValueUsd: number;

	@Column({ type: "timestamp", nullable: true, name: "expires_at" })
	expiresAt: Date;

	@Column({ type: "text" })
	blockchain: string;

	@Column({ type: "text", nullable: true, name: "transaction_hash" })
	transactionHash: string;

	@Column({ type: "boolean", default: false, name: "is_market_order" })
	isMarketOrder: boolean;

	@Column({ type: "boolean", default: true, name: "is_limit_order" })
	isLimitOrder: boolean;

	@CreateDateColumn({ name: "created_at", type: "timestamp" })
	@Index("idx_orders_created_at")
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at", type: "timestamp" })
	updatedAt: Date;

	@Column({ type: "timestamp", nullable: true, name: "filled_at" })
	filledAt: Date;
}
