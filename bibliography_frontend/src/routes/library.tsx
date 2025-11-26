import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useSuspenseReferencesQuery, useReferenceQuery, type ReferencesQueryParams } from '../features/library/api/references.queries';
// NOTE: useTagsQuery moved to useKeyboardShortcuts hook for 1-9 tag shortcuts
import { useLibraryStore } from '../features/library/store/library.store';
import { ReferenceTable } from '../features/library/components/ReferenceTable';
import { ReferenceTableSkeleton } from '../features/library/components/ReferenceTableSkeleton';
import { ReferenceModal } from '../features/library/components/ReferenceModal';
import { PdfReaderModal } from '../features/library/components/PdfReaderModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FolderOpenIcon, PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useCreateReferenceFromPdfMutation } from '../features/library/api/pdf.mutations';
import { useImportFromBibtexMutation, useExportToBibtexMutation } from '../features/library/api/import.mutations';

export const Route = createFileRoute('/library')({
  component: LibraryPage,
});

export function LibraryPage() {
  const { setActiveView, setDetailsPaneOpen, openModal, addToast } = useUIStore();
  const activeCollectionId = useLibraryStore((state) => state.activeCollectionId);
  const activeTags = useLibraryStore((state) => state.activeTags);
  const activeReferenceId = useLibraryStore((state) => state.activeReferenceId);
  const editReferenceId = useLibraryStore((state) => state.editReferenceId);
  const pdfReaderReferenceId = useLibraryStore((state) => state.pdfReaderReferenceId);
  const setPdfReaderReference = useLibraryStore((state) => state.setPdfReaderReference);
  const searchQuery = useLibraryStore((state) => state.searchQuery);

  // Fetch reference for PDF reader modal
  const { data: pdfReaderReference } = useReferenceQuery(
    pdfReaderReferenceId || undefined,
    !!pdfReaderReferenceId
  );

  const [isDragging, setIsDragging] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const bibtexInputRef = useRef<HTMLInputElement>(null);

  const createFromPdfMutation = useCreateReferenceFromPdfMutation();
  const importBibtexMutation = useImportFromBibtexMutation();
  const exportBibtexMutation = useExportToBibtexMutation();

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

  // NOTE: Keyboard shortcuts (ESC, 1-9 tags, Cmd+N, Cmd+F, Delete) are now
  // centralized in useKeyboardShortcuts hook, mounted in AppLayout.

  // Handle PDF file selection (from file picker)
  // Note: Collection validation happens BEFORE file picker opens (in button onClick)
  const handlePdfFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // activeCollectionId is guaranteed to exist here (validated before file picker)
    if (file && file.type === 'application/pdf' && activeCollectionId) {
      createFromPdfMutation.mutate({ file, collectionId: activeCollectionId });
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

  // Handle BibTeX file selection
  const handleBibtexFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const content = await file.text();
      importBibtexMutation.mutate({ bibtex: content, createImmediately: true });
      // Reset input so same file can be selected again
      event.target.value = '';
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

    // Validate collection is selected (consistent UX with New Reference)
    if (!activeCollectionId) {
      addToast({
        message: 'Please select a collection first',
        type: 'error',
        duration: 5000,
      });
      return;
    }

    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      createFromPdfMutation.mutate({ file, collectionId: activeCollectionId });
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

        {/* Toolbar - Option C: Add Reference (PDF) | Import BibTeX | Export BibTeX */}
        <div className="px-6 py-4 border-b border-app-border flex items-center gap-3">
          {/* Primary action: Add Reference from PDF */}
          <Button
            variant="primary"
            size="default"
            onClick={() => {
              if (!activeCollectionId) {
                addToast({
                  message: 'Please select a collection first',
                  type: 'error',
                  duration: 5000,
                });
                return;
              }
              pdfInputRef.current?.click();
            }}
            loading={createFromPdfMutation.isPending}
            disabled={createFromPdfMutation.isPending}
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Add Reference
          </Button>

          {/* Hidden file input for PDF upload */}
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePdfFileSelect}
            className="hidden"
          />

          {/* Import BibTeX button */}
          <Button
            variant="secondary"
            size="default"
            onClick={() => bibtexInputRef.current?.click()}
            loading={importBibtexMutation.isPending}
            disabled={importBibtexMutation.isPending}
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Import
          </Button>

          {/* Hidden file input for BibTeX upload */}
          <input
            ref={bibtexInputRef}
            type="file"
            accept=".bib"
            onChange={handleBibtexFileSelect}
            className="hidden"
          />

          {/* Export BibTeX button */}
          <Button
            variant="secondary"
            size="default"
            onClick={() => exportBibtexMutation.mutate(
              activeCollectionId ? { collectionId: activeCollectionId } : undefined
            )}
            loading={exportBibtexMutation.isPending}
            disabled={exportBibtexMutation.isPending}
          >
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            Export
          </Button>

          {/* Manual entry via secondary action */}
          <Button
            variant="ghost"
            size="default"
            onClick={() => {
              if (!activeCollectionId) {
                addToast({
                  message: 'Please select a collection first',
                  type: 'error',
                  duration: 5000,
                });
                return;
              }
              openModal('reference-modal');
            }}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Manual Entry
          </Button>
        </div>

        {/* Content - with drag-drop support (Session 10.5) */}
        {/* NOTE: Use min-h-0 instead of overflow-auto to allow flex child to shrink properly */}
        <div
          className={`flex-1 min-h-0 relative ${
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
              <ReferenceListContent queryParams={queryParams} />
            </Suspense>
          </ErrorBoundary>
        </div>

      {/* Reference Modal (Create/Edit) */}
      <ReferenceModal referenceId={editReferenceId || undefined} />

      {/* PDF Reader Modal (Full-screen - Zotero pattern) */}
      <PdfReaderModal
        reference={pdfReaderReference || null}
        isOpen={!!pdfReaderReferenceId}
        onClose={() => setPdfReaderReference(null)}
      />
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
}

function ReferenceListContent({ queryParams }: ReferenceListContentProps) {
  const { data: references } = useSuspenseReferencesQuery(queryParams);

  if (references.length === 0) {
    return (
      <EmptyState
        icon={FolderOpenIcon}
        title="No references yet"
        description="Add a PDF or import a BibTeX file to get started"
      />
    );
  }

  return (
    // NOTE: h-full lets ReferenceTable handle its own scrolling with overflow-auto
    <div className="h-full">
      <ReferenceTable references={references} />
    </div>
  );
}
