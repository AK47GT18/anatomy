'use client';

import React from 'react';
import { TbCompass } from 'react-icons/tb';
import { MdCenterFocusStrong } from 'react-icons/md';
import { useAnatomyStore } from '@/store/anatomyStore';
import { ViewMode, AnatomicalPlane } from '@/types/anatomy';

export const BottomToolbar: React.FC = () => {
  const viewMode = useAnatomyStore((s) => s.viewMode);
  const setViewMode = useAnatomyStore((s) => s.setViewMode);
  const anatomicalPlane = useAnatomyStore((s) => s.anatomicalPlane);
  const setAnatomicalPlane = useAnatomyStore((s) => s.setAnatomicalPlane);
  const isIsolateMode = useAnatomyStore((s) => s.isIsolateMode);
  const toggleIsolateMode = useAnatomyStore((s) => s.toggleIsolateMode);

  const modes: { id: ViewMode; label: string }[] = [
    { id: 'standard', label: 'Atlas' },
    { id: 'xray', label: 'X-Ray' },
    { id: 'wireframe', label: 'Wireframe' },
  ];

  const planes: { id: AnatomicalPlane; label: string }[] = [
    { id: 'coronal', label: 'Coronal' },
    { id: 'sagittal', label: 'Sagittal' },
    { id: 'transverse', label: 'Transverse' },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md max-w-[calc(100vw-24px)] overflow-x-auto">
      {/* View Mode Switcher */}
      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl shrink-0">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setViewMode(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === m.id
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0 hidden sm:block" />

      {/* Anatomical Planes */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        <TbCompass className="w-4 h-4 text-slate-400 ml-1" />
        {planes.map((p) => (
          <button
            key={p.id}
            onClick={() => setAnatomicalPlane(p.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              anatomicalPlane === p.id
                ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />

      {/* Isolate Toggle */}
      <button
        onClick={toggleIsolateMode}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 ${
          isIsolateMode
            ? 'bg-amber-50 border-amber-300 text-amber-800 font-medium'
            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <MdCenterFocusStrong className="w-3.5 h-3.5 text-sky-600" />
        <span>Isolate</span>
      </button>
    </div>
  );
};
