import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { Reference } from '@/common/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/common/utils';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
// @ts-ignore - Vite ?url import for worker file
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set PDF.js worker (required for react-pdf v9)
// Using ?url import for reliable pnpm + Vite compatibility
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfTabProps {
  reference: Reference | null;
}

/**
 * PDF Viewer Component (Session 10)
 *
 * Features:
 * - react-pdf Document/Page rendering
 * - Zoom controls (0.5x - 3.0x)
 * - Page navigation (prev/next + input)
 * - Download button
 * - Open in new tab button
 * - Empty state when no PDF
 * - Loading state during PDF load
 *
 * Adapted from Zotero attachmentPreviewBox.js zoom controls pattern
 */
export const PdfTab: React.FC<PdfTabProps> = ({ reference }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  // Reset page number when reference changes
  useEffect(() => {
    setPageNumber(1);
    setLoading(true);
  }, [reference?._id]);

  if (!reference?.hasPdf) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <DocumentTextIcon className="w-16 h-16 text-app-text-muted mb-4" />
        <h3 className="text-lg font-medium text-app-text-primary mb-2">No PDF attached</h3>
        <p className="text-sm text-app-text-secondary max-w-md">
          Upload a PDF file for this reference to view it here.
        </p>
      </div>
    );
  }

  const pdfUrl = `/api/bibliography/references/${reference._id}/pdf`;

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(3.0, prev + 0.25));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(numPages || 1, prev + 1));
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page >= 1 && page <= (numPages || 1)) {
      setPageNumber(page);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = reference.pdf?.originalName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-app-border bg-app-surface flex-shrink-0">
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-app-text-secondary min-w-[4rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
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
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm text-app-text-secondary">
            <input
              type="number"
              value={pageNumber}
              onChange={handlePageInputChange}
              min={1}
              max={numPages || 1}
              className="w-12 px-2 py-1 text-center border border-app-border rounded bg-app-bg text-app-text-primary focus:outline-none focus:ring-2 focus:ring-app-accent"
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
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            aria-label="Download PDF"
            title="Download PDF"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenInNewTab}
            aria-label="Open in new tab"
            title="Open in new tab"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-app-bg flex items-start justify-center p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent"></div>
          </div>
        )}
        <Document
          file={pdfUrl}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={(error) => {
            console.error('PDF load error:', error);
            setLoading(false);
          }}
          loading={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent"></div>
            </div>
          }
          className={cn(loading && 'hidden')}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
};
