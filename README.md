# Portfolio Monorepo

A modern portfolio application built with React, Vite, Tailwind CSS v4, and Cloudflare Workers (Hono).

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v20+ recommended)
- A Cloudflare account (if you want to test R2 buckets remotely, though `wrangler dev` simulates them locally by default).

### 1. Install Dependencies
Run the following command from the root of the repository to install dependencies for both the client and server:
```bash
npm install
```

### 2. Configure Environment Variables
You need a secret key for signing JWTs in the local worker. Create a `.dev.vars` file inside the `server/` directory:
```bash
echo "JWT_SECRET=super_secret_local_key" > server/.dev.vars
```

### 3. Run the Development Servers
You can start both the Vite frontend and the Cloudflare Worker backend concurrently with a single command from the root directory:
```bash
npm run dev:all
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:8787](http://localhost:8787)
- **Admin Panel:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

*(Note: The admin panel uses the `JWT_SECRET` you set in `.dev.vars`. You can test login endpoints by sending a POST to `/api/auth/login` to generate a token, or update your local worker to mock an admin password).*

---

## ☁️ Deploying to Cloudflare

The deployment process uses GitHub Actions to automatically deploy both the frontend (Cloudflare Pages) and backend (Cloudflare Workers) whenever code is pushed to `main`. To set this up, you need to configure your Cloudflare account.

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

[[r2_buckets]]
binding = "DATA_BUCKET"
bucket_name = "portfolio-data"

[[r2_buckets]]
binding = "ASSETS_BUCKET"
bucket_name = "portfolio-assets"
```

### 3. Set up Production Secrets
You must set your production JWT secret securely in Cloudflare:
```bash
cd server
npx wrangler secret put JWT_SECRET
# Enter a strong, random password when prompted
```

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
The `.github/workflows/deploy.yml` action will run, building and deploying your backend and frontend to Cloudflare automatically!
