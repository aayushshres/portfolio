import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Returns a click handler. When called 5 times within 3 seconds,
 * silently navigates to /admin.
 */
export function useFooterAdminUnlock() {
  const navigate = useNavigate();
  const clicksRef = useRef<number[]>([]);

  return useCallback(() => {
    const now = Date.now();
    // Keep only clicks within the last 3 seconds
    clicksRef.current = [...clicksRef.current.filter((t) => now - t < 3000), now];

    if (clicksRef.current.length >= 5) {
      clicksRef.current = [];
      navigate("/admin");
    }
  }, [navigate]);
}
