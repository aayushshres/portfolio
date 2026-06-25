import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up the pdf worker using Vite's URL import
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerModalProps {
  url: string;
  onClose: () => void;
}

export default function PdfViewerModal({ url, onClose }: PdfViewerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

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

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="CV Viewer"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-paper/95 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <span className="material-symbols-rounded text-brand-600">description</span>
            Document Viewer
          </span>
        </div>
        
        {/* Pagination & Zoom Controls */}
        <div className="hidden md:flex items-center gap-4 text-sm text-ink/80">
          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface/50 overflow-hidden">
             <button 
               onClick={() => setPageNumber(p => Math.max(1, p - 1))}
               disabled={pageNumber <= 1}
               className="p-1 hover:bg-white/5 disabled:opacity-50 transition-colors"
               aria-label="Previous page"
             >
               <span className="material-symbols-rounded text-[18px]">chevron_left</span>
             </button>
             <span className="min-w-[4rem] text-center text-xs font-mono">
               {pageNumber} / {numPages || '-'}
             </span>
             <button 
               onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
               disabled={pageNumber >= (numPages || 1)}
               className="p-1 hover:bg-white/5 disabled:opacity-50 transition-colors"
               aria-label="Next page"
             >
               <span className="material-symbols-rounded text-[18px]">chevron_right</span>
             </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface/50 overflow-hidden">
             <button 
               onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
               className="p-1 hover:bg-white/5 transition-colors"
               aria-label="Zoom out"
             >
               <span className="material-symbols-rounded text-[18px]">remove</span>
             </button>
             <span className="min-w-[3rem] text-center text-xs font-mono">
               {Math.round(scale * 100)}%
             </span>
             <button 
               onClick={() => setScale(s => Math.min(2.5, s + 0.25))}
               className="p-1 hover:bg-white/5 transition-colors"
               aria-label="Zoom in"
             >
               <span className="material-symbols-rounded text-[18px]">add</span>
             </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={url}
            download
            className="btn btn-outline text-xs py-1.5 px-3"
          >
            <span className="material-symbols-rounded text-[16px]">download</span>
            <span className="hidden sm:inline">Download</span>
          </a>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-ink hover:border-brand-300 transition-colors"
            aria-label="Close viewer"
          >
            <span className="material-symbols-rounded text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 overflow-auto bg-zinc-950/80 p-4 md:p-8">
        <div className="mx-auto flex min-h-full w-fit flex-col items-center justify-center">
           <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="text-white/50 text-sm animate-pulse flex flex-col items-center gap-4"><span className="material-symbols-rounded animate-spin text-3xl">refresh</span> Loading Document...</div>}
              error={<div className="text-red-400 text-sm p-4 bg-red-400/10 rounded-lg border border-red-400/20">Failed to load PDF. The file may be missing or invalid.</div>}
           >
              {numPages ? (
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-2xl shadow-black/50 bg-white"
                />
              ) : null}
           </Document>
        </div>
      </div>

      {/* Mobile controls (absolute at bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 p-2 backdrop-blur-md shadow-xl text-ink">
         <button 
           onClick={() => setPageNumber(p => Math.max(1, p - 1))}
           disabled={pageNumber <= 1}
           className="p-2 hover:bg-white/10 disabled:opacity-50 rounded-full transition-colors flex items-center justify-center"
         >
           <span className="material-symbols-rounded text-[20px]">chevron_left</span>
         </button>
         <span className="min-w-[4rem] text-center text-xs font-mono font-medium">
           {pageNumber} / {numPages || '-'}
         </span>
         <button 
           onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
           disabled={pageNumber >= (numPages || 1)}
           className="p-2 hover:bg-white/10 disabled:opacity-50 rounded-full transition-colors flex items-center justify-center"
         >
           <span className="material-symbols-rounded text-[20px]">chevron_right</span>
         </button>
      </div>
    </div>
  );
}
