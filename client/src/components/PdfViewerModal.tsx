import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { useLenis } from "lenis/react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const lenis = useLenis();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  const [showThumbnails, setShowThumbnails] = useState(false);

  // Drag to pan state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

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

  // Trackpad pinch-to-zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setScale(s => Math.min(Math.max(0.5, s + delta), 4.0));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // Panning handlers
  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5; // Scroll speed multiplier
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="CV Viewer"
      data-lenis-prevent="true"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-950 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-white">
            <span className="material-symbols-rounded text-brand-500">description</span>
            Document Viewer
          </span>
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
              showThumbnails ? "bg-brand-500/20 text-brand-300" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
            title="Toggle Thumbnails"
          >
            <span className="material-symbols-rounded text-[18px]">grid_view</span>
          </button>
        </div>
        
        {/* Pagination & Zoom Controls */}
        <div className="hidden md:flex items-center gap-4 text-sm text-zinc-300">
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
             <button 
               onClick={() => setPageNumber(p => Math.max(1, p - 1))}
               disabled={pageNumber <= 1}
               className="p-1.5 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
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
               className="p-1.5 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
               aria-label="Next page"
             >
               <span className="material-symbols-rounded text-[18px]">chevron_right</span>
             </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
             <button 
               onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
               className="p-1.5 hover:bg-zinc-800 transition-colors"
               aria-label="Zoom out"
             >
               <span className="material-symbols-rounded text-[18px]">remove</span>
             </button>
             <span className="min-w-[3.5rem] text-center text-xs font-mono">
               {Math.round(scale * 100)}%
             </span>
             <button 
               onClick={() => setScale(s => Math.min(3.0, s + 0.25))}
               className="p-1.5 hover:bg-zinc-800 transition-colors"
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
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-white hover:bg-zinc-700 transition-colors"
          >
            <span className="material-symbols-rounded text-[16px]">download</span>
            <span className="hidden sm:inline">Download</span>
          </a>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors bg-zinc-900"
            aria-label="Close viewer"
          >
            <span className="material-symbols-rounded text-[20px]">close</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" data-lenis-prevent="true">
        {/* Thumbnails Sidebar */}
        {showThumbnails && numPages && (
          <div className="w-48 flex-shrink-0 overflow-y-auto overscroll-contain border-r border-white/10 bg-zinc-950 p-4 custom-scrollbar" data-lenis-prevent="true">
            <Document file={url} className="flex flex-col gap-4">
              {Array.from(new Array(numPages), (el, index) => (
                <button
                  key={`page_${index + 1}`}
                  onClick={() => setPageNumber(index + 1)}
                  className={`relative w-full overflow-hidden rounded-md border-2 transition-all ${
                    pageNumber === index + 1 ? "border-brand-500 ring-2 ring-brand-500/30" : "border-transparent hover:border-zinc-700"
                  }`}
                >
                  <Page
                    pageNumber={index + 1}
                    width={150}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="bg-white pointer-events-none"
                  />
                  <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                    {index + 1}
                  </div>
                </button>
              ))}
            </Document>
          </div>
        )}

        {/* PDF Viewport */}
        <div 
          ref={containerRef}
          data-lenis-prevent="true"
          className={`flex-1 overflow-auto overscroll-contain bg-zinc-900 p-4 md:p-8 ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
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
      </div>

      {/* Mobile controls (absolute at bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 p-2 backdrop-blur-md shadow-xl text-white">
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

  // Mount modal directly to the document body so it escapes the Lenis smooth-scroll wrapper
  return createPortal(modalContent, document.body);
}
