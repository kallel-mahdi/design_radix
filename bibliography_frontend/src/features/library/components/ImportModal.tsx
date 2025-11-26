import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useImportFromDoiMutation, useImportFromBibtexMutation } from '../api/import.mutations';
import { useUIStore } from '@/store/ui.store';
import { isValidDoi, normalizeDoi } from '@/common/utils/validation';
import { cn } from '@/common/utils';
import type { ApiError } from '@/common/api/client';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIN_LOADING_DURATION_MS = 250;

type ImportTab = 'doi' | 'bibtex';

/**
 * ImportModal Component - Multi-Source Import (Session 12)
 *
 * Modal for importing references from:
 * 1. DOI via Crossref API (one-step flow)
 * 2. BibTeX string/paste (with preview option)
 *
 * Follows Zotero's one-step pattern: create reference immediately, no preview.
 *
 * User flow (DOI):
 * 1. Enter DOI → Click "Import" → Reference created immediately
 *
 * User flow (BibTeX):
 * 1. Paste BibTeX → Click "Import" → References created immediately
 *
 * See: docs/sessions/06-plan.md (DOI), docs/sessions/11-14-plan.md (BibTeX)
 */
export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ImportTab>('doi');

  // DOI state
  const [doi, setDoi] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // BibTeX state
  const [bibtexContent, setBibtexContent] = useState('');
  const [bibtexError, setBibtexError] = useState('');

  const importDoiMutation = useImportFromDoiMutation();
  const importBibtexMutation = useImportFromBibtexMutation();

  const isDoiValid = Boolean(doi.trim()) && isValidDoi(doi);
  const isBusy = isProcessing || importDoiMutation.isPending || importBibtexMutation.isPending;

  const handleDoiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDoi(value);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleImportDoi = async () => {
    if (!isDoiValid) {
      setValidationError('Invalid DOI format. Expected format: 10.xxxx/xxxxx');
      return;
    }

    const startTime = Date.now();
    setIsProcessing(true);

    try {
      const normalizedDoi = normalizeDoi(doi);
      await importDoiMutation.mutateAsync({ doi: normalizedDoi });
      setDoi('');
      setValidationError('');
    } catch (error) {
      const apiError = (error && typeof error === 'object' && 'message' in error) ? (error as ApiError) : null;
      const errorMessage = apiError?.message || (error instanceof Error ? error.message : 'Unknown error');

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
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = MIN_LOADING_DURATION_MS - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setIsProcessing(false);
    }
  };

  const handleImportBibtex = async () => {
    if (!bibtexContent.trim()) {
      setBibtexError('Please paste BibTeX content');
      return;
    }

    const startTime = Date.now();
    setIsProcessing(true);

    try {
      const result = await importBibtexMutation.mutateAsync({
        bibtex: bibtexContent,
        createImmediately: true,
      });

      // Show feedback based on results
      if (result.parseErrors.length > 0 && result.created.length === 0) {
        setBibtexError(`Parse error: ${result.parseErrors[0]?.message || 'Unknown parse error'}`);
      } else if (result.parsed.length === 0) {
        setBibtexError('No BibTeX entries found. Check your input format.');
      } else {
        // Success - clear the input
        setBibtexContent('');
        setBibtexError('');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useUIStore.getState().addToast({
        message: `BibTeX import failed: ${errorMessage}`,
        type: 'error',
      });
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
    setDoi('');
    setValidationError('');
    setBibtexContent('');
    setBibtexError('');
    setIsProcessing(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isDoiValid && !isBusy) {
      e.preventDefault();
      handleImportDoi();
    }
  };

  const tabIndex = activeTab === 'doi' ? 0 : 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import References"
      description="Import from DOI or BibTeX"
      className="max-w-2xl"
    >
      <Tab.Group
        selectedIndex={tabIndex}
        onChange={(index) => setActiveTab(index === 0 ? 'doi' : 'bibtex')}
      >
        <Tab.List className="flex border-b border-app-border mb-4">
          {['DOI', 'BibTeX'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                cn(
                  'px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-app-accent',
                  selected
                    ? 'border-b-2 border-app-accent text-app-accent'
                    : 'text-app-text-secondary hover:text-app-text-primary',
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* DOI Tab */}
          <Tab.Panel className="space-y-4">
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

            <Button
              onClick={handleImportDoi}
              disabled={!isDoiValid || isBusy}
              loading={isBusy && activeTab === 'doi'}
              variant="primary"
              className="w-full"
            >
              {isBusy && activeTab === 'doi' ? 'Importing...' : 'Import from DOI'}
            </Button>

            <p className="text-xs text-app-text-secondary text-center">
              Reference will be added to your library immediately.
            </p>
          </Tab.Panel>

          {/* BibTeX Tab */}
          <Tab.Panel className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="bibtex-input" className="block text-sm font-medium text-app-text-primary">
                BibTeX Content
              </label>
              <textarea
                id="bibtex-input"
                value={bibtexContent}
                onChange={(e) => {
                  setBibtexContent(e.target.value);
                  if (bibtexError) setBibtexError('');
                }}
                placeholder={`@article{smith2024,
  title = {Example Title},
  author = {Smith, John and Doe, Jane},
  year = {2024},
  journal = {Journal Name}
}`}
                className={cn(
                  'w-full h-48 px-3 py-2 text-sm font-mono rounded-md border bg-app-surface text-app-text-primary',
                  'placeholder:text-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-accent',
                  bibtexError ? 'border-red-500' : 'border-app-border'
                )}
                disabled={isBusy}
              />
              {bibtexError && (
                <p className="text-sm text-red-500">{bibtexError}</p>
              )}
              <p className="text-xs text-app-text-secondary">
                Paste BibTeX entries. Multiple entries will be imported at once.
              </p>
            </div>

            <Button
              onClick={handleImportBibtex}
              disabled={!bibtexContent.trim() || isBusy}
              loading={isBusy && activeTab === 'bibtex'}
              variant="primary"
              className="w-full"
            >
              {isBusy && activeTab === 'bibtex' ? 'Importing...' : 'Import from BibTeX'}
            </Button>

            <p className="text-xs text-app-text-secondary text-center">
              References will be created immediately from parsed BibTeX entries.
            </p>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Modal>
  );
};
