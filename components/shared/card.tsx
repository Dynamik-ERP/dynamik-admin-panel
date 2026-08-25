import cn from 'clsx';
import type { ComponentProps } from 'react';

interface CardProps extends ComponentProps<'div'> {
  variant?: 'default' | 'bordered' | 'elevated';
}

export function Card({ variant = 'default', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg',
        {
          'bg-white': variant === 'default',
          'bg-white border border-gray-200': variant === 'bordered',
          'bg-white shadow-md': variant === 'elevated',
        },
        className,
      )}
      {...props}
    />
  );
}