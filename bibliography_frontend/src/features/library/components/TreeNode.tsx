import React, { useState } from 'react';
import { ChevronRightIcon, FolderIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';
import type { Collection } from '@/common/types';

interface TreeNodeProps {
  collection: Collection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onContextMenu?: (collection: Collection, e: React.MouseEvent) => void;
  onDrop?: (collectionId: string, referenceId: string, referenceTitle: string) => void;
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
  onDrop,
  isActive,
  hasChildren,
  depth,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(collection, e);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const referenceId = e.dataTransfer.getData('referenceId');
    const referenceTitle = e.dataTransfer.getData('referenceTitle');
    if (referenceId && onDrop) {
      onDrop(collection._id, referenceId, referenceTitle);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 group',
        isActive
          ? 'bg-app-accent/20 border-l-4 border-app-accent'
          : 'hover:bg-app-surface-hover border-l-4 border-transparent',
        isDragOver && 'bg-app-accent/30 ring-2 ring-app-accent'
      )}
      style={{ paddingLeft: `${16 + depth * 16}px` }}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
