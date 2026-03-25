import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfModalProps {
  isOpen: boolean;
  title: string;
  fileUrl: string;
  onClose: () => void;
}

const PdfModal = ({ isOpen, title, fileUrl, onClose }: PdfModalProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) {
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
  }, [isOpen]);

  const pageWidth = useMemo(() => {
    if (!containerWidth) {
      return undefined;
    }

    return Math.max(280, Math.min(containerWidth - 24, 1100));
  }, [containerWidth]);

  const pages = numPages ? Array.from({ length: numPages }, (_, index) => index + 1) : [];

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.src = fileUrl;

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

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/80 p-4 overflow-y-auto"
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
        className="w-full max-w-6xl bg-white border-4 border-black shadow-[10px_10px_0px_#dc2626] max-h-[92vh] flex flex-col mx-auto my-2"
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
                file={fileUrl}
                onLoadSuccess={({ numPages: loadedPages }) => {
                  setNumPages(loadedPages);
                }}
                loading={<p className="font-black uppercase text-xs tracking-widest text-black">Ladowanie PDF...</p>}
                error={
                  <div className="text-center space-y-3">
                    <p className="font-black uppercase text-sm tracking-widest text-black">Nie mozna zaladowac pliku PDF.</p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 border-2 border-black bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-gray-800"
                    >
                      Otworz PDF w nowej karcie
                    </a>
                  </div>
                }
              >
                <div className="flex flex-col items-center gap-4">
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