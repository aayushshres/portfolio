import { Hono } from "hono";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_PROFILE, type Profile } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";
import { ProfileSchema } from "../lib/schemas.js";

const profile = new Hono<{ Bindings: Env }>();

const KEY = "config/profile.json";

profile.get("/", async (c) => {
  const data = await getJson<Profile>(c.env.DATA_BUCKET, KEY, DEFAULT_PROFILE);
  return c.json(data);
});

profile.patch("/", authMiddleware(), async (c) => {
  const current = await getJson<Profile>(c.env.DATA_BUCKET, KEY, DEFAULT_PROFILE);
  let updates: Partial<Profile>;
  try {
    const rawBody = await c.req.json();
    updates = ProfileSchema.partial().parse(rawBody);
  } catch (err) {
    return c.json({ error: "Invalid JSON body or schema", details: err }, 400);
  }
  
  const merged = { ...current, ...updates };
  await putJson(c.env.DATA_BUCKET, KEY, merged);
  
  return c.json(merged);
});

export default profile;
