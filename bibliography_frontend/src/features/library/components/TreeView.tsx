import React, { useMemo } from 'react';
import { TreeNode } from './TreeNode';
import { useLibraryStore, useIsCollectionExpanded } from '../store/library.store';
import type { Collection } from '@/common/types';

interface TreeViewProps {
  collections: Collection[];
  onSelectCollection: (id: string) => void;
  activeCollectionId: string | null;
}

interface TreeItemWithChildren extends Collection {
  children: TreeItemWithChildren[];
}

/**
 * Builds a tree structure from a flat array of collections
 * Sorted by parentId and position within each level
 */
function buildCollectionTree(collections: Collection[]): TreeItemWithChildren[] {
  const collectionMap = new Map<string | null, TreeItemWithChildren[]>();

  // Initialize map for all parent IDs (including null for roots)
  for (const collection of collections) {
    if (!collectionMap.has(collection.parentId)) {
      collectionMap.set(collection.parentId, []);
    }
  }

  // Add collections to their parent's children, sorted by position
  for (const collection of collections) {
    const treeItem: TreeItemWithChildren = { ...collection, children: [] };
    const children = collectionMap.get(collection.parentId) || [];
    children.push(treeItem);
    collectionMap.set(collection.parentId, children);
  }

  // Sort each level by position
  for (const children of collectionMap.values()) {
    children.sort((a, b) => a.position - b.position);
  }

  // Recursively set children for each node
  const populateChildren = (items: TreeItemWithChildren[]) => {
    for (const item of items) {
      item.children = collectionMap.get(item._id) || [];
      populateChildren(item.children);
    }
  };

  const roots = collectionMap.get(null) || [];
  populateChildren(roots);

  return roots;
}

/**
 * Renders a single tree item with its children (if expanded)
 * Uses hooks at component level (not in callbacks)
 */
interface TreeItemProps {
  item: TreeItemWithChildren;
  depth: number;
  onSelectCollection: (id: string) => void;
  activeCollectionId: string | null;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  depth,
  onSelectCollection,
  activeCollectionId,
}) => {
  const { toggleCollectionExpanded } = useLibraryStore();
  const isExpanded = useIsCollectionExpanded(item._id);
  const hasChildren = item.children.length > 0;

  return (
    <div>
      <TreeNode
        collection={item}
        isExpanded={isExpanded}
        onToggleExpand={() => toggleCollectionExpanded(item._id)}
        onSelect={() => onSelectCollection(item._id)}
        isActive={activeCollectionId === item._id}
        hasChildren={hasChildren}
        depth={depth}
      />

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <TreeRender
          items={item.children}
          depth={depth + 1}
          onSelectCollection={onSelectCollection}
          activeCollectionId={activeCollectionId}
        />
      )}
    </div>
  );
};

/**
 * Recursively renders a tree of collections with expand/collapse support
 */
interface TreeRenderProps {
  items: TreeItemWithChildren[];
  depth: number;
  onSelectCollection: (id: string) => void;
  activeCollectionId: string | null;
}

const TreeRender: React.FC<TreeRenderProps> = ({
  items,
  depth,
  onSelectCollection,
  activeCollectionId,
}) => {
  return (
    <>
      {items.map((item) => (
        <TreeItem
          key={item._id}
          item={item}
          depth={depth}
          onSelectCollection={onSelectCollection}
          activeCollectionId={activeCollectionId}
        />
      ))}
    </>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  collections,
  onSelectCollection,
  activeCollectionId,
}) => {
  // Build tree structure from flat array
  const tree = useMemo(() => buildCollectionTree(collections), [collections]);

  if (collections.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-app-text-tertiary">
        <p>No collections yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <TreeRender
        items={tree}
        depth={0}
        onSelectCollection={onSelectCollection}
        activeCollectionId={activeCollectionId}
      />
    </div>
  );
};
