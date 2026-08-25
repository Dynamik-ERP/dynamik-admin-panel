'use client';

import cn from 'clsx';
import type { ComponentProps } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-[#FF6B00] text-[#0B0C0E] border border-[#FF6B00]/20 hover:bg-[#E05E00] focus:ring-[#FF6B00]',
    secondary: 'bg-[#252833] text-white border border-[#2B3143] hover:bg-[#30343D] focus:ring-[#FF6B00]',
    outline: 'bg-transparent text-white border border-[#2B3143] hover:bg-[#161922] focus:ring-[#FF6B00]',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-[#161922] focus:ring-[#FF6B00]',
    success: 'bg-[#10B981] text-white border border-[#10B981]/20 hover:bg-[#059669] focus:ring-[#10B981]',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 focus:ring-red-500',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}