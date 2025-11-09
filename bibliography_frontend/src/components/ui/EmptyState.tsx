import { cn } from '@/common/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {Icon && <Icon className="w-16 h-16 text-gray-600 mb-4" />}
      <h3 className="text-lg font-medium text-text-secondary mb-2">{title}</h3>
      {description && <p className="text-sm text-text-muted mb-4 max-w-sm">{description}</p>}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
