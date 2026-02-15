import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-700 text-slate-200',
    success: 'bg-green-900/40 text-green-400 border border-green-700',
    warning: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700',
    danger: 'bg-red-900/40 text-red-400 border border-red-700',
    info: 'bg-blue-900/40 text-blue-400 border border-blue-700',
    purple: 'bg-purple-900/40 text-purple-400 border border-purple-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

// Status badge helpers
export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
    DRAFT: 'default',
    UPLOADED: 'info',
    SUBMITTED: 'purple',
    REVIEWED: 'warning',
    APPROVED: 'success',
    NOT_STARTED: 'default',
    IN_PROGRESS: 'warning',
    COMPLETE: 'success',
    COMPLETED: 'success',
    OPEN: 'warning',
    RESOLVED: 'success',
    CLOSED: 'default',
    ACTIVE: 'success',
    INACTIVE: 'default',
    PENDING: 'warning',
    PASS: 'success',
    FAIL: 'danger',
    INCONCLUSIVE: 'warning',
    NONE: 'default',
  };

  return <Badge variant={variants[status] || 'default'}>{status.replace(/_/g, ' ')}</Badge>;
}
