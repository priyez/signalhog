# Getting Started with FeatureFlag

Welcome to your self-hosted Feature Flag platform! This guide will walk you through setting up the platform and creating your first feature flag.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18.x or later
- **pnpm**: v9.x or later
- **PostgreSQL**: A running instance (local or hosted)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/feature-flag-platform.git
   cd feature-flag-platform
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

## ⚙️ Configuration

You need to set up environment variables for both the API and the Web App.

### API Server (`apps/api/.env`)
Create a `.env` file in `apps/api/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/feature_flags"
JWT_SECRET="your-super-secret-key"
PORT=3001
```

### Web Dashboard (`apps/web/.env.local`)
Create a `.env.local` file in `apps/web/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Social Auth (Optional but recommended)
AUTH_SECRET="your-auth-secret"
AUTH_GITHUB_ID="your-github-id"
AUTH_GITHUB_SECRET="your-github-secret"
AUTH_GOOGLE_ID="your-google-id"
AUTH_GOOGLE_SECRET="your-google-secret"
```

## 🗄️ Database Setup

Sync your Prisma schema with your PostgreSQL database:

```bash
pnpm --filter @feature-flags/api run prisma:push
```

## 🚀 Running the Platform

Start the development servers for both the API and the Dashboard:

```bash
pnpm dev
```

- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)

---

## 🚩 Your First Feature Flag

### 1. Register & Login
Open the dashboard and create an account. You can use traditional email/password or use Google/GitHub if you configured them.

### 2. Create a Project
Click on the **Project Switcher** and select **"Create Project"**. Name your project (e.g., "My Awesome App"). This will automatically create three environments: **Development**, **Staging**, and **Production**.

### 3. Create a Flag
Navigate to the **Feature Flags** page and click **"+ Create Flag"**.
- **Key**: `new_hero_section`
- **Rollout**: 50% (This means only half of your users will see the feature)

### 4. Get your API Key
Go to the **API Keys** page. Copy the key for your **Development** environment.

---

## 📦 Integrating the SDK

Now, let's use the flag in your code!

```typescript
import { FlagsClient } from "@feature-flags/sdk-node"

const flags = new FlagsClient({
  apiKey: "your_development_api_key",
})

// Initialize the client (starts background polling)
await flags.init()

// Evaluate the flag for a specific user
const isEnabled = await flags.isEnabled("new_hero_section", {
  userId: "user_123"
})

if (isEnabled) {
  console.log("Showing the new hero section! 🎉")
} else {
  console.log("Showing the old hero section. 😴")
}

// Remember to stop polling when your app shuts down
flags.stop()
```

## 📚 Next Steps
- Learn more about [Deterministic Rollouts](./concepts/rollouts.md)
- Check the [API Reference](../README.md#api-reference)
- Set up [Production Deployment](./deployment.md)
