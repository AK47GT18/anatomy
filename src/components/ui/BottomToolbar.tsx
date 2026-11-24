'use client';

import React, { useState } from 'react';
import { TbCompass, TbReload, TbKeyboard, TbX } from 'react-icons/tb';
import { MdCenterFocusStrong } from 'react-icons/md';
import { useAnatomyStore } from '@/store/anatomyStore';
import { ViewMode, AnatomicalPlane } from '@/types/anatomy';

export const BottomToolbar: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  const viewMode = useAnatomyStore((s) => s.viewMode);
  const setViewMode = useAnatomyStore((s) => s.setViewMode);
  const anatomicalPlane = useAnatomyStore((s) => s.anatomicalPlane);
  const setAnatomicalPlane = useAnatomyStore((s) => s.setAnatomicalPlane);
  const isIsolateMode = useAnatomyStore((s) => s.isIsolateMode);
  const toggleIsolateMode = useAnatomyStore((s) => s.toggleIsolateMode);
  const resetCamera = useAnatomyStore((s) => s.resetCamera);

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
    <>
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
          title="Isolate selected anatomical structure (Hotkey: I)"
        >
          <MdCenterFocusStrong className="w-3.5 h-3.5 text-sky-600" />
          <span>Isolate</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />

        {/* Reset Camera View */}
        <button
          onClick={resetCamera}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          title="Reset Camera View (Hotkey: R)"
        >
          <TbReload className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Shortcuts & Navigation Help */}
        <button
          onClick={() => setShowHelp(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          title="Shortcuts & Controls"
        >
          <TbKeyboard className="w-4 h-4" />
        </button>
      </div>

      {/* Shortcuts & Guide Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  ⌘
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Controls & Shortcuts</h3>
                  <p className="text-[11px] text-slate-500">Atlas navigation & hotkeys</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <TbX className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Mouse & Touch Gestures
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span className="font-medium">Rotate View</span>
                    <span className="text-slate-500">Left Click + Drag / 1 Finger</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span className="font-medium">Pan Camera</span>
                    <span className="text-slate-500">Right Click + Drag / 2 Fingers</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span className="font-medium">Zoom In / Out</span>
                    <span className="text-slate-500">Scroll Wheel / Pinch</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span className="font-medium">Select & Inspect</span>
                    <span className="text-slate-500">Click on any bone, muscle or organ</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Keyboard Shortcuts
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Reset View</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono font-semibold text-slate-700 shadow-xs">R</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Toggle Isolate</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono font-semibold text-slate-700 shadow-xs">I</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">Deselect / Close</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono font-semibold text-slate-700 shadow-xs">Esc</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600">View Modes</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-semibold text-slate-700 shadow-xs">1</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-semibold text-slate-700 shadow-xs">2</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-semibold text-slate-700 shadow-xs">3</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs transition-colors shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
