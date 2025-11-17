import React, { useState, useMemo } from 'react';
import { TagItem } from './TagItem';
import { useLibraryStore } from '../store/library.store';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/Input';
import { cn } from '@/common/utils';
import type { Tag } from '@/common/types';

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

      {/* Search box */}
      <Input
        placeholder="Search tags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3 text-sm"
      />

      {/* Active tag filters */}
      {activeTags.length > 0 && (
        <div className="mb-3 pb-3 border-b border-app-border">
          <p className="text-xs font-medium text-app-text-secondary mb-2">Active Filters</p>
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
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
