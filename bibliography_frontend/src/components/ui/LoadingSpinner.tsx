import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      accent: 'text-accent',
      primary: 'text-accent',
      white: 'text-white',
      current: 'text-current',
    },
  },
  defaultVariants: {
    size: 'default',
    color: 'accent',
  },
});

export interface LoadingSpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  text?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, color, text, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col items-center justify-center gap-2', className)}
      {...props}
    >
      <svg
        className={cn(spinnerVariants({ size, color }))}
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          fill="currentColor"
        />
      </svg>
      {text && <span className="text-sm text-app-text-secondary">{text}</span>}
    </div>
  ),
);
LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
