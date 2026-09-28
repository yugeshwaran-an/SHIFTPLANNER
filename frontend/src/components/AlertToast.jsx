import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function AlertToast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let className = 'toast-success';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          className = 'toast-error';
        } else if (toast.type === 'info') {
          Icon = Info;
          className = 'toast-info';
        }

        return (
          <div key={toast.id} className={`toast ${className}`}>
            <Icon size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div className="toast-content">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
