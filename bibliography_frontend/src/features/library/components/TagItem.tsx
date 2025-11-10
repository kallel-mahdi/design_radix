import React from 'react';
import { cn } from '@/common/utils';
import type { Tag } from '@/common/types';

interface TagItemProps {
  tag: Tag;
  isActive: boolean;
  onSelect: (tagName: string) => void;
  onContextMenu?: (tagName: string, e: React.MouseEvent) => void;
}

export const TagItem: React.FC<TagItemProps> = ({
  tag,
  isActive,
  onSelect,
  onContextMenu,
}) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(tag.name, e);
  };

  return (
    <button
      onClick={() => onSelect(tag.name)}
      onContextMenu={handleContextMenu}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors duration-150 text-left group',
        isActive
          ? 'bg-app-accent/20 text-app-text-primary'
          : 'text-app-text-secondary hover:bg-app-surface-hover hover:text-app-text-primary'
      )}
    >
      {/* Color Dot */}
      {tag.color && (
        <div
          data-testid="color-indicator"
          className="flex-shrink-0 w-3 h-3 rounded-full border border-app-border"
          style={{ backgroundColor: tag.color }}
        />
      )}

      {/* Tag Name */}
      <span className="flex-1 font-medium truncate">{tag.name}</span>

      {/* Usage Count */}
      <span className={cn(
        'flex-shrink-0 text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150',
        isActive ? 'bg-app-accent/30' : 'bg-app-surface'
      )}>
        {tag.usageCount || 0}
      </span>
    </button>
  );
};
