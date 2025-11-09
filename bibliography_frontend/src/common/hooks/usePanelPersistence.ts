/**
 * Panel Width Persistence Hook
 *
 * Persists panel sizes to localStorage and restores them on mount.
 * Works with react-resizable-panels library.
 *
 * @example
 * ```tsx
 * const { onLayout, defaultLayout } = usePanelPersistence('main-layout', [20, 60, 20]);
 *
 * <PanelGroup direction="horizontal" onLayout={onLayout}>
 *   <Panel defaultSize={defaultLayout[0]} />
 *   <PanelResizeHandle />
 *   <Panel defaultSize={defaultLayout[1]} />
 *   <PanelResizeHandle />
 *   <Panel defaultSize={defaultLayout[2]} />
 * </PanelGroup>
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

export interface UsePanelPersistenceReturn {
  defaultLayout: number[];
  onLayout: (sizes: number[]) => void;
}

/**
 * Hook for persisting panel sizes to localStorage
 *
 * @param storageKey - Unique key for localStorage (e.g., 'main-layout')
 * @param fallbackSizes - Default sizes if no stored sizes found (e.g., [20, 60, 20])
 * @returns Object with defaultLayout and onLayout callback
 */
export function usePanelPersistence(
  storageKey: string,
  fallbackSizes: number[]
): UsePanelPersistenceReturn {
  const [defaultLayout, setDefaultLayout] = useState<number[]>(fallbackSizes);

  // Load saved sizes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === fallbackSizes.length) {
          setDefaultLayout(parsed);
        }
      } catch {
        // Invalid JSON, use fallback
      }
    }
  }, [storageKey, fallbackSizes.length]);

  // Save sizes to localStorage when they change
  const onLayout = useCallback(
    (sizes: number[]) => {
      localStorage.setItem(storageKey, JSON.stringify(sizes));
    },
    [storageKey]
  );

  return { defaultLayout, onLayout };
}
