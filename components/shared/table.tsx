import cn from 'clsx';
import type { ComponentProps } from 'react';

interface TableProps extends ComponentProps<'table'> {}

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200', className)} {...props} />
    </div>
  );
}

interface TableHeadProps extends ComponentProps<'thead'> {}

export function TableHead({ className, ...props }: TableHeadProps) {
  return <thead className={cn('bg-gray-50', className)} {...props} />;
}

interface TableBodyProps extends ComponentProps<'tbody'> {}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cn('divide-y divide-gray-200 bg-white', className)} {...props} />;
}

interface TableRowProps extends ComponentProps<'tr'> {}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={cn('hover:bg-gray-50', className)} {...props} />;
}

interface TableHeaderProps extends ComponentProps<'th'> {}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className,
      )}
      {...props}
    />
  );
}

interface TableCellProps extends ComponentProps<'td'> {}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)} {...props} />
  );
}