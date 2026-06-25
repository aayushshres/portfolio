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
  const newProject = await c.req.json<Omit<ProjectItem, "id">>().catch(() => null);
  
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
  
  const updates = await c.req.json().catch(() => ({}));
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

projects.put("/reorder", authMiddleware(), async (c) => {
  const updates = await c.req.json<{ id: string; order: number }[]>().catch(() => null);
  
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
