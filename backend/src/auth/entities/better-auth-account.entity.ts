import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BetterAuthUser } from './better-auth-user.entity';

/**
 * Better-Auth Account Entity (for OAuth providers)
 */
@Entity('account')
export class BetterAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Better-Auth expects camelCase property names, but DB uses snake_case
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'account_id' })
  accountId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'provider' })
  provider: string | null;

  // Better-Auth expects 'providerId' property (mapped to 'provider' column)
  get providerId(): string | null {
    return this.provider;
  }
  
  set providerId(value: string | null) {
    this.provider = value;
  }

  // Password hash for email/password authentication (provider='credential')
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'text', nullable: true, name: 'access_token' })
  accessToken: string | null;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => BetterAuthUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: BetterAuthUser;
}

