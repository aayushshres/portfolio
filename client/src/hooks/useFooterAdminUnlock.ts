import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useFooterAdminUnlock(clicksRequired = 5, timeframeMs = 3000) {
  const [clicks, setClicks] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (clicks.length >= clicksRequired) {
      navigate("/admin");
      setClicks([]); // Reset after triggering
    }
  }, [clicks, navigate, clicksRequired]);

  const handleClick = useCallback(() => {
    const now = Date.now();
    setClicks((prevClicks) => {
      // Keep only clicks within the timeframe
      const validClicks = prevClicks.filter((time) => now - time <= timeframeMs);
      return [...validClicks, now];
    });
  }, [timeframeMs]);

  return handleClick;
}
