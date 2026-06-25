import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

/**
 * Gate for admin routes. If the user is not authenticated via JWT,
 * bounce them to the login page. While verifying the token, show
 * nothing instead of prematurely redirecting (which caused the
 * "flash admin panel then redirect" bug).
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();

  // Wait for token verification to complete before making a decision.
  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-200" />
          Verifying…
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
