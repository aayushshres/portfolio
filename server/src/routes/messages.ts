import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Env } from "../types.js";
import { authMiddleware } from "../middleware/auth.js";
import type { Message } from "../lib/defaults.js";
import { getJson, putJson, deleteKey } from "../lib/r2.js";

const messages = new Hono<{ Bindings: Env }>();

// Simple in-memory rate limiter (per worker instance)
const rateLimits = new Map<string, number[]>();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

messages.post("/", async (c) => {
  // Rate limiting: 3 reqs / 10 mins
  const ip = c.req.header("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const tenMinsAgo = now - 10 * 60 * 1000;
  
  let attempts = rateLimits.get(ip) || [];
  attempts = attempts.filter((t) => t > tenMinsAgo);
  
  if (attempts.length >= 3) {
    return c.json({ error: "Too many requests. Please try again later." }, 429);
  }
  
  attempts.push(now);
  rateLimits.set(ip, attempts);
  
  // Parse body
  const body = await c.req.json<{ name: string; email: string; message: string; website?: string }>().catch(() => null);
  
  if (!body || !body.name || !body.email || !body.message) {
    return c.json({ error: "Name, email, and message are required" }, 400);
  }
  
  if (body.website) {
    // Silently return 201 to not reveal detection
    return c.json({ id: "ok" }, 201);
  }

  if (body.name.trim().length > 100) {
    return c.json({ error: "Name must be 100 characters or fewer" }, 400);
  }
  if (body.email.length > 254) {
    return c.json({ error: "Invalid email address" }, 400);
  }
  if (body.message.trim().length > 5000) {
    return c.json({ error: "Message must be 5,000 characters or fewer" }, 400);
  }
  if (body.name.trim().length === 0 || body.message.trim().length === 0) {
    return c.json({ error: "Name and message must not be empty" }, 400);
  }
  
  const id = nanoid();
  const msg: Message = {
    id,
    name: body.name.trim(),
    email: body.email.trim(),
    message: body.message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  
  // Save to R2
  await putJson(c.env.DATA_BUCKET, `messages/${id}.json`, msg);
  
  // Send email via Resend
  if (c.env.RESEND_API_KEY && c.env.CONTACT_EMAIL) {
    c.executionCtx.waitUntil(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: c.env.CONTACT_EMAIL,
          subject: `New contact from ${msg.name}`,
          html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
            <hr />
            <p>${escapeHtml(msg.message).replace(/\\n/g, "<br>")}</p>
          `,
        }),
      }).catch(err => console.error("Failed to send email:", err))
    );
  }
  
  return c.json({ id }, 201);
});

// Admin routes below

messages.get("/", authMiddleware(), async (c) => {
  const list = await c.env.DATA_BUCKET.list({ prefix: "messages/" });
  
  const allMessages = await Promise.all(
    list.objects.map(async (obj) => {
      const data = await c.env.DATA_BUCKET.get(obj.key);
      if (!data) return null;
      return (await data.json()) as Message;
    })
  );
  
  const validMessages = allMessages.filter(Boolean) as Message[];
  validMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return c.json(validMessages);
});

messages.get("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  const msg = await getJson<Message | null>(c.env.DATA_BUCKET, `messages/${id}.json`, null);
  if (!msg) {
    return c.json({ error: "Message not found" }, 404);
  }
  return c.json(msg);
});

messages.patch("/:id/read", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  const msg = await getJson<Message | null>(c.env.DATA_BUCKET, `messages/${id}.json`, null);
  
  if (!msg) {
    return c.json({ error: "Message not found" }, 404);
  }
  
  const body = await c.req.json<{ read: boolean }>().catch(() => ({ read: true }));
  msg.read = !!body.read;
  
  await putJson(c.env.DATA_BUCKET, `messages/${id}.json`, msg);
  return c.json(msg);
});

messages.delete("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  await deleteKey(c.env.DATA_BUCKET, `messages/${id}.json`);
  return c.json({ ok: true });
});

export default messages;
