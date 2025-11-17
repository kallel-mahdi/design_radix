import { Outlet, useNavigate } from '@tanstack/react-router';
import { ActivityBar } from './ActivityBar';
import { DetailsPane } from './DetailsPane';
import { SearchBar } from './SearchBar';
import { useUIStore } from '@/store/ui.store';
import { useLibraryStore } from '@/features/library/store/library.store';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/Resizable';
import { usePanelPersistence } from '@/common/hooks/usePanelPersistence';
import { useReferencesQuery } from '@/features/library/api/references.queries';
import { useCollectionsQuery } from '@/features/library/api/collections.queries';
import { useTagsQuery } from '@/features/library/api/tags.queries';
import { TreeView } from '@/features/library/components/TreeView';
import { TagSelector } from '@/features/library/components/TagSelector';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeView,
    setActiveView,
    detailsPaneOpen,
    detailsPaneTab,
    setDetailsPaneTab,
    setDetailsPaneOpen,
  } = useUIStore();

  const handleViewChange = (view: typeof activeView) => {
    setActiveView(view);
    navigate({ to: `/${view}` });
  };

  // Activity Bar data sources
  // TODO: Add duplicates detection query when duplicates feature is implemented (Session 12+)
  const duplicatesCount = 0;

  // Check if trash has any items
  const { data: deletedRefs = [] } = useReferencesQuery({ deleted: true, limit: 1 });
  const trashNotEmpty = deletedRefs.length > 0;

  // Get active reference from library store
  const activeReferenceId = useLibraryStore((state) => state.activeReferenceId);
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Fetch collections for sidebar
  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery();
  const { setActiveCollection } = useLibraryStore();
  const activeCollectionId = useLibraryStore((state) => state.activeCollectionId);

  // Fetch tags for sidebar
  const { data: tags = [], isLoading: tagsLoading } = useTagsQuery();

  // Panel persistence: Sidebar | Main | Details (when open)
  const { defaultLayout, onLayout } = usePanelPersistence(
    'app-layout-panels',
    detailsPaneOpen && activeReferenceId ? [25, 50, 25] : [25, 75]
  );

  return (
    <div className="h-screen flex bg-app-bg text-app-text-primary overflow-hidden">
      {/* Activity Bar - Fixed */}
      <ActivityBar
        activeView={activeView}
        onViewChange={handleViewChange}
        duplicatesCount={duplicatesCount}
        trashNotEmpty={trashNotEmpty}
      />

      {/* Resizable Panel Group */}
      <ResizablePanelGroup direction="horizontal" className="flex-1" onLayout={onLayout}>
        {/* Sidebar Panel */}
        <ResizablePanel defaultSize={defaultLayout[0]} minSize={15} maxSize={40}>
          <aside className="h-full bg-app-surface border-r border-app-border flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-app-border">
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Search references..."
              />
            </div>

            {/* Collections */}
            <div className="p-4 border-b border-app-border">
              <h2 className="text-sm font-semibold text-app-text-primary">Collections</h2>
            </div>
            <div className="flex-1 overflow-auto">
              {collectionsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="p-2">
                  <TreeView
                    collections={collections}
                    onSelectCollection={setActiveCollection}
                    activeCollectionId={activeCollectionId}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            {tagsLoading ? (
              <div className="p-4 border-t border-app-border flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <TagSelector tags={tags} isLoading={false} />
            )}
          </aside>
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle withHandle />

        {/* Main Content Panel */}
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <main className="h-full flex flex-col overflow-hidden">
            <Outlet />
          </main>
        </ResizablePanel>

        {/* Details Pane - Conditional */}
        {detailsPaneOpen && activeReferenceId && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={defaultLayout[2] || 25} minSize={20} maxSize={50}>
              <DetailsPane
                isOpen={true}
                onClose={() => setDetailsPaneOpen(false)}
                referenceId={activeReferenceId}
                activeTab={detailsPaneTab}
                onTabChange={setDetailsPaneTab}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
