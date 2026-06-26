import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_PROJECTS, type ProjectItem } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";
import { ProjectItemSchema } from "../lib/schemas.js";

const projects = new Hono<{ Bindings: Env }>();

const KEY = "config/projects.json";

projects.get("/", async (c) => {
  const data = await getJson<ProjectItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PROJECTS);
  // Sort by order ascending
  return c.json(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
});

projects.post("/", authMiddleware(), async (c) => {
  const data = await getJson<ProjectItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PROJECTS);
  let newProject: any;
  try {
    const rawBody = await c.req.json();
    newProject = ProjectItemSchema.omit({ id: true, order: true }).parse(rawBody);
  } catch (err) {
    return c.json({ error: "Invalid JSON body or schema", details: err }, 400);
  }
  
  const project: ProjectItem = {
    ...newProject,
    id: nanoid(),
    order: data.length, // Put at the end
  };
  
  data.push(project);
  await putJson(c.env.DATA_BUCKET, KEY, data);
  
  return c.json(project, 201);
});

projects.patch("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  const data = await getJson<ProjectItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PROJECTS);
  const index = data.findIndex((p) => p.id === id);
  
  if (index === -1) {
    return c.json({ error: "Project not found" }, 404);
  }
  
  try {
    const rawBody = await c.req.json();
    const updates = ProjectItemSchema.partial().parse(rawBody);
    data[index] = { ...data[index], ...updates };
  } catch (err) {
    return c.json({ error: "Invalid JSON body or schema", details: err }, 400);
  }
  
  await putJson(c.env.DATA_BUCKET, KEY, data);
  return c.json(data[index]);
});

projects.delete("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  let data = await getJson<ProjectItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PROJECTS);
  
  const initialLength = data.length;
  data = data.filter((p) => p.id !== id);
  
  if (data.length === initialLength) {
    return c.json({ error: "Project not found" }, 404);
  }
  
  await putJson(c.env.DATA_BUCKET, KEY, data);
  return c.json({ ok: true });
});

projects.put("/", authMiddleware(), async (c) => {
  let incoming: ProjectItem[];
  try {
    const rawBody = await c.req.json();
    incoming = z.array(ProjectItemSchema).parse(rawBody);
  } catch (err) {
    return c.json({ error: "Invalid JSON body or schema", details: err }, 400);
  }
  
  const data: ProjectItem[] = incoming.map((item, i) => ({
    ...item,
    id: item.id || nanoid(),
    order: item.order ?? i,
  }));
  await putJson(c.env.DATA_BUCKET, KEY, data);
  return c.json(data);
});

projects.put("/reorder", authMiddleware(), async (c) => {
  let updates: { id: string; order: number }[];
  try {
    const rawBody = await c.req.json();
    updates = z.array(z.object({ id: z.string(), order: z.number() })).parse(rawBody);
  } catch (err) {
    return c.json({ error: "Invalid JSON body or schema", details: err }, 400);
  }
  
  const data = await getJson<ProjectItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PROJECTS);
  
  for (const update of updates) {
    const project = data.find((p) => p.id === update.id);
    if (project) {
      project.order = update.order;
    }
  }
  
  data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  await putJson(c.env.DATA_BUCKET, KEY, data);
  
  return c.json(data);
});

export default projects;
