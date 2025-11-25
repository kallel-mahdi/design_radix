import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MagnifyingGlassIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useCollectionsQuery } from '../api/collections.queries';
import type { Collection } from '@/common/types';

interface CollectionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (collectionId: string) => void;
  title?: string;
  excludeCollectionIds?: string[];
}

/**
 * Modal for selecting a collection.
 * Used when adding references to collections via context menu.
 */
export const CollectionPickerModal: React.FC<CollectionPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Add to Collection',
  excludeCollectionIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: collections = [] } = useCollectionsQuery();

  // Filter collections by search query and exclusions
  const filteredCollections = collections.filter(
    (collection) =>
      !excludeCollectionIds.includes(collection._id) &&
      collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group collections by parent (for hierarchy display)
  const rootCollections = filteredCollections.filter((c) => !c.parentId);
  const childrenByParent = new Map<string, Collection[]>();

  filteredCollections.forEach((collection) => {
    if (collection.parentId) {
      const children = childrenByParent.get(collection.parentId) || [];
      children.push(collection);
      childrenByParent.set(collection.parentId, children);
    }
  });

  const handleSelect = (collectionId: string) => {
    onSelect(collectionId);
    onClose();
    setSearchQuery('');
  };

  const renderCollection = (collection: Collection, depth: number = 0) => {
    const children = childrenByParent.get(collection._id) || [];

    return (
      <div key={collection._id}>
        <button
          onClick={() => handleSelect(collection._id)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-app-text-primary hover:bg-app-surface-hover transition-colors text-left"
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <FolderIcon
            className="w-4 h-4 flex-shrink-0"
            style={{ color: collection.color || undefined }}
          />
          <span className="truncate">{collection.name}</span>
        </button>
        {children.map((child) => renderCollection(child, depth + 1))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Select a collection to add the reference to"
    >
      {/* Search Input */}
      <div className="relative mb-3">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search collections..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-app-bg border border-app-border rounded-lg text-app-text-primary placeholder:text-app-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent"
          autoFocus
        />
      </div>

      {/* Collection List */}
      <div className="max-h-64 overflow-y-auto border border-app-border rounded-lg">
        {rootCollections.length > 0 ? (
          rootCollections.map((collection) => renderCollection(collection))
        ) : (
          <p className="p-4 text-sm text-app-text-muted text-center">
            {searchQuery ? 'No matching collections' : 'No collections yet'}
          </p>
        )}
      </div>
    </Modal>
  );
};
