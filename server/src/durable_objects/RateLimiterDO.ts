import type { Env } from "../types.js";

export class RateLimiterDO {
  state: DurableObjectState;
  
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
  }
  
  async fetch(request: Request) {
    const { limit, windowMs } = await request.json() as { limit: number; windowMs: number };
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let attempts: number[] = (await this.state.storage.get("attempts")) || [];
    attempts = attempts.filter((t) => t > windowStart);
    
    if (attempts.length >= limit) {
      return new Response(JSON.stringify({ success: false, attempts: attempts.length }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    attempts.push(now);
    await this.state.storage.put("attempts", attempts);
    
    // Set an alarm to clean up storage after the window expires
    this.state.storage.setAlarm(now + windowMs + 1000);
    
    return new Response(JSON.stringify({ success: true, attempts: attempts.length }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  async alarm() {
    await this.state.storage.deleteAll();
  }
}
