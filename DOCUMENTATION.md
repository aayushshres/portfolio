# Documentation

This document provides a comprehensive guide on how the Personal Portfolio works, how to run it locally, and how to deploy it to production.

## How It Works

The portfolio is structured as a monorepo consisting of a frontend client and a serverless backend.

### Architecture Overview

- **Frontend (Client)**: A single-page application built with React 19 and Vite. It serves the public-facing portfolio and a secure admin dashboard. Styling uses Tailwind CSS v4 with a custom design system (tokens defined in `src/index.css` via `@theme`). Smooth scrolling is powered by Lenis, and scroll-reveal animations use GSAP with ScrollTrigger.
- **Backend (Server)**: A RESTful API built with Hono and deployed as a Cloudflare Worker. It handles authentication, data persistence, rate limiting, input validation (via Zod v4 schemas), file uploads, and email notifications. File uploads are secured using magic-byte content sniffing to strictly validate against a MIME allowlist (JPEG, PNG, WEBP, GIF only, no SVG).
- **Storage & KV**: The application uses Cloudflare R2 object storage to persist data. The `DATA_BUCKET` stores JSON configuration files for the portfolio content and contact messages (each message stored as an individual JSON file under `messages/`), while the `ASSETS_BUCKET` stores uploaded files like images and the CV PDF. One Cloudflare KV namespace is used: `AUTH_STORE` (for secure, dynamic storage of the admin password hash). A Durable Object (`RATE_LIMITER_DO`) is used for atomic API rate limiting with automatic cleanup via alarms.
- **Authentication**: The admin dashboard is protected by JWT authentication using short-lived access tokens (15 min) and longer-lived refresh tokens (7 days). The password hash is stored in `AUTH_STORE` KV and verified using bcrypt. Tokens are stored securely in the browser as `httpOnly`, `Secure`, `SameSite=None`, `Partitioned` cookies to protect against XSS and support cross-site requests. The client-side `api.ts` wrapper automatically attempts a silent token refresh on 401 responses.
- **Content Security Policy (CSP)**: CSP is set dynamically per request via a Cloudflare Pages Functions middleware (`functions/_middleware.ts`). The middleware generates a cryptographic nonce, injects it into all `<script>` tags via `HTMLRewriter`, and sets the CSP header with that nonce. This approach supports Cloudflare's Bot Fight Mode / Browser Integrity Check, which injects inline scripts with unique content on every response.
- **Dynamic Theming**: The admin can change the site's accent color from the Settings page. The `SettingsContext` applies the chosen color at runtime using `color-mix()` in OKLAB to generate a full brand scale, with separate palettes for light and dark mode.

### Data Flow

When the application loads, the frontend fetches the portfolio data (Profile, Projects, Research, Publications, Contact info, Settings) from the backend API. If the API cannot be reached or the data has not been configured yet, the frontend falls back to a set of default values (`client/src/data/defaults.ts`) to ensure the site always renders. The server has its own mirrored defaults in `server/src/lib/defaults.ts`. Once logged into the admin dashboard, any changes made to the content are sent to the backend and saved directly as JSON objects in the Cloudflare R2 data bucket.

---

## Getting Started Locally

### Prerequisites

- Node.js (v20 or higher recommended)
- A Cloudflare account (optional for local development, as Wrangler simulates R2 and KV locally)

### 1. Install Dependencies

Run the following command from the root of the repository to install dependencies for both the client and server:

```bash
npm install
```

### 2. Configure Environment Variables

You need secrets for signing JWTs, your initial admin password hash, and the Resend API. Create a `.dev.vars` file inside the `server/` directory. You can use the provided `.env.example` as a reference:

```bash
echo "JWT_SECRET=super_secret_local_key" > server/.dev.vars
echo "ADMIN_PASSWORD_HASH=$(node -e \"console.log(require('bcryptjs').hashSync('your-password-here', 10))\")" >> server/.dev.vars
echo "RESEND_API_KEY=your_resend_api_key_here" >> server/.dev.vars
echo "CONTACT_EMAIL=your_email@example.com" >> server/.dev.vars
```

Alternatively, use the `server/generate-hash.mjs` helper to generate a bcrypt hash interactively.

### 3. Run the Development Servers

