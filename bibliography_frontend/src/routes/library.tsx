import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';
import { useReferencesQuery } from '../features/library/api/references.queries';
import { useLibraryStore } from '../features/library/store/library.store';
import { ReferenceList } from '../features/library/components/ReferenceList';
import { EmptyState } from '../components/ui/EmptyState';
import { FolderOpenIcon } from '@heroicons/react/24/outline';

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
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Library</h1>
        <p className="text-text-secondary mt-1">Organize your references and collections</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <span className="text-text-secondary">Loading references...</span>
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
          <div className="p-6">
            <ReferenceList references={references} />
          </div>
        )}
      </div>
    </div>
  );
}
