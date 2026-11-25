import Icon from "./Icons";
import "./ToastContainer.css";

const ICONS = {
  success: "check-circle",
  error: "alert",
  delete: "trash",
};

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type} ${toast.leaving ? "leaving" : ""}`}
          onClick={() => onDismiss(toast.id)}
          role="status"
        >
          <span className="toast-icon">
            <Icon name={ICONS[toast.type] || ICONS.success} size={16} />
          </span>
          <span className="toast-text">{toast.message}</span>
                    <span
            className="toast-bar"
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;