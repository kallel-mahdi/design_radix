import { cva } from 'class-variance-authority';
import { cn } from '../../common/utils';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  TagIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

const activityBarItemVariants = cva(
  'w-16 h-16 flex items-center justify-center relative transition-colors',
  {
    variants: {
      active: {
        true: 'bg-app-accent/10 border-l-2 border-app-accent text-app-accent cursor-pointer',
        false: 'text-app-text-muted hover:text-app-text-secondary hover:bg-app-surface-hover cursor-pointer',
      },
      disabled: {
        true: 'text-app-text-muted/50 cursor-not-allowed',
        false: '',
      },
    },
  }
);

interface ActivityBarProps {
  activeView: 'library' | 'search' | 'projects' | 'duplicates' | 'tags' | 'sharing' | 'trash';
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
      disabled: true,
      tooltip: 'Coming in Phase 1',
    },
    { id: 'tags' as const, icon: TagIcon, label: 'Tags' },
    { id: 'sharing' as const, icon: ShareIcon, label: 'Sharing' },
  ];

  return (
    <nav
      className={cn('w-16 bg-app-bg border-r border-app-border flex flex-col', className)}
      aria-label="Main Navigation"
    >
      {items.map((item) => (
        <div key={item.id} className="group relative">
          <button
            onClick={() => !item.disabled && onViewChange(item.id)}
            className={activityBarItemVariants({
              active: activeView === item.id && !item.disabled,
              disabled: item.disabled,
            })}
            aria-label={`View ${item.label}`}
            aria-current={activeView === item.id ? 'page' : undefined}
            disabled={item.disabled}
            title={item.tooltip}
          >
            <item.icon className="w-6 h-6" />
            {item.badge && item.badge > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
          {item.tooltip && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-app-surface text-app-text text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
              {item.tooltip}
            </div>
          )}
        </div>
      ))}
      <div className="flex-1" /> {/* Spacer */}
      <button
        onClick={() => onViewChange('trash')}
        className={activityBarItemVariants({ active: activeView === 'trash' })}
        aria-label="View Trash"
        aria-current={activeView === 'trash' ? 'page' : undefined}
      >
        <TrashIcon className={cn('w-6 h-6', trashNotEmpty && 'text-red-400')} />
      </button>
    </nav>
  );
};
