import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect, useState } from 'react';
import { useReferencesQuery } from '../features/library/api/references.queries';
import { useLibraryStore } from '../features/library/store/library.store';
import { ReferenceTable } from '../features/library/components/ReferenceTable';
import { ImportModal } from '../features/library/components/ImportModal';
import { ReferenceModal } from '../features/library/components/ReferenceModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { FolderOpenIcon, PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export const Route = createFileRoute('/library')({
  component: LibraryPage,
});

export function LibraryPage() {
  const { setActiveView, setDetailsPaneOpen, openModal } = useUIStore();
  const activeCollectionId = useLibraryStore((state) => state.activeCollectionId);
  const activeTags = useLibraryStore((state) => state.activeTags);
  const activeReferenceId = useLibraryStore((state) => state.activeReferenceId);
  const editReferenceId = useLibraryStore((state) => state.editReferenceId);
  const searchQuery = useLibraryStore((state) => state.searchQuery);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    setActiveView('library');
  }, [setActiveView]);

  // Auto-open DetailsPane when reference is selected
  useEffect(() => {
    if (activeReferenceId) {
      setDetailsPaneOpen(true);
    } else {
      setDetailsPaneOpen(false);
    }
  }, [activeReferenceId, setDetailsPaneOpen]);

  const { data: references = [], isLoading, error } = useReferencesQuery({
    collectionId: activeCollectionId || undefined,
    tags: activeTags.length > 0 ? activeTags : undefined,
    search: searchQuery || undefined,
    deleted: false
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
          <h1 className="text-2xl font-bold text-app-text-primary">Library</h1>
          <p className="text-app-text-secondary mt-1">Organize your references and collections</p>
        </div>

        {/* Toolbar - Always visible */}
        <div className="px-6 py-4 border-b border-app-border flex items-center gap-3">
          <Button
            variant="primary"
            size="default"
            onClick={() => openModal('reference-modal')}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Reference
          </Button>
          <Button
            variant="secondary"
            size="default"
            onClick={() => setIsImportModalOpen(true)}
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Import
          </Button>
          <Button
            variant="secondary"
            size="default"
            onClick={() => console.log('Export references')}
            disabled={references.length === 0}
          >
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            Export
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <span className="text-app-text-secondary">Loading references...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-red-500">Error loading references: {(error as Error).message}</div>
          )}

          {!isLoading && !error && references.length === 0 && (
            <EmptyState
              icon={FolderOpenIcon}
              title="No references yet"
              description="Import your first reference to get started organizing your research"
              action={{ label: "Import References", onClick: () => setIsImportModalOpen(true) }}
            />
          )}

          {!isLoading && !error && references.length > 0 && (
            <div className="flex-1 overflow-auto">
              <ReferenceTable references={references} />
            </div>
          )}
        </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Reference Modal (Create/Edit) */}
      <ReferenceModal referenceId={editReferenceId || undefined} />
    </div>
  );
}
