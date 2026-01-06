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
import { BetterAuthUser } from "../../auth/entities/better-auth-user.entity.js";

@Entity("tokenized_assets")
export class TokenizedAsset {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text", unique: true, name: "asset_id", length: 100 })
	@Index("idx_assets_asset_id")
	assetId: string;

	@Column({ type: "text", length: 255 })
	name: string;

	@Column({ type: "text", length: 20 })
	symbol: string;

	@Column("text", { nullable: true })
	description: string;

	// Asset Classification
	@Column({ type: "text", name: "asset_class", length: 50 })
	assetClass: string; // 'real_estate', 'art', 'commodities', etc.

	@Column({ type: "text", name: "asset_type", length: 50, nullable: true })
	assetType: string; // 'residential', 'commercial', etc.

	// Tokenization Details
	@Column({ name: "total_supply", type: "bigint" })
	totalSupply: bigint;

	@Column({ type: "int", default: 0 })
	decimals: number;

	@Column({ type: "text", name: "token_standard", length: 20, nullable: true })
	tokenStandard: string; // 'SPL', 'ERC-721', 'ERC-1155', 'UAT'

	// Blockchain Details
	@Column({ type: "text", length: 20 })
	@Index("idx_assets_blockchain")
	blockchain: string; // 'solana', 'ethereum', 'radix'

	@Column({ type: "text", length: 20, default: "devnet" })
	network: string; // 'devnet', 'testnet', 'mainnet'

	@Column({ type: "text", name: "contract_address", length: 255, nullable: true })
	@Index("idx_assets_contract_address")
	contractAddress: string;

	@Column({ type: "text", name: "mint_address", length: 255, nullable: true })
	mintAddress: string; // Solana mint address

	// Valuation
	@Column("decimal", {
		precision: 18,
		scale: 2,
		nullable: true,
		name: "total_value_usd",
	})
	totalValueUsd: number;

	@Column("decimal", {
		precision: 18,
		scale: 2,
		nullable: true,
		name: "price_per_token_usd",
	})
	pricePerTokenUsd: number;

	// Metadata
	@Column("text", { name: "metadata_uri", nullable: true })
	metadataUri: string; // IPFS URI

	@Column("text", { name: "image_uri", nullable: true })
	imageUri: string;

	@Column("text", { name: "legal_documents_uri", nullable: true })
	legalDocumentsUri: string;

	// Status
	@Column({ type: "text", length: 20, default: "draft" })
	@Index("idx_assets_status")
	status: string; // 'draft', 'listed', 'trading', 'closed'

	// Issuer relationship
	@ManyToOne(() => BetterAuthUser)
	@JoinColumn({ name: "issuer_id" })
	issuer: BetterAuthUser;

	@Column({ name: "issuer_id", type: "text" })
	issuerId: string;

	// Timestamps
	@CreateDateColumn({ name: "created_at", type: "timestamp" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at", type: "timestamp" })
	updatedAt: Date;

	@Column({ name: "listed_at", type: "timestamp", nullable: true })
	listedAt: Date;

	// Additional JSON metadata
	@Column("jsonb", { nullable: true })
	metadata: Record<string, any>;
}
