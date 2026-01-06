# Decommission Railway Postgres (Runbook)

This runbook removes the legacy Railway Postgres instance after migrating to
Neon as the shared database.

---

## Preconditions

- Backend is using Neon `DATABASE_URL` in all environments.
- Frontend Better Auth is using the same Neon `DATABASE_URL`.
- Alignment migration has run successfully on Neon.
- A recent backup of Railway Postgres exists (optional but recommended).

---

## Steps

1) **Freeze writes (optional but safest)**
   - Announce a short maintenance window if data loss is unacceptable.

2) **Backup Railway Postgres**
   ```bash
   pg_dump "$RAILWAY_DATABASE_URL" > railway-backup.sql
   ```

3) **Verify Neon data**
   - Check auth tables and domain tables exist.
   - Validate user count and a few sample rows.

4) **Update deployment variables**
   - In Railway backend service variables, set:
     - `DATABASE_URL=<neon-connection-string>`
   - Remove any Railway Postgres references.

5) **Restart/redeploy backend**
   - Trigger a deploy on Railway and confirm health checks pass.

6) **Remove Railway Postgres service**
   - In Railway project, delete the Postgres service.
   - Confirm no other services depend on it.

7) **Rotate/cleanup secrets**
   - Remove `RAILWAY_DATABASE_URL` from secret stores.
   - Rotate any credentials that referenced Railway Postgres.

---

## Rollback Plan

If issues appear after cutover:
- Re-enable the Railway Postgres service.
- Set backend `DATABASE_URL` back to the Railway URL.
- Redeploy the backend.

---

## Post-Checks

- `GET /api/health` returns database OK.
- JWT auth works end-to-end (login + `/api/auth/token`).
- Backend reads from `user` and domain tables successfully.
