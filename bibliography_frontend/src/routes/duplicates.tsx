import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';

export const Route = createFileRoute('/duplicates')({
  component: DuplicatesPage,
});

function DuplicatesPage() {
  const { setActiveView } = useUIStore();

  useEffect(() => {
    setActiveView('duplicates');
  }, [setActiveView]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
        <h1 className="text-2xl font-bold text-app-text-primary">Duplicates</h1>
        <p className="text-app-text-secondary mt-1">Review and resolve duplicate references</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-app-surface border border-app-border rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-app-text-primary mb-2">
            Duplicates View Coming Soon
          </h2>
          <p className="text-app-text-secondary">
            Duplicate detection and resolution will be implemented in Session 13-14
          </p>
        </div>
      </div>
    </div>
  );
}
