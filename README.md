# SignalHog — Feature Flag Platform

> A self-hosted, open-source feature flag platform and LaunchDarkly alternative built with **Fastify**, **Prisma**, **PostgreSQL**, and **Next.js**.

---

## Features

- 🚩 **Feature Flags** — Create, toggle, and delete flags from the dashboard or via AI
- 🌍 **Projects & Environments** — Organize flags across Development, Staging, and Production
- 📊 **Event Analytics** — Capture custom events, view trends, retention, and conversion funnels
- 🎯 **Percentage Rollouts** — Deterministic hashing for consistent gradual rollouts per user
- 🔑 **SDK API Keys** — Scoped per-environment public/secret keys for secure SDK access
- 📦 **Node.js SDK** — Drop-in client with local caching and background polling
- 🔐 **JWT Authentication** — Secure register/login flow for dashboard users
- 🤖 **SignalHog AI** — AI chat assistant to manage flags and query project stats
- 📱 **Desktop-First** — Dashboard is optimized for desktop; landing page supports all devices

---

## Project Structure

```
signalhog/
├── apps/
│   ├── api/              # Fastify REST API
│   │   └── src/
│   │       ├── config/       # Prisma & Groq SDK instances
│   │       ├── plugins/      # JWT auth plugin
│   │       ├── routes/       # Modular route handlers
│   │       ├── schemas/      # Zod validation schemas
│   │       ├── utils/        # Shared utilities (logActivity, etc.)
│   │       ├── app.ts        # Fastify app setup
│   │       └── server.ts     # Entry point
│   └── web/              # Next.js 16 dashboard
├── packages/
│   ├── shared/           # Shared types & deterministic hash logic
│   ├── sdk-node/         # Node.js SDK for developers
│   └── ui/               # Shared UI components (optional)
├── docker-compose.yml    # PostgreSQL for local development
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL database (or Docker)

### 1. Clone & Install

```bash
git clone https://github.com/ptiyez/signalhog
cd signalhog
pnpm install
```

### 2. Start PostgreSQL (Docker)

```bash
docker compose up -d
```

### 3. Configure Environment

```bash
# API — copy and fill in your values
cp apps/api/.env.example apps/api/.env
```

**`apps/api/.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/feature_flags"
JWT_SECRET="your-super-secret-jwt-key"
GROQ_API_KEY="your-groq-api-key"        # Required for SignalHog AI
```

```bash
# Web — copy and fill in your values
cp apps/web/.env.example apps/web/.env.local
```

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 4. Run Database Migrations

```bash
pnpm --filter @feature-flags/api prisma:push
```

### 5. Start Development Servers

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web Dashboard | http://localhost:3000 |
| API | http://localhost:3001 |

---

## Node.js SDK

### Install

```bash
npm install @signalhog/node
```

### Usage

```typescript
import { FlagsClient } from "@signalhog/node";

const flags = new FlagsClient({
  apiKey: process.env.FLAGS_API_KEY, // From the API Keys page in Settings
});

// Initialize with background polling (every 30s)
await flags.init();

// Evaluate a flag for a specific user
const enabled = await flags.isEnabled("new_dashboard", {
  userId: "user_123",
});

if (enabled) {
  showNewDashboard();
}

// Stop polling when done
flags.stop();
```

### Deterministic Rollouts

Rollouts are **deterministic** — a user always gets the same result for a given flag and percentage:

```typescript
// Always returns the same boolean for the same userId + flag combo
const enabled = await flags.isEnabled("beta_feature", { userId: "user_123" });
```

Internally, a fast hash function maps `userId` to a consistent bucket, which is checked against the rollout percentage threshold.

---

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Login and receive a JWT |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List all projects |
| POST | `/projects` | Create a project (auto-creates 3 environments) |
| GET | `/projects/:id` | Get project with environments & API keys |
| PATCH | `/projects/:id` | Update project name |
| DELETE | `/projects/:id` | Delete project and all data |

### Environments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/environments` | Create an environment |
| PATCH | `/environments/:id` | Rename an environment |
| DELETE | `/environments/:id` | Delete an environment |

### Feature Flags
| Method | Path | Description |
|--------|------|-------------|
| GET | `/flags` | List flags (`?projectId=&environmentId=`) |
| POST | `/flags` | Create a flag |
| PATCH | `/flags/:id` | Toggle or update rollout percentage |
| DELETE | `/flags/:id` | Delete a flag |

### Events & Analytics
| Method | Path | Description |
|--------|------|-------------|
| POST | `/capture` | Ingest a custom event (SDK API key auth) |
| GET | `/events` | List events for a project/environment |
| GET | `/events/names` | List unique event names |
| GET | `/metrics/trends` | 30-day event count trend |
| POST | `/metrics/funnel` | Conversion funnel analysis |
| GET | `/metrics/retention` | User retention cohort analysis |

### Funnels
| Method | Path | Description |
|--------|------|-------------|
| GET | `/funnels` | List saved funnels |
| POST | `/funnels` | Create a funnel |
| DELETE | `/funnels/:id` | Delete a funnel |

### SDK
| Method | Path | Description |
|--------|------|-------------|
| GET | `/sdk/flags` | Fetch all flags (API Key auth) |

### AI Assistant
| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/chat` | Send a message to SignalHog AI |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API health check |

---

## Deploying to Railway

Deploy the **API** and **Web** as two separate Railway services connected to a Railway PostgreSQL database.

**API service environment variables:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<your-secret>
GROQ_API_KEY=<your-groq-key>
PORT=3001
```

**Web service environment variables:**
```env
NEXT_PUBLIC_API_URL=https://<your-api-service>.up.railway.app
NEXTAUTH_SECRET=<your-secret>
```

> The worker service has been removed — all analytics are powered by PostgreSQL directly.

---

## License

MIT
