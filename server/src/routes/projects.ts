import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Env } from "../types.js";
import { getJson, putJson } from "../lib/r2.js";
import { DEFAULT_PROJECTS, type ProjectItem } from "../lib/defaults.js";
import { authMiddleware } from "../middleware/auth.js";

const projects = new Hono<{ Bindings: Env }>();

const KEY = "config/projects.json";

projects.get("/", async (c) => {
  const data = await getJson<ProjectItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PROJECTS);
  // Sort by order ascending
  return c.json(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
});

projects.post("/", authMiddleware(), async (c) => {
  const data = await getJson<ProjectItem[]>(c.env.DATA_BUCKET, KEY, DEFAULT_PROJECTS);
  let newProject: Omit<ProjectItem, "id">;
  try {
    newProject = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  
  if (!newProject || !newProject.title) {
    return c.json({ error: "Invalid project payload" }, 400);
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
  
  let updates: any;
  try {
    updates = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  data[index] = { ...data[index], ...updates };
  
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
    incoming = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  if (!Array.isArray(incoming)) {
    return c.json({ error: "Expected an array of projects" }, 400);
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
    updates = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  
  if (!Array.isArray(updates)) {
    return c.json({ error: "Expected an array of {id, order}" }, 400);
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
