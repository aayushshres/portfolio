import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_PUBLICATIONS, type PublicationItem } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";

const publications = new Hono<{ Bindings: Env }>();

const KEY = "config/publications.json";

publications.get("/", async (c) => {
  const data = await getJson<PublicationItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PUBLICATIONS);
  return c.json(data);
});

publications.post("/", authMiddleware(), async (c) => {
  const data = await getJson<PublicationItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PUBLICATIONS);
  const newItem = await c.req.json<Omit<PublicationItem, "id">>().catch(() => null);
  
  if (!newItem || !newItem.title) {
    return c.json({ error: "Invalid publication payload" }, 400);
  }
  
  const item: PublicationItem = {
    ...newItem,
    id: nanoid(),
  };
  
  data.push(item);
  await putJson(c.env.DATA_BUCKET, KEY, data);
  
  return c.json(item, 201);
});

publications.patch("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  const data = await getJson<PublicationItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PUBLICATIONS);
  const index = data.findIndex((p) => p.id === id);
  
  if (index === -1) {
    return c.json({ error: "Publication not found" }, 404);
  }
  
  const updates = await c.req.json().catch(() => ({}));
  data[index] = { ...data[index], ...updates };
  
  await putJson(c.env.DATA_BUCKET, KEY, data);
  return c.json(data[index]);
});

publications.delete("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  let data = await getJson<PublicationItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PUBLICATIONS);
  
  const initialLength = data.length;
  data = data.filter((p) => p.id !== id);
  
  if (data.length === initialLength) {
    return c.json({ error: "Publication not found" }, 404);
  }
  
  await putJson(c.env.DATA_BUCKET, KEY, data);
  return c.json({ ok: true });
});

export default publications;
