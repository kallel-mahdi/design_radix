import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';
import { useTagsQuery } from '../api/tags.queries';
import { useCreateTagMutation } from '../api/tags.mutations';
import type { Tag } from '@/common/types';

interface TagPickerProps {
  assignedTags: string[];
  onAddTag: (tagName: string) => void;
  className?: string;
}

/**
 * Dropdown component for adding tags to a reference.
 * - Shows available tags (filtered by search and already-assigned)
 * - Allows creating new tags via Enter key
 * - Used in DetailsPane to add tags to references
 */
export const TagPicker: React.FC<TagPickerProps> = ({
  assignedTags,
  onAddTag,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Queries & Mutations
  const { data: allTags = [] } = useTagsQuery();
  const createTagMutation = useCreateTagMutation();

  // Filter tags: exclude already-assigned and apply search filter
  const availableTags = allTags.filter(
    (tag) =>
      !assignedTags.includes(tag.name) &&
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query matches an existing tag exactly
  const exactMatch = allTags.find(
    (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase().trim()
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle selecting an existing tag
  const handleSelectTag = (tag: Tag) => {
    onAddTag(tag.name);
    setSearchQuery('');
    setIsOpen(false);
  };

  // Handle Enter key: create new tag or select existing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();

      if (exactMatch) {
        // Tag exists - add it
        if (!assignedTags.includes(exactMatch.name)) {
          onAddTag(exactMatch.name);
        }
      } else {
        // Create new tag first, then add it
        createTagMutation.mutate(
          { name: searchQuery.trim() },
          {
            onSuccess: (newTag) => {
              onAddTag(newTag.name);
            },
          }
        );
      }

      setSearchQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Add Tag Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-app-accent hover:text-app-accent-hover transition-colors"
        aria-label="Add Tag"
        aria-expanded={isOpen}
      >
        <PlusIcon className="w-4 h-4" />
        Add Tag
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-app-surface border border-app-border rounded-lg shadow-lg z-50">
          {/* Search Input */}
          <div className="p-2 border-b border-app-border">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-tertiary" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or create tag..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-app-bg border border-app-border rounded text-app-text-primary placeholder:text-app-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent"
              />
            </div>
            {searchQuery.trim() && !exactMatch && (
              <p className="text-xs text-app-text-muted mt-1 px-1">
                Press Enter to create "{searchQuery.trim()}"
              </p>
            )}
          </div>

          {/* Tag List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {availableTags.length > 0 ? (
              availableTags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => handleSelectTag(tag)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-app-text-primary hover:bg-app-surface-hover transition-colors text-left"
                >
                  {tag.color && (
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  <span className="truncate">{tag.name}</span>
                  <span className="ml-auto text-xs text-app-text-muted">
                    {tag.usageCount}
                  </span>
                </button>
              ))
            ) : searchQuery.trim() ? (
              <p className="px-3 py-2 text-sm text-app-text-muted">
                No matching tags
              </p>
            ) : (
              <p className="px-3 py-2 text-sm text-app-text-muted">
                {assignedTags.length === allTags.length
                  ? 'All tags assigned'
                  : 'No tags yet'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
