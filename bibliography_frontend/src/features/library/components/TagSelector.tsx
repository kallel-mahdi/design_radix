import React, { useState, useMemo } from 'react';
import { TagItem } from './TagItem';
import { TagColorPickerModal } from './TagColorPickerModal';
import { useLibraryStore } from '../store/library.store';
import { ChevronDownIcon, PencilIcon, TrashIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/Input';
import { ContextMenu, type ContextMenuItem } from '@/components/ui/ContextMenu';
import { PromptDialog } from '@/components/ui/PromptDialog';
import { cn } from '@/common/utils';
import type { Tag } from '@/common/types';
import {
  useCreateTagMutation,
  useRenameTagMutation,
  useDeleteTagMutation,
  useSetTagColorMutation,
} from '../api/tags.mutations';

interface TagSelectorProps {
  tags: Tag[];
  isLoading?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toggleTag, activeTags } = useLibraryStore();

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    tag: Tag | null;
  }>({ isOpen: false, position: { x: 0, y: 0 }, tag: null });

  // Dialog states
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; tag: Tag | null }>({
    isOpen: false,
    tag: null,
  });
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedTagForColor, setSelectedTagForColor] = useState<Tag | null>(null);

  // Mutations
  const createTagMutation = useCreateTagMutation();
  const renameTagMutation = useRenameTagMutation();
  const deleteTagMutation = useDeleteTagMutation();
  const setTagColorMutation = useSetTagColorMutation();

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;

    const query = searchQuery.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  // Sort by usage count descending, then by name
  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filteredTags]);

  // Context menu handler
  const handleContextMenu = (tagName: string, e: React.MouseEvent) => {
    const tag = tags.find((t) => t.name === tagName);
    if (tag) {
      setContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        tag,
      });
    }
  };

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, tag: null });
  };

  // Context menu actions
  const handleRename = () => {
    setRenameDialog({ isOpen: true, tag: contextMenu.tag });
    closeContextMenu();
  };

  const handleDelete = () => {
    if (contextMenu.tag) {
      deleteTagMutation.mutate(contextMenu.tag._id);
    }
    closeContextMenu();
  };

  const handleAssignColor = () => {
    setSelectedTagForColor(contextMenu.tag);
    setColorPickerOpen(true);
    closeContextMenu();
  };

  // Create tag via Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Check if tag already exists
      const exists = tags.some((t) => t.name.toLowerCase() === searchQuery.trim().toLowerCase());
      if (!exists) {
        createTagMutation.mutate({ name: searchQuery.trim() });
      }
      setSearchQuery('');
    }
  };

  // Context menu items
  const contextMenuItems: ContextMenuItem[] = [
    {
      label: 'Rename',
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: handleRename,
    },
    {
      label: 'Assign Color',
      icon: <SwatchIcon className="w-4 h-4" />,
      onClick: handleAssignColor,
    },
    {
      label: 'Delete',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  if (isCollapsed) {
    return (
      <div className="p-4 border-t border-app-border">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-sm font-semibold text-app-text-primary hover:text-app-accent transition-colors"
        >
          <ChevronDownIcon className="w-4 h-4 rotate-90" />
          Tags
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-app-border flex flex-col h-full overflow-hidden">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-app-text-primary">Tags</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-app-text-secondary hover:text-app-text-primary transition-colors"
          aria-label="Collapse tags"
        >
          <ChevronDownIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Search box - Enter to create new tag */}
      <Input
        placeholder="Search tags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-3 text-sm"
      />

      {/* Active tag filters */}
      {activeTags.length > 0 && (
        <div className="mb-3 pb-3 border-b border-app-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-app-text-secondary">Active Filters</p>
            {activeTags.length > 1 && (
              <button
                onClick={() => activeTags.forEach(toggleTag)}
                className="text-xs text-app-accent hover:text-app-accent-hover transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {activeTags.map((tagName) => (
              <button
                key={tagName}
                onClick={() => toggleTag(tagName)}
                className="text-xs px-2 py-1 rounded-full bg-app-accent/20 text-app-accent hover:bg-app-accent/30 transition-colors"
              >
                {tagName} ✕
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag list */}
      <div className={cn('flex-1 overflow-y-auto space-y-1', isLoading && 'opacity-50')}>
        {sortedTags.length === 0 ? (
          <div className="flex items-center justify-center h-full text-app-text-tertiary text-sm">
            {searchQuery ? 'No tags match your search' : 'No tags yet'}
          </div>
        ) : (
          sortedTags.map((tag) => (
            <div key={tag._id} className="group/tag-item">
              <TagItem
                tag={tag}
                isActive={activeTags.includes(tag.name)}
                onSelect={() => toggleTag(tag.name)}
                onContextMenu={handleContextMenu}
              />
            </div>
          ))
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        items={contextMenuItems}
      />

      {/* Rename Dialog */}
      <PromptDialog
        isOpen={renameDialog.isOpen}
        onClose={() => setRenameDialog({ isOpen: false, tag: null })}
        onConfirm={(newName) => {
          if (renameDialog.tag) {
            renameTagMutation.mutate({ oldName: renameDialog.tag.name, newName });
          }
          setRenameDialog({ isOpen: false, tag: null });
        }}
        title="Rename Tag"
        description={`Enter a new name for "${renameDialog.tag?.name}"`}
        placeholder="Tag name"
        initialValue={renameDialog.tag?.name || ''}
        confirmLabel="Rename"
        isLoading={renameTagMutation.isPending}
      />

      {/* Color Picker Modal */}
      <TagColorPickerModal
        isOpen={colorPickerOpen}
        onClose={() => {
          setColorPickerOpen(false);
          setSelectedTagForColor(null);
        }}
        tag={selectedTagForColor}
        allTags={tags}
        onColorAndPositionSelect={(color, position) => {
          if (selectedTagForColor) {
            setTagColorMutation.mutate({
              name: selectedTagForColor.name,
              color,
              position,
            });
          }
        }}
        isLoading={setTagColorMutation.isPending}
      />
    </div>
  );
};
