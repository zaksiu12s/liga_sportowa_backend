import type { ReactNode } from "react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white border-2 border-black w-full max-w-4xl max-h-[80vh] overflow-y-auto">
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
