import { cva } from 'class-variance-authority';
import { cn } from '../../common/utils';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const activityBarItemVariants = cva(
  'w-16 h-16 flex items-center justify-center relative transition-colors cursor-pointer',
  {
    variants: {
      active: {
        true: 'bg-accent/10 border-l-2 border-accent text-accent',
        false: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800',
      },
    },
  }
);

interface ActivityBarProps {
  activeView: 'library' | 'search' | 'projects' | 'duplicates';
  onViewChange: (view: ActivityBarProps['activeView']) => void;
  duplicatesCount?: number;
  trashNotEmpty?: boolean;
  className?: string;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
  duplicatesCount = 0,
  trashNotEmpty = false,
  className,
}) => {
  const items = [
    { id: 'library' as const, icon: BookOpenIcon, label: 'Library' },
    { id: 'search' as const, icon: MagnifyingGlassIcon, label: 'Search' },
    { id: 'projects' as const, icon: LinkIcon, label: 'Projects' },
    {
      id: 'duplicates' as const,
      icon: ExclamationTriangleIcon,
      label: 'Duplicates',
      badge: duplicatesCount,
    },
  ];

  return (
    <nav
      className={cn('w-16 bg-bg-dark border-r border-border flex flex-col', className)}
      aria-label="Main Navigation"
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={activityBarItemVariants({ active: activeView === item.id })}
          aria-label={`View ${item.label}`}
          aria-current={activeView === item.id ? 'page' : undefined}
        >
          <item.icon className="w-6 h-6" />
          {item.badge && item.badge > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </button>
      ))}
      <div className="flex-1" /> {/* Spacer */}
      <button
        className={activityBarItemVariants({ active: false })}
        aria-label="View Trash"
      >
        <TrashIcon className={cn('w-6 h-6', trashNotEmpty && 'text-red-400')} />
      </button>
    </nav>
  );
};
