# Task Brief: Project Setup & Infrastructure

**Phase:** 1 - Foundation  
**Priority:** Critical  
**Estimated Time:** 2-3 days  
**Dependencies:** None

---

## Overview

Set up the foundational project structure, development environment, and basic infrastructure for the Pangea Markets backend.

---

## Requirements

### 1. Project Structure

Create a NestJS (or Express) project with the following structure:

```
pangea/backend/
├── src/
│   ├── auth/              # Authentication module
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
│   └── config/           # Configuration
├── tests/
├── migrations/            # Database migrations
├── package.json
├── tsconfig.json
└── .env.example
```

### 2. Technology Stack

- **Framework:** NestJS (TypeScript) or Express
- **Database:** PostgreSQL
- **Cache:** Redis
- **Language:** TypeScript
- **Package Manager:** npm or yarn

### 3. Configuration Files

- `.env.example` with all required environment variables
- `tsconfig.json` with proper TypeScript configuration
- `package.json` with all dependencies
- `.gitignore` for Node.js projects
- `README.md` with setup instructions

### 4. Development Tools

- ESLint configuration
- Prettier configuration
- Git hooks (optional, via Husky)
- Docker setup (optional, for local development)

---

## Technical Specifications

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pangea
REDIS_URL=redis://localhost:6379

# OASIS API
OASIS_API_URL=https://api.oasisplatform.world
OASIS_API_KEY=your_api_key_here

# Smart Contract Generator
SMART_CONTRACT_GENERATOR_URL=http://localhost:5000

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Blockchain
SOLANA_RPC_URL=https://api.devnet.solana.com
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your_key
```

### Dependencies

**Core:**
- `@nestjs/core` (if using NestJS)
- `@nestjs/common`
- `@nestjs/config`
- `@nestjs/typeorm` or `typeorm`
- `pg` (PostgreSQL driver)
- `redis` or `ioredis`
- `jsonwebtoken`
- `bcrypt`

**Utilities:**
- `class-validator`
- `class-transformer`
- `axios` (for OASIS API calls)
- `dotenv`

---

## Acceptance Criteria

- [ ] Project structure created and organized
- [ ] All configuration files in place
- [ ] Environment variables documented in `.env.example`
- [ ] Dependencies installed and working
- [ ] Basic server can start and respond to health check
- [ ] Database connection established (PostgreSQL)
- [ ] Redis connection established
- [ ] TypeScript compiles without errors
- [ ] ESLint and Prettier configured
- [ ] README with setup instructions

---

## Deliverables

1. Complete project structure
2. All configuration files
3. Working development environment
4. Documentation (README.md with setup guide)

---

## References

- Main Implementation Plan: `../IMPLEMENTATION_PLAN.md`
- Project Summary: `../PROJECT_SUMMARY.md`
- OASIS API Integration: `../OASIS_API_REUSE_ANALYSIS.md`

---

## Notes

- Prefer NestJS for better structure and scalability
- Ensure all paths use TypeScript for type safety
- Set up hot-reload for development
- Consider using Docker Compose for local PostgreSQL and Redis
