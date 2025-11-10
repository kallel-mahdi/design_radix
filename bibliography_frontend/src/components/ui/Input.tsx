import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border px-4 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-app-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-app-accent disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-app-border bg-app-bg text-app-text-primary focus-visible:border-app-accent',
        error:
          'border-red-500 bg-app-bg text-app-text-primary focus-visible:ring-red-500 focus-visible:border-red-500',
        success:
          'border-green-500 bg-app-bg text-app-text-primary focus-visible:ring-green-500 focus-visible:border-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(inputVariants({ variant, className }))}
      type={type}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
