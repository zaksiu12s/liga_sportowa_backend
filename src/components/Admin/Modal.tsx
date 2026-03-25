import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { lockBodyScrollKeepScrollbar } from "../../utils/modalScrollLock";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  footer,
}: ModalProps) => {
  const animationMs = 220;
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

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

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${isVisible ? "opacity-50" : "opacity-0"}`}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className={`relative bg-white border-2 border-black w-full max-w-4xl max-h-[80vh] overflow-y-auto transition-all duration-200 ease-out ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-[0.98]"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b-2 border-black bg-white">
          <h3 className="text-lg font-black uppercase tracking-widest text-black">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-black font-black hover:bg-black hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex gap-2 p-6 border-t-2 border-black bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
