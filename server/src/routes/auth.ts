import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { setCookie, getCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import type { Env } from "../types.js";
import { authMiddleware } from "../middleware/auth.js";
import { checkRateLimit } from "../lib/rateLimit.js";

const auth = new Hono<{ Bindings: Env }>();

auth.post("/login", async (c) => {
  // Login rate limiting: 5 attempts per 15 minutes per IP
  const ip = c.req.header("CF-Connecting-IP") || "unknown";
  const { success } = await checkRateLimit(c.env, "login", ip, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!success) {
    // Generic error for enumeration prevention
    return c.json({ error: "Invalid credentials or too many attempts" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const password = body.password;

  if (!password || typeof password !== "string") {
    return c.json({ error: "Invalid credentials or too many attempts" }, 401);
  }

  const isValid = await bcrypt.compare(password, c.env.ADMIN_PASSWORD_HASH);

  if (!isValid) {
    await new Promise((r) => setTimeout(r, 1000));
    return c.json({ error: "Invalid credentials or too many attempts" }, 401);
  }

  // 15-minute access token
  const accessPayload = {
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + 15 * 60,
  };
  const accessToken = await sign(accessPayload, c.env.JWT_SECRET, "HS256");

  // 7-day refresh token
  const refreshPayload = {
    role: "admin_refresh",
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };
  const refreshToken = await sign(refreshPayload, c.env.JWT_SECRET, "HS256");

  setCookie(c, "access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: 15 * 60,
  });

  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/api/auth/refresh", // Only sent on refresh endpoint
    maxAge: 7 * 24 * 60 * 60,
  });

  return c.json({ ok: true });
});

auth.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, "refresh_token");
  if (!refreshToken) {
    return c.json({ error: "No refresh token" }, 401);
  }

  try {
    const payload = await verify(refreshToken, c.env.JWT_SECRET, "HS256");
    if (payload.role !== "admin_refresh") {
      throw new Error("Invalid role");
    }

    const accessPayload = {
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 15 * 60,
    };
    const accessToken = await sign(accessPayload, c.env.JWT_SECRET, "HS256");

    setCookie(c, "access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 15 * 60,
    });

    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: "Invalid or expired refresh token" }, 401);
  }
});

auth.post("/logout", (c) => {
  setCookie(c, "access_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: 0,
  });
  setCookie(c, "refresh_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/api/auth/refresh",
    maxAge: 0,
  });
  return c.json({ ok: true });
});

auth.get("/verify", authMiddleware(), (c) => {
  return c.json({ ok: true });
});

export default auth;
