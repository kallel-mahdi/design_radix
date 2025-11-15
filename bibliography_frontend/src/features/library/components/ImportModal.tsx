import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useImportFromDoiMutation } from '../api/import.queries';
import { useUIStore } from '@/store/ui.store';
import { isValidDoi, normalizeDoi } from '@/common/utils/validation';
import type { ApiError } from '@/common/api/client';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIN_LOADING_DURATION_MS = 250;

/**
 * ImportModal Component - One-Step Flow (Zotero Pattern)
 *
 * Modal for importing references from DOI via Crossref API.
 * Follows Zotero's one-step pattern: create reference immediately, no preview.
 *
 * User flow:
 * 1. Enter DOI
 * 2. Click "Import Reference" (or press Enter)
 * 3. Reference created immediately in database
 * 4. Success toast shown
 * 5. Input cleared for next import (modal stays open)
 *
 * Sequential import pattern: user can import multiple DOIs one-by-one
 * without closing modal (like Zotero's lookup panel).
 *
 * See: docs/sessions/06-plan.md for architecture decisions
 */
export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [doi, setDoi] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const importMutation = useImportFromDoiMutation();

  const isDoiValid = Boolean(doi.trim()) && isValidDoi(doi);
  const isBusy = isProcessing || importMutation.isPending;

  const handleDoiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDoi(value);

    // Clear validation error when user types
    if (validationError) {
      setValidationError('');
    }
  };

  const handleImportReference = async () => {
    if (!isDoiValid) {
      setValidationError('Invalid DOI format. Expected format: 10.xxxx/xxxxx');
      return;
    }

    const startTime = Date.now();
    setIsProcessing(true);

    try {
      const normalizedDoi = normalizeDoi(doi);

      // One-step: Creates reference immediately
      await importMutation.mutateAsync({ doi: normalizedDoi });

      // Success: clear input for next import (modal stays open)
      setDoi('');
      setValidationError('');

      // Success toast already shown by mutation's onSuccess handler
    } catch (error) {
      const apiError = (error && typeof error === 'object' && 'message' in error) ? (error as ApiError) : null;
      const errorMessage = apiError?.message || (error instanceof Error ? error.message : 'Unknown error');

      // Show specific error messages based on error type
      let toastMessage = 'Failed to import reference';

      if (errorMessage.includes('DOI not found')) {
        toastMessage = 'DOI not found. Please check the DOI and try again.';
      } else if (errorMessage.includes('Rate limit exceeded')) {
        toastMessage = 'Rate limit exceeded. Please try again in a few moments.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Network error')) {
        toastMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('already exists')) {
        toastMessage = 'Reference already exists in your library.';
      }

      useUIStore.getState().addToast({
        message: toastMessage,
        type: 'error',
      });

      // Modal stays open on error - allows user to fix typos
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = MIN_LOADING_DURATION_MS - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setDoi('');
    setValidationError('');
    setIsProcessing(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isDoiValid && !isBusy) {
      e.preventDefault();
      handleImportReference();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Reference"
      description="Import reference metadata from DOI via Crossref"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* DOI Input Section */}
        <div className="space-y-2">
          <label htmlFor="doi-input" className="block text-sm font-medium text-app-text-primary">
            DOI
          </label>
          <Input
            id="doi-input"
            type="text"
            value={doi}
            onChange={handleDoiChange}
            onKeyDown={handleKeyDown}
            placeholder="10.xxxx/xxxxx"
            variant={validationError ? 'error' : 'default'}
            className="w-full"
            disabled={isBusy}
            autoFocus
          />
          {validationError && (
            <p className="text-sm text-red-500">{validationError}</p>
          )}
          <p className="text-xs text-app-text-secondary">
            Enter DOI and press Enter to import. Example: 10.1145/3411764.3445518
          </p>
        </div>

        {/* Import Button */}
        <Button
          onClick={handleImportReference}
          disabled={!isDoiValid || isBusy}
          loading={isBusy}
          variant="primary"
          className="w-full"
        >
          {isBusy ? 'Importing...' : 'Import Reference'}
        </Button>

        {/* Help text */}
        <p className="text-xs text-app-text-secondary text-center">
          Reference will be added to your library immediately. Modal will stay open for importing more references.
        </p>
      </div>
    </Modal>
  );
};
