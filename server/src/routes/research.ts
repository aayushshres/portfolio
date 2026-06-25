import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_RESEARCH, type ResearchItem } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";

const research = new Hono<{ Bindings: Env }>();

const KEY = "config/research.json";

research.get("/", async (c) => {
  const data = await getJson<ResearchItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_RESEARCH);
  return c.json(data);
});

research.post("/", authMiddleware(), async (c) => {
  const data = await getJson<ResearchItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_RESEARCH);
  const newItem = await c.req.json<Omit<ResearchItem, "id">>().catch(() => null);
  
  if (!newItem || !newItem.title) {
    return c.json({ error: "Invalid research payload" }, 400);
  }
  
  const item: ResearchItem = {
    ...newItem,
    id: nanoid(),
  };
  
  data.push(item);
  await putJson(c.env.DATA_BUCKET, KEY, data);
  
  return c.json(item, 201);
});

research.patch("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  const data = await getJson<ResearchItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_RESEARCH);
  const index = data.findIndex((r) => r.id === id);
  
  if (index === -1) {
    return c.json({ error: "Research not found" }, 404);
  }
  
  const updates = await c.req.json().catch(() => ({}));
  data[index] = { ...data[index], ...updates };
  
  await putJson(c.env.DATA_BUCKET, KEY, data);
  return c.json(data[index]);
});

research.delete("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  let data = await getJson<ResearchItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_RESEARCH);
  
  const initialLength = data.length;
  data = data.filter((r) => r.id !== id);
  
  if (data.length === initialLength) {
    return c.json({ error: "Research not found" }, 404);
  }
  
  await putJson(c.env.DATA_BUCKET, KEY, data);
  return c.json({ ok: true });
});

export default research;
