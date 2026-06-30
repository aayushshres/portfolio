import { Hono } from "hono";
import type { Env } from "../types.js";
import { authMiddleware } from "../middleware/auth.js";

const images = new Hono<{ Bindings: Env }>();

images.get("/:filename", async (c) => {
  const filename = c.req.param("filename");
  const obj = await c.env.ASSETS_BUCKET.get(`images/${filename}`);
  if (!obj) {
    return c.text("Not found", 404);
  }
  
  const contentType = obj.httpMetadata?.contentType || "application/octet-stream";
  c.header("Content-Type", contentType);
  c.header("Cache-Control", "public, max-age=31536000"); // cache for 1 year
  
  return c.body(obj.body);
});

images.post("/upload", authMiddleware(), async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  
  if (!file || !(file instanceof File)) {
    return c.json({ error: "Missing or invalid file" }, 400);
  }
  
  if (!file.type.startsWith("image/")) {
    return c.json({ error: "File must be an image" }, 400);
  }
  
  // 5 MB limit
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return c.json({ error: "File exceeds 5 MB limit" }, 413);
  }
  
  // Generate a unique filename using crypto.randomUUID
  const extension = file.name.split(".").pop() || "png";
  const uniqueId = crypto.randomUUID();
  const filename = `${uniqueId}.${extension}`;
  
  await c.env.ASSETS_BUCKET.put(`images/${filename}`, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  
  return c.json({ url: `/api/images/${filename}` });
});

export default images;
