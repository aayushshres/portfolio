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

  let storedHash = await c.env.AUTH_STORE.get("admin_password_hash");
  if (!storedHash) {
    if (c.env.ADMIN_PASSWORD_HASH) {
      await c.env.AUTH_STORE.put("admin_password_hash", c.env.ADMIN_PASSWORD_HASH);
      storedHash = c.env.ADMIN_PASSWORD_HASH;
      console.log(JSON.stringify({
        event: "password_migration",
        message: "Successfully migrated password from environment secret to KV store.",
        timestamp: new Date().toISOString()
      }));
    } else {
      return c.json({ error: "Server configuration error: No password set." }, 500);
    }
  }

  const isValid = await bcrypt.compare(password, storedHash);

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

auth.post("/change-password", authMiddleware(), async (c) => {
  const ip = c.req.header("CF-Connecting-IP") || "unknown";
  const userAgent = c.req.header("User-Agent") || "unknown";
  
  // Rate limiting: 3 attempts per hour
  const { success } = await checkRateLimit(c.env, "change-password", ip, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });

  if (!success) {
    return c.json({ error: "Too many requests. Please try again later." }, 429);
  }

  const body = await c.req.json().catch(() => ({}));
  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return c.json({ error: "All fields are required" }, 400);
  }

  if (newPassword !== confirmPassword) {
    return c.json({ error: "New passwords do not match" }, 400);
  }

  if (newPassword.length < 12 || newPassword.length > 128) {
    return c.json({ error: "New password must be between 12 and 128 characters" }, 400);
  }

  if (currentPassword === newPassword) {
    return c.json({ error: "New password must be different from current password" }, 400);
  }

  let storedHash = await c.env.AUTH_STORE.get("admin_password_hash");
  if (!storedHash) {
    storedHash = c.env.ADMIN_PASSWORD_HASH;
  }

  const isValid = await bcrypt.compare(currentPassword, storedHash);

  if (!isValid) {
    console.log(JSON.stringify({
      event: "password_change_failure",
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      reason: "Incorrect current password"
    }));
    return c.json({ error: "Incorrect current password" }, 401);
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await c.env.AUTH_STORE.put("admin_password_hash", newHash);

  console.log(JSON.stringify({
    event: "password_change_success",
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  }));

  // Clear sessions to force re-login
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

  return c.json({ ok: true, message: "Password updated successfully" });
});

export default auth;
