import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';

export const Route = createFileRoute('/library')({
  component: LibraryPage,
});

function LibraryPage() {
  const { setActiveView, setDetailsPaneOpen } = useUIStore();

  useEffect(() => {
    setActiveView('library');
  }, [setActiveView]);

  const handleToggleDetails = () => {
    setDetailsPaneOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Library</h1>
        <p className="text-text-secondary mt-1">Organize your references and collections</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-bg-surface border border-border rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Reference Table Coming Soon
          </h2>
          <p className="text-text-secondary mb-4">
            The reference table will be implemented in Session 3
          </p>
          <button
            onClick={handleToggleDetails}
            className="px-4 py-2 bg-accent text-black rounded hover:bg-accent-hover transition-colors"
          >
            Test Details Pane
          </button>
        </div>
      </div>
    </div>
  );
}
