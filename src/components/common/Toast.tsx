import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    info: <ShieldAlert className="w-5 h-5 text-blue-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    danger: <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />,
  };

  const borders = {
    info: 'border-blue-500/40 bg-slate-900/95',
    warning: 'border-amber-500/40 bg-slate-900/95',
    success: 'border-emerald-500/40 bg-slate-900/95',
    danger: 'border-red-500/40 bg-slate-900/95',
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${borders[toast.type]}`}>
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-slate-100">{toast.title}</h5>
        <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
