'use client';

import cn from 'clsx';
import type { ComponentProps } from 'react';

interface DataTableProps extends ComponentProps<'table'> {
  headers: string[];
  children: React.ReactNode;
}

export function DataTable({ headers, children, className, ...props }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-left', className)} {...props}>
        <thead>
          <tr className="border-b border-[#1F2330]">
            {headers.map((header, index) => (
              <th
                key={index}
                className="p-3 text-[#FF6B00] font-semibold font-mono text-xs"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}