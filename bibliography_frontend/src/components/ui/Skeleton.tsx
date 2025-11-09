/**
 * Skeleton Loading Component
 *
 * Generic skeleton for loading states
 */

import { cn } from '@/common/utils';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface-3';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}
