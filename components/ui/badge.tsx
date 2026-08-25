'use client';

import cn from 'clsx';
import type { ComponentProps } from 'react';

interface BadgeProps extends ComponentProps<'span'> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#374151] text-white',
    success: 'bg-[#10B981] text-white',
    warning: 'bg-[#F59E0B] text-white',
    error: 'bg-[#EF4444] text-white',
    info: 'bg-[#3B82F6] text-white',
  };

  return (
    <span
      className={cn(
        'px-2 py-1 rounded text-xs font-medium uppercase',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}