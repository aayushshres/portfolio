import { Hono } from "hono";
import type { Env } from "../types.js";
import { authMiddleware } from "../middleware/auth.js";

const cv = new Hono<{ Bindings: Env }>();

const FILENAME = "cv.pdf";

cv.get("/url", async (c) => {
  const obj = await c.env.ASSETS_BUCKET.head(FILENAME);
  if (!obj) {
    return c.json(null);
  }
  return c.json(`/api/cv/file`);
});

cv.get("/file", async (c) => {
  const obj = await c.env.ASSETS_BUCKET.get(FILENAME);
  if (!obj) {
    return c.text("Not found", 404);
  }
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", 'inline; filename="Aayush-Shrestha-CV.pdf"');
  c.header("Cache-Control", "public, max-age=86400");
  return c.body(obj.body);
});

cv.post("/upload", authMiddleware(), async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  
  if (!file || !(file instanceof File)) {
    return c.json({ error: "Missing or invalid file" }, 400);
  }
  
  if (file.type !== "application/pdf") {
    return c.json({ error: "File must be a PDF" }, 400);
  }
  
  // ✅ NEW: enforce 10 MB limit
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return c.json({ error: "File exceeds 10 MB limit" }, 413);
  }
  
  await c.env.ASSETS_BUCKET.put(FILENAME, await file.arrayBuffer(), {
    httpMetadata: { contentType: "application/pdf" },
  });
  
  return c.json({ ok: true });
});

cv.delete("/", authMiddleware(), async (c) => {
  await c.env.ASSETS_BUCKET.delete(FILENAME);
  return c.json({ ok: true });
});

export default cv;
