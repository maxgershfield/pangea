# Pangea Backend Documentation

Welcome to the Pangea Markets backend documentation.

---

## Quick Start

| Document | Description |
|---------|-------------|
| [Getting Started](./getting-started.md) | Installation, environment setup, running locally |
| [API Reference](./api-reference.md) | Endpoint patterns, authentication, request/response formats |
| [API Endpoints](./api-endpoints.md) | Complete endpoint list with implementation status |
| [OpenAPI Specification](./openapi/README.md) | Complete OpenAPI 3.1.0 specification for the API |

---

## Core Documentation

| Document | Description |
|---------|-------------|
| [Architecture Overview](./architecture-overview.md) | System design, security decisions, read/write patterns |
| [Database Schema](./database-schema.md) | Tables, relationships, indexes, constraints |
| [Frontend Integration](./frontend-integration.md) | Guide for frontend developers integrating with this backend |

---

## Integrations

| Document | Description |
|---------|-------------|
| [Wallet (OASIS)](./wallet-oasis.md) | OASIS wallet API integration for multi-chain support |
| [Remote OASIS API Setup](./REMOTE_OASIS_API_SETUP.md) | Configuration for using remote OASIS API |
| [Smart Contracts](./contracts-spec.md) | Token, Vault, and Order Book contract specifications |

---

## Deployment

| Document | Description |
|---------|-------------|
| [Railway Deployment](./deployment-railway.md) | Complete deployment guide for Railway platform |

---

## Module Documentation

These READMEs are colocated with their source code:

- [`src/auth/README.md`](../src/auth/README.md) - Authentication module internals
- [`src/wallet/README.md`](../src/wallet/README.md) - Wallet module internals

---

## Contributing

When adding new documentation:
1. Use descriptive file names
2. Update this README with links to new docs
3. Keep module-specific docs colocated in `src/*/README.md`
