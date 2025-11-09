import { Outlet, useNavigate } from '@tanstack/react-router';
import { ActivityBar } from './ActivityBar';
import { Sidebar } from './Sidebar';
import { DetailsPane } from './DetailsPane';
import { useUIStore } from '../../store/ui.store';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeView,
    setActiveView,
    sidebarWidth,
    setSidebarWidth,
    detailsPaneOpen,
    detailsPaneWidth,
    setDetailsPaneWidth,
    detailsPaneTab,
    setDetailsPaneTab,
    setDetailsPaneOpen,
  } = useUIStore();

  const handleViewChange = (view: typeof activeView) => {
    setActiveView(view);
    navigate({ to: `/${view}` });
  };

  // Mock data - will be replaced with real data in later sessions
  const duplicatesCount = 0;
  const trashNotEmpty = false;
  const activeReferenceId = detailsPaneOpen ? 'mock-reference-id' : null;

  return (
    <div className="h-screen flex bg-bg-dark text-text-primary overflow-hidden">
      {/* Activity Bar */}
      <ActivityBar
        activeView={activeView}
        onViewChange={handleViewChange}
        duplicatesCount={duplicatesCount}
        trashNotEmpty={trashNotEmpty}
      />

      {/* Sidebar */}
      <Sidebar width={sidebarWidth} onWidthChange={setSidebarWidth}>
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Collections</h2>
        </div>
        <div className="flex-1 p-4 text-text-secondary text-sm">
          <p>Collection tree will go here (Session 4)</p>
        </div>
        <div className="p-4 border-t border-border">
          <h2 className="text-sm font-semibold text-text-primary">Tags</h2>
          <div className="mt-2 text-text-secondary text-sm">
            <p>Tag selector will go here (Session 5)</p>
          </div>
        </div>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>

      {/* Details Pane */}
      <DetailsPane
        isOpen={detailsPaneOpen}
        onClose={() => setDetailsPaneOpen(false)}
        referenceId={activeReferenceId}
        activeTab={detailsPaneTab}
        onTabChange={setDetailsPaneTab}
        width={detailsPaneWidth}
        onWidthChange={setDetailsPaneWidth}
      />
    </div>
  );
};
