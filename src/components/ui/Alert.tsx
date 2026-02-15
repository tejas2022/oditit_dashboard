import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-900/20 border-blue-700',
      icon: <Info className="h-5 w-5 text-blue-400" />,
      title: 'text-blue-300',
      text: 'text-blue-200',
    },
    success: {
      container: 'bg-green-900/20 border-green-700',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      title: 'text-green-300',
      text: 'text-green-200',
    },
    warning: {
      container: 'bg-yellow-900/20 border-yellow-700',
      icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
      title: 'text-yellow-300',
      text: 'text-yellow-200',
    },
    danger: {
      container: 'bg-red-900/20 border-red-700',
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      title: 'text-red-300',
      text: 'text-red-200',
    },
  };

  const config = variants[variant];

  return (
    <div className={`rounded-lg border p-4 ${config.container} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          {title && <h4 className={`mb-1 font-semibold ${config.title}`}>{title}</h4>}
          <div className={`text-sm ${config.text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded p-0.5 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
