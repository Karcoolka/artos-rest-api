# artos-rest-api

REST API and partner order form for submitting orders to a bakery. Backend and frontend live in one project.

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
- **Authentication:** API key (partner header)
- **Testing:** Vitest, Supertest
- **Local database:** Docker Compose

### Frontend

- React
- Vite
- TypeScript

## Setup (Phase 1)

Requires Node.js 20+.

```bash
npm install
npm run dev
```

The API starts on `http://localhost:3000`. Endpoints will be added in later phases.

> **Note:** This project uses a committed `.env` file (no `.env.example`). That is intentional — this is a hobby project with local-only credentials, not a production setup.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API in watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled API |
| `npm test` | Run all tests |
| `npm run db:up` | Start Postgres (Phase 2) |
