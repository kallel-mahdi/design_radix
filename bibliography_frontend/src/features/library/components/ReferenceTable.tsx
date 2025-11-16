import { useLibraryStore } from '../store/library.store';
import { useUIStore } from '@/store/ui.store';
import type { Reference } from '@/common/types';
import { Tag } from '@/components/ui/Tag';
import { PencilIcon } from '@heroicons/react/24/outline';

interface ReferenceTableProps {
  references: Reference[];
}

export function ReferenceTable({ references }: ReferenceTableProps) {
  const selectedReferenceIds = useLibraryStore((state) => state.selectedReferenceIds);
  const selectReference = useLibraryStore((state) => state.selectReference);
  const toggleSelection = useLibraryStore((state) => state.toggleSelection);
  const selectAll = useLibraryStore((state) => state.selectAll);
  const clearSelection = useLibraryStore((state) => state.clearSelection);
  const setActiveReference = useLibraryStore((state) => state.setActiveReference);
  const setEditReference = useLibraryStore((state) => state.setEditReference);
  const { openModal } = useUIStore();

  const allSelected = references.length > 0 && references.every(ref => selectedReferenceIds.has(ref._id));
  const someSelected = references.some(ref => selectedReferenceIds.has(ref._id)) && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(references.map(ref => ref._id));
    }
  };

  const handleRowClick = (refId: string, event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey) {
      // Cmd/Ctrl+Click: toggle multi-select without changing active reference
      toggleSelection(refId);
    } else {
      // Regular click: clear all, select only this item, set as active
      const isCurrentlySelected = selectedReferenceIds.has(refId);
      const isOnlySelection = selectedReferenceIds.size === 1 && isCurrentlySelected;

      if (isOnlySelection) {
        // Clicking the only selected item: deselect and clear active
        clearSelection();
        setActiveReference(null);
      } else {
        // Select only this item and show details
        clearSelection();
        selectReference(refId);
        setActiveReference(refId);
      }
    }
  };

  const handleCheckboxClick = (refId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleSelection(refId);
  };

  const handleEdit = (refId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditReference(refId);
    openModal('reference-modal');
  };

  const formatAuthors = (authors: Reference['authors']) => {
    if (!authors || authors.length === 0) return 'Unknown';
    const first = authors[0];
    if (!first) return 'Unknown';

    if (authors.length === 1) return first.family || 'Unknown';

    const second = authors[1];
    if (authors.length === 2 && second) {
      return `${first.family || 'Unknown'} & ${second.family || 'Unknown'}`;
    }

    return `${first.family || 'Unknown'} et al.`;
  };

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-app-border bg-app-surface">
            <th className="px-3 py-3 w-12">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-app-border text-app-accent focus:ring-app-accent focus:ring-offset-0 cursor-pointer"
                aria-label="Select all references"
              />
            </th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Title</th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Authors</th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Year</th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Type</th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Tags</th>
            <th className="px-3 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {references.map((ref) => {
            const isSelected = selectedReferenceIds.has(ref._id);
            return (
              <tr
                key={ref._id}
                className={`border-b border-app-border cursor-pointer transition-colors ${
                  isSelected ? 'bg-app-accent/5 border-l-2 border-l-app-accent' : 'hover:bg-app-bg-hover'
                }`}
                onClick={(e) => handleRowClick(ref._id, e)}
              >
                <td className="px-3 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleCheckboxClick(ref._id, e as any)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-app-border text-app-accent focus:ring-app-accent focus:ring-offset-0 cursor-pointer"
                    aria-label={`Select ${ref.title}`}
                  />
                </td>
                <td className="px-3 py-3 text-sm text-app-text-primary font-medium">
                  {ref.title}
                </td>
                <td className="px-3 py-3 text-sm text-app-text-secondary">
                  {formatAuthors(ref.authors)}
                </td>
                <td className="px-3 py-3 text-sm text-app-text-secondary">
                  {ref.year || 'N/A'}
                </td>
                <td className="px-3 py-3 text-sm text-app-text-secondary">
                  <span className="capitalize">{ref.type}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {ref.tags && ref.tags.length > 0 ? (
                      ref.tags.map((tag) => (
                        <Tag key={tag} label={tag} size="sm" />
                      ))
                    ) : (
                      <span className="text-xs text-app-text-muted">No tags</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 w-12">
                  <button
                    onClick={(e) => handleEdit(ref._id, e)}
                    className="p-1.5 text-app-text-secondary hover:text-app-accent hover:bg-app-surface-hover rounded transition-colors"
                    aria-label="Edit reference"
                    title="Edit reference"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
