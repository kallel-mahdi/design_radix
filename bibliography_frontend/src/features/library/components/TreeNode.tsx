import React from 'react';
import { ChevronRightIcon, FolderIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';
import type { Collection } from '@/common/types';

interface TreeNodeProps {
  collection: Collection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onContextMenu?: (collection: Collection, e: React.MouseEvent) => void;
  isActive: boolean;
  hasChildren: boolean;
  depth: number;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  collection,
  isExpanded,
  onToggleExpand,
  onSelect,
  onContextMenu,
  isActive,
  hasChildren,
  depth,
}) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(collection, e);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 group',
        isActive ? 'bg-app-accent/20' : 'hover:bg-app-surface-hover'
      )}
      style={{ paddingLeft: `${16 + depth * 16}px` }}
      onContextMenu={handleContextMenu}
    >
      {/* Chevron/Expand Icon */}
      <button
        data-testid="expand-collection"
        onClick={onToggleExpand}
        className={cn(
          'flex-shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-200 opacity-50 hover:opacity-100',
          !hasChildren && 'invisible'
        )}
      >
        <ChevronRightIcon
          className={cn('w-4 h-4', isExpanded && 'rotate-90')}
        />
      </button>

      {/* Collection Icon & Color Dot */}
      <div className="flex-shrink-0 w-5 h-5 relative flex items-center justify-center">
        <FolderIcon className="w-5 h-5 text-app-text-secondary" />
        {collection.color && (
          <div
            data-testid="color-indicator"
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-app-bg"
            style={{ backgroundColor: collection.color }}
          />
        )}
      </div>

      {/* Collection Name */}
      <button
        onClick={onSelect}
        className={cn(
          'flex-1 text-left font-medium truncate transition-colors duration-150',
          isActive ? 'text-app-text-primary' : 'text-app-text-secondary group-hover:text-app-text-primary'
        )}
      >
        {collection.name}
      </button>

      {/* Item Count Badge (placeholder - would come from reference count) */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <span
          data-testid="collection-count"
          className="text-xs px-2 py-0.5 rounded-full bg-app-surface text-app-text-secondary"
        >
          0
        </span>
      </div>
    </div>
  );
};
