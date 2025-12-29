import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * Better-Auth Verification Entity (for email verification, password reset, etc.)
 */
@Entity('verification')
export class BetterAuthVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  identifier: string;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

