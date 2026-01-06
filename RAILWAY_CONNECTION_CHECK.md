# Railway Connection Check

**Railway Project:** https://railway.com/project/47499eb4-af5b-45dc-9463-2be4d17709ba  
**Service:** https://railway.com/project/47499eb4-af5b-45dc-9463-2be4d17709ba/service/2dc6f27d-ee7c-481a-8ea5-51ab4439e358

---

## How Railway Provides Connection Strings

Railway automatically provides environment variables when services are linked:

1. **PostgreSQL Service** → Provides `DATABASE_URL`
2. **Redis Service** → Provides `REDIS_URL`

These are automatically injected into your application's environment when deployed on Railway.

---

## Current Configuration

### Database Config (`src/config/database.config.ts`)
✅ **Configured to use Railway:**
- Checks for `DATABASE_URL` first (Railway provides this)
- Falls back to individual `DB_HOST`, `DB_PORT`, etc. if not provided
- Uses connection string format: `postgresql://user:password@host:port/database`

### Redis Config (`src/config/redis.module.ts`)
✅ **Configured to use Railway:**
- Checks for `REDIS_URL` first (Railway provides this)
- Falls back to individual `REDIS_HOST`, `REDIS_PORT` if not provided
- Uses connection string format: `redis://host:port` or `redis://:password@host:port`

---

## How to Verify Connection

### On Railway (Production)
Railway automatically injects:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

**Check in Railway Dashboard:**
1. Go to your service
2. Click "Variables" tab
3. Verify `DATABASE_URL` and `REDIS_URL` are present

### Local Development
To test locally with Railway services:

1. **Get connection strings from Railway:**
   - Go to PostgreSQL service → "Connect" → Copy connection string
   - Go to Redis service → "Connect" → Copy connection string

2. **Create `.env` file:**
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   REDIS_URL=redis://host:port
   OASIS_API_URL=https://api.oasisplatform.world
   JWT_SECRET=your-secret-key
   PORT=3000
   NODE_ENV=development
   ```

3. **Start server:**
   ```bash
   npm run start:dev
   ```

---

## Connection Test

The backend will:
1. ✅ Read `DATABASE_URL` from environment (Railway provides this)
2. ✅ Read `REDIS_URL` from environment (Railway provides this)
3. ✅ Connect to PostgreSQL on startup
4. ✅ Connect to Redis on startup

**If connections fail, you'll see errors in the logs:**
- Database connection errors
- Redis connection errors

---

## Verification Steps

1. **Check Railway Variables:**
   - Ensure PostgreSQL service is linked
   - Ensure Redis service is linked
   - Verify `DATABASE_URL` and `REDIS_URL` are in service variables

2. **Check Application Logs:**
   - Look for "Database connected" or connection errors
   - Look for "Redis connected" or connection errors

3. **Test Connection:**
   - Server should start without database/Redis errors
   - API endpoints should respond

---

*Last updated: January 2025*








