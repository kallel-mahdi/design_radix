/**
 * PdfReaderModal - Full-screen PDF reader (Zotero pattern)
 *
 * Opens on double-click when reference has PDF.
 * Features:
 * - Full-screen modal with dark backdrop
 * - Zoom controls (0.5x - 3.0x)
 * - Page navigation (prev/next + input)
 * - Download and open in new tab
 * - Escape key to close
 * - Shift+double-click opens in new browser tab (handled in ReferenceTable)
 *
 * Adapted from PdfTab.tsx for modal context.
 * Zotero reference: zotero/chrome/content/zotero/reader/reader.js
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PageCallback } from 'react-pdf/dist/esm/shared/types.js';
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import type { Reference, Annotation } from '@/common/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/common/utils';
import { useAnnotationsQuery } from '../api/annotations.queries';
import { useCreateAnnotationMutation, useUpdateAnnotationMutation, useDeleteAnnotationMutation } from '../api/annotations.mutations';
import {
  AnnotationLayer,
  AnnotationPopup,
  AnnotationSidebar,
  HighlightPopover,
  useTextSelection,
  generateSortIndex,
  pdfToScreenRect,
  type PdfRect,
} from './annotations';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
// @ts-ignore - Vite ?url import for worker file
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set PDF.js worker (required for react-pdf v9)
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfReaderModalProps {
  reference: Reference | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  reference,
  isOpen,
  onClose,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Fetch annotations for this reference
  const { data: annotations = [] } = useAnnotationsQuery(reference?._id, isOpen);

  // Mutations for annotations
  const createAnnotationMutation = useCreateAnnotationMutation();
  const updateAnnotationMutation = useUpdateAnnotationMutation();
  const deleteAnnotationMutation = useDeleteAnnotationMutation();

  // Text selection hook for highlight creation
  const { selection, clearSelection } = useTextSelection({
    pageContainerRef,
    scale,
    enabled: isOpen && !loading,
  });

  // Filter annotations for current page (0-based pageIndex)
  const pageAnnotations = useMemo(() =>
    annotations.filter(ann => ann.pageIndex === pageNumber - 1),
    [annotations, pageNumber]
  );

  // Reset state when reference changes
  useEffect(() => {
    if (isOpen) {
      // Clear stale browser selection to prevent HighlightPopover from appearing
      // on modal reopen (browser selection persists across modal close/open cycles)
      window.getSelection()?.removeAllRanges();
      setPageNumber(1);
      setLoading(true);
      setScale(1.0);
      setPageDimensions(null);
      setSelectedAnnotationId(null);
      setEditingAnnotation(null);
      setPopupPosition(null);
    }
  }, [reference?._id, isOpen]);

  // Memoize file config to prevent react-pdf re-render loop
  const fileConfig = useMemo(() => {
    if (!reference?._id) return null;
    return {
      url: `/api/bibliography/references/${reference._id}/pdf`,
      httpHeaders: {
        'x-user-id': 'test-user-id',
      },
    };
  }, [reference?._id]);

  const pdfUrl = reference?._id
    ? `/api/bibliography/references/${reference._id}/pdf`
    : '';

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handlePageLoadSuccess = (page: PageCallback) => {
    // react-pdf's PageCallback includes width/height directly
    setPageDimensions({ width: page.originalWidth, height: page.originalHeight });
  };

  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    setSelectedAnnotationId(annotation._id);
    setEditingAnnotation(annotation);

    // Calculate popup position based on annotation's first rect
    if (pageContainerRef.current && annotation.position.rects.length > 0) {
      const firstRect = annotation.position.rects[0] as PdfRect;
      const screenRect = pdfToScreenRect(firstRect, scale);
      const pageRect = pageContainerRef.current.getBoundingClientRect();

      setPopupPosition({
        x: pageRect.left + screenRect.x + screenRect.width / 2,
        y: pageRect.top + screenRect.y + screenRect.height + 10,
      });
    }
  }, [scale]);

  const handleCreateHighlight = useCallback(async (color: string) => {
    if (!selection || !reference?._id) return;

    const pageIndex = pageNumber - 1;
    const sortIndex = generateSortIndex(pageIndex, selection.rects);

    await createAnnotationMutation.mutateAsync({
      referenceId: reference._id,
      data: {
        type: 'highlight',
        pageIndex,
        position: { rects: selection.rects },
        content: { text: selection.text },
        color,
        sortIndex,
      },
    });

    clearSelection();
  }, [selection, reference?._id, pageNumber, createAnnotationMutation, clearSelection]);

  const handleSidebarAnnotationClick = useCallback((annotation: Annotation) => {
    // Navigate to the annotation's page and select it
    setPageNumber(annotation.pageIndex + 1);
    setSelectedAnnotationId(annotation._id);
  }, []);

  const handleDeleteAnnotation = useCallback(async (annotation: Annotation) => {
    if (!reference?._id) return;

    // Simple confirmation
    if (!window.confirm('Delete this annotation?')) return;

    await deleteAnnotationMutation.mutateAsync({
      annotationId: annotation._id,
      referenceId: reference._id,
    });

    // Clear selection if we deleted the selected annotation
    if (selectedAnnotationId === annotation._id) {
      setSelectedAnnotationId(null);
    }
  }, [reference?._id, deleteAnnotationMutation, selectedAnnotationId]);

  const handlePopupSave = useCallback(async (data: { comment?: string; color?: string }) => {
    if (!editingAnnotation || !reference?._id) return;

    await updateAnnotationMutation.mutateAsync({
      annotationId: editingAnnotation._id,
      referenceId: reference._id,
      data: {
        content: data.comment !== undefined ? { comment: data.comment } : undefined,
        color: data.color,
      },
    });

    setEditingAnnotation(null);
    setPopupPosition(null);
  }, [editingAnnotation, reference?._id, updateAnnotationMutation]);

  const handlePopupDelete = useCallback(async () => {
    if (!editingAnnotation || !reference?._id) return;

    await deleteAnnotationMutation.mutateAsync({
      annotationId: editingAnnotation._id,
      referenceId: reference._id,
    });

    setEditingAnnotation(null);
    setPopupPosition(null);
    setSelectedAnnotationId(null);
  }, [editingAnnotation, reference?._id, deleteAnnotationMutation]);

  const handlePopupClose = useCallback(() => {
    setEditingAnnotation(null);
    setPopupPosition(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(3.0, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  }, []);

  const handlePrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(numPages || 1, prev + 1));
  }, [numPages]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page >= 1 && page <= (numPages || 1)) {
      setPageNumber(page);
    }
  };

  const handleDownload = useCallback(() => {
    if (!reference) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = reference.pdf?.originalName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfUrl, reference]);

  const handleOpenInNewTab = useCallback(() => {
    window.open(pdfUrl, '_blank');
  }, [pdfUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePrevPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          handleNextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'Home':
          e.preventDefault();
          setPageNumber(1);
          break;
        case 'End':
          e.preventDefault();
          if (numPages) setPageNumber(numPages);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevPage, handleNextPage, handleZoomIn, handleZoomOut, numPages]);

  // Only skip rendering if explicitly closed
  // When open but reference is loading, show loading state inside modal
  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Full-screen backdrop */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        {/* Full-screen panel */}
        <div className="fixed inset-0 overflow-hidden">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Panel className="flex flex-col h-full w-full">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
                {/* Left: Title */}
                <div className="flex items-center gap-4 min-w-0">
                  <Dialog.Title className="text-white font-medium truncate max-w-md">
                    {reference?.title || 'Loading...'}
                  </Dialog.Title>
                </div>

                {/* Center: Zoom + Page Navigation (only show when reference is loaded with PDF) */}
                {reference?.hasPdf && (
                  <div className="flex items-center gap-6">
                    {/* Zoom controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        disabled={scale <= 0.5}
                        aria-label="Zoom out"
                        title="Zoom out (-)"
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <MagnifyingGlassMinusIcon className="w-5 h-5" />
                      </Button>
                      <span className="text-sm font-medium text-gray-300 min-w-[4rem] text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        disabled={scale >= 3.0}
                        aria-label="Zoom in"
                        title="Zoom in (+)"
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <MagnifyingGlassPlusIcon className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={pageNumber <= 1}
                        aria-label="Previous page"
                        title="Previous page"
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </Button>
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <input
                          type="number"
                          value={pageNumber}
                          onChange={handlePageInputChange}
                          min={1}
                          max={numPages || 1}
                          className="w-14 px-2 py-1 text-center border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-app-accent"
                        />
                        <span>/</span>
                        <span>{numPages || '?'}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={pageNumber >= (numPages || 1)}
                        aria-label="Next page"
                        title="Next page"
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  {reference?.hasPdf && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSidebar}
                        aria-label="Toggle annotations sidebar"
                        title="Annotations"
                        className={cn(
                          "text-gray-300 hover:text-white hover:bg-gray-700",
                          sidebarOpen && "bg-gray-700 text-white"
                        )}
                      >
                        <Bars3BottomLeftIcon className="w-5 h-5" />
                        {annotations.length > 0 && (
                          <span className="ml-1 text-xs">{annotations.length}</span>
                        )}
                      </Button>
                      <div className="w-px h-6 bg-gray-700 mx-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        aria-label="Download PDF"
                        title="Download PDF"
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenInNewTab}
                        aria-label="Open in new tab"
                        title="Open in new tab"
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                      </Button>
                      <div className="w-px h-6 bg-gray-700 mx-2" />
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close"
                    title="Close (Escape)"
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content area: PDF + optional sidebar */}
              <div className="flex-1 flex overflow-hidden">
                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto bg-gray-800 flex items-start justify-center p-6">
                  {/* Loading state: reference is still being fetched */}
                  {!reference && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-accent mb-4"></div>
                      <span className="text-gray-400">Loading reference...</span>
                    </div>
                  )}

                  {/* No PDF state: reference loaded but has no PDF */}
                  {reference && !reference.hasPdf && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <span className="text-lg">This reference has no PDF attached</span>
                      <Button
                        variant="secondary"
                        size="default"
                        onClick={onClose}
                        className="mt-4"
                      >
                        Close
                      </Button>
                    </div>
                  )}

                  {/* PDF loaded state */}
                  {reference?.hasPdf && (
                    <>
                      {loading && (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-app-accent"></div>
                        </div>
                      )}
                      <Document
                        file={fileConfig}
                        onLoadSuccess={handleLoadSuccess}
                        onLoadError={(error) => {
                          console.error('PDF load error:', error);
                          setLoading(false);
                        }}
                        loading={
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-app-accent"></div>
                          </div>
                        }
                        className={cn(loading && 'hidden')}
                      >
                        <div ref={pageContainerRef} className="relative">
                          <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                            className="shadow-2xl"
                            onLoadSuccess={handlePageLoadSuccess}
                          />
                          {/* Annotation overlay */}
                          {pageDimensions && (
                            <AnnotationLayer
                              annotations={pageAnnotations}
                              scale={scale}
                              pageWidth={pageDimensions.width}
                              pageHeight={pageDimensions.height}
                              selectedId={selectedAnnotationId}
                              onAnnotationClick={handleAnnotationClick}
                            />
                          )}
                        </div>
                      </Document>
                    </>
                  )}
                </div>

                {/* Annotation sidebar */}
                {sidebarOpen && reference?.hasPdf && (
                  <AnnotationSidebar
                    annotations={annotations}
                    selectedId={selectedAnnotationId}
                    onAnnotationClick={handleSidebarAnnotationClick}
                    onAnnotationDelete={handleDeleteAnnotation}
                  />
                )}
              </div>

              {/* Highlight popover - appears on text selection */}
              {selection && (
                <HighlightPopover
                  position={selection.popoverPosition}
                  onColorSelect={handleCreateHighlight}
                  onClose={clearSelection}
                />
              )}

              {/* Annotation popup - appears when clicking on an annotation */}
              {editingAnnotation && popupPosition && (
                <AnnotationPopup
                  annotation={editingAnnotation}
                  position={popupPosition}
                  onSave={handlePopupSave}
                  onDelete={handlePopupDelete}
                  onClose={handlePopupClose}
                  isSaving={updateAnnotationMutation.isPending}
                />
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
