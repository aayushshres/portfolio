import type { Env } from "../types.js";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export async function checkRateLimit(
  env: Env,
  action: string,
  ip: string,
  options: RateLimitOptions
): Promise<{ success: boolean; attempts: number }> {
  const key = `${action}:${ip}`;
  const id = env.RATE_LIMITER_DO.idFromName(key);
  const stub = env.RATE_LIMITER_DO.get(id);
  
  try {
    const response = await stub.fetch("http://do/limit", {
      method: "POST",
      body: JSON.stringify(options),
      headers: { "Content-Type": "application/json" }
    });
    
    if (response.ok || response.status === 400 || response.status === 429) {
      const result = await response.json() as { success: boolean; attempts: number };
      return result;
    }
  } catch (e) {
    // If DO fails, fail open to not block legitimate traffic
    console.error("Rate limiter DO failed:", e);
  }

  return { success: true, attempts: 1 };
}
