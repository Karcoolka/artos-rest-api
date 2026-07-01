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
npm run db:wait
# OR Linux: sudo docker compose up -d postgres

npm run db:migrate
npm run db:seed

# API only
npm run dev

# Optionaly: API + frontend together
npm run dev:all
```

The API runs at `http://localhost:3000`. 
The frontend dev server runs at `http://localhost:5173` and proxies `/api` to the backend.


```bash
npm run build
npm run start
```

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

## Design decisions

I tried to keep things simple and focus on the main flow: a partner submits an order and it gets saved correctly.

**Database (PostgreSQL + Prisma)**  
An order has a header (who, when, pickup/delivery) and multiple line items, so a relational database made sense to me. I picked PostgreSQL because I wanted proper foreign keys and transactions. Prisma helped me with migrations, seed data, and TypeScript types — I didn't want to write all SQL by hand for this project.

**User and Contact as separate tables**  
From the task description, a partner is a company (hotel, restaurant…) but the order is placed by a real person. So I modeled `User` as the company (they authenticate with an API key) and `Contact` as the person who submits the order. Every order links to both — that way I know which organization ordered and who actually sent it.

**CRUD only on orders**  
The assignment was about submitting orders, not building a full admin panel. Contacts and products come from seed data and are read-only in the API — just enough to fill the order form. I put create/read/update/delete on orders because that's the main thing a partner needs.

**API key auth**  
Auth wasn't required, but I still wanted a minimal way to know *which* partner is calling the API. An API key in the header felt like the simplest B2B approach for a project this size. Keys are hashed with bcrypt.

**Project structure**  
I split the backend into routes, controllers, services, and validators. It's probably more layers than strictly necessary for a small app, but it kept things readable for me — HTTP stuff in controllers, business rules in services, input validation in Zod schemas. I'm still getting comfortable with this pattern, but it made testing easier.

**React frontend in the same repo**  
I added a small Vite + React form so I could click through the flow, not only test with curl. In dev, the UI runs on port 5173 and proxies `/api` to Express. After `npm run build`, Express serves the static files so everything runs on one port.

**Separate test database (`artos_test`)**  
Integration tests reset data, so they run against a separate database and don't touch dev seed data.

## With more time

- Add **company tax ID (IČO)** and optional delivery address on orders
- **Multi-tenant bakery** model (each bakery is a tenant; partners belong to a bakery)
- Richer **order lifecycle** (`confirmed`, `in production`, `delivered`, `cancelled`) and audit log
- **Pricing** on products and order totals
- **Order cutoff rules** (e.g. orders for tomorrow must be placed before 14:00)
- **Role-based auth** (bakery admin vs partner) instead of a flat API key
- Frontend: order detail, edit, and delete using the existing PATCH/DELETE endpoints
- Pagination and filtering on `GET /orders`
- CI pipeline (GitHub Actions) with Postgres service container

## Deliberately skipped

| Area | Why |
|------|-----|
| Tax ID (IČO) on partners | Scope focused on order submission flow; company identity is represented by name + API key for now |
| Bakery-as-tenant in ERP | Single-bakery assumption keeps the model small; partner isolation via `user_id` is enough for this exercise |
| OAuth / JWT | Brief asked to keep auth simple |
| Product/contact admin API | Seed data is sufficient; partners only need read access to place orders |
| Prices and invoices | Out of scope for “submit an order” |
| Delivery time windows | Date-only delivery field covers the minimum requirement |
| Full UI for all CRUD endpoints | UI covers create + list; remaining operations are available via API (Postman/curl) |
| Production hardening | No rate limiting, secret management, or HTTPS — local/hobby setup |

## Environment

Configuration lives in `.env` (local development credentials only).

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Dev API and Prisma Studio (`artos`) |
| `TEST_DATABASE_URL` | Test suite (`artos_test`) |
| `PORT` | API port (default `3000`) |
