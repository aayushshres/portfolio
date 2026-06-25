import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

/**
 * Gate for admin routes. If the user is not authenticated via JWT,
 * bounce them to the login page.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
