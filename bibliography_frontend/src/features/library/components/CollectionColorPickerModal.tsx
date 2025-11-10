import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Collection } from '@/common/types';

interface CollectionColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
  onColorSelect: (color: string | null) => void;
  isLoading?: boolean;
}

const COLLECTION_COLORS = [
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

export const CollectionColorPickerModal: React.FC<CollectionColorPickerModalProps> = ({
  isOpen,
  onClose,
  collection,
  onColorSelect,
  isLoading = false,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(collection?.color || null);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color === selectedColor ? null : color);
  };

  const handleConfirm = () => {
    onColorSelect(selectedColor);
    onClose();
  };

  const handleRemoveColor = () => {
    onColorSelect(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pick a Color">
      <div className="space-y-6 p-6">
        {/* Color Grid */}
        <div className="grid grid-cols-3 gap-3">
          {COLLECTION_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`w-full aspect-square rounded-lg transition-all duration-200 border-2 ${
                selectedColor === color
                  ? 'border-app-accent scale-110 shadow-lg'
                  : 'border-transparent hover:scale-105 shadow-sm'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {selectedColor ? 'Apply Color' : 'Cancel'}
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
