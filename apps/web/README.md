# SignalHog — Web Dashboard

The Next.js 16 frontend for the SignalHog feature flag platform.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Auth**: [NextAuth v5](https://next-auth.js.org) (beta)
- **Styling**: Vanilla CSS with CSS custom properties (dark-mode design system)
- **Charts**: [Recharts](https://recharts.org)
- **Icons**: [Lucide React](https://lucide.dev)
- **HTTP**: Native `fetch` via `apiRequest` utility

---

## Getting Started

### 1. Install dependencies (from the monorepo root)

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 3. Start the development server

From the monorepo root:
```bash
pnpm dev
```

Or from this package directly:
```bash
pnpm --filter @feature-flags/web dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Project Structure

```
apps/web/src/
├── app/
│   ├── (main)/               # Authenticated dashboard shell
│   │   ├── layout.tsx        # Sidebar + Topbar layout
│   │   ├── dashboard/        # Project listing page
│   │   ├── onboarding/       # First-time project setup
│   │   └── project/[projectId]/
│   │       ├── flags/        # Feature flags management
│   │       ├── analytics/    # Trends, retention, funnel charts
│   │       ├── funnels/      # Conversion funnel builder
│   │       ├── activities/   # Audit log
│   │       └── settings/     # Project settings & API keys
│   ├── login/                # Login page
│   ├── register/             # Register page
│   ├── docs/                 # Documentation pages
│   ├── layout.tsx            # Root layout (fonts, SessionProvider, MobileBlocker)
│   ├── globals.css           # Global CSS design tokens & utilities
│   └── page.tsx              # Landing page
├── components/
│   ├── AgentSidebar.tsx      # SignalHog AI chat panel
│   ├── MobileBlockerWrapper.tsx  # Desktop-only guard for dashboard routes
│   ├── SidebarNav.tsx        # Navigation sidebar
│   ├── Topbar.tsx            # Top navigation bar
│   ├── ProjectSwitcher.tsx   # Project/environment context switcher
│   ├── UserDropdown.tsx      # User menu
│   ├── PlatformLogo.tsx      # Brand logo
│   ├── dashboard/            # Dashboard-specific components
│   ├── landing/              # Landing page sections
│   └── ui/                   # Shared UI primitives (Button, Input, Modal, etc.)
├── contexts/                 # React context providers
└── lib/
    └── api.ts                # Authenticated API fetch utility
```

---

## Key Features

### SignalHog AI Assistant
The `AgentSidebar` component renders a full AI chat panel powered by the `/ai/chat` API endpoint. It uses a custom lightweight Markdown renderer to display formatted responses with:
- Bullet lists
- Bold & italic text
- Inline code and code blocks
- Clickable links
- Section headings

### Mobile Access Control
`MobileBlockerWrapper` prevents mobile/small-screen users from accessing any route except:
- `/` — Landing page
- `/docs` and `/docs/*` — Documentation

Mobile users visiting any other route are presented with a "Desktop Required" screen.

### Design System
The app uses a dark-mode CSS design system defined in `globals.css` with CSS custom properties:
| Token | Value |
|-------|-------|
| `--color-brand` | `#00c797` (teal accent) |
| `--color-bg` | `#08090a` |
| `--color-surface` | `#111214` |
| `--color-border` | `rgba(255,255,255,0.07)` |
| `--color-text` | `#f4f4f5` |
| `--color-muted` | `#71717a` |

---

## Building for Production

```bash
pnpm --filter @feature-flags/web build
pnpm --filter @feature-flags/web start
```

---

## Deploying to Railway

Set the following environment variables in your Railway web service:

```env
NEXT_PUBLIC_API_URL=https://<your-api-service>.up.railway.app
NEXTAUTH_SECRET=<your-secret>
PORT=3000
```

**Build command:** `pnpm --filter @feature-flags/web build`  
**Start command:** `pnpm --filter @feature-flags/web start`
