'use client';

import { useEffect } from 'react';
import { useAnatomyStore } from '@/store/anatomyStore';

export function useKeyboardShortcuts() {
  const resetCamera = useAnatomyStore((s) => s.resetCamera);
  const toggleIsolateMode = useAnatomyStore((s) => s.toggleIsolateMode);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const setViewMode = useAnatomyStore((s) => s.setViewMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in a search bar or text field
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA'].includes(activeTag)) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        selectStructure(null);
      } else if (e.key === 'r' || e.key === 'R') {
        resetCamera();
      } else if (e.key === 'i' || e.key === 'I') {
        toggleIsolateMode();
      } else if (e.key === '1') {
        setViewMode('standard');
      } else if (e.key === '2') {
        setViewMode('xray');
      } else if (e.key === '3') {
        setViewMode('wireframe');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetCamera, toggleIsolateMode, selectStructure, setViewMode]);
}
