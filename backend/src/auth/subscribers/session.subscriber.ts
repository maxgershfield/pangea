import { randomBytes } from "node:crypto";
import {
	type EntitySubscriberInterface,
	EventSubscriber,
	type InsertEvent,
} from "typeorm";
import { BetterAuthSession } from "../entities/better-auth-session.entity.js";

/**
 * Entity Subscriber for Better-Auth Session
 *
 * This subscriber ensures that session IDs are always set before insertion.
 * The Better-Auth TypeORM adapter sometimes fails to set the session ID,
 * so we intercept the insert and generate one if missing.
 *
 * Better-Auth generates session IDs as base64-encoded random bytes (32 bytes = 44 chars base64).
 */
@EventSubscriber()
export class SessionSubscriber
	implements EntitySubscriberInterface<BetterAuthSession>
{
	/**
	 * Listen to Session entity events
	 */
	listenTo() {
		return BetterAuthSession;
	}

	/**
	 * Before insert: Ensure session ID is set
	 * Better-Auth generates session IDs as base64-encoded random bytes (32 bytes = 44 chars base64)
	 */
	async beforeInsert(event: InsertEvent<BetterAuthSession>): Promise<void> {
		const session = event.entity;

		// If ID is missing or null, generate one in Better-Auth format
		if (!session.id || session.id === null || session.id === undefined) {
			// Better-Auth uses base64-encoded random bytes for session IDs
			// Generate 32 random bytes and encode as base64 (results in 44 characters)
			const randomId = randomBytes(32).toString("base64");
			session.id = randomId;

			// Log for debugging (only in development)
			if (process.env.NODE_ENV === "development") {
				console.log("[SessionSubscriber] Generated session ID:", session.id);
			}
		}
	}
}
