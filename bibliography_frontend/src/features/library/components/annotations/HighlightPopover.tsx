import { createPortal } from 'react-dom';
import { cn } from '@/common/utils';
import { ZOTERO_COLORS } from './constants';

interface HighlightPopoverProps {
  /** Screen position for the popover */
  position: { x: number; y: number };
  /** Callback when a color is selected */
  onColorSelect: (color: string) => void;
  /** Callback to close the popover */
  onClose: () => void;
}

/**
 * Popover that appears when text is selected in the PDF.
 * Shows 5 Zotero color options for creating a highlight.
 */
export function HighlightPopover({
  position,
  onColorSelect,
  onClose,
}: HighlightPopoverProps) {
  // Adjust position to center horizontally and ensure it stays on screen
  const adjustedX = Math.max(80, Math.min(position.x - 80, window.innerWidth - 180));
  const adjustedY = Math.max(10, position.y);

  const popoverContent = (
    <div
      data-highlight-popover
      className={cn(
        'fixed z-[100] bg-gray-800 border border-gray-600 rounded-lg shadow-xl',
        'px-3 py-2 flex items-center gap-2',
        'animate-in fade-in-0 zoom-in-95 duration-150'
      )}
      style={{
        left: adjustedX,
        top: adjustedY,
        transform: 'translateY(-100%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Color buttons */}
      {ZOTERO_COLORS.map(({ hex, name }) => (
        <button
          key={hex}
          onClick={() => onColorSelect(hex)}
          className={cn(
            'w-7 h-7 rounded-full transition-all duration-150',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800',
            'border-2 border-transparent hover:border-white/50'
          )}
          style={{ backgroundColor: hex }}
          aria-label={`Highlight in ${name}`}
          title={name}
        />
      ))}

      {/* Divider */}
      <div className="w-px h-5 bg-gray-600 mx-1" />

      {/* Close button */}
      <button
        onClick={onClose}
        className={cn(
          'text-gray-400 hover:text-white text-sm px-2 py-1 rounded',
          'hover:bg-gray-700 transition-colors'
        )}
        aria-label="Cancel"
      >
        ✕
      </button>

      {/* Arrow pointing down */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgb(55, 65, 81)', // gray-700
        }}
      />
    </div>
  );

  // Render in a portal to escape the modal's overflow context
  return createPortal(popoverContent, document.body);
}
