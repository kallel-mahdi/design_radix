/**
 * Reference Creation/Edit Modal Component
 *
 * Full-featured modal for creating and editing references with:
 * - Dual-mode author entry (structured firstName/lastName OR single name field)
 * - Form validation with inline error display
 * - Keyboard shortcuts (Cmd+Enter to save, Escape to cancel)
 * - Optimistic updates via React Query mutations
 *
 * Referenced patterns:
 * - Zotero dual-mode creator entry: zotero/chrome/content/zotero/xpcom/data/creators.js:176-242
 * - Zotero item editor UI: zotero/chrome/content/zotero/elements/itemBox.js:1162-1195
 * - Editor Modal component: editor_frontend/src/components/ui/Modal.tsx
 *
 * Deviations from Zotero:
 * - Modal dialog instead of in-place editing (web UX vs desktop UX)
 * - No collection/tag assignment in modal (deferred to post-creation workflows)
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useForm, useFieldArray, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useModalState, useUIStore } from '@/store/ui.store';
import { useReferenceQuery } from '../api/references.queries';
import {
  useCreateReferenceMutation,
  useUpdateReferenceMutation,
} from '../api/references.mutations';
import { ReferenceFormSchema, formDataToCreateInput, formDataToUpdateInput, type ReferenceFormData } from '../types/schemas';
import { useLibraryStore } from '../store/library.store';

interface ReferenceModalProps {
  referenceId?: string; // If provided, edit mode
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ referenceId }) => {
  const isOpen = useModalState('reference-modal');
  const { closeModal } = useUIStore();
  const setEditReference = useLibraryStore((state) => state.setEditReference);
  const createMutation = useCreateReferenceMutation();
  const updateMutation = useUpdateReferenceMutation();

  const isEditMode = !!referenceId;

  // Fetch reference data in edit mode
  const { data: reference } = useReferenceQuery(referenceId, isEditMode && isOpen);

  // Track author field modes: 'structured' (firstName/lastName) or 'single' (full name only)
  // Matches Zotero's fieldMode: 0 = structured, 1 = single
  // Uses field.id as key to survive author removal/reordering
  const [authorModes, setAuthorModes] = useState<Record<string, 'structured' | 'single'>>({});

  // Form setup with Zod validation
  const form = useForm<ReferenceFormData>({
    resolver: zodResolver(ReferenceFormSchema) as any,
    defaultValues: {
      type: 'article',
      title: '',
      authors: [{ given: '', family: '', full: '' }],
      year: undefined,
      venue: '',
      doi: '',
      url: '',
      abstract: '',
      tags: [],
      collectionIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'authors',
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (reference && isEditMode) {
      form.reset({
        type: reference.type,
        title: reference.title,
        authors: reference.authors.length > 0 ? reference.authors : [{ given: '', family: '', full: '' }],
        year: reference.year ?? undefined,
        venue: reference.venue ?? '',
        doi: reference.doi ?? '',
        url: reference.url ?? '',
        abstract: reference.abstract ?? '',
        tags: reference.tags,
        collectionIds: reference.collectionIds,
      });

      // Initialize author modes based on existing data
      // Note: After form.reset, useFieldArray will regenerate field IDs
      // We need to wait for fields to update, then initialize modes
      // This happens in a separate effect that watches fields.length
      const modes: Record<string, 'structured' | 'single'> = {};
      reference.authors.forEach((author, index) => {
        // Temporary: use index as string key until fields are ready
        // Will be replaced by field.id in the next effect
        modes[String(index)] = (author.given || author.family) ? 'structured' : 'single';
      });
      setAuthorModes(modes);
    }
  }, [reference, isEditMode, form]);

  // Sync authorModes from index-based keys to id-based keys after fields update
  // This handles edit mode when useFieldArray regenerates field IDs after form.reset
  useEffect(() => {
    if (fields.length > 0) {
      setAuthorModes((prev) => {
        const newModes: Record<string, 'structured' | 'single'> = {};
        fields.forEach((field, index) => {
          // Check if we have a mode for this field.id already
          if (prev[field.id]) {
            newModes[field.id] = prev[field.id];
          }
          // Otherwise check if we have a temporary index-based mode (from edit mode init)
          else if (prev[String(index)]) {
            newModes[field.id] = prev[String(index)];
          }
          // Otherwise default to structured
          else {
            newModes[field.id] = 'structured';
          }
        });
        return newModes;
      });
    }
  }, [fields]);

  // Auto-focus title field when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => form.setFocus('title'), 100);
    }
  }, [isOpen, form]);

  // Handle form submission
  const onSubmit: SubmitHandler<ReferenceFormData> = useCallback(async (data) => {
    try {
      if (isEditMode && referenceId) {
        await updateMutation.mutateAsync({
          id: referenceId,
          data: formDataToUpdateInput(data),
        });
      } else {
        await createMutation.mutateAsync(formDataToCreateInput(data));
      }
      closeModal('reference-modal');
      setEditReference(null);
      form.reset();
      setAuthorModes({});
    } catch (error) {
      // Error toast handled by mutation
      console.error('Form submission error:', error);
    }
  }, [isEditMode, referenceId, updateMutation, createMutation, closeModal, setEditReference, form]);

  // Handle modal close
  const handleClose = useCallback(() => {
    closeModal('reference-modal');
    setEditReference(null);
    form.reset();
    setAuthorModes({});
  }, [closeModal, setEditReference, form]);

  // Keyboard shortcuts: Cmd+Enter to save, Escape to cancel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, form, onSubmit, handleClose]);

  // Toggle author field mode between structured and single
  const toggleAuthorMode = useCallback((fieldId: string, index: number) => {
    setAuthorModes((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId] === 'structured' ? 'single' : 'structured',
    }));

    // Clear the opposite fields when toggling
    const currentMode = authorModes[fieldId] || 'structured';
    if (currentMode === 'structured') {
      // Switching to single mode: clear given/family
      form.setValue(`authors.${index}.given`, '');
      form.setValue(`authors.${index}.family`, '');
    } else {
      // Switching to structured mode: clear full
      form.setValue(`authors.${index}.full`, '');
    }
  }, [authorModes, form]);

  // Add new author field
  const addAuthor = useCallback(() => {
    append({ given: '', family: '', full: '' });
    // Note: The new field's ID will be set by the useEffect that syncs modes with fields
    // Default mode is 'structured' (handled in the sync effect)
  }, [append]);

  // Remove author field
  const removeAuthor = useCallback((fieldId: string, index: number) => {
    remove(index);
    // Clean up author modes - remove by field ID
    setAuthorModes((prev) => {
      const newModes = { ...prev };
      delete newModes[fieldId];
      return newModes;
    });
  }, [remove]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Reference' : 'Create Reference'}
      className="max-w-2xl"
      closeButton={!isLoading}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Reference Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-app-text-primary mb-1">
            Type
          </label>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <select
                {...field}
                id="type"
                data-testid="reference-type-select"
                className="w-full rounded-lg border border-app-border bg-app-bg px-4 py-2 text-sm text-app-text-primary focus:outline-none focus:ring-2 focus:ring-app-accent"
                disabled={isLoading}
              >
                <option value="article">Journal Article</option>
                <option value="book">Book</option>
                <option value="chapter">Book Chapter</option>
                <option value="conference">Conference Paper</option>
                <option value="thesis">Thesis</option>
                <option value="other">Other</option>
              </select>
            )}
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-app-text-primary mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            {...form.register('title')}
            id="title"
            data-testid="reference-title-input"
            placeholder="Enter title"
            variant={form.formState.errors.title ? 'error' : 'default'}
            disabled={isLoading}
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>

        {/* Authors - Dynamic Array with Dual-Mode Entry */}
        <div>
          <label className="block text-sm font-medium text-app-text-primary mb-2">
            Authors
          </label>
          <div className="space-y-3">
            {fields.map((field, index) => {
              const mode = authorModes[field.id] || 'structured';
              const isStructured = mode === 'structured';

              return (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    {isStructured ? (
                      // Structured mode: firstName + lastName
                      <div className="flex gap-2">
                        <Input
                          {...form.register(`authors.${index}.given`)}
                          data-testid={`author-${index}-given-input`}
                          placeholder="First Name"
                          className="flex-1"
                          disabled={isLoading}
                        />
                        <Input
                          {...form.register(`authors.${index}.family`)}
                          data-testid={`author-${index}-family-input`}
                          placeholder="Last Name"
                          className="flex-1"
                          disabled={isLoading}
                        />
                      </div>
                    ) : (
                      // Single mode: full name only
                      <Input
                        {...form.register(`authors.${index}.full`)}
                        data-testid={`author-${index}-full-input`}
                        placeholder="Full Name (e.g., World Health Organization)"
                        disabled={isLoading}
                      />
                    )}

                    {/* Toggle button */}
                    <button
                      type="button"
                      onClick={() => toggleAuthorMode(field.id, index)}
                      className="text-xs text-app-text-secondary hover:text-app-accent transition-colors"
                      disabled={isLoading}
                    >
                      {isStructured ? 'Use single field' : 'Use two fields'}
                    </button>

                    {form.formState.errors.authors?.[index] && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.authors[index]?.message ||
                          form.formState.errors.authors[index]?.given?.message ||
                          form.formState.errors.authors[index]?.family?.message ||
                          form.formState.errors.authors[index]?.full?.message}
                      </p>
                    )}
                  </div>

                  {/* Remove button (disabled if only one author) */}
                  <button
                    type="button"
                    onClick={() => removeAuthor(field.id, index)}
                    disabled={fields.length === 1 || isLoading}
                    className="mt-1 p-2 text-app-text-secondary hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Remove author"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Author button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addAuthor}
            data-testid="add-author-button"
            className="mt-2"
            disabled={isLoading}
          >
            + Add Author
          </Button>
        </div>

        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-app-text-primary mb-1">
            Year
          </label>
          <Input
            {...form.register('year', { valueAsNumber: true })}
            id="year"
            data-testid="reference-year-input"
            type="number"
            placeholder="YYYY"
            variant={form.formState.errors.year ? 'error' : 'default'}
            disabled={isLoading}
          />
          {form.formState.errors.year && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.year.message}</p>
          )}
        </div>

        {/* Venue/Publication */}
        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-app-text-primary mb-1">
            Venue / Publication
          </label>
          <Input
            {...form.register('venue')}
            id="venue"
            data-testid="reference-venue-input"
            placeholder="Journal, conference, publisher, etc."
            disabled={isLoading}
          />
        </div>

        {/* DOI */}
        <div>
          <label htmlFor="doi" className="block text-sm font-medium text-app-text-primary mb-1">
            DOI
          </label>
          <Input
            {...form.register('doi')}
            id="doi"
            data-testid="reference-doi-input"
            placeholder="10.1234/example"
            variant={form.formState.errors.doi ? 'error' : 'default'}
            disabled={isLoading}
          />
          {form.formState.errors.doi && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.doi.message}</p>
          )}
          <p className="mt-1 text-xs text-app-text-secondary">Format: 10.xxxx/xxxxx</p>
        </div>

        {/* URL */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-app-text-primary mb-1">
            URL
          </label>
          <Input
            {...form.register('url')}
            id="url"
            data-testid="reference-url-input"
            type="url"
            placeholder="https://example.com"
            variant={form.formState.errors.url ? 'error' : 'default'}
            disabled={isLoading}
          />
          {form.formState.errors.url && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.url.message}</p>
          )}
        </div>

        {/* PDF Upload Placeholder (Phase 2) */}
        <div>
          <label className="block text-sm font-medium text-app-text-secondary mb-1">
            PDF Attachment
          </label>
          <div className="rounded-lg border-2 border-dashed border-app-border bg-app-bg-hover p-4 text-center">
            <p className="text-sm text-app-text-secondary">
              Coming in Phase 2
            </p>
          </div>
        </div>

        {/* Footer: Cancel | Save */}
        <div className="flex justify-end gap-3 pt-4 border-t border-app-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            data-testid="reference-cancel-button"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
            data-testid="reference-submit-button"
            className="min-w-[120px]"
          >
            {isEditMode ? 'Save Changes' : 'Create'} {(navigator.platform.includes('Mac') ? '⌘↩' : 'Ctrl+↩')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
