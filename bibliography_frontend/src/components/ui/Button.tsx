import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-dark disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-accent text-black hover:bg-accent-hover",
        secondary: "bg-gray-700 text-white hover:bg-gray-600",
        ghost: "text-text-secondary hover:bg-bg-hover",
        danger: "bg-red-600 text-white hover:bg-red-700"
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  loading,
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
