import { Hono } from "hono";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_SOCIALS, type SocialItem } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";

const socials = new Hono<{ Bindings: Env }>();

const KEY = "config/socials.json";

socials.get("/", async (c) => {
  const data = await getJson<SocialItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_SOCIALS);
  return c.json(data);
});

socials.put("/", authMiddleware(), async (c) => {
  const newSocials = await c.req.json<SocialItem[]>().catch(() => null);
  
  if (!Array.isArray(newSocials)) {
    return c.json({ error: "Invalid payload, expected array" }, 400);
  }
  
  await putJson(c.env.DATA_BUCKET, KEY, newSocials);
  return c.json(newSocials);
});

export default socials;
