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

const app = new Hono<{ Bindings: Env }>();

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "https://aayushshrestha.dev"],
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

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

app.onError((err, c) => {
  console.error("Server Error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