You can start both the Vite frontend and the Cloudflare Worker backend concurrently with a single command from the root directory:

```bash
npm run dev:all
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8787
- **Admin Panel:** http://localhost:5173/admin/login

In dev mode, Vite proxies all `/api` requests to `http://localhost:8787` so you don't need to configure CORS for local development.

### 4. Run Tests

The server includes a Vitest test suite:

```bash
cd server
npm test
```

---

## Deploying to Cloudflare

The deployment process uses GitHub Actions to automatically deploy both the frontend (Cloudflare Pages) and backend (Cloudflare Workers) whenever code is pushed to the `main` branch. 

### 1. Create R2 Buckets

Log in to your Cloudflare dashboard, navigate to **R2**, and create two buckets:
1. `portfolio-data`
2. `portfolio-assets`

### 2. Create a KV Namespace

Navigate to **Workers & Pages > KV** and create a namespace called `AUTH_STORE`. Note the namespace ID — you'll need it for `wrangler.toml`.

### 3. Update `wrangler.toml` (Server)

Ensure your `server/wrangler.toml` correctly maps to the buckets and KV namespace you just created. It should look like this:

```toml
name = "portfolio-api"
main = "src/index.ts"
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "AUTH_STORE"
id = "YOUR_AUTH_STORE_KV_ID"

[[r2_buckets]]
binding = "DATA_BUCKET"
bucket_name = "portfolio-data"

[[r2_buckets]]
binding = "ASSETS_BUCKET"
bucket_name = "portfolio-assets"

[vars]
NODE_ENV = "production"

[[durable_objects.bindings]]
name = "RATE_LIMITER_DO"
class_name = "RateLimiterDO"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["RateLimiterDO"]
```

*Note: Durable Objects require a migration entry (`[[migrations]]`) on their first deployment. The `new_sqlite_classes` key ensures the class is created on the Cloudflare network with SQLite-backed storage.*

### 4. Set up Production Secrets

You must set your production secrets securely in Cloudflare:

```bash
cd server
npx wrangler secret put JWT_SECRET
# Enter a strong, random password for JWT signing when prompted

npx wrangler secret put ADMIN_PASSWORD_HASH
# Enter the bcrypt hash of your desired initial admin password

npx wrangler secret put RESEND_API_KEY
# Enter your Resend API Key for email notifications

npx wrangler secret put CONTACT_EMAIL
# Enter the email address where you want to receive notifications
```

*Note: Upon your first successful login, the system will migrate your password from the `ADMIN_PASSWORD_HASH` environment variable into the `AUTH_STORE` KV namespace. You can then manage your password directly from the Admin Settings UI and delete the static secret.*

### 5. Content Security Policy (Frontend)

The frontend's Content Security Policy is **no longer** defined in a static `_headers` file. Instead, it is set dynamically per request via a Cloudflare Pages Functions middleware at `client/functions/_middleware.ts`. This middleware generates a cryptographic nonce, injects it into all `<script>` tags using `HTMLRewriter`, and sets the CSP header with that nonce.

If you are forking this repository or deploying to a different domain, you must update the `connect-src` URLs in the `buildCSP()` function inside `client/functions/_middleware.ts`. Updating CORS settings in `server/src/index.ts` is not enough; the CSP must also permit the frontend to make requests to your new backend URL.

### 6. Configure GitHub Actions

To allow GitHub Actions to deploy on your behalf, you need to provide it with your Cloudflare API credentials. 

Go to your **GitHub Repository Settings > Secrets and variables > Actions**, and add the following repository secrets:
- **`CLOUDFLARE_API_TOKEN`**: Create this in your Cloudflare dashboard (My Profile > API Tokens). It needs permissions to edit Workers, Pages, and R2.
- **`CLOUDFLARE_ACCOUNT_ID`**: Found on the right sidebar of your Cloudflare dashboard.
- **`VITE_API_URL`**: The live URL of your deployed Cloudflare Worker (e.g., `https://portfolio-api.<your-subdomain>.workers.dev`).

### 7. Push to Deploy

Once your secrets are configured, simply commit and push your code to the `main` branch. 

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

The `.github/workflows/deploy.yml` action will run, building and deploying your backend and frontend to Cloudflare automatically.
