# Getting Started

Quick setup guide for the Pangea Markets backend.

---

## Prerequisites

- Node.js 22+ and pnpm
- PostgreSQL 14+
- Redis 6+

---

## Installation

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables) below).

### 3. Database Setup

```bash
# Create database
createdb pangea

# Run migrations
pnpm migration:run
```

### 4. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or local installation
redis-server
```

### 5. Run the Application

```bash
# Development (with hot-reload)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

### 6. Verify Setup

```bash
curl http://localhost:3000/api/health
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

---

## Environment Variables

### Required

```env
# Node
NODE_ENV=development
PORT=3000

# Database
# Use Neon in shared environments; local Postgres is fine for isolated dev.
DATABASE_URL=postgresql://user:password@localhost:5432/pangea

# Redis
REDIS_URL=redis://localhost:6379

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET=your-32-char-random-string
JWT_EXPIRES_IN=7d

# OASIS API
OASIS_API_URL=https://api.oasisweb4.com
OASIS_ADMIN_USERNAME=OASIS_ADMIN
OASIS_ADMIN_PASSWORD=your-password
```

### Optional

```env
# Blockchain RPCs
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# CORS (comma-separated)
CORS_ORIGIN=http://localhost:3001,https://your-frontend.com
```

---

## Available Scripts

| Script            | Description                        |
| ----------------- | ---------------------------------- |
| `pnpm start:dev`  | Development server with hot-reload |
| `pnpm build`      | Build for production               |
| `pnpm start:prod` | Production server                  |
| `pnpm test`       | Run unit tests                     |
| `pnpm test:cov`   | Run tests with coverage            |
| `pnpm lint`       | Run ESLint                         |
| `pnpm format`     | Format with Prettier               |

---

## Database Migrations

```bash
# Generate new migration
pnpm migration:generate -- migrations/MigrationName

# Run migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert
```

---

## Project Structure

```
pangea-backend/
├── src/
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── assets/            # Asset management
│   ├── orders/            # Order management
│   ├── trades/            # Trade execution
│   ├── wallet/            # Wallet integration
│   ├── transactions/      # Deposits/withdrawals
│   ├── admin/             # Admin endpoints
│   ├── blockchain/        # Blockchain services
│   ├── smart-contracts/   # Smart contract integration
│   ├── common/            # Shared utilities
│   ├── config/            # Configuration
│   └── main.ts            # Entry point
├── migrations/            # Database migrations
├── docs/                  # Documentation
├── knip.json             # Unused code detection
└── vitest.config.ts      # Test configuration
```

---

## Technology Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis (ioredis)
- **Testing**: Vitest
- **Validation**: class-validator, class-transformer
- **Authentication**: Better-Auth with session tokens

---

## Security Notes

1. **Generate a strong JWT_SECRET**:
   ```bash
   openssl rand -hex 32
   ```

2. **Never commit secrets to Git** - use environment variables

3. **Use different secrets per environment** - dev, staging, production

4. **OASIS token is auto-refreshed** - no manual intervention needed

---

## Next Steps

- [API Reference](./api-reference.md) - Endpoint documentation
- [Architecture Overview](./architecture-overview.md) - System design
- [Deployment Guide](./deployment-railway.md) - Railway deployment (Neon DB)
- [Neon Connection Check](./NEON_CONNECTION_CHECK.md) - Neon database setup and validation
