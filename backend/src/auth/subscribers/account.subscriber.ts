import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { BetterAuthAccount } from '../entities/better-auth-account.entity';

/**
 * Entity Subscriber for Better-Auth Account
 * 
 * This subscriber ensures that accounts created for email/password authentication
 * have provider='credential' set. The Better-Auth TypeORM adapter sometimes
 * creates account records with provider=null, which causes sign-in to fail
 * because Better-Auth queries for provider='credential'.
 */
@EventSubscriber()
export class AccountSubscriber implements EntitySubscriberInterface<BetterAuthAccount> {
  /**
   * Listen to Account entity events
   */
  listenTo() {
    return BetterAuthAccount;
  }

  /**
   * Before insert: Set provider='credential' if password is set but provider is null
   * Also set account_id to email if it's not set (for email/password auth)
   * This is a workaround for Better-Auth TypeORM adapter not setting these correctly
   */
  async beforeInsert(event: InsertEvent<BetterAuthAccount>): Promise<void> {
    const account = event.entity;

    // If account has a password but provider is null, set provider='credential'
    // Better-Auth uses 'credential' as the provider for email/password authentication
    if (account.password && !account.provider) {
      account.provider = 'credential';
      
      // Log for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('[AccountSubscriber] Setting provider=credential for account with password');
      }
    }

    // If we have a user relation, we might need to set account_id to email
    // But we don't have direct access to user email here, so this might need to be done
    // at a different level or via a database trigger
  }

  /**
   * Before update: Set provider='credential' if password is set but provider is null
   */
  async beforeUpdate(event: UpdateEvent<BetterAuthAccount>): Promise<void> {
    const account = event.entity as BetterAuthAccount;

    if (!account) return;

    // If account has a password but provider is null, set provider='credential'
    // Better-Auth uses 'credential' as the provider for email/password authentication
    if (account.password && !account.provider) {
      account.provider = 'credential';
      
      // Log for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('[AccountSubscriber] Setting provider=credential for account with password (update)');
      }
    }
  }
}

