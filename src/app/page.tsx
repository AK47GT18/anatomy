'use client';

import dynamic from 'next/dynamic';
import { LeftPanel } from '@/components/ui/LeftPanel';
import { RightPanel } from '@/components/ui/RightPanel';
import { BottomToolbar } from '@/components/ui/BottomToolbar';

const AnatomyCanvas = dynamic(
  () => import('@/components/canvas/AnatomyCanvas').then((m) => m.AnatomyCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#f4f6f8]">
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing cross icon */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-xl bg-sky-100 border border-sky-200 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
          {/* Progress track */}
          <div className="w-40 h-0.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full shimmer" style={{ width: '60%' }} />
          </div>
          <span className="text-[11px] text-slate-400 tracking-widest uppercase font-mono">
            Loading 3D Atlas
          </span>
        </div>
      </div>
    ),
  }
);

export default function AnatomyPage() {
  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-[#f4f6f8]">
      {/* Full-bleed WebGL canvas */}
      <div className="absolute inset-0">
        <AnatomyCanvas />
      </div>

      {/* Left navigation dock */}
      <LeftPanel />

      {/* Right inspection drawer */}
      <RightPanel />

      {/* Bottom floating toolbar */}
      <BottomToolbar />
    </main>
  );
}
