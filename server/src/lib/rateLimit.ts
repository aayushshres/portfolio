import type { Env } from "../types.js";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export async function checkRateLimit(
  env: Env["Bindings"],
  action: string,
  ip: string,
  options: RateLimitOptions
): Promise<{ success: boolean; attempts: number }> {
  const key = `ratelimit:${action}:${ip}`;
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let attempts: number[] = [];
  try {
    const data = await env.RATE_LIMITER.get(key, "json");
    if (Array.isArray(data)) {
      attempts = data;
    }
  } catch (e) {
    // Ignore KV read errors
  }

  // Filter out attempts outside the window
  attempts = attempts.filter((t: number) => t > windowStart);

  if (attempts.length >= options.limit) {
    return { success: false, attempts: attempts.length };
  }

  attempts.push(now);

  // Set expiration slightly longer than the window to ensure cleanup
  const ttlSeconds = Math.ceil(options.windowMs / 1000) + 60;
  
  try {
    await env.RATE_LIMITER.put(key, JSON.stringify(attempts), {
      expirationTtl: ttlSeconds,
    });
  } catch (e) {
    // Ignore KV write errors
  }

  return { success: true, attempts: attempts.length };
}
