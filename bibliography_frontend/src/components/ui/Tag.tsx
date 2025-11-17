import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

const tagVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full",
  {
    variants: {
      hasColor: {
        true: "text-white",
        false: "bg-gray-700 text-app-text-secondary"
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2 py-1 text-sm"
      }
    },
    defaultVariants: {
      hasColor: false,
      size: "sm"
    }
  }
);

interface TagProps extends VariantProps<typeof tagVariants> {
  label: string;
  color?: string | null;
  onRemove?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ label, color, size, onRemove, className }) => {
  const style = color ? { backgroundColor: color } : undefined;

  return (
    <span
      className={cn(tagVariants({ hasColor: !!color, size }), className)}
      style={style}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove tag ${label}`}
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
