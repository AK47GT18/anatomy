import { create } from 'zustand';
import { ANATOMY_DATABASE } from '@/data/anatomyData';
import { AnatomicalStructure, AnatomicalSystem, AnatomicalPlane, ViewMode, AnatomicalSex } from '@/types/anatomy';

// Helper to format clean readable medical names from GLB mesh identifiers
export function formatAnatomicalName(rawName: string): string {
  let name = rawName.replace(/_/g, ' ').replace(/\.00\d/g, '').trim();
  if (name.endsWith(' L') || name.endsWith(' l')) name = 'Left ' + name.slice(0, -2);
  if (name.endsWith(' R') || name.endsWith(' r')) name = 'Right ' + name.slice(0, -2);
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

interface AnatomyState {
  selectedId: string | null;
  hoveredId: string | null;
  selectedStructure: AnatomicalStructure | null;
  selectedDisplayName: string | null;
  viewMode: ViewMode;
  anatomicalPlane: AnatomicalPlane;
  searchQuery: string;
  isIsolateMode: boolean;
  showInspector: boolean;
  cameraResetKey: number;

  // Sex / Gender toggle
  sex: AnatomicalSex;

  // Active Model
  activeModel: 'body' | 'skeleton';

  // Dynamic Camera Focus
  cameraFocusTarget: [number, number, number] | null;
  cameraFocusDistance: number | null;

  // Multi-System Visibility
  systemVisibility: Record<AnatomicalSystem, boolean>;

  // Actions
  setSex: (sex: AnatomicalSex) => void;
  selectStructure: (id: string | null, worldCenter?: [number, number, number], customDisplayName?: string) => void;
  hoverStructure: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setAnatomicalPlane: (plane: AnatomicalPlane) => void;
  setSearchQuery: (query: string) => void;
  toggleIsolateMode: () => void;
  toggleInspector: (open?: boolean) => void;
  toggleSystemVisibility: (system: AnatomicalSystem) => void;
  setActiveModel: (model: 'body' | 'skeleton') => void;
  focusRegion: (region: 'head' | 'thorax' | 'abdomen' | 'pelvis' | 'full') => void;
  resetCamera: () => void;
}

export const useAnatomyStore = create<AnatomyState>((set, get) => ({
  selectedId: null,
  hoveredId: null,
  selectedStructure: null,
  selectedDisplayName: null,
  viewMode: 'standard',
  anatomicalPlane: 'perspective',
  searchQuery: '',
  isIsolateMode: false,
  showInspector: false,
  cameraResetKey: 0,
  sex: 'male',
  activeModel: 'body',
  cameraFocusTarget: null,
  cameraFocusDistance: null,

  systemVisibility: {
    skeletal: true,
    muscular: true,
    visceral: true,
    // Heavy systems default OFF — only load when user enables them.
    // This cuts initial network payload from 52 MB → ~26 MB.
    circulatory: false,
    nervous: false,
    reproductive: false,
    integumentary: true,
  },

  setSex: (sex) => {
    set({ sex });
  },

  selectStructure: (id, worldCenter, customDisplayName) => {
    if (!id) {
      set({
        selectedId: null,
        selectedStructure: null,
        selectedDisplayName: null,
        showInspector: false,
        isIsolateMode: false,
      });
      return;
    }

    const lowerId = id.toLowerCase();
    const cleanTitle = customDisplayName ? formatAnatomicalName(customDisplayName) : formatAnatomicalName(id);

    // 1. Try matching in the clinical database
    let found = ANATOMY_DATABASE.find(
      (item) => item.id.toLowerCase() === lowerId || lowerId.includes(item.id.toLowerCase())
    );

    // 2. If not found, build a rich dynamic clinical record for ANY organ, bone, or muscle
    if (!found) {
      const isBone =
        lowerId.includes('bone') || lowerId.includes('carpal') || lowerId.includes('tarsal') ||
        lowerId.includes('phalanx') || lowerId.includes('metacarp') || lowerId.includes('metatars') ||
        lowerId.includes('femur') || lowerId.includes('tibia') || lowerId.includes('fibul') ||
        lowerId.includes('skull') || lowerId.includes('rib') || lowerId.includes('verteb') ||
        lowerId.includes('pelv') || lowerId.includes('hand') || lowerId.includes('foot');

      const isOrgan =
        lowerId.includes('heart') || lowerId.includes('lung') || lowerId.includes('liver') ||
        lowerId.includes('kidney') || lowerId.includes('stomach') || lowerId.includes('intestin') ||
        lowerId.includes('bladder') || lowerId.includes('spleen');

      const isRepro =
        lowerId.includes('penis') || lowerId.includes('testis') || lowerId.includes('prostate') ||
        lowerId.includes('uterus') || lowerId.includes('ovary') || lowerId.includes('vagina') ||
        lowerId.includes('vulva') || lowerId.includes('genit');

      const isNerve =
        lowerId.includes('brain') || lowerId.includes('cerebr') || lowerId.includes('cerebell') ||
        lowerId.includes('nerve') || lowerId.includes('spinal');

      const system: AnatomicalSystem = isRepro
        ? 'reproductive'
        : isNerve
        ? 'nervous'
        : isOrgan
        ? 'visceral'
        : isBone
        ? 'skeletal'
        : 'muscular';

      const region =
        lowerId.includes('femur') || lowerId.includes('tibia') || lowerId.includes('foot') || lowerId.includes('tarsal')
          ? 'Lower Limb'
          : lowerId.includes('hand') || lowerId.includes('carpal') || lowerId.includes('humer') || lowerId.includes('arm')
          ? 'Upper Limb'
          : lowerId.includes('skull') || lowerId.includes('brain') || lowerId.includes('head')
          ? 'Head & Neck'
          : isRepro || lowerId.includes('pelv') || lowerId.includes('bladder')
          ? 'Abdomen & Pelvis'
          : 'Thorax';

      found = {
        id,
        name: cleanTitle,
        latinName: `Anatomia ${cleanTitle}`,
        system,
        region,
        overview: `Segmented anatomical component (${cleanTitle}) rendered with authentic medical mesh geometry.`,
        function: [
          'Contributes to structural biomechanics, kinetic motility, and physiological stability',
          'Enclosed within distinct regional fascial, neurovascular, and visceral compartments'
        ],
        clinicalSignificance: {
          commonPathology: ['Pathological trauma', 'Inflammatory strain', 'Functional restriction'],
          clinicalNotes: 'Evaluated clinically via visual inspection, palpation, and radiological cross-sectional CT/MRI imaging.'
        },
      };
    }

    set({
      selectedId: id,
      selectedStructure: found,
      selectedDisplayName: found.name,
      showInspector: true,
      cameraFocusTarget: worldCenter || null,
      cameraFocusDistance: 1.4,
    });
  },

  hoverStructure: (id) => set({ hoveredId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setAnatomicalPlane: (plane) => set({ anatomicalPlane: plane }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleIsolateMode: () => set((s) => ({ isIsolateMode: !s.isIsolateMode })),
  toggleInspector: (open) => set((s) => ({ showInspector: open !== undefined ? open : !s.showInspector })),
  toggleSystemVisibility: (system) =>
    set((s) => ({
      systemVisibility: { ...s.systemVisibility, [system]: !s.systemVisibility[system] },
    })),
  setActiveModel: (model) => set({ activeModel: model }),

  focusRegion: (region) => {
    switch (region) {
      case 'head':
        set({ cameraFocusTarget: [0, 1.05, 0], cameraFocusDistance: 1.5, showInspector: false });
        break;
      case 'thorax':
        set({ cameraFocusTarget: [0, 0.45, 0], cameraFocusDistance: 1.8, showInspector: false });
        break;
      case 'abdomen':
        set({ cameraFocusTarget: [0, -0.05, 0], cameraFocusDistance: 1.8, showInspector: false });
        break;
      case 'pelvis':
        set({ cameraFocusTarget: [0, -0.65, 0], cameraFocusDistance: 1.8, showInspector: false });
        break;
      case 'full':
      default:
        set({
          selectedId: null,
          selectedStructure: null,
          showInspector: false,
          isIsolateMode: false,
          cameraFocusTarget: [0, -0.2, 0],
          cameraFocusDistance: 4.8,
          cameraResetKey: get().cameraResetKey + 1,
          anatomicalPlane: 'perspective',
        });
        break;
    }
  },

  resetCamera: () => {
    get().focusRegion('full');
  },
}));
