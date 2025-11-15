import { useLibraryStore } from '../store/library.store';
import type { Reference } from '@/common/types';
import { Tag } from '@/components/ui/Tag';

interface ReferenceTableProps {
  references: Reference[];
}

export function ReferenceTable({ references }: ReferenceTableProps) {
  const selectedReferenceIds = useLibraryStore((state) => state.selectedReferenceIds);
  const toggleSelection = useLibraryStore((state) => state.toggleSelection);
  const selectAll = useLibraryStore((state) => state.selectAll);
  const clearSelection = useLibraryStore((state) => state.clearSelection);
  const setActiveReference = useLibraryStore((state) => state.setActiveReference);

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
      // Cmd/Ctrl+Click: toggle selection without affecting others
      toggleSelection(refId);
    } else {
      // Regular click: select only this item and show details
      toggleSelection(refId);
      setActiveReference(refId);
    }
  };

  const handleCheckboxClick = (refId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleSelection(refId);
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
