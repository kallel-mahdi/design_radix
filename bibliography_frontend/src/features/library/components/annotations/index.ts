export { AnnotationLayer } from './AnnotationLayer';
export { AnnotationPopup } from './AnnotationPopup';
export { AnnotationSidebar } from './AnnotationSidebar';
export { HighlightPopover } from './HighlightPopover';
export { useTextSelection, type TextSelection } from './useTextSelection';
export { ZOTERO_COLORS, DEFAULT_HIGHLIGHT_COLOR } from './constants';
export {
  pdfToScreenRect,
  screenToPdfRect,
  selectionToPdfRects,
  mergeAdjacentRects,
  generateSortIndex,
  getBoundingRect,
  type PdfRect,
  type ScreenRect,
} from './coordinateUtils';
