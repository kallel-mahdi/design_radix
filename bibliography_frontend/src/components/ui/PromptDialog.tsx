import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

/**
 * Modal dialog with a text input for prompting user input.
 * Used for rename, create, and other text input operations.
 */
export const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  placeholder = 'Enter value...',
  initialValue = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset value when dialog opens
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      // Focus input after animation
      setTimeout(() => inputRef.current?.select(), 100);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-app-border bg-app-bg px-3 py-2 text-app-text-primary placeholder:text-app-text-tertiary focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent"
          disabled={isLoading}
          autoFocus
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!value.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
