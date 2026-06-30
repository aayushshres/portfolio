import { describe, it, expect, vi } from "vitest";
import { authMiddleware } from "../src/middleware/auth.js";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import type { Env } from "../src/types.js";

describe("authMiddleware", () => {
  const getApp = () => {
    const app = new Hono<{ Bindings: Env }>();
    app.use("/protected", authMiddleware());
    app.get("/protected", (c) => c.json({ ok: true }));
    return app;
  };

  const MOCK_ENV = { JWT_SECRET: "test-secret" } as Env;

  it("should reject when access_token cookie is missing", async () => {
    const app = getApp();
    const req = new Request("http://localhost/protected");
    const res = await app.fetch(req, MOCK_ENV);

    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Unauthorized");
  });

  it("should reject when access_token cookie is invalid", async () => {
    const app = getApp();
    const req = new Request("http://localhost/protected", {
      headers: {
        cookie: "access_token=invalid-token",
      },
    });
    const res = await app.fetch(req, MOCK_ENV);

    expect(res.status).toBe(401);
  });

  it("should allow when access_token cookie is valid", async () => {
    const app = getApp();
    const token = await sign({ role: "admin", exp: Math.floor(Date.now() / 1000) + 60 }, MOCK_ENV.JWT_SECRET, "HS256");
    
    const req = new Request("http://localhost/protected", {
      headers: {
        cookie: `access_token=${token}`,
      },
    });
    const res = await app.fetch(req, MOCK_ENV);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("should reject when access_token cookie is expired", async () => {
    const app = getApp();
    const token = await sign({ role: "admin", exp: Math.floor(Date.now() / 1000) - 60 }, MOCK_ENV.JWT_SECRET, "HS256");
    
    const req = new Request("http://localhost/protected", {
      headers: {
        cookie: `access_token=${token}`,
      },
    });
    const res = await app.fetch(req, MOCK_ENV);

    expect(res.status).toBe(401);
  });
});
