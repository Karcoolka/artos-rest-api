# artos-rest-api

REST API for business partners to submit bakery orders. Includes a partner order form (React) in the same repository.

Partners authenticate with an API key, select a contact and products, and submit orders with a requested delivery date and pickup or delivery preference.

## Tech stack

**Backend:** Node.js, TypeScript, Express, PostgreSQL, Prisma, Zod, Vitest, Supertest

**Frontend:** React, Vite, TypeScript

**Local development:** Docker Compose (PostgreSQL)

## Project structure

```
src/           Express API
client/        React partner UI
prisma/        Schema, migrations, seed data
tests/         Unit, integration, and API tests
scripts/       Development helpers
```

## Getting started

**Requirements:** Node.js 20+, Docker

```bash
npm run install:all

# Start PostgreSQL
npm run db:up
# Linux without docker group: sudo docker compose up -d postgres
npm run db:wait
npm run db:migrate
npm run db:seed

# API only
npm run dev

# API + frontend together
npm run dev:all
```

The API runs at `http://localhost:3000`. The frontend dev server runs at `http://localhost:5173` and proxies `/api` to the backend.

For production, build the client and start the API — Express serves the built UI from `client/dist`:

```bash
npm run build
npm run start
```

On first migration, use the name `init` when prompted.

### Development API keys

| User | API key |
|------|---------|
| Artos Wholesale | `dev-artos-key` |
| Downtown Deli Co. | `dev-deli-key` |

Pass the key in the `X-API-Key` request header. Contact and product UUIDs are printed after `npm run db:seed`, or browse data with `npx prisma studio`.

## API

All `/api/v1` routes require the `X-API-Key` header.

Orders support full CRUD. Contacts and products are exposed as read-only catalog data for building an order.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/contacts` | List contacts for the authenticated user |
| `GET` | `/api/v1/products` | List active products |
| `GET` | `/api/v1/orders` | List orders |
| `GET` | `/api/v1/orders/:id` | Get order by ID |
| `POST` | `/api/v1/orders` | Create order |
| `PATCH` | `/api/v1/orders/:id` | Update order (delivery date, fulfillment, notes) |
| `DELETE` | `/api/v1/orders/:id` | Delete order |

Only orders with status `submitted` can be updated or deleted.

### Example: create order

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-artos-key" \
  -d '{
    "contactId": "<contact-uuid>",
    "requestedDeliveryDate": "2026-07-10",
    "fulfillment": "delivery",
    "items": [
      { "productId": "<product-uuid>", "quantity": 12 }
    ],
    "notes": "Deliver to loading dock B"
  }'
```

Public routes (no API key): `GET /`, `GET /health`.

## Testing

```bash
npm test
```

Tests use a separate database (`artos_test`) so dev seed data in `artos` is not affected.

| Layer | Command |
|-------|---------|
| All tests | `npm test` |
| Unit only | `npm run test:unit` |
| Integration | `npm run test:integration` |
| API (Supertest) | `npm run test:functional` |

Browse test data: `DATABASE_URL="postgresql://artos:artos@localhost:5432/artos_test?schema=public" npx prisma studio`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run install:all` | Install root and client dependencies |
| `npm run dev` | Start API in watch mode |
| `npm run dev:client` | Start Vite frontend |
| `npm run dev:all` | Start API and frontend together |
| `npm run build` | Build API and frontend |
| `npm run build:client` | Build frontend only |
| `npm run start` | Run compiled API (serves UI if built) |
| `npm test` | Run tests |
| `npm run db:up` | Start Postgres container |
| `npm run db:down` | Stop Postgres container |
| `npm run db:wait` | Wait until Postgres is ready |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Load sample data |
| `npm run db:reset` | Reset database, migrate, and seed |

Dev database: `artos`. Test database: `artos_test` (created automatically before `npm test`).

## Environment

Configuration lives in `.env` (local development credentials only).

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Dev API and Prisma Studio (`artos`) |
| `TEST_DATABASE_URL` | Test suite (`artos_test`) |
| `PORT` | API port (default `3000`) |
