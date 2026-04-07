# Bash n Build

A PERN stack monorepo for a tech blog targeting the Kenyan and pan-African developer community.

## Stack
- **Database**: PostgreSQL (using `pg` node-postgres driver, no ORM)
- **Backend**: Express + Node.js (TypeScript)
- **Frontend**: Next.js 14 App Router (TypeScript)

## Setup Instructions

1. **Clone the repository**
2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
3. **Run with Docker Compose** (easiest way to get started with DB)
   ```bash
   docker-compose up -d db
   ```
4. **Install Dependencies**
   ```bash
   # From root, install server and client dependencies
   cd server && npm install
   cd ../client && npm install
   ```
5. **Run Locally**
   Use separate terminals for the client and server:
   
   **Server:**
   ```bash
   cd server
   npm run dev
   ```

   **Client:**
   ```bash
   cd client
   npm run dev
   ```

The client will be running at `http://localhost:3000` and the server at `http://localhost:5000`.

## Database Migrations

Migrations live in `server/src/db/migrations/`. To apply them after starting the database:

```bash
cd server
npm run db:migrate
```

This runs `migrate.ts` which executes each `.sql` file in order. Add new migration files as `002_add_something.sql`, `003_...`, etc., and register them in the `files` array inside `migrate.ts`.
