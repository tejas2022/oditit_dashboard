interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  label,
  className = '',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  // Auto-determine variant based on percentage if default
  let barVariant = variant;
  if (variant === 'default') {
    if (percentage >= 80) barVariant = 'success';
    else if (percentage >= 50) barVariant = 'warning';
    else barVariant = 'danger';
  }

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-400">{label || 'Progress'}</span>
          <span className="font-medium text-slate-300">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-800 ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantClasses[barVariant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Circular progress
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  let color = variantColors[variant];
  if (variant === 'default') {
    if (percentage >= 80) color = variantColors.success;
    else if (percentage >= 50) color = variantColors.warning;
    else color = variantColors.danger;
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
          <span className="text-xs text-slate-400">Complete</span>
        </div>
      )}
    </div>
  );
}
