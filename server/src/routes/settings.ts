import { Hono } from "hono";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_SETTINGS, type Settings } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";

const settings = new Hono<{ Bindings: Env }>();

const KEY = "config/settings.json";

settings.get("/", async (c) => {
  const data = await getJson<Settings>(c.env.DATA_BUCKET, KEY, DEFAULT_SETTINGS);
  return c.json(data);
});

settings.put("/", authMiddleware(), async (c) => {
  const newSettings = await c.req.json<Settings>().catch(() => null);
  
  if (!newSettings || !newSettings.sections) {
    return c.json({ error: "Invalid settings payload" }, 400);
  }
  
  await putJson(c.env.DATA_BUCKET, KEY, newSettings);
  return c.json(newSettings);
});

export default settings;
