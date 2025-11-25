import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Annotation } from '@/common/types';
import { cn } from '@/common/utils';
import { ZOTERO_COLORS } from './constants';

interface AnnotationPopupProps {
  /** The annotation being edited */
  annotation: Annotation;
  /** Screen position for the popup */
  position: { x: number; y: number };
  /** Callback when annotation is updated */
  onSave: (data: { comment?: string; color?: string }) => void;
  /** Callback when annotation is deleted */
  onDelete: () => void;
  /** Callback to close the popup */
  onClose: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
}

/**
 * Popup for editing an annotation's comment and color.
 * Appears when clicking on a highlight in the PDF.
 */
export function AnnotationPopup({
  annotation,
  position,
  onSave,
  onDelete,
  onClose,
  isSaving = false,
}: AnnotationPopupProps) {
  const [comment, setComment] = useState(annotation.content.comment || '');
  const [selectedColor, setSelectedColor] = useState(annotation.color);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const commentChanged = comment !== (annotation.content.comment || '');
    const colorChanged = selectedColor !== annotation.color;
    setHasChanges(commentChanged || colorChanged);
  }, [comment, selectedColor, annotation]);

  // Adjust position to stay on screen
  const adjustedX = Math.max(20, Math.min(position.x - 160, window.innerWidth - 340));
  const adjustedY = Math.max(20, Math.min(position.y, window.innerHeight - 350));

  const handleSave = () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    const updates: { comment?: string; color?: string } = {};
    if (comment !== (annotation.content.comment || '')) {
      updates.comment = comment;
    }
    if (selectedColor !== annotation.color) {
      updates.color = selectedColor;
    }
    onSave(updates);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  const popupContent = (
    <div
      data-annotation-popup
      className={cn(
        'fixed z-[100] bg-gray-800 border border-gray-600 rounded-lg shadow-xl',
        'w-80 animate-in fade-in-0 zoom-in-95 duration-150'
      )}
      style={{ left: adjustedX, top: adjustedY }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-200">Edit Annotation</span>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
          aria-label="Close"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Highlighted text (read-only) */}
        {annotation.content.text && (
          <div>
            <label className="text-xs text-gray-400 block mb-1">Highlighted text</label>
            <p className="text-sm text-gray-300 bg-gray-700/50 rounded px-2 py-1.5 line-clamp-3">
              &ldquo;{annotation.content.text}&rdquo;
            </p>
          </div>
        )}

        {/* Comment textarea */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Note</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a note..."
            className={cn(
              'w-full px-2 py-1.5 text-sm rounded resize-none',
              'bg-gray-700 border border-gray-600 text-white',
              'placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent'
            )}
            rows={3}
            autoFocus
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Color</label>
          <div className="flex gap-2">
            {ZOTERO_COLORS.map(({ hex, name }) => (
              <button
                key={hex}
                onClick={() => setSelectedColor(hex)}
                className={cn(
                  'w-7 h-7 rounded-full transition-all duration-150',
                  'hover:scale-110 focus:outline-none',
                  'border-2',
                  selectedColor === hex
                    ? 'border-white scale-110'
                    : 'border-transparent hover:border-white/50'
                )}
                style={{ backgroundColor: hex }}
                aria-label={name}
                title={name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-700 bg-gray-850 rounded-b-lg">
        <button
          onClick={onDelete}
          className={cn(
            'flex items-center gap-1 px-2 py-1 text-sm rounded',
            'text-red-400 hover:text-red-300 hover:bg-red-900/30',
            'transition-colors'
          )}
        >
          <TrashIcon className="w-4 h-4" />
          Delete
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-300 hover:text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'px-3 py-1 text-sm rounded font-medium',
              'bg-app-accent text-white hover:bg-app-accent/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
}
