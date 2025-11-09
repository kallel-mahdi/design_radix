import { useState, useRef, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../common/utils';

interface DetailsPaneProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string | null;
  activeTab: 'info' | 'pdf' | 'notes';
  onTabChange: (tab: DetailsPaneProps['activeTab']) => void;
  width: number;
  onWidthChange: (width: number) => void;
  className?: string;
}

export const DetailsPane: React.FC<DetailsPaneProps> = ({
  isOpen,
  onClose,
  referenceId,
  activeTab,
  onTabChange,
  width,
  onWidthChange,
  className,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(300, Math.min(600, window.innerWidth - e.clientX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }

    return undefined;
  }, [isResizing, onWidthChange]);

  if (!isOpen || !referenceId) return null;

  const tabIndex = ['info', 'pdf', 'notes'].indexOf(activeTab);

  return (
    <aside
      ref={paneRef}
      className={cn('bg-bg-surface border-l border-border flex flex-col', className)}
      style={{ width: `${width}px` }}
      aria-label="Reference Details"
    >
      {/* Resize handle */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 hover:w-2 hover:bg-accent cursor-col-resize transition-all',
          isResizing && 'w-2 bg-accent'
        )}
        onMouseDown={handleMouseDown}
        aria-label="Resize details pane"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Reference Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 transition-colors"
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
        <Tab.List className="flex border-b border-border">
          {['Info', 'PDF', 'Notes'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                cn(
                  'px-4 py-2 text-sm font-medium transition-colors focus:outline-none',
                  selected
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-gray-400 hover:text-gray-300'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="flex-1 overflow-auto">
          <Tab.Panel className="p-4">
            <div className="text-text-secondary">
              <p className="mb-2">Info tab content will go here</p>
              <p className="text-sm text-text-muted">Reference ID: {referenceId}</p>
            </div>
          </Tab.Panel>
          <Tab.Panel className="p-4">
            <div className="text-text-secondary">
              <p>PDF viewer will go here</p>
              <p className="text-sm text-text-muted mt-2">
                Will display PDF using iframe in later sessions
              </p>
            </div>
          </Tab.Panel>
          <Tab.Panel className="p-4">
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
