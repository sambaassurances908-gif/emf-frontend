import { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children: ReactNode;
  className?: string;
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableDataCellElement> {
  children: ReactNode;
  className?: string;
}

export const Table = ({ children, className }: TableProps) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className={cn('min-w-full divide-y divide-gray-100', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className }: TableProps) => {
  return (
    <thead className={cn('bg-gray-50/50', className)}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className }: TableProps) => {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-100', className)}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className, ...props }: TableRowProps) => {
  return (
    <tr className={cn('hover:bg-gray-50/50 transition-colors', className)} {...props}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className, ...props }: TableHeadProps) => {
  return (
    <th
      className={cn(
        'px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ children, className, ...props }: TableCellProps) => {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-700', className)} {...props}>
      {children}
    </td>
  );
};
