import type { FC } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { ToastItem } from "../../context/ToastContext";
import "./ToastContainer.css";

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const getToastIcon = (type: ToastItem["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle2 size={19} strokeWidth={2.2} />;
    case "error":
      return <AlertCircle size={19} strokeWidth={2.2} />;
    case "warning":
      return <AlertTriangle size={19} strokeWidth={2.2} />;
    case "info":
    default:
      return <Info size={19} strokeWidth={2.2} />;
  }
};

const ToastContainer: FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <aside
      className="toast-container"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const duration = toast.duration ?? 4500;
        return (
          <div
            key={toast.id}
            className={`toast-item ${toast.type}`}
            role={toast.type === "error" ? "alert" : "status"}
          >

            <div className="toast-icon-box" aria-hidden="true">
              {getToastIcon(toast.type)}
            </div>

            <div className="toast-content">
              {toast.title && <h4 className="toast-title">{toast.title}</h4>}
              <p className="toast-message">{toast.message}</p>
            </div>

            <button
              type="button"
              className="toast-dismiss-btn"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>

            {duration > 0 && (
              <div
                className="toast-progress"
                style={{ animationDuration: `${duration}ms` }}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default ToastContainer;
