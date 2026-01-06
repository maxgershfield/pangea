# Pangea Backend Documentation

**Quick links to code and essential docs.**

---

## 🚀 Quick Start

- **[Getting Started](./getting-started.md)** - Setup and run locally
- **[API Reference](./api-reference.md)** - All endpoints with examples
- **[Deployment](./deployment-railway.md)** - Deploy to Railway

---

## 📍 Where is the code?

### Core Modules

| Feature | Code Location |
|---------|--------------|
| **Authentication** | `src/auth/` - OASIS integration, JWT |
| **Users** | `src/users/` - User entities |
| **Assets** | `src/assets/` - Tokenized RWA assets |
| **Orders** | `src/orders/` - Order creation & matching engine |
| **Trades** | `src/trades/` - Trade history |
| **Wallet** | `src/wallet/` - Phantom/MetaMask integration |
| **Transactions** | `src/transactions/` - Deposits/withdrawals |
| **WebSocket** | `src/orders/services/websocket.service.ts` |

### Key Services

- **Order Matching**: `src/orders/services/order-matching.service.ts`
- **OASIS Wallet**: `src/services/oasis-wallet.service.ts`
- **Vault Management**: `src/transactions/services/vault.service.ts`

### Database

- **Schema**: See TypeORM entities in `src/*/entities/`
- **Migrations**: `migrations/`

---

## 📚 Essential Docs

| Document | Purpose |
|----------|---------|
| [Getting Started](./getting-started.md) | Setup, environment, run locally |
| [API Reference](./api-reference.md) | Complete endpoint docs with examples |
| [Frontend Integration](./frontend-integration.md) | Guide for frontend developers |
| [Architecture](./architecture-overview.md) | System design & security patterns |
| [Deployment](./deployment-railway.md) | Railway deployment guide |

---

## 🔗 External Resources

- **OASIS API**: `https://api.oasisweb4.com` - Auth, wallets, blockchain
- **OpenAPI Spec**: `docs/openapi/pangea-backend-api.yaml`

---

**Need more detail? Check the code - it's well-documented with comments.**
