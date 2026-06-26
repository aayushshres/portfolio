import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_RESEARCH, type ResearchItem } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";
import { ResearchItemSchema } from "../lib/schemas.js";

const research = new Hono<{ Bindings: Env }>();

const KEY = "config/research.json";

research.get("/", async (c) => {
  const data = await getJson<ResearchItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_RESEARCH);
  return c.json(data);
});

research.post("/", authMiddleware(), async (c) => {
  const data = await getJson<ResearchItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_RESEARCH);
  let newItem: any;
  try {
    const rawBody = await c.req.json();
    newItem = ResearchItemSchema.omit({ id: true }).parse(rawBody);
  } catch (err) {
    return c.json({ error: "Invalid JSON body or schema", details: err }, 400);
  }
  
  const item: ResearchItem = {
    ...newItem,
    id: nanoid(),
  };
  
  data.push(item);
  await putJson(c.env.DATA_BUCKET, KEY, data);
  
  return c.json(item, 201);
});

research.put("/", authMiddleware(), async (c) => {
  let incoming: ResearchItem[];
  try {
    const rawBody = await c.req.json();
    incoming = z.array(ResearchItemSchema).parse(rawBody);
  } catch (err) {
    return c.json({ error: "Invalid JSON body or schema", details: err }, 400);
  }
  
  const data: ResearchItem[] = incoming.map((item) => ({
    ...item,
    id: item.id || nanoid(),
  }));
  await putJson(c.env.DATA_BUCKET, KEY, data);
  return c.json(data);
});

research.patch("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  const data = await getJson<ResearchItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_RESEARCH);
  const index = data.findIndex((r) => r.id === id);
  
  if (index === -1) {
    return c.json({ error: "Research not found" }, 404);
  }
  
  try {
    const rawBody = await c.req.json();
    const updates = ResearchItemSchema.partial().parse(rawBody);
    data[index] = { ...data[index], ...updates };
  } catch (err) {
    return c.json({ error: "Invalid JSON body or schema", details: err }, 400);
  }
  
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
