# artos-rest-api

REST API and order form for submitting orders to a bakery. Backend and frontend live in one project.

## Project structure

- `src/` — Express API (TypeScript)
- `client/` — Vite + React UI (TypeScript, Phase 5)
- `prisma/` — database schema and seed (Phase 2)
- `tests/` — unit, integration, and functional tests
- `scripts/` — helper scripts (e.g. wait for Postgres)

## Tech stack

### Backend

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **HTTP framework:** Express
- **Database:** PostgreSQL
- **ORM & migrations:** Prisma
- **Validation:** Zod
- **Authentication:** API key (`X-API-Key` header, per user)
- **Testing:** Vitest, Supertest
- **Local database:** Docker Compose

### Frontend

- React
- Vite
- TypeScript

## Setup

Requires Node.js 20+ and Docker.

### Phase 1 — API

```bash
npm install
npm run dev
```

The API starts on `http://localhost:3000`.

### Phase 2 — Database

```bash
npm run db:up
npm run db:wait
npm run db:migrate
npm run db:seed
```

When prompted for a migration name, use e.g. `init`.

**Dev API keys (after seed):**

| User | API key |
|---------|---------|
| Artos Wholesale | `dev-artos-key` |
| Downtown Deli Co. | `dev-deli-key` |

Use header: `X-API-Key: dev-artos-key`

> **Note:** This project uses a committed `.env` file (no `.env.example`). That is intentional — this is a hobby project with local-only credentials, not a production setup.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API in watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled API |
| `npm test` | Run all tests |
| `npm run db:up` | Start Postgres container |
| `npm run db:down` | Stop Postgres container |
| `npm run db:wait` | Wait until Postgres is ready |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset DB, migrate, and seed |
