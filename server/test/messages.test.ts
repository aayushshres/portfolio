import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import messages from "../src/routes/messages.js";
import type { Env } from "../src/types.js";

describe("Messages Route", () => {
  let app: Hono<{ Bindings: Env }>;
  let mockRateLimiterDO: any;
  let mockStub: any;
  let mockR2: any;

  beforeEach(() => {
    mockStub = {
      fetch: vi.fn(),
    };
    mockRateLimiterDO = {
      idFromName: vi.fn().mockReturnValue("mock-id"),
      get: vi.fn().mockReturnValue(mockStub),
    };
    mockR2 = {
      put: vi.fn(),
    };
    app = new Hono<{ Bindings: Env }>();
    app.route("/messages", messages);
  });

  const getEnv = () => ({ RATE_LIMITER_DO: mockRateLimiterDO, DATA_BUCKET: mockR2 } as unknown as Env);

  it("should reject submission if honeypot (website) field is filled", async () => {
    mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true, attempts: 1 }), { status: 200 }));

    const req = new Request("http://localhost/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bot",
        email: "bot@bot.com",
        message: "Spam",
        website: "http://spam.com", // honeypot
      }),
    });

    const res = await app.fetch(req, getEnv());
    expect(res.status).toBe(201); // silently accepts
    
    // But does not save to R2
    expect(mockR2.put).not.toHaveBeenCalled();
  });

  it("should enforce rate limiting and return 429 after 3 attempts", async () => {
    mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: false, attempts: 3 }), { status: 429 }));

    const req = new Request("http://localhost/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "CF-Connecting-IP": "127.0.0.1" 
      },
      body: JSON.stringify({
        name: "User",
        email: "user@test.com",
        message: "Hello",
      }),
    });

    const res = await app.fetch(req, getEnv());
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "Too many requests. Please try again later." });
  });

  it("should validate email regex", async () => {
    mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true, attempts: 1 }), { status: 200 }));

    const req = new Request("http://localhost/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User",
        email: "invalid-email-no-domain",
        message: "Hello",
      }),
    });

    const res = await app.fetch(req, getEnv());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid email address" });
  });

  it("should save message and trigger email send when validation succeeds", async () => {
    mockStub.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true, attempts: 1 }), { status: 200 }));
    
    const req = new Request("http://localhost/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Valid User",
        email: "valid@example.com",
        message: "Hello world",
      }),
    });

    const env = getEnv();
    env.RESEND_API_KEY = "test-key";
    env.CONTACT_EMAIL = "admin@example.com";

    const mockWaitUntil = vi.fn();
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });

    const res = await app.fetch(req, env, { waitUntil: mockWaitUntil, passThroughOnException: () => {} } as ExecutionContext);
    
    expect(res.status).toBe(201);
    expect(mockR2.put).toHaveBeenCalled();
    expect(mockWaitUntil).toHaveBeenCalled();
    
    // The fetch should have been called in waitUntil
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails/batch",
      expect.objectContaining({ method: "POST" })
    );

    global.fetch = originalFetch;
  });
});
