import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import { BetterAuthUser } from "./better-auth-user.entity.js";

/**
 * Better-Auth Account Entity (for OAuth providers)
 */
@Entity("account")
export class BetterAuthAccount {
	@PrimaryColumn({ type: "text" })
	id: string;

	// Better-Auth expects camelCase property names, but DB uses snake_case
	@Column({ type: "text", name: "user_id" })
	userId: string;

	@Column({ type: "text", name: "account_id" })
	accountId: string;

	// Better-Auth expects 'providerId' property (mapped to 'provider_id' column)
	@Column({ type: "text", name: "provider_id" })
	providerId: string;

	// Password hash for email/password authentication (provider='credential')
	@Column({ type: "text", nullable: true })
	password: string | null;

	@Column({ type: "text", nullable: true, name: "access_token" })
	accessToken: string | null;

	@Column({ type: "text", nullable: true, name: "refresh_token" })
	refreshToken: string | null;

	@Column({ type: "timestamp", nullable: true, name: "access_token_expires_at" })
	accessTokenExpiresAt: Date | null;

	@Column({ type: "timestamp", nullable: true, name: "refresh_token_expires_at" })
	refreshTokenExpiresAt: Date | null;

	@Column({ type: "text", nullable: true })
	scope: string | null;

	@Column({ type: "text", nullable: true, name: "id_token" })
	idToken: string | null;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@ManyToOne(() => BetterAuthUser, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	user: BetterAuthUser;
}
