import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BetterAuthUser } from './better-auth-user.entity';

/**
 * Better-Auth Account Entity (for OAuth providers)
 */
@Entity('account')
export class BetterAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  user_id: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  account_id: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider: string | null;

  @Column({ type: 'text', nullable: true, name: 'access_token' })
  access_token: string | null;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refresh_token: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expires_at: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => BetterAuthUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: BetterAuthUser;
}

