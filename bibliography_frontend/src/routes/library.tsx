import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';
import { useReferencesQuery } from '../features/library/api/references.queries';
import { useLibraryStore } from '../features/library/store/library.store';
import { ReferenceTable } from '../features/library/components/ReferenceTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { FolderOpenIcon, PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export const Route = createFileRoute('/library')({
  component: LibraryPage,
});

function LibraryPage() {
  const { setActiveView } = useUIStore();
  const activeCollectionId = useLibraryStore((state) => state.activeCollectionId);
  const activeTags = useLibraryStore((state) => state.activeTags);

  useEffect(() => {
    setActiveView('library');
  }, [setActiveView]);

  const { data: references = [], isLoading, error } = useReferencesQuery({
    collectionId: activeCollectionId || undefined,
    tags: activeTags.length > 0 ? activeTags : undefined,
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
          onClick={() => console.log('Add reference')}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Reference
        </Button>
        <Button
          variant="secondary"
          size="default"
          onClick={() => console.log('Import references')}
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
            action={{ label: "Import References", onClick: () => console.log('Open import modal') }}
          />
        )}

        {!isLoading && !error && references.length > 0 && (
          <div className="flex-1 overflow-auto">
            <ReferenceTable references={references} />
          </div>
        )}
      </div>
    </div>
  );
}
