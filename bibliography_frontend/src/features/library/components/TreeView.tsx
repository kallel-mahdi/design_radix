import React, { useMemo, useState } from 'react';
import { TreeNode } from './TreeNode';
import { CollectionColorPickerModal } from './CollectionColorPickerModal';
import { useLibraryStore, useIsCollectionExpanded } from '../store/library.store';
import { ContextMenu, type ContextMenuItem } from '@/components/ui/ContextMenu';
import { PromptDialog } from '@/components/ui/PromptDialog';
import { PencilIcon, TrashIcon, SwatchIcon, FolderPlusIcon } from '@heroicons/react/24/outline';
import type { Collection } from '@/common/types';
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} from '../api/collections.mutations';

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
  // Defensive: filter out deleted collections (should already be filtered at query level)
  const activeCollections = collections.filter(c => !c.deleted);

  const collectionMap = new Map<string | null, TreeItemWithChildren[]>();

  // Initialize map for all parent IDs (including null for roots)
  for (const collection of activeCollections) {
    if (!collectionMap.has(collection.parentId)) {
      collectionMap.set(collection.parentId, []);
    }
  }

  // Add collections to their parent's children, sorted by position
  for (const collection of activeCollections) {
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
  onContextMenu: (collection: Collection, e: React.MouseEvent) => void;
  activeCollectionId: string | null;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  depth,
  onSelectCollection,
  onContextMenu,
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
        onContextMenu={onContextMenu}
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
          onContextMenu={onContextMenu}
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
  onContextMenu: (collection: Collection, e: React.MouseEvent) => void;
  activeCollectionId: string | null;
}

const TreeRender: React.FC<TreeRenderProps> = ({
  items,
  depth,
  onSelectCollection,
  onContextMenu,
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
          onContextMenu={onContextMenu}
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

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    collection: Collection | null;
  }>({ isOpen: false, position: { x: 0, y: 0 }, collection: null });

  // Dialog states
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; collection: Collection | null }>({
    isOpen: false,
    collection: null,
  });
  const [createSubDialog, setCreateSubDialog] = useState<{ isOpen: boolean; parentCollection: Collection | null }>({
    isOpen: false,
    parentCollection: null,
  });
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedCollectionForColor, setSelectedCollectionForColor] = useState<Collection | null>(null);

  // Mutations
  const createCollectionMutation = useCreateCollectionMutation();
  const updateCollectionMutation = useUpdateCollectionMutation();
  const deleteCollectionMutation = useDeleteCollectionMutation();

  // Context menu handler
  const handleContextMenu = (collection: Collection, e: React.MouseEvent) => {
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      collection,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, collection: null });
  };

  // Context menu actions
  const handleNewSubcollection = () => {
    setCreateSubDialog({ isOpen: true, parentCollection: contextMenu.collection });
    closeContextMenu();
  };

  const handleRename = () => {
    setRenameDialog({ isOpen: true, collection: contextMenu.collection });
    closeContextMenu();
  };

  const handleDelete = () => {
    if (contextMenu.collection) {
      deleteCollectionMutation.mutate(contextMenu.collection._id);
    }
    closeContextMenu();
  };

  const handleAssignColor = () => {
    setSelectedCollectionForColor(contextMenu.collection);
    setColorPickerOpen(true);
    closeContextMenu();
  };

  // Context menu items
  const contextMenuItems: ContextMenuItem[] = [
    {
      label: 'New Subcollection',
      icon: <FolderPlusIcon className="w-4 h-4" />,
      onClick: handleNewSubcollection,
    },
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

  if (collections.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-app-text-tertiary">
        <p>No collections yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <TreeRender
          items={tree}
          depth={0}
          onSelectCollection={onSelectCollection}
          onContextMenu={handleContextMenu}
          activeCollectionId={activeCollectionId}
        />
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
        onClose={() => setRenameDialog({ isOpen: false, collection: null })}
        onConfirm={(newName) => {
          if (renameDialog.collection) {
            updateCollectionMutation.mutate({
              id: renameDialog.collection._id,
              data: { name: newName },
            });
          }
          setRenameDialog({ isOpen: false, collection: null });
        }}
        title="Rename Collection"
        description={`Enter a new name for "${renameDialog.collection?.name}"`}
        placeholder="Collection name"
        initialValue={renameDialog.collection?.name || ''}
        confirmLabel="Rename"
        isLoading={updateCollectionMutation.isPending}
      />

      {/* Create Subcollection Dialog */}
      <PromptDialog
        isOpen={createSubDialog.isOpen}
        onClose={() => setCreateSubDialog({ isOpen: false, parentCollection: null })}
        onConfirm={(name) => {
          createCollectionMutation.mutate({
            name,
            parentId: createSubDialog.parentCollection?._id,
          });
          setCreateSubDialog({ isOpen: false, parentCollection: null });
        }}
        title="New Subcollection"
        description={`Create a new subcollection under "${createSubDialog.parentCollection?.name}"`}
        placeholder="Collection name"
        confirmLabel="Create"
        isLoading={createCollectionMutation.isPending}
      />

      {/* Color Picker Modal */}
      <CollectionColorPickerModal
        isOpen={colorPickerOpen}
        onClose={() => {
          setColorPickerOpen(false);
          setSelectedCollectionForColor(null);
        }}
        collection={selectedCollectionForColor}
        onColorSelect={(color) => {
          if (selectedCollectionForColor) {
            updateCollectionMutation.mutate({
              id: selectedCollectionForColor._id,
              data: { color: color ?? undefined },
            });
          }
        }}
        isLoading={updateCollectionMutation.isPending}
      />
    </>
  );
};
