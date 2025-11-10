import React from 'react';
import { Tab } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { ReferenceSchema } from '@bibliography/shared';
import type { Reference } from '@/common/types';
import { Tag } from '@/components/ui/Tag';
import { Skeleton } from '@/components/ui/Skeleton';

interface DetailsPaneProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string | null;
  activeTab: 'info' | 'pdf' | 'notes';
  onTabChange: (tab: DetailsPaneProps['activeTab']) => void;
  className?: string;
}

export const DetailsPane: React.FC<DetailsPaneProps> = ({
  isOpen,
  onClose,
  referenceId,
  activeTab,
  onTabChange,
  className,
}) => {
  if (!isOpen || !referenceId) return null;

  const tabIndex = ['info', 'pdf', 'notes'].indexOf(activeTab);

  // Fetch reference data
  const { data: reference, isLoading } = useQuery({
    queryKey: ['references', 'detail', referenceId],
    queryFn: async (): Promise<Reference> => {
      const data = await apiClient.get<Reference>(`/references/${referenceId}`);
      return ReferenceSchema.parse(data);
    },
    enabled: !!referenceId,
  });

  return (
    <aside
      className={cn('bg-app-surface border-l border-app-border flex flex-col h-full', className)}
      aria-label="Reference Details"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-app-border flex-shrink-0">
        <h2 className="text-lg font-semibold text-app-text-primary">Reference Details</h2>
        <button
          onClick={onClose}
          className="text-app-text-secondary hover:text-app-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent rounded"
          aria-label="Close details pane"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <Tab.Group
        selectedIndex={tabIndex}
        onChange={(index) => onTabChange(['info', 'pdf', 'notes'][index] as typeof activeTab)}
      >
        <Tab.List className="flex border-b border-app-border flex-shrink-0">
          {['Info', 'PDF', 'Notes'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                cn(
                  'px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-app-accent',
                  selected
                    ? 'border-b-2 border-app-accent text-app-accent'
                    : 'text-app-text-secondary hover:text-app-text-primary',
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="flex-1 overflow-auto min-h-0">
          {/* Info Tab */}
          <Tab.Panel className="p-4 h-full">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : reference ? (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-lg font-semibold text-app-text-primary mb-2">
                    {reference.title}
                  </h3>
                </div>

                {/* Authors */}
                {reference.authors && reference.authors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-app-text-muted mb-1">Authors</p>
                    <p className="text-sm text-app-text-secondary">
                      {reference.authors.map(a => a.full || a.family).join(', ')}
                    </p>
                  </div>
                )}

                {/* Publication Info */}
                <div className="grid grid-cols-2 gap-4">
                  {reference.year && (
                    <div>
                      <p className="text-sm font-medium text-app-text-muted mb-1">Year</p>
                      <p className="text-sm text-app-text-secondary">{reference.year}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-app-text-muted mb-1">Type</p>
                    <p className="text-sm text-app-text-secondary capitalize">{reference.type}</p>
                  </div>
                </div>

                {/* DOI */}
                {reference.doi && (
                  <div>
                    <p className="text-sm font-medium text-app-text-muted mb-1">DOI</p>
                    <a
                      href={`https://doi.org/${reference.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-app-accent hover:text-app-accent-hover flex items-center gap-1"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {reference.doi}
                    </a>
                  </div>
                )}

                {/* Abstract */}
                {reference.abstract && (
                  <div>
                    <p className="text-sm font-medium text-app-text-muted mb-1">Abstract</p>
                    <p className="text-sm text-app-text-secondary leading-relaxed">
                      {reference.abstract}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {reference.tags && reference.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-app-text-muted mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {reference.tags.map((tag) => (
                        <Tag key={tag} label={tag} size="sm" />
                      ))}
                    </div>
                  </div>
                )}

                {/* PDF */}
                {reference.hasPdf && (
                  <div>
                    <p className="text-sm font-medium text-app-text-muted mb-2">Attachment</p>
                    <div className="flex items-center gap-2 text-sm text-app-text-secondary">
                      <DocumentTextIcon className="w-5 h-5 text-app-accent" />
                      <span>PDF available</span>
                    </div>
                  </div>
                )}

                {/* Citation Key */}
                <div>
                  <p className="text-sm font-medium text-app-text-muted mb-1">Citation Key</p>
                  <code className="text-sm text-app-text-secondary bg-app-bg px-2 py-1 rounded">
                    {reference.citationKey}
                  </code>
                </div>
              </div>
            ) : (
              <div className="text-app-text-secondary">
                <p>Reference not found</p>
              </div>
            )}
          </Tab.Panel>

          {/* PDF Tab - Placeholder for Session 7 */}
          <Tab.Panel className="p-4 h-full flex items-center justify-center">
            <div className="text-center text-app-text-secondary">
              <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-app-text-muted" />
              <p className="mb-2">PDF viewer coming in Session 7</p>
              <p className="text-sm text-app-text-muted">Will display PDF using react-pdf viewer</p>
            </div>
          </Tab.Panel>

          {/* Notes Tab - Placeholder for Phase 2 */}
          <Tab.Panel className="p-4 h-full flex items-center justify-center">
            <div className="text-center text-app-text-secondary">
              <p className="mb-2">Notes feature coming in Phase 2</p>
              <p className="text-sm text-app-text-muted">Add personal notes to your references</p>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </aside>
  );
};
