import { Hono } from "hono";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import type { Env } from "../types.js";
import { authMiddleware } from "../middleware/auth.js";

const auth = new Hono<{ Bindings: Env }>();

auth.post("/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const password = body.password;

  if (!password || typeof password !== "string") {
    return c.json({ error: "Password is required" }, 400);
  }

  const isValid = await bcrypt.compare(password, c.env.ADMIN_PASSWORD_HASH);

  if (!isValid) {
    return c.json({ error: "Invalid password" }, 401);
  }

  const payload = {
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };

  const token = await sign(payload, c.env.JWT_SECRET, "HS256");

  return c.json({ token });
});

auth.post("/logout", (c) => {
  return c.json({ ok: true });
});

auth.get("/verify", authMiddleware(), (c) => {
  return c.json({ ok: true });
});

export default auth;
