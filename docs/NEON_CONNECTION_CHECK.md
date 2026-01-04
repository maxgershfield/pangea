# Neon Connection Check

This guide documents the shared Neon Postgres setup used by both the frontend
(Better Auth tables) and the backend (domain tables).

---

## Current Architecture

- **Single shared database** hosted on Neon.
- **Frontend (Better Auth)** owns the auth tables: `user`, `session`, `account`,
  `verification`, `jwks`.
- **Backend** owns domain tables: `tokenized_assets`, `orders`, `trades`,
  `transactions`, `user_balances`, `order_book_snapshots`.
- **Canonical user ID** is Better Auth `user.id` (text).

---

## Environment Variables

### Backend

```env
# Shared Neon database
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

### Frontend (packages/auth)

```env
# Same Neon database (shared)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

---

## Pooler vs Direct URLs

- **Pooler URL**: recommended for app runtime (better connection limits).
- **Direct URL**: recommended for heavy DDL or large migrations.

If you only have one URL, it is still safe to use the pooler for normal
migrations, but prefer the direct URL for large schema changes.

---

## Verify Connection

```bash
psql "$DATABASE_URL" -c "select 1";
```

Check that auth tables exist:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('user','session','account','verification','jwks');
```

Check that backend tables exist:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('tokenized_assets','orders','trades','transactions','user_balances');
```

---

## Migrations

### Backend (Neon alignment)

```bash
DATABASE_URL=postgresql://... npm run migration:run:neon
```

This uses the alignment migration only and avoids replaying legacy migrations.

### Frontend (Better Auth)

Prefer migrations (generated with `drizzle-kit`) over force pushes on the shared
DB. Avoid `db:push --force` when backend domain tables exist.

---

## Common Issues

- **"too many connections"**: switch to the Neon pooler URL for runtime.
- **Schema drift**: ensure both backend and frontend point to the same Neon DB.
- **Accidental legacy migrations**: use the `migration:run:neon` script.
