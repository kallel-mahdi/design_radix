import React from 'react';
import { Tab } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';

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

  return (
    <aside
      className={cn('bg-bg-surface border-l border-border flex flex-col h-full', className)}
      aria-label="Reference Details"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <h2 className="text-lg font-semibold text-text-primary">Reference Details</h2>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
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
        <Tab.List className="flex border-b border-border flex-shrink-0">
          {['Info', 'PDF', 'Notes'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                cn(
                  'px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                  selected
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-text-secondary hover:text-text-primary',
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="flex-1 overflow-auto min-h-0">
          <Tab.Panel className="p-4 h-full">
            <div className="text-text-secondary">
              <p className="mb-2">Info tab content will go here</p>
              <p className="text-sm text-text-muted">Reference ID: {referenceId}</p>
            </div>
          </Tab.Panel>
          <Tab.Panel className="p-4 h-full">
            <div className="text-text-secondary">
              <p>PDF viewer will go here (Session 7)</p>
              <p className="text-sm text-text-muted mt-2">Will display PDF using react-pdf viewer</p>
            </div>
          </Tab.Panel>
          <Tab.Panel className="p-4 h-full">
            <div className="text-text-secondary">
              <p>Notes will go here</p>
              <p className="text-sm text-text-muted mt-2">Phase 2 feature</p>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </aside>
  );
};
