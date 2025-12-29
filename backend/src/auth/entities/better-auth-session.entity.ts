import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BetterAuthUser } from './better-auth-user.entity';

/**
 * Better-Auth Session Entity
 */
@Entity('session')
export class BetterAuthSession {
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  user_id: string | null;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expires_at: Date | null;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  token: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  user_agent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => BetterAuthUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: BetterAuthUser;
}

