import { useLibraryStore } from '../store/library.store';
import type { Reference } from '@/common/types';
import { Tag } from '@/components/ui/Tag';

interface ReferenceTableProps {
  references: Reference[];
}

export function ReferenceTable({ references }: ReferenceTableProps) {
  const selectedReferenceIds = useLibraryStore((state) => state.selectedReferenceIds);
  const toggleSelection = useLibraryStore((state) => state.toggleSelection);
  const setActiveReference = useLibraryStore((state) => state.setActiveReference);

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
                onClick={() => {
                  toggleSelection(ref._id);
                  setActiveReference(ref._id);
                }}
              >
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
