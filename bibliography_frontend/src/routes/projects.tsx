import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { setActiveView } = useUIStore();

  useEffect(() => {
    setActiveView('projects');
  }, [setActiveView]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Linked Projects</h1>
        <p className="text-text-secondary mt-1">
          Connect collections to your LaTeX projects
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-bg-surface border border-border rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Projects View Coming Soon
          </h2>
          <p className="text-text-secondary">
            Project linking will be implemented in Session 10
          </p>
        </div>
      </div>
    </div>
  );
}
