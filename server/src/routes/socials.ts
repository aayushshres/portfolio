import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_SOCIALS, type SocialItem } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";
import { SocialItemSchema } from "../lib/schemas.js";

const socials = new Hono<{ Bindings: Env }>();

const KEY = "config/socials.json";

socials.get("/", async (c) => {
  const data = await getJson<SocialItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_SOCIALS);
  return c.json(data);
});

socials.put("/", authMiddleware(), async (c) => {
  try {
    const rawBody = await c.req.json();
    const newSocials = z.array(SocialItemSchema).parse(rawBody);
    await putJson(c.env.DATA_BUCKET, KEY, newSocials);
    return c.json(newSocials);
  } catch (err) {
    return c.json({ error: "Invalid payload, expected array of socials", details: err }, 400);
  }
});

export default socials;
