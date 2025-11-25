import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Tag } from '@/common/types';

interface TagColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: Tag | null;
  allTags: Tag[];
  onColorAndPositionSelect: (color: string | null, position: number | null) => void;
  isLoading?: boolean;
}

const TAG_COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // blue
  '#FFA07A', // salmon
  '#98D8C8', // mint
  '#F7DC6F', // yellow
  '#BB8FCE', // purple
  '#85C1E2', // light blue
  '#F8B88B', // peach
];

// Color names for accessibility
const COLOR_NAMES: Record<string, string> = {
  '#FF6B6B': 'Red',
  '#4ECDC4': 'Teal',
  '#45B7D1': 'Blue',
  '#FFA07A': 'Salmon',
  '#98D8C8': 'Mint',
  '#F7DC6F': 'Yellow',
  '#BB8FCE': 'Purple',
  '#85C1E2': 'Light Blue',
  '#F8B88B': 'Peach',
};

export const TagColorPickerModal: React.FC<TagColorPickerModalProps> = ({
  isOpen,
  onClose,
  tag,
  allTags,
  onColorAndPositionSelect,
  isLoading = false,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  // Get positions used by OTHER tags (not the current tag)
  const usedPositions = useMemo(() => {
    return new Set(
      allTags
        .filter((t) => t.position !== null && t.name !== tag?.name)
        .map((t) => t.position) as number[]
    );
  }, [allTags, tag?.name]);

  // Get colors used by OTHER tags
  const usedColors = useMemo(() => {
    return new Set(
      allTags
        .filter((t) => t.color && t.name !== tag?.name)
        .map((t) => t.color) as string[]
    );
  }, [allTags, tag?.name]);

  // Available positions (1-9 that are not used by other tags, plus current tag's position)
  const availablePositions = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      (pos) => !usedPositions.has(pos) || pos === tag?.position
    );
  }, [usedPositions, tag?.position]);

  // Pre-select color and position when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (tag?.color) {
      // Existing colored tag: show current color and position
      setSelectedColor(tag.color);
      setSelectedPosition(tag.position);
    } else {
      // New tag or uncolored tag: pick random unused color and next available position
      const unusedColors = TAG_COLORS.filter((c) => !usedColors.has(c));
      if (unusedColors.length > 0) {
        const randomIndex = Math.floor(Math.random() * unusedColors.length);
        const randomColor = unusedColors[randomIndex];
        setSelectedColor(randomColor ?? null);
      } else {
        setSelectedColor(null);
      }

      // Auto-select next available position
      const nextPos = availablePositions[0] || null;
      setSelectedPosition(nextPos);
    }
  }, [isOpen, tag, usedColors, availablePositions]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(selectedColor === color ? null : color);
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPosition(value ? parseInt(value, 10) : null);
  };

  const handleSetColor = () => {
    onColorAndPositionSelect(selectedColor, selectedPosition);
    onClose();
  };

  const handleRemoveColor = () => {
    onColorAndPositionSelect(null, null);
    onClose();
  };

  const hasExistingColor = tag?.color !== null && tag?.color !== undefined;
  const allPositionsOccupied = availablePositions.length === 0;
  const canSetColor = selectedColor && selectedPosition && !allPositionsOccupied;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Tag Color">
      <div className="space-y-6 p-6">
        {/* Color and Position - Side by Side */}
        <div className="flex gap-8">
          {/* Color Picker */}
          <div className="flex-1">
            <p className="text-sm font-medium text-app-text-secondary mb-3">Color</p>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                const colorName = COLOR_NAMES[color] || color;

                return (
                  <button
                    key={color}
                    data-testid="color-swatch"
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full transition-all duration-200 border-2 ${
                      isSelected
                        ? 'border-app-accent scale-110 shadow-lg ring-2 ring-app-accent ring-offset-2 ring-offset-app-bg-primary'
                        : 'border-transparent hover:scale-105 shadow-sm'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${colorName}`}
                    aria-pressed={isSelected}
                  />
                );
              })}
            </div>
          </div>

          {/* Position Dropdown */}
          <div className="w-40">
            <p className="text-sm font-medium text-app-text-secondary mb-3">
              Position
              <span className="block text-xs text-app-text-tertiary font-normal">
                (keyboard shortcut)
              </span>
            </p>
            <select
              value={selectedPosition ?? ''}
              onChange={handlePositionChange}
              disabled={allPositionsOccupied}
              className="w-full px-3 py-2 rounded-lg border border-app-border bg-app-bg-secondary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-app-accent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Select position"
            >
              {availablePositions.length === 0 ? (
                <option value="">No positions available</option>
              ) : (
                availablePositions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Keyboard Instruction */}
        {selectedPosition && (
          <div className="bg-app-bg-secondary rounded-lg p-3 border border-app-border">
            <p className="text-sm text-app-text-secondary">
              Press <kbd className="px-2 py-1 bg-app-bg-tertiary rounded text-app-text-primary font-mono font-bold">{selectedPosition}</kbd> to add/remove this tag from selected items
            </p>
          </div>
        )}

        {/* Max Tags Info */}
        <p className="text-xs text-app-text-tertiary">
          Maximum of 9 tags can have colors assigned at a time
        </p>

        {/* Warning when all positions occupied */}
        {allPositionsOccupied && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              All positions are occupied. Remove color from another tag first.
            </p>
          </div>
        )}

        {/* Action Buttons - Always visible */}
        <div className="flex gap-3 pt-2">
          {hasExistingColor && (
            <Button
              variant="ghost"
              onClick={handleRemoveColor}
              disabled={isLoading}
            >
              Remove Color
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSetColor}
            disabled={isLoading || !canSetColor}
          >
            Set Color
          </Button>
        </div>
      </div>
    </Modal>
  );
};
