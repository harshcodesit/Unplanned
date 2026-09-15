import {
  createContext,
  useCallback,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react";
import ToastContainer from "../components/toast/ToastContainer";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // In milliseconds, default 4000ms
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  createdAt: number;
}

export interface ToastContextType {
  toasts: ToastItem[];
  show: (options: ToastOptions | string) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  remove: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback(
    (options: ToastOptions | string): string => {
      const id = "toast-" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const parsedOptions: ToastOptions =
        typeof options === "string" ? { message: options } : options;

      const duration = parsedOptions.duration ?? 4500;
      const newToast: ToastItem = {
        id,
        type: parsedOptions.type || "info",
        title: parsedOptions.title,
        message: parsedOptions.message,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep at most 5 toasts stacked

      if (duration > 0) {
        setTimeout(() => {
          remove(id);
        }, duration);
      }

      return id;
    },
    [remove]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) =>
      show({ type: "success", title, message, duration }),
    [show]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) =>
      show({ type: "error", title, message, duration: duration ?? 5500 }),
    [show]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) =>
      show({ type: "warning", title, message, duration }),
    [show]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) =>
      show({ type: "info", title, message, duration }),
    [show]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        show,
        success,
        error,
        warning,
        info,
        remove,
        clearAll,
      }}
    >
      {children}
      {/* Global Toast Container persists above all routes and survives navigation */}
      <ToastContainer toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
};

// Custom Hook to consume Toast API anywhere in the app
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
