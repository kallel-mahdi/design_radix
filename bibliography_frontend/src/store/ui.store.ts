import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  // Modal state
  modals: {
    [key: string]: boolean;
  };

  // Theme state
  theme: 'light' | 'dark' | 'system';

  // Sidebar state
  sidebarOpen: boolean;
  sidebarWidth: number;

  // Details pane state (bibliography-specific)
  detailsPaneOpen: boolean;
  detailsPaneWidth: number;
  detailsPaneTab: 'info' | 'pdf' | 'notes';

  // View mode
  viewMode: 'table' | 'grid';

  // Loading states
  globalLoading: boolean;

  // Toast notifications
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>;
}

interface UIActions {
  // Modal actions
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  closeAllModals: () => void;

  // Theme actions
  setTheme: (theme: UIState['theme']) => void;
  toggleTheme: () => void;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;

  // Details pane actions
  toggleDetailsPane: () => void;
  setDetailsPaneOpen: (open: boolean) => void;
  setDetailsPaneWidth: (width: number) => void;
  setDetailsPaneTab: (tab: UIState['detailsPaneTab']) => void;

  // View mode actions
  setViewMode: (mode: UIState['viewMode']) => void;

  // Loading actions
  setGlobalLoading: (loading: boolean) => void;

  // Toast actions
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        modals: {},
        theme: 'dark', // Default to dark theme
        sidebarOpen: true,
        sidebarWidth: 280,
        detailsPaneOpen: false,
        detailsPaneWidth: 400,
        detailsPaneTab: 'info',
        viewMode: 'table',
        globalLoading: false,
        toasts: [],

        // Modal actions
        openModal: (modalId) =>
          set(
            (state) => ({
              modals: { ...state.modals, [modalId]: true },
            }),
            false,
            'ui/openModal'
          ),

        closeModal: (modalId) =>
          set(
            (state) => ({
              modals: { ...state.modals, [modalId]: false },
            }),
            false,
            'ui/closeModal'
          ),

        toggleModal: (modalId) => {
          const { modals } = get();
          const isOpen = modals[modalId] || false;
          set(
            (state) => ({
              modals: { ...state.modals, [modalId]: !isOpen },
            }),
            false,
            'ui/toggleModal'
          );
        },

        closeAllModals: () =>
          set({ modals: {} }, false, 'ui/closeAllModals'),

        // Theme actions
        setTheme: (theme) =>
          set({ theme }, false, 'ui/setTheme'),

        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === 'light' ? 'dark' : 'light';
          set({ theme: newTheme }, false, 'ui/toggleTheme');
        },

        // Sidebar actions
        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            'ui/toggleSidebar'
          ),

        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),

        setSidebarWidth: (width) =>
          set({ sidebarWidth: width }, false, 'ui/setSidebarWidth'),

        // Details pane actions
        toggleDetailsPane: () =>
          set(
            (state) => ({ detailsPaneOpen: !state.detailsPaneOpen }),
            false,
            'ui/toggleDetailsPane'
          ),

        setDetailsPaneOpen: (open) =>
          set({ detailsPaneOpen: open }, false, 'ui/setDetailsPaneOpen'),

        setDetailsPaneWidth: (width) =>
          set({ detailsPaneWidth: width }, false, 'ui/setDetailsPaneWidth'),

        setDetailsPaneTab: (tab) =>
          set({ detailsPaneTab: tab }, false, 'ui/setDetailsPaneTab'),

        // View mode actions
        setViewMode: (mode) =>
          set({ viewMode: mode }, false, 'ui/setViewMode'),

        // Loading actions
        setGlobalLoading: (loading) =>
          set({ globalLoading: loading }, false, 'ui/setGlobalLoading'),

        // Toast actions
        addToast: (toast) =>
          set(
            (state) => ({
              toasts: [
                ...state.toasts,
                { ...toast, id: Math.random().toString(36).substr(2, 9) },
              ],
            }),
            false,
            'ui/addToast'
          ),

        removeToast: (id) =>
          set(
            (state) => ({
              toasts: state.toasts.filter((toast) => toast.id !== id),
            }),
            false,
            'ui/removeToast'
          ),

        clearToasts: () =>
          set({ toasts: [] }, false, 'ui/clearToasts'),
      }),
      {
        name: 'bibliography-ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarWidth: state.sidebarWidth,
          detailsPaneWidth: state.detailsPaneWidth,
          viewMode: state.viewMode,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// Selectors for optimized subscriptions
export const useModalState = (modalId: string) =>
  useUIStore((state) => state.modals[modalId] || false);

export const useTheme = () => useUIStore((state) => state.theme);

export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);

export const useDetailsPaneOpen = () => useUIStore((state) => state.detailsPaneOpen);

export const useGlobalLoading = () => useUIStore((state) => state.globalLoading);

export const useToasts = () => useUIStore((state) => state.toasts);
