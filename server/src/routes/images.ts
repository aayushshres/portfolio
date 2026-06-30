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
  
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed." }, 400);
  }
  
  // 5 MB limit
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return c.json({ error: "File exceeds 5 MB limit" }, 413);
  }
  
  const buffer = await file.arrayBuffer();
  const arr = new Uint8Array(buffer).subarray(0, 12);
  const header = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  
  let extension = "";
  let expectedMime = "";
  if (header.startsWith('ffd8ff')) {
    extension = "jpg";
    expectedMime = "image/jpeg";
  } else if (header.startsWith('89504e47')) {
    extension = "png";
    expectedMime = "image/png";
  } else if (header.startsWith('47494638')) {
    extension = "gif";
    expectedMime = "image/gif";
  } else if (header.startsWith('52494646') && header.substring(16, 24) === '57454250') {
    extension = "webp";
    expectedMime = "image/webp";
  }

  if (!extension || file.type !== expectedMime) {
    return c.json({ error: "Invalid file content or mismatched MIME type" }, 400);
  }
  
  // Generate a unique filename using crypto.randomUUID
  const uniqueId = crypto.randomUUID();
  const filename = `${uniqueId}.${extension}`;
  
  await c.env.ASSETS_BUCKET.put(`images/${filename}`, buffer, {
    httpMetadata: { contentType: file.type },
  });
  
  return c.json({ url: `/api/images/${filename}` });
});

export default images;
