import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';
import { useReferencesQuery } from '../features/library/api/references.queries';
import { ReferenceTable } from '../features/library/components/ReferenceTable';
import { EmptyState } from '../components/ui/EmptyState';
import { TrashIcon } from '@heroicons/react/24/outline';

export const Route = createFileRoute('/trash')({
  component: TrashPage,
});

function TrashPage() {
  const { setActiveView } = useUIStore();

  useEffect(() => {
    setActiveView('trash');
  }, [setActiveView]);

  const { data: references = [], isLoading, error } = useReferencesQuery({
    deleted: true
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
        <h1 className="text-2xl font-bold text-app-text-primary">Trash</h1>
        <p className="text-app-text-secondary mt-1">Deleted references are kept here for 30 days</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <span className="text-app-text-secondary">Loading deleted references...</span>
          </div>
        )}

        {error && (
          <div className="p-6 text-red-500">Error loading trash: {(error as Error).message}</div>
        )}

        {!isLoading && !error && references.length === 0 && (
          <EmptyState
            icon={TrashIcon}
            title="Trash is empty"
            description="Deleted references will appear here and be permanently deleted after 30 days"
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
