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
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: "HS256",
      cookie: "access_token",
    });
    return jwtMiddleware(c, next);
  };
};
