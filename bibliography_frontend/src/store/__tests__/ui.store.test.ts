import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui.store';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({
      modals: {},
      theme: 'dark',
      sidebarOpen: true,
      sidebarWidth: 280,
      detailsPaneOpen: false,
      detailsPaneWidth: 400,
      detailsPaneTab: 'info',
      activeView: 'library',
      viewMode: 'table',
      globalLoading: false,
      toasts: [],
    });
  });

  describe('Modal actions', () => {
    it('should open a modal', () => {
      const { openModal } = useUIStore.getState();

      openModal('test-modal');

      const state = useUIStore.getState();
      expect(state.modals['test-modal']).toBe(true);
    });

    it('should close a modal', () => {
      const { openModal, closeModal } = useUIStore.getState();

      openModal('test-modal');
      closeModal('test-modal');

      const state = useUIStore.getState();
      expect(state.modals['test-modal']).toBe(false);
    });

    it('should toggle a modal', () => {
      const { toggleModal } = useUIStore.getState();

      toggleModal('test-modal');
      expect(useUIStore.getState().modals['test-modal']).toBe(true);

      toggleModal('test-modal');
      expect(useUIStore.getState().modals['test-modal']).toBe(false);
    });

    it('should close all modals', () => {
      const { openModal, closeAllModals } = useUIStore.getState();

      openModal('modal-1');
      openModal('modal-2');
      openModal('modal-3');
      closeAllModals();

      const state = useUIStore.getState();
      expect(state.modals).toEqual({});
    });
  });

  describe('Theme actions', () => {
    it('should set theme', () => {
      const { setTheme } = useUIStore.getState();

      setTheme('light');

      expect(useUIStore.getState().theme).toBe('light');
    });

    it('should toggle theme from light to dark', () => {
      const { setTheme, toggleTheme } = useUIStore.getState();

      setTheme('light');
      toggleTheme();

      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('should toggle theme from dark to light', () => {
      const { setTheme, toggleTheme } = useUIStore.getState();

      setTheme('dark');
      toggleTheme();

      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('Sidebar actions', () => {
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useUIStore.getState();

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should set sidebar open state', () => {
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);

      setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should set sidebar width', () => {
      const { setSidebarWidth } = useUIStore.getState();

      setSidebarWidth(320);

      expect(useUIStore.getState().sidebarWidth).toBe(320);
    });
  });

  describe('Details pane actions', () => {
    it('should toggle details pane', () => {
      const { toggleDetailsPane } = useUIStore.getState();

      toggleDetailsPane();
      expect(useUIStore.getState().detailsPaneOpen).toBe(true);

      toggleDetailsPane();
      expect(useUIStore.getState().detailsPaneOpen).toBe(false);
    });

    it('should set details pane open state', () => {
      const { setDetailsPaneOpen } = useUIStore.getState();

      setDetailsPaneOpen(true);
      expect(useUIStore.getState().detailsPaneOpen).toBe(true);

      setDetailsPaneOpen(false);
      expect(useUIStore.getState().detailsPaneOpen).toBe(false);
    });

    it('should set details pane width', () => {
      const { setDetailsPaneWidth } = useUIStore.getState();

      setDetailsPaneWidth(500);

      expect(useUIStore.getState().detailsPaneWidth).toBe(500);
    });

    it('should set details pane tab', () => {
      const { setDetailsPaneTab } = useUIStore.getState();

      setDetailsPaneTab('pdf');
      expect(useUIStore.getState().detailsPaneTab).toBe('pdf');

      setDetailsPaneTab('notes');
      expect(useUIStore.getState().detailsPaneTab).toBe('notes');

      setDetailsPaneTab('info');
      expect(useUIStore.getState().detailsPaneTab).toBe('info');
    });
  });

  describe('View actions', () => {
    it('should set active view', () => {
      const { setActiveView } = useUIStore.getState();

      setActiveView('search');
      expect(useUIStore.getState().activeView).toBe('search');

      setActiveView('duplicates');
      expect(useUIStore.getState().activeView).toBe('duplicates');
    });

    it('should set view mode', () => {
      const { setViewMode } = useUIStore.getState();

      setViewMode('grid');
      expect(useUIStore.getState().viewMode).toBe('grid');

      setViewMode('table');
      expect(useUIStore.getState().viewMode).toBe('table');
    });
  });

  describe('Loading actions', () => {
    it('should set global loading state', () => {
      const { setGlobalLoading } = useUIStore.getState();

      setGlobalLoading(true);
      expect(useUIStore.getState().globalLoading).toBe(true);

      setGlobalLoading(false);
      expect(useUIStore.getState().globalLoading).toBe(false);
    });
  });

  describe('Toast actions', () => {
    it('should add a toast', () => {
      const { addToast } = useUIStore.getState();

      addToast({ message: 'Test message', type: 'success' });

      const state = useUIStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('Test message');
      expect(state.toasts[0].type).toBe('success');
      expect(state.toasts[0].id).toBeDefined();
    });

    it('should remove a toast by id', () => {
      const { addToast, removeToast } = useUIStore.getState();

      addToast({ message: 'Test 1', type: 'info' });
      const toastId = useUIStore.getState().toasts[0].id;

      removeToast(toastId);

      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('should clear all toasts', () => {
      const { addToast, clearToasts } = useUIStore.getState();

      addToast({ message: 'Test 1', type: 'info' });
      addToast({ message: 'Test 2', type: 'warning' });
      addToast({ message: 'Test 3', type: 'error' });

      clearToasts();

      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('should add multiple toasts with unique ids', () => {
      const { addToast } = useUIStore.getState();

      addToast({ message: 'Test 1', type: 'info' });
      addToast({ message: 'Test 2', type: 'success' });

      const state = useUIStore.getState();
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
    });
  });
});
