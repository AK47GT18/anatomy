'use client';

import React from 'react';
import { MdClose, MdCenterFocusStrong, MdOutlineWarning } from 'react-icons/md';
import { TbFileDescription, TbActivity, TbGitFork, TbBolt } from 'react-icons/tb';
import { useAnatomyStore } from '@/store/anatomyStore';

export const RightPanel: React.FC = () => {
  const selectedStructure = useAnatomyStore((s) => s.selectedStructure);
  const selectedDisplayName = useAnatomyStore((s) => s.selectedDisplayName);
  const showInspector = useAnatomyStore((s) => s.showInspector);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const isIsolateMode = useAnatomyStore((s) => s.isIsolateMode);
  const toggleIsolateMode = useAnatomyStore((s) => s.toggleIsolateMode);

  if (!showInspector || !selectedStructure) return null;

  const displayName = selectedDisplayName || selectedStructure.name;
  const { clinicalSignificance } = selectedStructure;

  return (
    <aside className="fixed md:absolute right-3 top-3 bottom-3 w-[calc(100vw-24px)] md:w-80 z-20 flex flex-col rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-medium text-sky-700 capitalize">
              {selectedStructure.system} • {selectedStructure.region}
            </div>
            <h2 className="text-base font-bold text-slate-800 leading-tight mt-0.5">
              {displayName}
            </h2>
            <p className="text-xs italic text-slate-500 mt-0.5">
              {selectedStructure.latinName}
            </p>
          </div>
          <button
            onClick={() => selectStructure(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Close Inspector"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-3">
          <button
            onClick={toggleIsolateMode}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isIsolateMode
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MdCenterFocusStrong className="w-4 h-4 text-sky-600" />
            <span>{isIsolateMode ? 'Show Full Body' : 'Isolate Structure'}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Overview */}
        <section>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            <TbFileDescription className="w-4 h-4 text-sky-600" />
            Anatomical Overview
          </div>
          <p className="text-slate-600 leading-relaxed text-xs">
            {selectedStructure.overview}
          </p>
        </section>

        {/* Functions */}
        <section>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            <TbActivity className="w-4 h-4 text-sky-600" />
            Physiological Functions
          </div>
          <ul className="space-y-1.5">
            {selectedStructure.function.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-600 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Articulations */}
        {selectedStructure.articulations && selectedStructure.articulations.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              <TbGitFork className="w-4 h-4 text-sky-600" />
              Articulations & Attachments
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedStructure.articulations.map((joint, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]"
                >
                  {joint}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Neurovascular Supply */}
        {(selectedStructure.innervation || selectedStructure.bloodSupply) && (
          <section className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <TbBolt className="w-4 h-4 text-amber-500" />
              Neurovascular Supply
            </div>
            {selectedStructure.innervation && (
              <div className="text-xs">
                <span className="text-slate-400 font-medium">Innervation: </span>
                <span className="text-slate-700">{selectedStructure.innervation}</span>
              </div>
            )}
            {selectedStructure.bloodSupply && (
              <div className="text-xs">
                <span className="text-slate-400 font-medium">Blood Supply: </span>
                <span className="text-slate-700">{selectedStructure.bloodSupply}</span>
              </div>
            )}
          </section>
        )}

        {/* Clinical Pathologies */}
        <section className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
            <MdOutlineWarning className="w-4 h-4 text-amber-500" />
            Clinical Notes & Pathology
          </div>
          <ul className="space-y-1">
            {clinicalSignificance.commonPathology.map((pathology, idx) => (
              <li key={idx} className="text-slate-700 flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{pathology}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
            {clinicalSignificance.clinicalNotes}
          </p>
        </section>
      </div>
    </aside>
  );
};
