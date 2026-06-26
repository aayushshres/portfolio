import { jwt } from "hono/jwt";
import { getCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import type { Env } from "../types.js";

/**
 * Middleware that verifies the JWT token in the access_token cookie.
 * Uses the JWT_SECRET from the environment.
 */
export const authMiddleware = (): MiddlewareHandler<{ Bindings: Env }> => {
  return async (c, next) => {
    const token = getCookie(c, "access_token");
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // We manually set the Authorization header so that the standard hono/jwt
    // middleware can process it seamlessly, avoiding custom verify logic here.
    c.req.raw.headers.set("Authorization", `Bearer ${token}`);
    
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: "HS256",
    });
    return jwtMiddleware(c, next);
  };
};
