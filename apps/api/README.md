# SignalHog — API

The Fastify REST API backend for the SignalHog feature flag platform.

---

## Tech Stack

- **Framework**: [Fastify v4](https://fastify.dev) with `@fastify/cors`, `@fastify/helmet`, `@fastify/jwt`
- **ORM**: [Prisma](https://prisma.io) with PostgreSQL
- **Validation**: [Zod](https://zod.dev)
- **AI**: [Groq SDK](https://groq.com) (llama-3.1-8b-instant)
- **Runtime**: Node.js 18+ with `tsx` for development

---

## Getting Started

### 1. Install (from monorepo root)

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/feature_flags"
JWT_SECRET="your-super-secret-jwt-key"
GROQ_API_KEY="your-groq-api-key"
```

### 3. Run database migrations

```bash
pnpm prisma:push
```

### 4. Start development server

From the monorepo root:
```bash
pnpm dev
```

Or from this package directly:
```bash
pnpm --filter @feature-flags/api dev
```

API runs at: **http://localhost:3001**

---

## Architecture

```
apps/api/src/
├── config/
│   └── index.ts        # Prisma client & Groq SDK singletons
├── plugins/
│   └── auth.ts         # Fastify JWT plugin & authenticate preHandler
├── routes/
│   ├── index.ts        # Central route registry
│   ├── auth.ts         # /auth/register, /auth/login
│   ├── projects.ts     # /projects CRUD
│   ├── environments.ts # /environments CRUD
│   ├── flags.ts        # /flags CRUD + toggle
│   ├── sdk.ts          # /sdk/flags (SDK API Key auth)
│   ├── events.ts       # /capture, /events, /metrics/*
│   ├── funnels.ts      # /funnels CRUD
│   ├── activities.ts   # /activities audit log
│   └── ai.ts           # /ai/chat (Groq tool-calling)
├── schemas/
│   └── index.ts        # Shared Zod schemas
├── utils/
│   └── logger.ts       # logActivity utility
├── types.d.ts          # Fastify type augmentations
├── app.ts              # Fastify instance setup, plugin registration
└── server.ts           # Entry point: app.listen()
```

---

## API Endpoints

### Health
```
GET  /health
```

### Auth
```
POST /auth/register    { name, email, password }
POST /auth/login       { email, password }
```

### Projects
```
GET    /projects
POST   /projects       { name }
GET    /projects/:id
PATCH  /projects/:id   { name }
DELETE /projects/:id
```

### Environments
```
POST   /environments        { projectId, name }
PATCH  /environments/:id    { name }
DELETE /environments/:id
```

### Feature Flags
```
GET    /flags?projectId=&environmentId=
POST   /flags          { projectId, environmentId, key, name?, enabled?, rolloutPercentage? }
PATCH  /flags/:id      { enabled?, rolloutPercentage? }
DELETE /flags/:id
```

### SDK
```
GET /sdk/flags?environmentId=    (Bearer <API_KEY> auth)
```

### Events & Analytics
```
POST /capture                                (Bearer <API_KEY> auth)
GET  /events?projectId=&environmentId=
GET  /events/names?projectId=&environmentId=
GET  /metrics/trends?projectId=&environmentId=
POST /metrics/funnel   { projectId, environmentId, steps[], window? }
GET  /metrics/retention?projectId=&environmentId=&cohortEvent=&activityEvent=
```

### Funnels
```
GET    /funnels?projectId=
POST   /funnels        { projectId, name, steps[] }
DELETE /funnels/:id
```

### Activities
```
GET /activities?projectId=
```

### AI Assistant
```
POST /ai/chat    { messages[], projectId?, environmentId? }
```

The AI endpoint uses **Groq tool-calling** to let the model invoke real actions:
- `get_project_stats` — Count flags, events, active experiments
- `list_flags` — List all flags in a project/environment
- `toggle_flag` / `toggle_flag_by_key` — Enable or disable flags
- `create_flag` — Create a new flag

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start with hot-reload via `tsx watch` |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled output (`dist/server.js`) |
| `pnpm prisma:generate` | Regenerate Prisma client |
| `pnpm prisma:push` | Push schema to database (no migration file) |
| `pnpm prisma:migrate` | Create and run a migration |

---

## Deployment

Set the following environment variables in your API service:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<your-secret>
GROQ_API_KEY=<your-groq-key>
PORT=3001
```

**Build command:** `pnpm --filter @feature-flags/api prisma:generate && pnpm --filter @feature-flags/api build`  
**Start command:** `pnpm --filter @feature-flags/api start`
