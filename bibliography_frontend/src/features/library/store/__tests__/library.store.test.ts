import { describe, it, expect, beforeEach } from 'vitest';
import { useLibraryStore } from '../library.store';

describe('Library Store', () => {
	beforeEach(() => {
		// Reset store before each test
		useLibraryStore.setState({
			selectedReferenceIds: new Set(),
			activeReferenceId: null,
			activeCollectionId: null,
			activeTags: [],
		});
	});

	describe('selectReference', () => {
		it('should select a single reference', () => {
			const { selectReference, selectedReferenceIds } =
				useLibraryStore.getState();

			selectReference('ref-1');

			const state = useLibraryStore.getState();
			expect(state.selectedReferenceIds.has('ref-1')).toBe(true);
			expect(state.selectedReferenceIds.size).toBe(1);
		});
	});

	describe('deselectReference', () => {
		it('should deselect a reference', () => {
			const { selectReference, deselectReference } = useLibraryStore.getState();

			selectReference('ref-1');
			deselectReference('ref-1');

			const state = useLibraryStore.getState();
			expect(state.selectedReferenceIds.has('ref-1')).toBe(false);
			expect(state.selectedReferenceIds.size).toBe(0);
		});
	});

	describe('toggleSelection', () => {
		it('should toggle selection on and off', () => {
			const { toggleSelection } = useLibraryStore.getState();

			toggleSelection('ref-1');
			expect(useLibraryStore.getState().selectedReferenceIds.has('ref-1')).toBe(
				true
			);

			toggleSelection('ref-1');
			expect(useLibraryStore.getState().selectedReferenceIds.has('ref-1')).toBe(
				false
			);
		});
	});

	describe('selectAll', () => {
		it('should select all provided references', () => {
			const { selectAll } = useLibraryStore.getState();

			const refIds = ['ref-1', 'ref-2', 'ref-3'];
			selectAll(refIds);

			const state = useLibraryStore.getState();
			expect(state.selectedReferenceIds.size).toBe(3);
			refIds.forEach((id) => {
				expect(state.selectedReferenceIds.has(id)).toBe(true);
			});
		});
	});

	describe('clearSelection', () => {
		it('should clear all selections', () => {
			const { selectAll, clearSelection } = useLibraryStore.getState();

			selectAll(['ref-1', 'ref-2', 'ref-3']);
			clearSelection();

			const state = useLibraryStore.getState();
			expect(state.selectedReferenceIds.size).toBe(0);
		});
	});

	describe('setActiveReference', () => {
		it('should set the active reference', () => {
			const { setActiveReference } = useLibraryStore.getState();

			setActiveReference('ref-1');

			const state = useLibraryStore.getState();
			expect(state.activeReferenceId).toBe('ref-1');
		});

		it('should clear active reference when null is passed', () => {
			const { setActiveReference } = useLibraryStore.getState();

			setActiveReference('ref-1');
			setActiveReference(null);

			const state = useLibraryStore.getState();
			expect(state.activeReferenceId).toBe(null);
		});
	});
});
