import { useEffect, useRef } from "react";

interface PdfViewerModalProps {
  url: string;
  onClose: () => void;
}

export default function PdfViewerModal({ url, onClose }: PdfViewerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="CV Viewer"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-paper/95 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className="material-symbols-rounded text-brand-600">description</span>
          Curriculum Vitae
        </span>
        <div className="flex items-center gap-3">
          <a
            href={url}
            download
            className="btn btn-outline text-xs py-1.5 px-3"
          >
            <span className="material-symbols-rounded text-[16px]">download</span>
            Download
          </a>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-ink hover:border-brand-300 transition-colors"
            aria-label="Close CV viewer"
          >
            <span className="material-symbols-rounded text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          className="h-full w-full border-0"
          title="CV PDF Viewer"
        />
      </div>
    </div>
  );
}
