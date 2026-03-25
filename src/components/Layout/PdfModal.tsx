import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { lockBodyScrollKeepScrollbar } from "../../utils/modalScrollLock";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfModalProps {
  isOpen: boolean;
  title: string;
  fileUrl: string;
  onClose: () => void;
}

const pdfObjectUrlCache = new Map<string, string>();
const pdfPreloadPromises = new Map<string, Promise<string>>();

const preloadPdf = async (url: string): Promise<string> => {
  const cached = pdfObjectUrlCache.get(url);
  if (cached) {
    return cached;
  }

  const pending = pdfPreloadPromises.get(url);
  if (pending) {
    return pending;
  }

  const preloadPromise = (async () => {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`Nie mozna pobrac pliku PDF: ${url}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    pdfObjectUrlCache.set(url, objectUrl);
    return objectUrl;
  })();

  pdfPreloadPromises.set(url, preloadPromise);

  try {
    return await preloadPromise;
  } finally {
    pdfPreloadPromises.delete(url);
  }
};

export const preloadPdfFiles = (urls: string[]) => {
  urls.forEach((url) => {
    void preloadPdf(url).catch(() => {
      // Ignore preload failures and fallback to direct file URL during render.
    });
  });
};

const PdfModal = ({ isOpen, title, fileUrl, onClose }: PdfModalProps) => {
  const animationMs = 220;
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [resolvedFileUrl, setResolvedFileUrl] = useState(fileUrl);
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const frame = window.requestAnimationFrame(() => setIsVisible(true));

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => setIsMounted(false), animationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  useEffect(() => {
    let isCancelled = false;
    setIsDocumentLoading(true);
    setNumPages(null);

    const cached = pdfObjectUrlCache.get(fileUrl);
    if (cached) {
      setResolvedFileUrl(cached);
      return () => {
        isCancelled = true;
      };
    }

    setResolvedFileUrl(fileUrl);

    void preloadPdf(fileUrl)
      .then((objectUrl) => {
        if (!isCancelled) {
          setResolvedFileUrl(objectUrl);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setResolvedFileUrl(fileUrl);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const releaseScrollLock = lockBodyScrollKeepScrollbar();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      releaseScrollLock();
    };
  }, [isMounted, onClose]);

  useEffect(() => {
    if (!isMounted || !containerRef.current) {
      return;
    }

    const updateWidth = () => {
      if (!containerRef.current) {
        return;
      }

      setContainerWidth(containerRef.current.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isMounted]);

  const pageWidth = useMemo(() => {
    if (!containerWidth) {
      return undefined;
    }

    return Math.max(280, Math.min(containerWidth - 24, 1100));
  }, [containerWidth]);

  const pages = numPages ? Array.from({ length: numPages }, (_, index) => index + 1) : [];
  const activeFileUrl = resolvedFileUrl || fileUrl;

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.src = activeFileUrl;

    iframe.onload = () => {
      const printWindow = iframe.contentWindow;
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }

      setTimeout(() => {
        iframe.remove();
      }, 1000);
    };

    document.body.appendChild(iframe);
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] bg-black/80 p-4 overflow-hidden transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClose();
        }
      }}
      role="button"
      tabIndex={-1}
    >
      <div
        className={`w-full max-w-6xl bg-white border-4 border-black shadow-[10px_10px_0px_#dc2626] max-h-[92vh] flex flex-col mx-auto my-2 transition-all duration-200 ease-out ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-[0.98]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-red-600 bg-white px-4 py-4 md:px-6">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">{title}</h3>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 border-2 border-black bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-gray-200"
            >
              Drukuj
            </button>
            <a
              href={fileUrl}
              download
              className="px-4 py-2 border-2 border-black bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-gray-200"
            >
              Pobierz
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black bg-red-600 text-white font-black uppercase text-xs tracking-widest hover:bg-red-500"
            >
              Zamknij
            </button>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 min-h-0 bg-gray-200 p-2 md:p-3 overflow-auto">
          <div className="w-full border-2 border-black bg-white p-3 md:p-4">
            <div className="flex flex-col items-center gap-4">
              <Document
                file={activeFileUrl}
                onLoadSuccess={({ numPages: loadedPages }) => {
                  setNumPages(loadedPages);
                  setIsDocumentLoading(false);
                }}
                onLoadError={() => {
                  setIsDocumentLoading(false);
                }}
                loading={
                  <div className="w-full min-h-[62vh] flex flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="font-black uppercase text-xs tracking-widest text-black">Ladowanie PDF...</p>
                  </div>
                }
                error={
                  <div className="text-center space-y-3">
                    <p className="font-black uppercase text-sm tracking-widest text-black">Nie mozna zaladowac pliku PDF.</p>
                    <a
                      href={activeFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 border-2 border-black bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-gray-800"
                    >
                      Otworz PDF w nowej karcie
                    </a>
                  </div>
                }
              >
                <div className={`flex flex-col items-center gap-4 w-full ${isDocumentLoading ? "min-h-[62vh]" : ""}`}>
                  {pages.map((page) => (
                    <Page
                      key={`${fileUrl}-page-${page}`}
                      pageNumber={page}
                      width={pageWidth}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  ))}
                </div>
              </Document>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PdfModal;