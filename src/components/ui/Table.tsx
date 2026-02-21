import type { ReactNode, MouseEvent } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="border-b border-slate-700 bg-slate-800/50">
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-slate-800">{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      className={`${onClick ? 'cursor-pointer hover:bg-slate-800/50' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ${className}`}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  onClick?: (e: MouseEvent<HTMLTableDataCellElement>) => void;
}

export function TableCell({ children, className = '', colSpan, onClick }: TableCellProps) {
  return (
    <td
      className={`px-4 py-3 text-sm text-slate-300 ${className}`}
      colSpan={colSpan}
      onClick={onClick}
    >
      {children}
    </td>
  );
}

// Empty state component for tables
interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
}

export function TableEmptyState({ message = 'No data available', icon }: EmptyStateProps) {
  return (
    <TableRow>
      <TableCell className="py-12 text-center" colSpan={100}>
        <div className="flex flex-col items-center gap-3">
          {icon && <div className="text-slate-600">{icon}</div>}
          <p className="text-slate-500">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
