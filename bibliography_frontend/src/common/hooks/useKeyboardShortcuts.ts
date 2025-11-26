import { useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/ui.store';
import { useLibraryStore } from '@/features/library/store/library.store';
import { useTagsQuery } from '@/features/library/api/tags.queries';
import { useDeleteReferenceMutation } from '@/features/library/api/references.mutations';

/**
 * Centralized keyboard shortcuts hook
 *
 * MVP Shortcuts:
 * - Cmd/Ctrl+N: Open new reference modal
 * - Cmd/Ctrl+F: Focus search box
 * - Cmd/Ctrl+A: Select all references
 * - Delete/Backspace: Move selected references to trash
 * - Escape: Close modal/details pane/clear selection
 * - 1-9: Toggle colored tag filters (Zotero pattern)
 *
 * Pattern: Mounted once in AppLayout to avoid duplicate listeners
 * Reference: Zotero's keyboard handling in zotero/chrome/content/zotero/
 */
export function useKeyboardShortcuts() {
  const { openModal, closeAllModals, setDetailsPaneOpen, modals } = useUIStore();
  const {
    activeReferenceId,
    selectedReferenceIds,
    setActiveReference,
    clearSelection,
    selectAll,
    toggleTag,
  } = useLibraryStore();

  // Tags for 1-9 shortcuts
  const { data: allTags = [] } = useTagsQuery();

  // Delete mutation for trash shortcut
  const deleteMutation = useDeleteReferenceMutation();

  /**
   * Check if focus is in an editable element
   * Skip shortcuts when user is typing
   */
  const isInputFocused = useCallback((): boolean => {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) return false;

    const tagName = activeElement.tagName.toUpperCase();
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') return true;
    if (activeElement.isContentEditable) return true;

    // Check for CodeMirror or other rich editors
    if (activeElement.closest('[role="textbox"]')) return true;

    return false;
  }, []);

  /**
   * Check if any modal is open
   */
  const hasOpenModal = useCallback((): boolean => {
    return Object.values(modals).some(Boolean);
  }, [modals]);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Platform detection
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Skip if in input field (except for Escape)
      if (isInputFocused() && event.key !== 'Escape') {
        return;
      }

      // Cmd/Ctrl+N: New Reference
      if (modKey && event.key === 'n') {
        event.preventDefault();
        openModal('reference-modal');
        return;
      }

      // Cmd/Ctrl+F: Focus search
      if (modKey && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Cmd/Ctrl+A: Select all (only in library view, when no modal is open)
      if (modKey && event.key === 'a' && !hasOpenModal()) {
        event.preventDefault();
        // Get all visible reference IDs from the table
        const tableRows = document.querySelectorAll('[data-reference-id]');
        const allIds = Array.from(tableRows).map(
          (row) => row.getAttribute('data-reference-id')!
        );
        if (allIds.length > 0) {
          selectAll(allIds);
        }
        return;
      }

      // Delete/Backspace: Move to trash
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        !modKey &&
        !hasOpenModal()
      ) {
        const idsToDelete = Array.from(selectedReferenceIds);
        if (idsToDelete.length > 0) {
          event.preventDefault();
          // Delete each selected reference (batch delete not yet implemented)
          idsToDelete.forEach((id) => deleteMutation.mutate(id));
          clearSelection();
        }
        return;
      }

      // Escape: Close modal/details pane/clear selection
      if (event.key === 'Escape') {
        // Priority 1: Close any open modal
        if (hasOpenModal()) {
          closeAllModals();
          return;
        }

        // Priority 2: Close details pane if open
        if (activeReferenceId) {
          setDetailsPaneOpen(false);
          setActiveReference(null);
          return;
        }

        // Priority 3: Clear selection
        if (selectedReferenceIds.size > 0) {
          clearSelection();
          return;
        }
      }

      // Number keys 1-9: Toggle colored tag filters
      // Pattern from Zotero: zotero/chrome/content/zotero/collectionTree.js
      const position = parseInt(event.key);
      if (position >= 1 && position <= 9 && !modKey && !hasOpenModal()) {
        const tagWithPosition = allTags.find((tag) => tag.position === position);
        if (tagWithPosition) {
          toggleTag(tagWithPosition.name);
        }
        return;
      }
    },
    [
      isInputFocused,
      hasOpenModal,
      openModal,
      closeAllModals,
      setDetailsPaneOpen,
      activeReferenceId,
      setActiveReference,
      selectedReferenceIds,
      clearSelection,
      selectAll,
      toggleTag,
      allTags,
      deleteMutation,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
