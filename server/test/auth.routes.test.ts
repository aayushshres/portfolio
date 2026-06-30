import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import auth from "../src/routes/auth.js";
import type { Env } from "../src/types.js";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

describe("Auth Routes", () => {
  let app: Hono<{ Bindings: Env }>;
  let mockKV: any;
  let mockRateLimiterDO: any;
  let mockStub: any;

  beforeEach(() => {
    mockKV = {
      get: vi.fn(),
      put: vi.fn(),
    };
    mockStub = {
      fetch: vi.fn(),
    };
    mockRateLimiterDO = {
      idFromName: vi.fn().mockReturnValue("mock-id"),
      get: vi.fn().mockReturnValue(mockStub),
    };
    app = new Hono<{ Bindings: Env }>();
    app.route("/auth", auth);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const getEnv = () => ({ 
    AUTH_STORE: mockKV,
    RATE_LIMITER_DO: mockRateLimiterDO,
    ADMIN_PASSWORD_HASH: "fallback-hash",
    JWT_SECRET: "test-secret"
  } as unknown as Env);

  describe("POST /auth/login", () => {
    it("should migrate password to KV if not present", async () => {
      mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true, attempts: 1 }), { status: 200 }));
      mockKV.get.mockResolvedValue(null); // Not in KV
      vi.mocked(bcrypt.compare).mockResolvedValue(true); // Password correct

      const req = new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "correct-password" }),
      });

      const res = await app.fetch(req, getEnv());
      
      expect(mockKV.put).toHaveBeenCalledWith("admin_password_hash", "fallback-hash");
      expect(res.status).toBe(200);
      
      // Should set cookies
      const setCookie = res.headers.get("Set-Cookie");
      expect(setCookie).toContain("access_token");
    });

    it("should reject invalid login", async () => {
      mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true, attempts: 1 }), { status: 200 }));
      mockKV.get.mockResolvedValue("stored-hash"); // Already in KV
      vi.mocked(bcrypt.compare).mockResolvedValue(false); // Password wrong

      const req = new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "wrong-password" }),
      });

      const res = await app.fetch(req, getEnv());
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Invalid credentials or too many attempts" });
    });
  });

  describe("POST /auth/change-password", () => {
    it("should change password when current is correct and new matches", async () => {
      mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true, attempts: 1 }), { status: 200 }));
      mockKV.get.mockResolvedValue("stored-hash");
      vi.mocked(bcrypt.compare).mockResolvedValue(true); // Current password correct
      vi.mocked(bcrypt.hash).mockResolvedValue("new-hash");

      const token = await sign({ role: "admin", exp: Math.floor(Date.now() / 1000) + 60 }, "test-secret", "HS256");

      const req = new Request("http://localhost/auth/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cookie": `access_token=${token}`
        },
        body: JSON.stringify({
          currentPassword: "old-password",
          newPassword: "new-password123",
          confirmPassword: "new-password123"
        }),
      });

      const res = await app.fetch(req, getEnv());
      
      expect(res.status).toBe(200);
      expect(mockKV.put).toHaveBeenCalledWith("admin_password_hash", "new-hash");
      
      const setCookieHeaders = res.headers.getSetCookie();
      // Should clear access_token and refresh_token
      expect(setCookieHeaders.some(c => c.includes("access_token=;") && c.includes("Max-Age=0"))).toBe(true);
      expect(setCookieHeaders.some(c => c.includes("refresh_token=;") && c.includes("Max-Age=0"))).toBe(true);
    });

    it("should reject when new password is too short", async () => {
      mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true, attempts: 1 }), { status: 200 }));
      const token = await sign({ role: "admin", exp: Math.floor(Date.now() / 1000) + 60 }, "test-secret", "HS256");

      const req = new Request("http://localhost/auth/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cookie": `access_token=${token}`
        },
        body: JSON.stringify({
          currentPassword: "old-password",
          newPassword: "short",
          confirmPassword: "short"
        }),
      });

      const res = await app.fetch(req, getEnv());
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "New password must be between 12 and 128 characters" });
    });
    
    it("should enforce rate limit for change password", async () => {
      mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: false, attempts: 3 }), { status: 429 }));
      const token = await sign({ role: "admin", exp: Math.floor(Date.now() / 1000) + 60 }, "test-secret", "HS256");

      const req = new Request("http://localhost/auth/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cookie": `access_token=${token}`
        },
        body: JSON.stringify({
          currentPassword: "old-password",
          newPassword: "new-password123",
          confirmPassword: "new-password123"
        }),
      });

      const res = await app.fetch(req, getEnv());
      expect(res.status).toBe(429);
    });
  });
});
