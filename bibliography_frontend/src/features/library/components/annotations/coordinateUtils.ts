/**
 * Coordinate conversion utilities for PDF annotations
 *
 * PDF coordinates are stored as absolute values in PDF space (points).
 * Screen coordinates depend on the current zoom scale.
 *
 * Conversion: screenCoord = pdfCoord * scale
 *             pdfCoord = screenCoord / scale
 */

export type PdfRect = [number, number, number, number]; // [x1, y1, x2, y2]

export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert a PDF rect to screen coordinates for rendering
 */
export function pdfToScreenRect(rect: PdfRect, scale: number): ScreenRect {
  const [x1, y1, x2, y2] = rect;
  return {
    x: x1 * scale,
    y: y1 * scale,
    width: (x2 - x1) * scale,
    height: (y2 - y1) * scale,
  };
}

/**
 * Convert screen coordinates to PDF rect
 */
export function screenToPdfRect(
  screenRect: DOMRect,
  pageRect: DOMRect,
  scale: number
): PdfRect {
  return [
    (screenRect.left - pageRect.left) / scale,
    (screenRect.top - pageRect.top) / scale,
    (screenRect.right - pageRect.left) / scale,
    (screenRect.bottom - pageRect.top) / scale,
  ];
}

/**
 * Convert multiple DOMRects from a selection to PDF rects
 */
export function selectionToPdfRects(
  clientRects: DOMRectList,
  pageElement: HTMLElement,
  scale: number
): PdfRect[] {
  const pageRect = pageElement.getBoundingClientRect();

  return Array.from(clientRects)
    .filter(rect => rect.width > 1 && rect.height > 1) // Filter tiny artifacts
    .map(rect => screenToPdfRect(rect, pageRect, scale));
}

/**
 * Merge adjacent/overlapping rects to reduce annotation complexity
 * Zotero does this to avoid storing dozens of tiny rects
 */
export function mergeAdjacentRects(rects: PdfRect[], tolerance = 2): PdfRect[] {
  if (rects.length <= 1) return rects;

  // Sort by y then x
  const sorted = [...rects].sort((a, b) => {
    const yDiff = a[1] - b[1];
    if (Math.abs(yDiff) > tolerance) return yDiff;
    return a[0] - b[0];
  });

  const merged: PdfRect[] = [];
  let current: PdfRect = sorted[0]!;

  for (let i = 1; i < sorted.length; i++) {
    const next: PdfRect = sorted[i]!;
    // Check if on same line (similar y) and adjacent/overlapping
    const sameLine = Math.abs(current[1] - next[1]) < tolerance;
    const adjacent = next[0] - current[2] < tolerance;

    if (sameLine && adjacent) {
      // Merge: extend current rect to include next
      current = [
        Math.min(current[0], next[0]),
        Math.min(current[1], next[1]),
        Math.max(current[2], next[2]),
        Math.max(current[3], next[3]),
      ];
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  return merged;
}

/**
 * Generate Zotero-style sortIndex for ordering annotations
 * Format: "XXXXX|YYYYY|ZZZZZ"
 * - XXXXX: Page number (5-digit, zero-padded)
 * - YYYYY: Y position (5-digit, zero-padded, scaled 0-99999)
 * - ZZZZZ: X position (5-digit, zero-padded, scaled 0-99999)
 */
export function generateSortIndex(
  pageIndex: number,
  rects: PdfRect[]
): string {
  if (rects.length === 0) {
    // Fallback for empty rects (shouldn't happen in practice)
    return `${String(pageIndex).padStart(5, '0')}|00000|00000`;
  }
  const firstRect = rects[0]!;
  const page = String(pageIndex).padStart(5, '0');
  // Scale to 0-99999 range (assuming max page size ~1000 points)
  const y = String(Math.round(firstRect[1] * 100)).padStart(5, '0');
  const x = String(Math.round(firstRect[0] * 100)).padStart(5, '0');
  return `${page}|${y}|${x}`;
}

/**
 * Get bounding box of all rects combined
 */
export function getBoundingRect(rects: PdfRect[]): PdfRect | null {
  if (rects.length === 0) return null;
  return [
    Math.min(...rects.map((r) => r[0])),
    Math.min(...rects.map((r) => r[1])),
    Math.max(...rects.map((r) => r[2])),
    Math.max(...rects.map((r) => r[3])),
  ];
}
