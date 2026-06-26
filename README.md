# Personal Portfolio

This repository contains the source code for a comprehensive, full-stack personal portfolio application. It is designed for academics, researchers, and software developers to showcase their projects, publications, and professional background.

The project features a public-facing website with a modern, responsive design, alongside a secure, built-in admin dashboard. From the admin dashboard, the owner can dynamically manage and edit all content on the site, including biographical information, project listings, research highlights, and social links. The application is highly configurable, allowing specific sections to be hidden or displayed based on user preference.

For detailed information on the architecture, local development setup, and deployment instructions, please refer to the [Documentation](DOCUMENTATION.md).

## Tech Stack

The application is built using a modern, serverless architecture split into a frontend client and a backend API.

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router
- **Animations**: GSAP (GreenSock Animation Platform)
- **Forms**: React Hook Form

### Backend
- **Framework**: Hono (running on Cloudflare Workers)
- **Runtime**: Cloudflare Workers
- **Authentication**: JWT (JSON Web Tokens) delivered via `httpOnly` cookies with bcrypt for password hashing. Passwords are securely stored in a dedicated Cloudflare KV namespace.
- **Storage**: Cloudflare R2 Object Storage (used as a lightweight NoSQL database for JSON configurations and file hosting).
- **Rate Limiting**: Cloudflare KV is used for persistent IP-based rate limiting across all public endpoints.
- **Email Notifications**: Resend API (used to send admin notifications for contact form submissions).

### Deployment
- **Hosting**: Cloudflare Pages (Frontend) and Cloudflare Workers (Backend)
- **CI/CD**: GitHub Actions for automated building and deployment
