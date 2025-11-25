import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useSuspenseReferencesQuery, type ReferencesQueryParams } from '../features/library/api/references.queries';
import { useTagsQuery } from '../features/library/api/tags.queries';
import { useLibraryStore } from '../features/library/store/library.store';
import { ReferenceTable } from '../features/library/components/ReferenceTable';
import { ReferenceTableSkeleton } from '../features/library/components/ReferenceTableSkeleton';
import { ImportModal } from '../features/library/components/ImportModal';
import { ReferenceModal } from '../features/library/components/ReferenceModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FolderOpenIcon, PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ChevronDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import { useCreateReferenceFromPdfMutation } from '../features/library/api/pdf.mutations';

export const Route = createFileRoute('/library')({
  component: LibraryPage,
});

export function LibraryPage() {
  const { setActiveView, setDetailsPaneOpen, openModal, addToast } = useUIStore();
  const activeCollectionId = useLibraryStore((state) => state.activeCollectionId);
  const activeTags = useLibraryStore((state) => state.activeTags);
  const activeReferenceId = useLibraryStore((state) => state.activeReferenceId);
  const setActiveReference = useLibraryStore((state) => state.setActiveReference);
  const editReferenceId = useLibraryStore((state) => state.editReferenceId);
  const searchQuery = useLibraryStore((state) => state.searchQuery);
  const toggleTag = useLibraryStore((state) => state.toggleTag);

  // Tags query for keyboard shortcuts (1-9 for colored tags)
  const { data: allTags = [] } = useTagsQuery();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createFromPdfMutation = useCreateReferenceFromPdfMutation();

  useEffect(() => {
    setActiveView('library');
  }, [setActiveView]);

  // Auto-open DetailsPane when reference is selected
  useEffect(() => {
    if (activeReferenceId) {
      setDetailsPaneOpen(true);
    } else {
      setDetailsPaneOpen(false);
    }
  }, [activeReferenceId, setDetailsPaneOpen]);

  // Auto-open ReferenceModal when Edit button clicked
  useEffect(() => {
    if (editReferenceId) {
      openModal('reference-modal');
    }
  }, [editReferenceId]); // openModal is stable from Zustand, no need in deps

  // ESC key handler: Close DetailsPane and clear active reference
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeReferenceId) {
        setDetailsPaneOpen(false);
        setActiveReference(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReferenceId, setDetailsPaneOpen, setActiveReference]);

  /**
   * Keyboard shortcuts 1-9: Toggle colored tag filters
   * - Keys '1' through '9' toggle the tag with the corresponding position
   * - Only colored tags (with position 1-9) respond to shortcuts
   * - Pattern copied from Zotero: zotero/chrome/content/zotero/collectionTree.js
   */
  useEffect(() => {
    const handleTagShortcut = (event: KeyboardEvent) => {
      // Skip if typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check for number keys 1-9
      const position = parseInt(event.key);
      if (position >= 1 && position <= 9) {
        // Find tag with this position
        const tagWithPosition = allTags.find((tag) => tag.position === position);
        if (tagWithPosition) {
          toggleTag(tagWithPosition.name);
        }
      }
    };

    window.addEventListener('keydown', handleTagShortcut);
    return () => window.removeEventListener('keydown', handleTagShortcut);
  }, [allTags, toggleTag]);

  // Handle PDF file selection (from file picker)
  const handlePdfFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      createFromPdfMutation.mutate(file);
      // Reset input so same file can be selected again
      event.target.value = '';
    } else if (file) {
      addToast({
        message: 'Only PDF files are supported',
        type: 'error',
        duration: 5000,
      });
    }
  };

  // Drag-drop handlers (Session 10.5 - Zotero pattern from itemTree.jsx:2242-2675)
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      createFromPdfMutation.mutate(file);
    } else if (file) {
      addToast({
        message: 'Only PDF files are supported',
        type: 'error',
        duration: 5000,
      });
    }
  };

  // Query params for Suspense component
  const queryParams: ReferencesQueryParams = {
    collectionId: activeCollectionId || undefined,
    tags: activeTags.length > 0 ? activeTags : undefined,
    search: searchQuery || undefined,
    deleted: false
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
          <h1 className="text-2xl font-bold text-app-text-primary">Library</h1>
          <p className="text-app-text-secondary mt-1">Organize your references and collections</p>
        </div>

        {/* Toolbar - Always visible */}
        <div className="px-6 py-4 border-b border-app-border flex items-center gap-3">
          <Button
            variant="primary"
            size="default"
            onClick={() => openModal('reference-modal')}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Reference
          </Button>

          {/* Import Dropdown (Session 10.5) */}
          <Menu as="div" className="relative">
            <Menu.Button as={Button} variant="secondary" size="default">
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Import
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </Menu.Button>

            <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <ArrowDownTrayIcon className="w-5 h-5 mr-3" />
                      Import from DOI
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <DocumentTextIcon className="w-5 h-5 mr-3" />
                      Import from PDF...
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>

          {/* Hidden file input for PDF upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePdfFileSelect}
            className="hidden"
          />

          <Button
            variant="secondary"
            size="default"
            onClick={() => console.log('Export references')}
          >
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            Export
          </Button>
        </div>

        {/* Content - with drag-drop support (Session 10.5) */}
        <div
          className={`flex-1 overflow-auto relative ${
            isDragging ? 'ring-2 ring-green-500 ring-inset bg-green-50/50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag-drop overlay indicator */}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-50/80 z-10 pointer-events-none">
              <div className="text-center">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-green-500 mb-2" />
                <p className="text-lg font-medium text-green-700">Drop PDF to add reference</p>
                <p className="text-sm text-green-600 mt-1">Metadata will be extracted automatically</p>
              </div>
            </div>
          )}

          {/* Suspense-wrapped reference list - cleaner loading pattern */}
          <ErrorBoundary
            fallback={(error, reset) => (
              <div className="p-6 text-red-500">
                <p>Error loading references: {error.message}</p>
                <Button variant="secondary" size="sm" onClick={reset} className="mt-2">
                  Try Again
                </Button>
              </div>
            )}
          >
            <Suspense fallback={<ReferenceTableSkeleton rows={10} />}>
              <ReferenceListContent
                queryParams={queryParams}
                onImport={() => setIsImportModalOpen(true)}
              />
            </Suspense>
          </ErrorBoundary>
        </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Reference Modal (Create/Edit) */}
      <ReferenceModal referenceId={editReferenceId || undefined} />
    </div>
  );
}

/**
 * ReferenceListContent - Suspense-enabled data fetching component
 *
 * Uses useSuspenseQuery to fetch data, suspending until ready.
 * Wrapped with <Suspense> boundary in parent for loading state.
 *
 * Pattern: Cleaner than isLoading checks - component always receives data.
 */
interface ReferenceListContentProps {
  queryParams: ReferencesQueryParams;
  onImport: () => void;
}

function ReferenceListContent({ queryParams, onImport }: ReferenceListContentProps) {
  const { data: references } = useSuspenseReferencesQuery(queryParams);

  if (references.length === 0) {
    return (
      <EmptyState
        icon={FolderOpenIcon}
        title="No references yet"
        description="Import your first reference to get started organizing your research"
        action={{ label: "Import References", onClick: onImport }}
      />
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <ReferenceTable references={references} />
    </div>
  );
}
