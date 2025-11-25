import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';
import { useTagsQuery } from '../features/library/api/tags.queries';
import { Skeleton } from '../components/ui/Skeleton';
import { Tag } from '../components/ui/Tag';
import { EmptyState } from '../components/ui/EmptyState';
import { TagIcon } from '@heroicons/react/24/outline';

export const Route = createFileRoute('/tags')({
  component: TagsPage,
});

export function TagsPage() {
  const { setActiveView } = useUIStore();
  const { data: tags = [], isLoading } = useTagsQuery();

  useEffect(() => {
    setActiveView('tags');
  }, [setActiveView]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-app-bg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-app-text mb-6">Tags</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-app-bg">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-app-text mb-2">Tags</h1>
          <p className="text-app-text-muted">
            {tags.length} tag{tags.length !== 1 ? 's' : ''} in your library
          </p>
        </div>

        {tags.length === 0 ? (
          <EmptyState
            icon={TagIcon}
            title="No tags yet"
            description="Create tags to organize and categorize your references"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tags.map((tag) => (
              <div
                key={tag._id}
                className="p-4 rounded-lg border border-app-border hover:border-app-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <Tag label={tag.name} color={tag.color} />
                  <span className="text-sm text-app-text-muted">
                    {tag.usageCount || 0} ref{tag.usageCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-1 bg-app-surface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: tag.color || '#999',
                      width: `${Math.min(100, ((tag.usageCount || 0) / Math.max(1, ...tags.map((t) => t.usageCount || 0))) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
