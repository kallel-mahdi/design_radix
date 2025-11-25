import { cn } from '@/common/utils';
import type { Annotation } from '@/common/types';
import { pdfToScreenRect, type PdfRect } from './coordinateUtils';
import {
  HIGHLIGHT_FILL_OPACITY,
  HIGHLIGHT_SELECTED_OPACITY,
} from './constants';

interface AnnotationLayerProps {
  /** Annotations to render on this page */
  annotations: Annotation[];
  /** Current zoom scale (0.5 to 3.0) */
  scale: number;
  /** Page dimensions in PDF coordinates */
  pageWidth: number;
  pageHeight: number;
  /** Currently selected annotation ID */
  selectedId: string | null;
  /** Callback when annotation is clicked */
  onAnnotationClick: (annotation: Annotation) => void;
}

/**
 * SVG overlay that renders highlight annotations on top of a PDF page.
 * Positioned absolutely over the react-pdf Page component.
 */
export function AnnotationLayer({
  annotations,
  scale,
  pageWidth,
  pageHeight,
  selectedId,
  onAnnotationClick,
}: AnnotationLayerProps) {
  if (annotations.length === 0) return null;

  const width = pageWidth * scale;
  const height = pageHeight * scale;

  return (
    <svg
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width, height }}
    >
      {annotations.map((annotation) => (
        <AnnotationHighlight
          key={annotation._id}
          annotation={annotation}
          scale={scale}
          isSelected={selectedId === annotation._id}
          onClick={() => onAnnotationClick(annotation)}
        />
      ))}
    </svg>
  );
}

interface AnnotationHighlightProps {
  annotation: Annotation;
  scale: number;
  isSelected: boolean;
  onClick: () => void;
}

function AnnotationHighlight({
  annotation,
  scale,
  isSelected,
  onClick,
}: AnnotationHighlightProps) {
  const rects = annotation.position.rects as PdfRect[];

  return (
    <g
      className="pointer-events-auto cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {rects.map((rect, index) => {
        const screen = pdfToScreenRect(rect, scale);
        return (
          <rect
            key={index}
            x={screen.x}
            y={screen.y}
            width={screen.width}
            height={screen.height}
            fill={annotation.color}
            fillOpacity={
              isSelected
                ? HIGHLIGHT_SELECTED_OPACITY
                : HIGHLIGHT_FILL_OPACITY
            }
            className={cn(
              'transition-opacity duration-150',
              !isSelected && 'hover:fill-opacity-60'
            )}
            style={{
              // CSS hover doesn't work reliably with fillOpacity, so we use a class
              // but keep the inline style for the actual opacity value
            }}
          />
        );
      })}
      {/* Invisible larger hit area for easier clicking */}
      {rects.map((rect, index) => {
        const screen = pdfToScreenRect(rect, scale);
        return (
          <rect
            key={`hit-${index}`}
            x={screen.x - 2}
            y={screen.y - 2}
            width={screen.width + 4}
            height={screen.height + 4}
            fill="transparent"
          />
        );
      })}
    </g>
  );
}
