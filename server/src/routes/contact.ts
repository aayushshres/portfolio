import { Hono } from "hono";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_CONTACT, type ContactInfo } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";

const contact = new Hono<{ Bindings: Env }>();

const KEY = "config/contact.json";

contact.get("/", async (c) => {
  const data = await getJson<ContactInfo>(c.env.DATA_BUCKET, KEY, DEFAULT_CONTACT);
  return c.json(data);
});

contact.patch("/", authMiddleware(), async (c) => {
  const current = await getJson<ContactInfo>(c.env.DATA_BUCKET, KEY, DEFAULT_CONTACT);
  let updates: Partial<ContactInfo>;
  try {
    updates = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  
  const merged = { ...current, ...updates };
  await putJson(c.env.DATA_BUCKET, KEY, merged);
  
  return c.json(merged);
});

export default contact;
