import { useMemo } from 'react';
import { TrashIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import type { Annotation } from '@/common/types';
import { cn } from '@/common/utils';

interface AnnotationSidebarProps {
  /** All annotations for the current reference */
  annotations: Annotation[];
  /** Currently selected annotation ID */
  selectedId: string | null;
  /** Callback when annotation is clicked (to navigate to it) */
  onAnnotationClick: (annotation: Annotation) => void;
  /** Callback when delete is clicked */
  onAnnotationDelete: (annotation: Annotation) => void;
}

/**
 * Sidebar panel listing all annotations for a PDF.
 * Shows text excerpt, page number, and color indicator.
 * Click navigates to the annotation in the PDF.
 */
export function AnnotationSidebar({
  annotations,
  selectedId,
  onAnnotationClick,
  onAnnotationDelete,
}: AnnotationSidebarProps) {
  // Sort by sortIndex (page position order)
  const sortedAnnotations = useMemo(
    () => [...annotations].sort((a, b) => a.sortIndex.localeCompare(b.sortIndex)),
    [annotations]
  );

  return (
    <div className="w-64 border-l border-gray-700 bg-gray-850 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-900">
        <h3 className="text-sm font-medium text-gray-200">
          Annotations ({annotations.length})
        </h3>
      </div>

      {/* Annotation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedAnnotations.map((annotation) => (
          <AnnotationItem
            key={annotation._id}
            annotation={annotation}
            isSelected={selectedId === annotation._id}
            onClick={() => onAnnotationClick(annotation)}
            onDelete={() => onAnnotationDelete(annotation)}
          />
        ))}

        {/* Empty state */}
        {annotations.length === 0 && (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-gray-400">No annotations yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Select text to create a highlight
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AnnotationItemProps {
  annotation: Annotation;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function AnnotationItem({
  annotation,
  isSelected,
  onClick,
  onDelete,
}: AnnotationItemProps) {
  const hasComment = annotation.content.comment && annotation.content.comment.trim();

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-2.5 rounded-lg cursor-pointer transition-colors group',
        'hover:bg-gray-700/50',
        isSelected && 'bg-gray-700 ring-1 ring-app-accent/50'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Color indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: annotation.color }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Highlighted text */}
          {annotation.content.text && (
            <p className="text-sm text-gray-200 line-clamp-2 leading-snug">
              &ldquo;{annotation.content.text}&rdquo;
            </p>
          )}

          {/* Comment indicator */}
          {hasComment && (
            <div className="flex items-center gap-1 mt-1">
              <ChatBubbleLeftIcon className="w-3 h-3 text-gray-500" />
              <p className="text-xs text-gray-400 truncate">
                {annotation.content.comment}
              </p>
            </div>
          )}

          {/* Note-only annotation (no highlighted text) */}
          {!annotation.content.text && annotation.content.comment && (
            <p className="text-sm text-gray-300 line-clamp-2 leading-snug italic">
              {annotation.content.comment}
            </p>
          )}

          {/* Page number */}
          <p className="text-xs text-gray-500 mt-1">
            Page {annotation.pageIndex + 1}
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={cn(
            'p-1 rounded opacity-0 group-hover:opacity-100',
            'text-gray-500 hover:text-red-400 hover:bg-gray-600/50',
            'transition-all duration-150'
          )}
          aria-label="Delete annotation"
          title="Delete annotation"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
