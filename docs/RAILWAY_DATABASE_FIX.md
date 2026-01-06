# Railway Database Connection Fix

## Problem
The Railway staging deployment is failing with `ETIMEDOUT` errors because it cannot connect to the database. The `DATABASE_URL` environment variable is either missing or pointing to the old Railway Postgres instance.

## Solution
Set the `DATABASE_URL` environment variable in Railway staging to point to the Neon database.

## Steps to Fix

### Option 1: Via Railway Web UI (Recommended)

1. Go to your staging project: https://railway.com/project/47499eb4-af5b-45dc-9463-2be4d17709ba?environmentId=e219f4bc-a7cb-485d-967b-0f8b2911e35e

2. Click on your **backend service** (the NestJS service)

3. Go to the **Variables** tab

4. Look for `DATABASE_URL`:
   - **If it exists**: Click on it and update the value
   - **If it doesn't exist**: Click **"New Variable"** and add it

5. Set the value to (with connection timeout for idle Neon computes):
   ```
   postgresql://neondb_owner:npg_5oJxXkB7abUz@ep-sweet-art-a41b7p8i-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&connect_timeout=30
   ```
   
   **Note:** The `connect_timeout=30` parameter gives Neon's compute time to wake up from idle state (up to 30 seconds).

6. Click **Save** or **Add Variable**

7. Railway will automatically redeploy the service with the new environment variable

### Option 2: Via Railway CLI

```bash
# Navigate to the project
cd /Users/maxgershfield/OASIS_CLEAN/pangea-repo

# Link to the staging project (if not already linked)
railway link

# Set the DATABASE_URL variable
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_5oJxXkB7abUz@ep-sweet-art-a41b7p8i-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Verify it was set
railway variables
```

## Verification

After setting the variable, check the deployment logs. You should see:
- ✅ `[InstanceLoader] TypeOrmModule dependencies initialized` (without errors)
- ✅ Application starts successfully
- ❌ No more `ETIMEDOUT` errors

## Important Notes

- **Do NOT** create a PostgreSQL service in Railway - we're using Neon Postgres externally
- The `DATABASE_URL` must be set as an **environment variable** in Railway
- Railway will automatically redeploy when you change environment variables
- The connection string uses the **pooler** endpoint (`-pooler`) which is recommended for serverless/containerized deployments

## Troubleshooting

If you still see connection errors after setting `DATABASE_URL`:

1. **Verify the variable is set**: Check Railway's Variables tab to confirm `DATABASE_URL` exists and has the correct value
2. **Check Neon firewall**: Ensure Neon allows connections from Railway's IP ranges (Neon should allow all by default)
3. **Verify connection string format**: Make sure there are no extra spaces or line breaks in the connection string
4. **Check Neon dashboard**: Verify the database is active and accessible in the Neon console

