import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { Env } from "./types.js";

import auth from "./routes/auth.js";
import profile from "./routes/profile.js";
import settings from "./routes/settings.js";
import socials from "./routes/socials.js";
import projects from "./routes/projects.js";
import research from "./routes/research.js";
import publications from "./routes/publications.js";
import cv from "./routes/cv.js";
import messages from "./routes/messages.js";
import contact from "./routes/contact.js";
import images from "./routes/images.js";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", secureHeaders());
app.use("/api/*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
});

const ALLOWED_ORIGINS = [
  "https://aayushshrestha-portfolio.pages.dev",   // production frontend domain
  "https://aayushshrestha.dev",                   // custom domain
  "http://localhost:5173",               // local Vite dev
  "http://localhost:4173",               // local preview
];

app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (typeof origin === "string" && origin.endsWith(".aayushshrestha-portfolio.pages.dev")) {
        return origin;
      }
      return ALLOWED_ORIGINS.includes(origin) ? origin : null;
    },
    credentials: true,
  })
);

app.get("/api/health", (c) => {
  return c.json({ status: "ok", ts: Date.now() });
});

app.route("/api/auth", auth);
app.route("/api/profile", profile);
app.route("/api/settings", settings);
app.route("/api/socials", socials);
app.route("/api/projects", projects);
app.route("/api/research", research);
app.route("/api/publications", publications);
app.route("/api/cv", cv);
app.route("/api/messages", messages);
app.route("/api/contact", contact);
app.route("/api/images", images);

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

import { HTTPException } from "hono/http-exception";

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error("Server Error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
export { RateLimiterDO } from "./durable_objects/RateLimiterDO.js";
