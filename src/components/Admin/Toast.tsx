import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import type { ToastNotification } from "../../types/admin";

interface ToastContextType {
  notifications: ToastNotification[];
  showToast: (message: string, type: "success" | "error" | "info", duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info", duration = 3000) => {
      const id = Date.now().toString();
      const notification = { id, type, message, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== id)
          );
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ notifications, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const Toast = ({ notification }: { notification: ToastNotification }) => {
  const { removeToast } = useToast();

  const bgColor = {
    success: "bg-green-100 border-green-600",
    error: "bg-red-100 border-red-600",
    info: "bg-blue-100 border-blue-600",
  }[notification.type];

  const textColor = {
    success: "text-green-900",
    error: "text-red-900",
    info: "text-blue-900",
  }[notification.type];

  return (
    <div
      className={`p-4 mb-2 border-2 ${bgColor} ${textColor} font-semibold text-sm flex justify-between items-center`}
    >
      <span>{notification.message}</span>
      <button
        onClick={() => removeToast(notification.id)}
        className="ml-4 font-black text-lg hover:opacity-50"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { notifications } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
