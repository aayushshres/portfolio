import { Hono } from "hono";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_SETTINGS, type Settings } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";
import { SettingsSchema } from "../lib/schemas.js";

const settings = new Hono<{ Bindings: Env }>();

const KEY = "config/settings.json";

settings.get("/", async (c) => {
  const data = await getJson<Settings>(c.env.DATA_BUCKET, KEY, DEFAULT_SETTINGS);
  return c.json(data);
});

settings.put("/", authMiddleware(), async (c) => {
  try {
    const rawBody = await c.req.json();
    const newSettings = SettingsSchema.parse(rawBody);
    await putJson(c.env.DATA_BUCKET, KEY, newSettings);
    return c.json(newSettings);
  } catch (err) {
    return c.json({ error: "Invalid settings payload", details: err }, 400);
  }
});

export default settings;
