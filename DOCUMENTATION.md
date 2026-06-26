# Documentation

This document provides a comprehensive guide on how the Personal Portfolio works, how to run it locally, and how to deploy it to production.

## How It Works

The portfolio is structured as a monorepo consisting of a frontend client and a serverless backend.

### Architecture Overview

- **Frontend (Client)**: A single-page application built with React and Vite. It serves the public-facing portfolio and a secure admin dashboard.
- **Backend (Server)**: A RESTful API built with Hono and deployed as a Cloudflare Worker. It handles authentication, data persistence, rate limiting, and file uploads.
- **Storage & KV**: The application uses Cloudflare R2 object storage to persist data. The `DATA_BUCKET` stores JSON configuration files for the portfolio content, while the `ASSETS_BUCKET` stores uploaded files like the CV PDF. Two Cloudflare KV namespaces are used: `RATE_LIMITER` (for API rate limiting) and `AUTH_STORE` (for secure, dynamic storage of the admin password hash).
- **Authentication**: The admin dashboard is protected by JWT authentication using short-lived access tokens and longer-lived refresh tokens. The password hash is stored in `AUTH_STORE` and verified using bcrypt. Tokens are stored securely in the browser as `httpOnly` cookies to protect against XSS and are automatically attached to subsequent API requests.

### Data Flow

When the application loads, the frontend fetches the portfolio data (Profile, Projects, Research, etc.) from the backend API. If the API cannot be reached or the data has not been configured yet, the frontend falls back to a set of default values to ensure the site always renders. Once logged into the admin dashboard, any changes made to the content are sent to the backend and saved directly as JSON objects in the Cloudflare R2 data bucket.

---

## Getting Started Locally

### Prerequisites

- Node.js (v20 or higher recommended)
- A Cloudflare account (optional for local development, as Wrangler simulates R2 locally)

### 1. Install Dependencies

Run the following command from the root of the repository to install dependencies for both the client and server:

```bash
npm install
```

### 2. Configure Environment Variables

You need secrets for signing JWTs, your initial admin password hash, and the Resend API. Create a `.dev.vars` file inside the `server/` directory:

```bash
echo "JWT_SECRET=super_secret_local_key" > server/.dev.vars
echo "ADMIN_PASSWORD_HASH=\$2a\$10\$Xo7.l/k/G1zO.A0mX8xSvuV9tI8M2vTzM/G5k3l.U/t/a/C.X/o4e" >> server/.dev.vars # Hash for 'admin123'
echo "RESEND_API_KEY=your_resend_api_key_here" >> server/.dev.vars
echo "CONTACT_EMAIL=your_email@example.com" >> server/.dev.vars
```

### 3. Run the Development Servers

You can start both the Vite frontend and the Cloudflare Worker backend concurrently with a single command from the root directory:

```bash
npm run dev:all
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8787
- **Admin Panel:** http://localhost:5173/admin/login

*(Note: The admin panel uses the `JWT_SECRET` you set in `.dev.vars`. You can test login endpoints by sending a POST to `/api/auth/login` to generate a token, or update your local worker to mock an admin password).*

---

## Deploying to Cloudflare

The deployment process uses GitHub Actions to automatically deploy both the frontend (Cloudflare Pages) and backend (Cloudflare Workers) whenever code is pushed to the `main` branch. 

### 1. Create R2 Buckets

Log in to your Cloudflare dashboard, navigate to **R2**, and create two buckets:
1. `portfolio-data`
2. `portfolio-assets`

### 2. Update `wrangler.toml` (Server)

Ensure your `server/wrangler.toml` correctly maps to the buckets you just created. It should look like this:

```toml
name = "portfolio-api"
main = "src/index.ts"
compatibility_date = "2024-11-01"

[[kv_namespaces]]
binding = "RATE_LIMITER"
id = "YOUR_RATE_LIMITER_KV_ID"

[[kv_namespaces]]
binding = "AUTH_STORE"
id = "YOUR_AUTH_STORE_KV_ID"

[[r2_buckets]]
binding = "DATA_BUCKET"
bucket_name = "portfolio-data"

[[r2_buckets]]
binding = "ASSETS_BUCKET"
bucket_name = "portfolio-assets"
```

### 3. Set up Production Secrets

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

### 4. Configure GitHub Actions

To allow GitHub Actions to deploy on your behalf, you need to provide it with your Cloudflare API credentials. 

Go to your **GitHub Repository Settings > Secrets and variables > Actions**, and add the following repository secrets:
- **`CLOUDFLARE_API_TOKEN`**: Create this in your Cloudflare dashboard (My Profile > API Tokens). It needs permissions to edit Workers, Pages, and R2.
- **`CLOUDFLARE_ACCOUNT_ID`**: Found on the right sidebar of your Cloudflare dashboard.
- **`VITE_API_URL`**: The live URL of your deployed Cloudflare Worker (e.g., `https://portfolio-api.<your-subdomain>.workers.dev`).

### 5. Push to Deploy

Once your secrets are configured, simply commit and push your code to the `main` branch. 

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

The `.github/workflows/deploy.yml` action will run, building and deploying your backend and frontend to Cloudflare automatically.
