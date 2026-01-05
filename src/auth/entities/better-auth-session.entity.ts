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
 * Better-Auth Session Entity
 */
@Entity("session")
export class BetterAuthSession {
	@PrimaryColumn({ type: "text" })
	id: string;

	// Better-Auth expects camelCase property names, but DB uses snake_case
	@Column({ type: "text", name: "user_id" })
	userId: string;

	@Column({ type: "datetime", name: "expires_at" })
	expiresAt: Date;

	@Column({ type: "text", unique: true })
	token: string;

	@Column({ type: "varchar", length: 45, nullable: true, name: "ip_address" })
	ipAddress: string | null;

	@Column({ type: "text", nullable: true, name: "user_agent" })
	userAgent: string | null;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@ManyToOne(() => BetterAuthUser, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	user: BetterAuthUser;
}
