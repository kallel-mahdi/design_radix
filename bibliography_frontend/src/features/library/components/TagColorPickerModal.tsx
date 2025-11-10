import React, { useState, useMemo } from 'react';
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

export const TagColorPickerModal: React.FC<TagColorPickerModalProps> = ({
  isOpen,
  onClose,
  tag,
  allTags,
  onColorAndPositionSelect,
  isLoading = false,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(tag?.color || null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(tag?.position || null);

  // Track which positions are occupied by other colored tags
  const occupiedPositions = useMemo(() => {
    return new Set(
      allTags
        .filter((t) => t.color && t.name !== tag?.name)
        .map((t) => t.position)
        .filter((p) => p !== null) as number[]
    );
  }, [allTags, tag?.name]);

  // Available positions (1-9) that are not occupied
  const availablePositions = Array.from({ length: 9 }, (_, i) => i + 1).filter(
    (pos) => !occupiedPositions.has(pos)
  );

  const handleColorSelect = (color: string) => {
    if (selectedColor === color) {
      setSelectedColor(null);
      setSelectedPosition(null);
    } else {
      setSelectedColor(color);
      // Auto-select the first available position
      const firstAvailable = availablePositions[0];
      if (firstAvailable) {
        setSelectedPosition(firstAvailable);
      }
    }
  };

  const handlePositionSelect = (position: number) => {
    setSelectedPosition(selectedPosition === position ? null : position);
  };

  const handleConfirm = () => {
    onColorAndPositionSelect(selectedColor, selectedPosition);
    onClose();
  };

  const handleRemoveColor = () => {
    onColorAndPositionSelect(null, null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Color & Position">
      <div className="space-y-6 p-6">
        {/* Color Grid with Positions */}
        <div>
          <p className="text-sm font-medium text-app-text-secondary mb-3">Select Color</p>
          <div className="grid grid-cols-3 gap-3">
            {TAG_COLORS.map((color, index) => {
              const position = index + 1;
              const isOccupied = occupiedPositions.has(position) && !selectedColor;
              const isSelected = selectedColor === color;

              return (
                <div key={color} className="relative">
                  <button
                    onClick={() => !isOccupied && handleColorSelect(color)}
                    disabled={isOccupied}
                    className={`w-full aspect-square rounded-lg transition-all duration-200 border-2 flex items-center justify-center font-bold text-white ${
                      isSelected
                        ? 'border-app-accent scale-110 shadow-lg'
                        : isOccupied
                          ? 'border-gray-500 opacity-40 cursor-not-allowed'
                          : 'border-transparent hover:scale-105 shadow-sm'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  >
                    {isOccupied ? '✕' : position}
                  </button>
                  {isOccupied && (
                    <p className="text-xs text-app-text-tertiary text-center mt-1">Taken</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Position Selector */}
        {selectedColor && (
          <div>
            <p className="text-sm font-medium text-app-text-secondary mb-3">Select Position (1-9)</p>
            <div className="grid grid-cols-3 gap-2">
              {availablePositions.map((position) => (
                <button
                  key={position}
                  onClick={() => handlePositionSelect(position)}
                  className={`py-2 px-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                    selectedPosition === position
                      ? 'border-app-accent bg-app-accent/20 text-app-text-primary'
                      : 'border-app-border text-app-text-secondary hover:border-app-accent'
                  }`}
                >
                  {position}
                </button>
              ))}
            </div>
            {availablePositions.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                All positions are occupied. Remove color from another tag first.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || !!(selectedColor && !selectedPosition)}
            className="flex-1"
          >
            {selectedColor && selectedPosition ? 'Apply Color & Position' : 'Cancel'}
          </Button>
          {selectedColor && (
            <Button
              variant="ghost"
              onClick={handleRemoveColor}
              disabled={isLoading}
              className="flex-1"
            >
              Remove Color
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
