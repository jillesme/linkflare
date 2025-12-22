# LinkFlare

A link-in-bio application built with [TanStack Start](https://tanstack.com/start) on [Cloudflare Workers](https://developers.cloudflare.com/workers/).

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React meta-framework)
- **Runtime**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [BetterAuth](https://www.better-auth.com/)
- **Bot Protection**: [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- [Cloudflare account](https://dash.cloudflare.com/sign-up)

## Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd linkflare
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with test Turnstile keys (these always pass validation):

   ```bash
   BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
   BETTER_AUTH_URL=http://localhost:5173

   # Test keys from Cloudflare - always pass validation
   VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173`. Local development uses a local SQLite database automatically managed by Wrangler.

## Cloudflare Setup

Follow these steps to deploy LinkFlare to Cloudflare.

### 1. Login to Cloudflare

```bash
npx wrangler login
```

This opens a browser window to authenticate with your Cloudflare account.

### 2. Create D1 Databases

Create a database for each environment:

```bash
# Development database
npx wrangler d1 create linkflare-development

# Production database
npx wrangler d1 create linkflare-production
```

Each command outputs a `database_id`. Update `wrangler.jsonc` with your new database IDs:

```jsonc
{
  "env": {
    "development": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "linkflare-development",
          "database_id": "<your-development-database-id>",  // ← Update this
          "migrations_dir": "./drizzle/migrations"
        }
      ]
    },
    "production": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "linkflare-production",
          "database_id": "<your-production-database-id>",  // ← Update this
          "migrations_dir": "./drizzle/migrations"
        }
      ]
    }
  }
}
```

### 3. Configure Custom Domain (Optional)

The `wrangler.jsonc` file includes a `routes` configuration for custom domains. You have two options:

**Option A: Use your own domain**

Replace `linkflare.app` with your domain in `wrangler.jsonc`:

```jsonc
{
  "env": {
    "production": {
      "routes": [
        {
          "pattern": "your-domain.com",
          "custom_domain": true
        },
        {
          "pattern": "www.your-domain.com",
          "custom_domain": true
        }
      ]
    }
  }
}
```

Your domain must be added to your Cloudflare account first.

**Option B: Use workers.dev subdomain only**

Remove the `routes` section entirely from the production environment. Your app will be available at `linkflare-production.<your-subdomain>.workers.dev`.

### 4. Create Turnstile Widget

1. Go to the [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click **Add Widget**
3. Enter a name and add your domains (e.g., `your-domain.com`, `localhost`)
4. Select widget mode (Managed is recommended)
5. Click **Create**
6. Copy your **Site Key** and **Secret Key**

For more details, see the [Turnstile documentation](https://developers.cloudflare.com/turnstile/get-started/).

### 5. Set Secrets

Secrets are sensitive values stored securely in Cloudflare. Set them for each environment:

**Development environment:**

```bash
npx wrangler secret put BETTER_AUTH_SECRET -e development
npx wrangler secret put TURNSTILE_SECRET_KEY -e development
npx wrangler secret put VITE_TURNSTILE_SITE_KEY -e development
```

**Production environment:**

```bash
npx wrangler secret put BETTER_AUTH_SECRET -e production
npx wrangler secret put TURNSTILE_SECRET_KEY -e production
npx wrangler secret put VITE_TURNSTILE_SITE_KEY -e production
```

Each command prompts you to enter the secret value.

**Notes:**

- `BETTER_AUTH_SECRET` must be at least 32 characters. Generate one with:
  ```bash
  openssl rand -base64 32
  ```
- `BETTER_AUTH_URL` is already configured in `wrangler.jsonc` under `vars` for each environment. Update these URLs to match your deployment URLs.
- Use different `BETTER_AUTH_SECRET` values for development and production.

### 6. Apply Database Migrations

Apply migrations to your remote databases:

```bash
# Development
npx wrangler d1 migrations apply linkflare-development -e development --remote

# Production
npx wrangler d1 migrations apply linkflare-production -e production --remote
```

## Deployment

### Manual Deployment

Deploy to either environment using the provided scripts:

```bash
# Deploy to development
pnpm deploy:development

# Deploy to production
pnpm deploy:production
```

These commands build the application and deploy it to Cloudflare Workers.

### CI/CD with Cloudflare Worker Builds (Production)

[Worker Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) automatically deploys your Worker when you push to your Git repository.

#### 1. Initial Manual Deploy

First, deploy manually to create the Worker in Cloudflare:

```bash
pnpm deploy:production
```

#### 2. Connect Git Repository

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) in the Cloudflare Dashboard
2. Select **linkflare-production**
3. Go to **Settings** → **Builds** → **Connect**
4. Select your Git provider (GitHub or GitLab)
5. Authorize and select your repository

#### 3. Configure Build Settings

In the build configuration:

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `CLOUDFLARE_ENV=production pnpm run build` |
| Deploy command | `npx wrangler deploy -e production` |

#### 4. Done

Now every push to `main` will automatically build and deploy your Worker.

For more details, see the [Worker Builds documentation](https://developers.cloudflare.com/workers/ci-cd/builds/).

## Drizzle Studio

Inspect your local development database with Drizzle Studio:

```bash
pnpm db:studio
```

This opens a web interface to browse and edit your local SQLite database.

## Creating Migrations

When you modify the database schema in `src/db/schema.ts`:

1. **Generate a migration**

   ```bash
   npx drizzle-kit generate
   ```

   This creates a new SQL migration file in `drizzle/migrations/`.

2. **Apply to local database**

   Migrations are applied automatically when you run `pnpm dev`.

3. **Apply to remote databases**

   ```bash
   # Development
   npx wrangler d1 migrations apply linkflare-development -e development --remote

   # Production
   npx wrangler d1 migrations apply linkflare-production -e production --remote
   ```

## Environment Variables Reference

| Variable | Description | Location |
|----------|-------------|----------|
| `BETTER_AUTH_SECRET` | Encryption key for auth sessions (min 32 chars) | Secret (`wrangler secret put`) |
| `BETTER_AUTH_URL` | Full URL of your application | `wrangler.jsonc` vars |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile widget public key | Secret (`wrangler secret put`) |
| `TURNSTILE_SECRET_KEY` | Turnstile server-side secret key | Secret (`wrangler secret put`) |

## Troubleshooting

### "Database not found" error

Ensure you've updated `wrangler.jsonc` with your actual `database_id` values from the `wrangler d1 create` commands.

### "Invalid Turnstile token" error

- **Local development**: Make sure you're using the [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) in your `.env` file
- **Production**: Verify your Turnstile widget is configured with the correct domains and you're using the production keys

### Migrations not applying

1. Check that the database exists: `npx wrangler d1 list`
2. Ensure you're using the `--remote` flag for remote databases
3. Verify the correct environment flag (`-e development` or `-e production`)

### Secrets not working

After setting secrets with `wrangler secret put`, you may need to redeploy your Worker for changes to take effect:

```bash
pnpm deploy:development  # or deploy:production
```
