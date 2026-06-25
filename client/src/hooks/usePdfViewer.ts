import { useState, useCallback } from "react";

export function usePdfViewer() {
  const [isOpen, setIsOpen] = useState(false);

  const openViewer = useCallback(() => setIsOpen(true), []);
  const closeViewer = useCallback(() => setIsOpen(false), []);

  return { isOpen, openViewer, closeViewer };
}
