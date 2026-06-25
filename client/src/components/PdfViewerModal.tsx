import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [baseWidth, setBaseWidth] = useState<number>(800);
  
  const [showThumbnails, setShowThumbnails] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const padding = window.innerWidth >= 768 ? 64 : 32;
      let availableWidth = window.innerWidth - padding;
      if (window.innerWidth >= 768 && showThumbnails) {
        availableWidth -= 192; // w-48 is 12rem = 192px
      }
      setBaseWidth(availableWidth - 20); // 20px for scrollbars
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [showThumbnails]);

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

  // Trackpad and touch pinch-to-zoom (smooth using CSS transform during gesture)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    let currentVisualScale = scale;

    // Reset transform when React scale updates externally
    if (contentRef.current) {
       contentRef.current.style.transform = `scale(1)`;
    }

    const commitScale = () => {
      setScale(currentVisualScale);
      // Let React re-render with new scale prop, and keep transform scale(1)
      if (contentRef.current) {
        contentRef.current.style.transform = 'scale(1)';
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        currentVisualScale = Math.min(Math.max(0.5, currentVisualScale + delta), 4.0);
        
        if (contentRef.current) {
          contentRef.current.style.transform = `scale(${currentVisualScale / scale})`;
        }

        if (wheelTimeout) clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(commitScale, 200);
      }
    };

    let initialDistance: number | null = null;
    let startScale = 1.0;

    const getDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
        startScale = currentVisualScale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance !== null) {
        e.preventDefault(); // Prevent browser zoom
        const currentDistance = getDistance(e.touches);
        const distanceRatio = currentDistance / initialDistance;
        currentVisualScale = Math.min(Math.max(0.5, startScale * distanceRatio), 4.0);
        
        if (contentRef.current) {
          contentRef.current.style.transform = `scale(${currentVisualScale / scale})`;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && initialDistance !== null) {
        initialDistance = null;
        commitScale();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [scale]);

  // Disable viewport zoom while modal is open
  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalContent = viewportMeta?.getAttribute("content");
    
    if (viewportMeta) {
      viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    }

    return () => {
      if (viewportMeta && originalContent) {
        viewportMeta.setAttribute("content", originalContent);
      }
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Panning handlers
  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    
    // Don't pan if the user is clicking on text (spans) or links (a)
    if (tag === 'span' || tag === 'a') {
      return;
    }

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
          <button
            onClick={() => setScale(1.0)}
            className="md:hidden flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            title="Reset Zoom"
          >
            <span className="material-symbols-rounded text-[18px]">fit_screen</span>
          </button>
        </div>
        
        {/* Zoom Controls */}
        <div className="hidden md:flex items-center gap-4 text-sm text-zinc-300">
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
             <button 
               onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
               className="p-1.5 hover:bg-zinc-800 transition-colors"
               aria-label="Zoom out"
             >
               <span className="material-symbols-rounded text-[18px]">remove</span>
             </button>
             <button
               onClick={() => setScale(1.0)}
               className="min-w-[3.5rem] text-center text-xs font-mono hover:bg-zinc-800 transition-colors py-1.5"
               aria-label="Reset zoom"
             >
               {Math.round(scale * 100)}%
             </button>
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

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden" data-lenis-prevent="true">
        {/* Thumbnails Sidebar */}
        {showThumbnails && numPages && (
          <div className="order-2 md:order-1 h-40 w-full md:h-auto md:w-48 flex-shrink-0 overflow-auto overscroll-contain border-t md:border-t-0 md:border-r border-white/10 bg-zinc-950 p-4 custom-scrollbar" data-lenis-prevent="true">
            <Document file={url} className="flex flex-row md:flex-col gap-4 h-full md:h-auto">
              {Array.from(new Array(numPages), (_, index) => (
                <button
                  key={`page_${index + 1}`}
                  onClick={() => {
                    const pageElement = document.getElementById(`pdf_page_${index + 1}`);
                    if (pageElement) {
                      pageElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="relative flex-shrink-0 h-full md:h-auto md:w-full overflow-hidden rounded-md border-2 transition-all border-transparent hover:border-zinc-700"
                >
                  <Page
                    pageNumber={index + 1}
                    height={120}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="bg-white pointer-events-none md:hidden"
                  />
                  <Page
                    pageNumber={index + 1}
                    width={150}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="bg-white pointer-events-none hidden md:block"
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
          className={`order-1 md:order-2 flex-1 overflow-auto overscroll-contain bg-zinc-900 p-4 md:p-8 ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div ref={contentRef} className="mx-auto flex min-h-full w-fit flex-col items-center justify-center origin-top">
             <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="text-white/50 text-sm animate-pulse flex flex-col items-center gap-4"><span className="material-symbols-rounded animate-spin text-3xl">refresh</span> Loading Document...</div>}
                error={<div className="text-red-400 text-sm p-4 bg-red-400/10 rounded-lg border border-red-400/20">Failed to load PDF. The file may be missing or invalid.</div>}
                className="flex flex-col gap-6 md:gap-8"
             >
                {numPages ? (
                  Array.from(new Array(numPages), (_, index) => (
                    <div key={`page_${index + 1}`} id={`pdf_page_${index + 1}`}>
                      <Page 
                        pageNumber={index + 1} 
                        scale={scale} 
                        width={baseWidth}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-2xl shadow-black/50 bg-white"
                      />
                    </div>
                  ))
                ) : null}
             </Document>
          </div>
        </div>
      </div>

    </div>
  );

  // Mount modal directly to the document body so it escapes the Lenis smooth-scroll wrapper
  return createPortal(modalContent, document.body);
}
