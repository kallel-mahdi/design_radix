/**
 * Annotation constants following Zotero patterns
 * Reference: zotero/chrome/content/zotero/xpcom/data/annotations.js
 */

// Zotero's 5 standard annotation colors
export const ZOTERO_COLORS = [
  { hex: '#ffd400', name: 'Yellow' },
  { hex: '#ff6666', name: 'Red' },
  { hex: '#2ea8e5', name: 'Blue' },
  { hex: '#a28ae5', name: 'Purple' },
  { hex: '#5fb236', name: 'Green' },
] as const;

export const DEFAULT_HIGHLIGHT_COLOR = '#ffd400'; // Yellow

// Highlight opacity for rendering (50% opacity)
export const HIGHLIGHT_FILL_OPACITY = 0.4;
export const HIGHLIGHT_HOVER_OPACITY = 0.6;
export const HIGHLIGHT_SELECTED_OPACITY = 0.7;
