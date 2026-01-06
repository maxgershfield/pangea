# Architecture Overview

System design and security patterns for the Pangea backend.

---

## Design Pattern

**Read/Write Separation:**
- **Reads (GET)**: Direct from client → Backend API
- **Writes (POST/PUT/DELETE)**: Client → Next.js API Route → Backend API

**Why?** Extra validation and audit trail at Next.js layer for writes.

---

## Security

- **JWT Authentication**: All protected routes require `Authorization: Bearer <token>`
- **User Scoping**: Users can only access their own data
- **Admin Routes**: Require `role: 'admin'` (see `src/auth/guards/roles.guard.ts`)

**Code:**
- Auth guards: `src/auth/guards/`
- JWT strategy: `src/auth/strategies/jwt.strategy.ts`

---

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Order Matching** | `src/orders/services/order-matching.service.ts` | Price-time priority matching |
| **WebSocket** | `src/orders/services/websocket.service.ts` | Real-time updates |
| **OASIS Integration** | `src/services/oasis-*.service.ts` | Auth, wallets, blockchain |
| **Vault Service** | `src/transactions/services/vault.service.ts` | Deposit/withdrawal addresses |

---

## Database

- **PostgreSQL** with TypeORM
- **Entities**: `src/*/entities/`
- **Migrations**: `migrations/`

---

## Error Handling

Standard format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

**Code**: `src/common/filters/http-exception.filter.ts`

---

## CORS

Configured in `src/main.ts` - allows frontend origins only.
