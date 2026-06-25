import { Hono } from "hono";
import { cors } from "hono/cors";
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

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_ORIGINS = [
  "https://aayushshrestha-portfolio.pages.dev",   // production frontend domain
  "https://aayushshrestha.dev",                   // custom domain
  "http://localhost:5173",               // local Vite dev
  "http://localhost:4173",               // local preview
];

app.use(
  "/*",
  cors({
    origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]),
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
