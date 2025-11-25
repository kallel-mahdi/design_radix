import { useState, useEffect, useCallback, type RefObject } from 'react';
import { selectionToPdfRects, mergeAdjacentRects, type PdfRect } from './coordinateUtils';

export interface TextSelection {
  /** The selected text content */
  text: string;
  /** PDF coordinates of the selection rectangles */
  rects: PdfRect[];
  /** Screen position for showing the popover (near selection) */
  popoverPosition: { x: number; y: number };
}

interface UseTextSelectionOptions {
  /** Reference to the PDF page container element */
  pageContainerRef: RefObject<HTMLDivElement | null>;
  /** Current zoom scale */
  scale: number;
  /** Whether selection is enabled */
  enabled?: boolean;
}

/**
 * Hook to capture text selection on a PDF page and convert to PDF coordinates.
 * Returns selection state that can be used to show a highlight popover.
 */
export function useTextSelection({
  pageContainerRef,
  scale,
  enabled = true,
}: UseTextSelectionOptions) {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSelection(null);
      return;
    }

    // Clear stale browser selection when re-enabling (defense-in-depth)
    // Prevents old selections from previous modal instances triggering popover
    window.getSelection()?.removeAllRanges();

    const handleMouseUp = () => {
      const pageContainer = pageContainerRef.current;
      if (!pageContainer) return;

      const windowSelection = window.getSelection();
      if (!windowSelection || windowSelection.isCollapsed) {
        setSelection(null);
        return;
      }

      const text = windowSelection.toString().trim();
      if (!text) {
        setSelection(null);
        return;
      }

      // Get selection range
      const range = windowSelection.getRangeAt(0);
      const clientRects = range.getClientRects();

      if (clientRects.length === 0) {
        setSelection(null);
        return;
      }

      // Check if selection is within the page container
      const pageRect = pageContainer.getBoundingClientRect();
      const firstRect = clientRects[0]!;
      const isWithinPage =
        firstRect.left >= pageRect.left &&
        firstRect.top >= pageRect.top &&
        firstRect.right <= pageRect.right + 50 && // Allow some tolerance
        firstRect.bottom <= pageRect.bottom + 50;

      if (!isWithinPage) {
        setSelection(null);
        return;
      }

      // Convert to PDF coordinates
      const pdfRects = selectionToPdfRects(clientRects, pageContainer, scale);
      const mergedRects = mergeAdjacentRects(pdfRects);

      if (mergedRects.length === 0) {
        setSelection(null);
        return;
      }

      // Calculate popover position (above the last selected line)
      const lastClientRect = clientRects[clientRects.length - 1]!;
      const popoverX = lastClientRect.left + lastClientRect.width / 2;
      const popoverY = lastClientRect.top - 10; // 10px above selection

      setSelection({
        text,
        rects: mergedRects,
        popoverPosition: { x: popoverX, y: popoverY },
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Clear selection on mousedown outside the popover area
      // This allows new selections to start fresh
      const target = e.target as HTMLElement;
      if (!target.closest('[data-highlight-popover]')) {
        setSelection(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear selection on Escape
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pageContainerRef, scale, enabled, clearSelection]);

  return { selection, clearSelection };
}
