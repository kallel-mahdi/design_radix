import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-black hover:bg-accent-hover shadow-md hover:shadow-lg focus-visible:ring-offset-bg-dark',
        secondary:
          'bg-bg-surface text-text-primary hover:bg-bg-hover border border-border shadow-md hover:shadow-lg focus-visible:ring-offset-bg-dark',
        outline:
          'border-2 border-accent text-accent hover:bg-accent/10 focus-visible:ring-offset-bg-dark',
        ghost: 'text-text-secondary hover:bg-bg-hover focus-visible:ring-offset-bg-dark',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg focus-visible:ring-red-500 focus-visible:ring-offset-bg-dark',
      },
      size: {
        sm: 'h-9 px-3 py-1.5 text-sm',
        default: 'h-11 px-6 py-2.5',
        lg: 'h-13 px-8 py-3 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
