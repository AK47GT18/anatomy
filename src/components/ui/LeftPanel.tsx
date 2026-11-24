'use client';

import React, { useState } from 'react';
import { 
  MdSearch, 
  MdOutlineVisibility, 
  MdOutlineVisibilityOff, 
  MdFullscreen,
  MdMenu,
  MdClose
} from 'react-icons/md';
import { 
  TbBone, 
  TbHeartbeat, 
  TbBrain, 
  TbLungs, 
  TbActivity,
  TbGenderFemale,
  TbGenderMale
} from 'react-icons/tb';
import { FaDna } from 'react-icons/fa6';
import { useAnatomyStore } from '@/store/anatomyStore';
import { ANATOMY_DATABASE, SYSTEM_LAYERS } from '@/data/anatomyData';
import { AnatomicalSystem } from '@/types/anatomy';

const SYSTEM_ICONS: Record<AnatomicalSystem, React.ReactNode> = {
  skeletal: <TbBone className="w-4 h-4 text-amber-700" />,
  muscular: <FaDna className="w-3.5 h-3.5 text-red-600" />,
  visceral: <TbHeartbeat className="w-4 h-4 text-rose-600" />,
  circulatory: <TbActivity className="w-4 h-4 text-sky-600" />,
  nervous: <TbBrain className="w-4 h-4 text-amber-600" />,
  reproductive: <TbGenderFemale className="w-4 h-4 text-purple-600" />,
  integumentary: <TbLungs className="w-4 h-4 text-teal-600" />,
};

export const LeftPanel: React.FC = () => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const searchQuery = useAnatomyStore((s) => s.searchQuery);
  const setSearchQuery = useAnatomyStore((s) => s.setSearchQuery);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const systemVisibility = useAnatomyStore((s) => s.systemVisibility);
  const toggleSystemVisibility = useAnatomyStore((s) => s.toggleSystemVisibility);
  const sex = useAnatomyStore((s) => s.sex);
  const setSex = useAnatomyStore((s) => s.setSex);
  const activeModel = useAnatomyStore((s) => s.activeModel);
  const setActiveModel = useAnatomyStore((s) => s.setActiveModel);
  const focusRegion = useAnatomyStore((s) => s.focusRegion);
  const resetCamera = useAnatomyStore((s) => s.resetCamera);

  const filteredStructures = ANATOMY_DATABASE.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systems = SYSTEM_LAYERS.filter((s) => s.id !== 'integumentary');

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="md:hidden fixed top-3 left-3 z-30 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-md transition-all active:scale-95"
        aria-label="Toggle Systems Menu"
      >
        {isOpenMobile ? <MdClose className="w-5 h-5" /> : <MdMenu className="w-5 h-5" />}
      </button>

      {/* Main Left Drawer / Panel */}
      <aside
        className={`fixed md:absolute left-3 top-3 bottom-3 w-[calc(100vw-24px)] md:w-72 z-20 flex flex-col rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md overflow-hidden transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'
        }`}
      >
        {/* Brand & Model Selection */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-slate-800">
                Human Anatomy 3D
              </h1>
              <p className="text-[11px] text-slate-500">
                Interactive Medical Atlas
              </p>
            </div>

            {/* Model Switcher */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setActiveModel('body')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeModel === 'body'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Body
              </button>
              <button
                onClick={() => setActiveModel('skeleton')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeModel === 'skeleton'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Skeleton
              </button>
            </div>
          </div>

          {/* Male / Female Anatomy Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setSex('male')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-all ${
                sex === 'male'
                  ? 'bg-sky-600 text-white shadow-sm font-medium'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TbGenderMale className="w-4 h-4" />
              <span>Male ♂</span>
            </button>
            <button
              onClick={() => setSex('female')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-all ${
                sex === 'female'
                  ? 'bg-rose-500 text-white shadow-sm font-medium'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TbGenderFemale className="w-4 h-4" />
              <span>Female ♀</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-sky-500 focus-within:bg-white transition-all shadow-inner">
            <MdSearch className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search bones, vessels, nerves, organs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Autocomplete Results */}
          {searchQuery && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg divide-y divide-slate-100">
              {filteredStructures.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-400 text-center font-mono">
                  No matching structures found
                </div>
              ) : (
                filteredStructures.slice(0, 10).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      selectStructure(item.id);
                      setSearchQuery('');
                      setIsOpenMobile(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-700 group-hover:text-sky-600">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 italic">
                        {item.latinName}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {item.system}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quick Region Focus Section */}
        <div className="px-3 py-2 border-b border-slate-100 shrink-0">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 pb-1.5">
            Quick Region Focus
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => { focusRegion('head'); setIsOpenMobile(false); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-left transition-colors"
            >
              Head & Brain
            </button>
            <button
              onClick={() => { focusRegion('thorax'); setIsOpenMobile(false); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-left transition-colors"
            >
              Thorax & Organs
            </button>
            <button
              onClick={() => { focusRegion('abdomen'); setIsOpenMobile(false); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-left transition-colors"
            >
              Abdomen & Viscera
            </button>
            <button
              onClick={() => { focusRegion('pelvis'); setIsOpenMobile(false); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-left transition-colors"
            >
              Pelvis & Genitalia
            </button>
            <button
              onClick={() => { focusRegion('legs'); setIsOpenMobile(false); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-left transition-colors font-medium text-sky-700"
            >
              Legs & Feet
            </button>
            <button
              onClick={() => { focusRegion('arms'); setIsOpenMobile(false); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-left transition-colors"
            >
              Arms & Hands
            </button>
          </div>
        </div>

        {/* Anatomical Systems Layer Toggles */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Performance Advisory Banner */}
          <div className="mb-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 leading-normal">
            <div className="font-semibold text-amber-800 flex items-center gap-1">
              <span>⚡ Skeleton Default Mode</span>
            </div>
            <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
              Default is pure skeleton for fast loading. Enabling multiple layers (Muscles, Organs, Vessels, Nerves) renders thousands of 3D meshes and may be a bit slower on mobile or low-power devices.
            </p>
          </div>

          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 py-1">
            Anatomical Layers
          </div>
          {systems.map((sys) => {
            const active = systemVisibility[sys.id];
            return (
              <button
                key={sys.id}
                onClick={() => toggleSystemVisibility(sys.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all ${
                  active
                    ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                    : 'bg-transparent border-transparent text-slate-400 opacity-60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-white border border-slate-200">
                    {SYSTEM_ICONS[sys.id]}
                  </div>
                  <span className="text-xs font-medium">{sys.label}</span>
                </div>
                {active ? (
                  <MdOutlineVisibility className="w-4 h-4 text-sky-600 shrink-0" />
                ) : (
                  <MdOutlineVisibilityOff className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Full Body Reset Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <button
            onClick={() => { resetCamera(); setIsOpenMobile(false); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-900 shadow-sm transition-all"
          >
            <MdFullscreen className="w-4 h-4 text-slate-500" />
            <span>Full Body Overview</span>
          </button>
        </div>
      </aside>
    </>
  );
};
