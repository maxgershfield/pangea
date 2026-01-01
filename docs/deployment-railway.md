# Railway Deployment Guide

Complete guide for deploying the Pangea backend to Railway.

---

## Why Railway?

| Platform    | Recommendation  | Reason                                                |
| ----------- | --------------- | ----------------------------------------------------- |
| **Railway** | Recommended     | WebSockets, managed Postgres/Redis, simple Git deploy |
| **Vercel**  | Not Recommended | Serverless only, no WebSocket support, timeout limits |

---

## Quick Deploy (5 minutes)

### 1. Create Railway Account
Go to https://railway.app and sign up with GitHub.

### 2. Add Services

In your Railway project, add:
1. **PostgreSQL**: Click "+ New" → "Database" → "PostgreSQL"
2. **Redis**: Click "+ New" → "Database" → "Redis"
3. **Backend**: Click "+ New" → "GitHub Repo" → Select your repo

### 3. Configure Backend Service

**Settings → Deploy:**
```
Root Directory: backend  (or pangea/backend if nested)
Build Command:  npm install && npm run build
Start Command:  npm run start:prod
```

**Settings → Variables:**
```env
NODE_ENV=production
PORT=3000

# Auto-provided by Railway:
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Add manually:
JWT_SECRET=<generate-32-char-random-string>
JWT_EXPIRES_IN=7d
OASIS_API_URL=https://api.oasisweb4.com
OASIS_API_KEY=your-oasis-api-key
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3001
```

Generate a secure JWT_SECRET:
```bash
openssl rand -hex 32
```

### 4. Run Migrations

```bash
npm i -g @railway/cli
railway login
railway link
railway run npm run migration:run
```

### 5. Get Your URL

Railway provides: `https://your-app.up.railway.app`

Test it:
```bash
curl https://your-app.up.railway.app/api/health
```

---

## Pre-Deployment Checklist

### Code
- [ ] All code committed and pushed
- [ ] No hardcoded secrets
- [ ] Build passes locally: `npm run build`
- [ ] Tests pass: `npm test`

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is strong (32+ chars, random)
- [ ] `DATABASE_URL` references Postgres service
- [ ] `REDIS_URL` references Redis service
- [ ] `OASIS_API_URL` and `OASIS_API_KEY` set
- [ ] `CORS_ORIGIN` includes frontend URL

### Database
- [ ] Migrations ready to run
- [ ] Backup strategy in place

---

## Post-Deployment Setup

### Health Check
```bash
curl https://your-app.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Pangea Markets Backend",
  "checks": {
    "database": { "status": "ok" },
    "redis": { "status": "ok" }
  }
}
```

### Test Authentication
```bash
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'
```

### Configure Health Checks
Railway dashboard → Settings → Health Checks:
- Path: `/api/health`
- Interval: 30 seconds

---

## CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up
```

**Setup GitHub Secret:**
1. Railway dashboard → Project Settings → Tokens → New Project Token
2. GitHub repo → Settings → Secrets → New secret: `RAILWAY_TOKEN`

---

## Common Operations

### Deployment
```bash
railway up                           # Deploy current directory
railway up --environment production  # Deploy to specific environment
railway redeploy                     # Redeploy latest
railway status                       # View deployment status
```

### Logs
```bash
railway logs          # View logs
railway logs --tail   # Stream logs in real-time
```

### Database
```bash
railway connect postgres              # Open database shell
railway run npm run migration:run     # Run migrations
railway run npm run migration:revert  # Revert last migration
```

### Environment Variables
```bash
railway variables                     # List all
railway variables set KEY=value       # Set variable
railway variables unset KEY           # Remove variable
```

---

## Troubleshooting

### Build Fails

**Check logs:**
Railway dashboard → Deployments → Failed deployment → View Logs

**Common causes:**
| Error                     | Fix                                       |
| ------------------------- | ----------------------------------------- |
| `package.json not found`  | Set Root Directory correctly              |
| `command not found: nest` | Add `@nestjs/cli` to dependencies         |
| `Cannot find module`      | Run `npm install` locally, push lock file |
| TypeScript errors         | Fix locally first with `npm run build`    |

### Database Connection Fails
1. Verify `DATABASE_URL` is set (use Railway reference: `${{Postgres.DATABASE_URL}}`)
2. Check PostgreSQL service is running
3. Run migrations: `railway run npm run migration:run`
4. Test connection: `railway connect postgres`

### Redis Connection Fails
1. Verify `REDIS_URL` is set (use Railway reference: `${{Redis.REDIS_URL}}`)
2. Check Redis service is running

### CORS Errors
Update `CORS_ORIGIN` to include:
- Your production frontend domain
- `http://localhost:3001` for local development

### WebSocket Issues
Railway supports WebSockets by default. Check:
- CORS settings allow WebSocket origins
- Socket.IO configuration in code

### Port Issues
Railway sets `PORT` automatically. Ensure code uses:
```typescript
const port = process.env.PORT || 3000;
```

---

## API Tokens

### Token Types
| Type          | Scope          | Use Case                   |
| ------------- | -------------- | -------------------------- |
| Project Token | Single project | CI/CD for specific project |
| Account Token | All projects   | Managing multiple projects |
| Team Token    | Team workspace | Team-wide automation       |

### Getting Tokens
**Project Token:** Project Settings → Tokens → New Token
**Account Token:** Profile → Settings → Tokens → New Token

### Using Tokens
```bash
export RAILWAY_TOKEN=your_project_token
railway up
```

---

## Cost Estimates

Railway pricing (as of 2025):
- **Free tier**: $5 credit/month
- **Hobby**: $5/month + usage
- **Pro**: $20/month + usage

Typical monthly costs:
- PostgreSQL: ~$5-10
- Redis: ~$5
- Backend service: ~$5-20

**Total: ~$15-35/month** for small-medium apps

---

## Security Best Practices

1. **JWT Secret**: Generate strong random string (32+ chars)
2. **Never commit tokens**: Use Railway's environment variable system
3. **Restrict CORS**: Only allow your frontend domains
4. **Use project tokens**: Prefer over account tokens for CI/CD
5. **Rotate tokens**: Regenerate periodically

---

## Next Steps After Deployment

1. Set up monitoring/alerting
2. Configure custom domain (optional)
3. Set up staging environment
4. Configure database backups
5. Update frontend to use production URL
6. Test all endpoints
