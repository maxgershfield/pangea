# Pangea Markets Backend

Backend API for the Pangea Markets RWA tokenization and trading platform.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Run migrations
pnpm migration:run

# Start development server
pnpm start:dev

# Verify
curl http://localhost:3000/api/health
```

## Documentation

See [`/docs`](../docs/README.md) for full documentation:

- **[Getting Started](../docs/getting-started.md)** - Installation, environment setup
- **[API Reference](../docs/api-reference.md)** - Endpoint documentation
- **[Architecture](../docs/architecture-overview.md)** - System design, security
- **[Deployment](../docs/deployment-railway.md)** - Railway deployment guide

## Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication (Better-Auth)
│   ├── users/             # User management
│   ├── assets/            # Asset management
│   ├── orders/            # Order management
│   ├── trades/            # Trade execution
│   ├── wallet/            # Wallet integration (OASIS)
│   ├── transactions/      # Deposits/withdrawals
│   └── main.ts            # Entry point
├── migrations/            # Database migrations
└── knip.json             # Unused code detection
```

## Scripts

| Script           | Description        |
| ---------------- | ------------------ |
| `pnpm start:dev` | Development server |
| `pnpm build`     | Production build   |
| `pnpm test`      | Run tests          |
| `pnpm lint`      | ESLint             |
| `pnpm knip`      | Check unused deps  |

## Tech Stack

- NestJS + TypeScript
- PostgreSQL + TypeORM
- Redis (caching, sessions)
- Better-Auth (authentication)
- Vitest (testing)

