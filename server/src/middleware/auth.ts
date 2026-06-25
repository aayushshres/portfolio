import { jwt } from "hono/jwt";
import type { MiddlewareHandler } from "hono";
import type { Env } from "../types.js";

/**
 * Middleware that verifies the JWT token in the Authorization header.
 * Uses the JWT_SECRET from the environment.
 */
export const authMiddleware = (): MiddlewareHandler<{ Bindings: Env }> => {
  return async (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: "HS256",
    });
    return jwtMiddleware(c, next);
  };
};
