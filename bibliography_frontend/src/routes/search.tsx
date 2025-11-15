import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';

export const Route = createFileRoute('/search')({
  component: SearchPage,
});

function SearchPage() {
  const { setActiveView } = useUIStore();

  useEffect(() => {
    setActiveView('search');
  }, [setActiveView]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
        <h1 className="text-2xl font-bold text-app-text-primary">Search</h1>
        <p className="text-app-text-secondary mt-1">Find references across your library</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-app-surface border border-app-border rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-app-text-primary mb-2">
            Search View Coming Soon
          </h2>
          <p className="text-app-text-secondary">
            Full-text search and filtering will be implemented in Session 8
          </p>
        </div>
      </div>
    </div>
  );
}
