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
  activeModel: 'skeleton',
  cameraFocusTarget: null,
  cameraFocusDistance: null,

  systemVisibility: {
    skeletal: true,
    muscular: false,
    visceral: false,
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
        lowerId.includes('pelv') || lowerId.includes('hand') || lowerId.includes('foot') ||
        lowerId.includes('clavic') || lowerId.includes('scapul') || lowerId.includes('stern') ||
        lowerId.includes('patell') || lowerId.includes('humer') || lowerId.includes('radiu') ||
        lowerId.includes('ulna') || lowerId.includes('sacr') || lowerId.includes('coccy') ||
        lowerId.includes('cartilage') || lowerId.includes('tooth') || lowerId.includes('molar');

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
        lowerId.includes('femur') || lowerId.includes('tibia') || lowerId.includes('foot') || lowerId.includes('tarsal') || lowerId.includes('fibul') || lowerId.includes('patell')
          ? 'Lower Limb'
          : lowerId.includes('hand') || lowerId.includes('carpal') || lowerId.includes('humer') || lowerId.includes('arm') || lowerId.includes('radiu') || lowerId.includes('ulna') || lowerId.includes('clavic') || lowerId.includes('scapul')
          ? 'Upper Limb'
          : lowerId.includes('skull') || lowerId.includes('brain') || lowerId.includes('head') || lowerId.includes('mandib') || lowerId.includes('maxill') || lowerId.includes('frontal') || lowerId.includes('parietal') || lowerId.includes('temporal') || lowerId.includes('occipital')
          ? 'Head & Neck'
          : isRepro || lowerId.includes('pelv') || lowerId.includes('bladder') || lowerId.includes('sacr') || lowerId.includes('pubis') || lowerId.includes('ilium')
          ? 'Abdomen & Pelvis'
          : lowerId.includes('verteb') || lowerId.includes('spine')
          ? 'Vertebral Column'
          : 'Thorax';

      // Clinical Common Name resolution
      let commonName = cleanTitle;
      let commonPathology = ['Traumatic injury or fracture', 'Degenerative strain or inflammation', 'Functional mechanical restriction'];
      let functionList = [
        'Maintains structural biomechanics and physical stability',
        'Facilitates coordinated kinetic movement and anatomical containment'
      ];
      let clinicalNotes = 'Evaluated clinically via visual inspection, palpation, and cross-sectional radiological imaging (X-Ray / CT / MRI).';

      if (lowerId.includes('clavicle')) {
        commonName = 'Collarbone';
        commonPathology = ['Clavicular midshaft fracture (most common shoulder fracture)', 'Acromioclavicular (AC) joint separation ("shoulder separation")', 'Sternoclavicular joint arthritis'];
        functionList = ['Acts as a strut connecting the upper limb to the axial trunk', 'Protects underlying subclavian vessels and brachial plexus'];
        clinicalNotes = 'Commonly injured during direct shoulder impacts or falls onto an outstretched hand (FOOSH).';
      } else if (lowerId.includes('scapula')) {
        commonName = 'Shoulder Blade';
        commonPathology = ['Scapular winging (long thoracic nerve injury to serratus anterior)', 'Snapping scapula syndrome', 'High-energy scapular body fractures'];
        functionList = ['Provides mobile socket for humerus articulation (glenohumeral joint)', 'Serves as attachment site for 17 distinct muscle groups'];
        clinicalNotes = 'Scapular fractures typically indicate severe thoracic trauma and require screening for pulmonary contusions or rib fractures.';
      } else if (lowerId.includes('sternum')) {
        commonName = 'Breastbone';
        commonPathology = ['Sternal fracture (blunt vehicle deceleration trauma)', 'Costochondritis / Tietze syndrome (benign chest wall pain)', 'Sternal wound infection after cardiac surgery'];
        functionList = ['Protects anterior mediastinum, heart, and great vascular trunks', 'Anchors the anterior costal cartilages during pulmonary ventilation'];
        clinicalNotes = 'Sternal fractures have a high association with underlying myocardial contusion and blunt cardiac trauma.';
      } else if (lowerId.includes('patella')) {
        commonName = 'Kneecap';
        commonPathology = ['Patellar dislocation or subluxation (lateral tracking)', 'Patellofemoral pain syndrome ("Runner\'s Knee")', 'Transverse patellar fracture (disrupts extensor mechanism)'];
        functionList = ['Increases the biomechanical mechanical leverage of the quadriceps tendon by 30%', 'Protects anterior knee joint from direct mechanical trauma'];
        clinicalNotes = 'Inability to perform an active straight leg raise indicates complete disruption of the knee extensor mechanism.';
      } else if (lowerId.includes('femur')) {
        commonName = 'Thighbone (Longest & Strongest Bone)';
        commonPathology = ['Femoral neck fracture (geriatric osteoporotic fall)', 'Femoral shaft high-energy fracture (major hemorrhage risk up to 1.5L)', 'Avascular necrosis (AVN) of femoral head'];
        functionList = ['Transmits entire body weight from hip pelvis to lower leg', 'Provides structural lever arm for walking, running, and climbing'];
        clinicalNotes = 'Displaced femoral neck fractures carry a high rate of avascular necrosis due to disruption of retinacular vessels.';
      } else if (lowerId.includes('tibia')) {
        commonName = 'Shinbone';
        commonPathology = ['Tibial plateau fracture (axial load with valgus/varus stress)', 'Medial tibial stress syndrome ("Shin Splints")', 'Compartment syndrome (orthopedic emergency)'];
        functionList = ['Major weight-bearing column of the lower extremity (bears 85-90% of load)', 'Articulates superiorly with femoral condyles and inferiorly with talus'];
        clinicalNotes = 'The anteromedial border of the tibia is subcutaneous and particularly susceptible to open fractures and poor healing.';
      } else if (lowerId.includes('fibula')) {
        commonName = 'Calf Bone';
        commonPathology = ['Fibular neck fracture with common peroneal (fibular) nerve injury causing foot drop', 'Maisonneuve fracture (proximal fibula fracture with ankle syndesmosis rupture)', 'Lateral malleolus ankle fracture'];
        functionList = ['Provides attachment for leg and ankle stabilizing muscles', 'Forms the lateral mortise (lateral malleolus) stabilizing ankle joint'];
        clinicalNotes = 'Proximal fibular tenderness in any acute ankle injury mandates radiographic evaluation of the entire leg.';
      } else if (lowerId.includes('humerus')) {
        commonName = 'Upper Arm Bone';
        commonPathology = ['Proximal humerus fracture (elderly osteoporotic falls)', 'Midshaft fracture with radial nerve injury causing wrist drop', 'Supracondylar fracture in pediatric falls (brachial artery hazard)'];
        functionList = ['Provides kinetic leverage for throwing, lifting, and upper extremity reach', 'Articulates at glenoid cavity proximally and radius/ulna distally'];
        clinicalNotes = 'Midshaft fractures run alongside the spiral groove; sensory testing of the dorsal first webspace and wrist extension are critical.';
      } else if (lowerId.includes('radius')) {
        commonName = 'Forearm Bone (Thumb-side)';
        commonPathology = ['Colles\' fracture (dorsally displaced distal radius fracture from FOOSH)', 'Radial head fracture (elbow fall)', 'Galeazzi fracture-dislocation'];
        functionList = ['Permits forearm pronation and supination by pivoting around ulna', 'Forms majority of the radiocarpal wrist joint surface'];
        clinicalNotes = 'The most frequently fractured long bone in adults; restoration of articular congruity and radial height prevents chronic wrist pain.';
      } else if (lowerId.includes('ulna')) {
        commonName = 'Forearm Bone (Pinky-side)';
        commonPathology = ['Olecranon fracture ("elbow tip" fracture)', 'Nightstick fracture (direct blow defending against trauma)', 'Monteggia fracture-dislocation (ulnar shaft with radial head dislocation)'];
        functionList = ['Forms stable hinge joint with trochlea of humerus at elbow', 'Acts as stabilizing axis about which radius rotates'];
        clinicalNotes = 'Olecranon fractures are intra-articular and usually require surgical open reduction and internal fixation.';
      } else if (lowerId.includes('mandible')) {
        commonName = 'Lower Jaw';
        commonPathology = ['Mandibular angle / condyle / symphysis fracture', 'Temporomandibular joint (TMJ) dysfunction', 'Mandibular osteonecrosis (antiresorptive medication-related)'];
        functionList = ['Houses lower dentition for mastication (chewing)', 'Provides movable articulation for speech, breathing, and facial expression'];
        clinicalNotes = 'The mandible forms a rigid ring; a fracture on one side is accompanied by a contralateral fracture in over 50% of cases.';
      } else if (lowerId.includes('maxilla')) {
        commonName = 'Upper Jaw & Midface';
        commonPathology = ['Le Fort I, II, III midfacial fractures', 'Maxillary sinusitis (fluid accumulation in antrum of Highmore)', 'Oroantral fistula following molar extraction'];
        functionList = ['Houses upper teeth and forms boundaries of orbits, nasal cavity, and hard palate', 'Contains maxillary paranasal sinuses providing acoustic resonance'];
        clinicalNotes = 'Le Fort fractures disrupt dental occlusion and require careful airway management.';
      } else if (lowerId.includes('vertebra')) {
        commonName = 'Spinal Vertebra';
        commonPathology = ['Herniated intervertebral disc (radiculopathy / sciatica)', 'Vertebral osteoporotic compression fracture', 'Spondylolisthesis (vertebral slippage)', 'Spinal canal stenosis'];
        functionList = ['Protects delicate spinal cord and exiting nerve roots', 'Provides flexible axial column bearing head and torso weight'];
        clinicalNotes = 'Red flags for back pain include sudden cauda equina syndrome (saddle anesthesia, urinary retention), requiring emergency surgical decompression.';
      } else if (lowerId.includes('rib')) {
        commonName = 'Rib';
        commonPathology = ['Rib fractures (sharp pleuritic pain, risk of pneumothorax / hemothorax)', 'Flail chest (segmental fractures disrupting ventilation mechanics)', 'Costochondritis'];
        functionList = ['Expands and recoils to create negative intrathoracic pressure during breathing', 'Protects heart, lungs, liver, and spleen from blunt injury'];
        clinicalNotes = 'Fractures of the 9th-11th ribs on the left carry high risk of splenic rupture; on the right, hepatic laceration.';
      } else if (lowerId.includes('deltoid')) {
        commonName = 'Shoulder Muscle';
        commonPathology = ['Deltoid strain / muscle tear', 'Axillary nerve neuropathy (shoulder dislocation complication)', 'Subdeltoid bursitis'];
        functionList = ['Prime mover of arm abduction beyond 15 degrees', 'Assists in shoulder flexion, extension, and rotation'];
        clinicalNotes = 'The axillary nerve winds around the surgical neck of the humerus directly deep to the deltoid.';
      } else if (lowerId.includes('biceps')) {
        commonName = 'Biceps (Front Arm Muscle)';
        commonPathology = ['Distal biceps tendon rupture (sudden eccentric load, "Popeye" deformity)', 'Long head biceps tendinopathy', 'SLAP tear at superior glenoid labrum'];
        functionList = ['Powerful supinator of the forearm (especially with flexed elbow)', 'Flexes elbow joint and assists shoulder forward flexion'];
        clinicalNotes = 'Distal biceps rupture requires prompt surgical reattachment (within 2-3 weeks) to prevent permanent loss of supination strength.';
      } else if (lowerId.includes('gastrocnemius') || lowerId.includes('soleus')) {
        commonName = 'Calf Muscle (Triceps Surae)';
        commonPathology = ['Achilles tendon rupture (positive Thompson squeeze test)', 'Medial gastrocnemius strain ("Tennis Leg")', 'Deep vein thrombosis (DVT) in soleal venous sinuses'];
        functionList = ['Powerful plantarflexor of the ankle for push-off during walking and running', 'Acts as the peripheral muscle pump returning venous blood to heart'];
        clinicalNotes = 'A palpable gap in the Achilles tendon with absent plantarflexion on calf squeeze confirms complete tendon rupture.';
      } else if (lowerId.includes('quadriceps') || lowerId.includes('rectus femoris')) {
        commonName = 'Front Thigh Muscle (Quads)';
        commonPathology = ['Quadriceps tendon rupture (inability to extend knee against gravity)', 'Quadriceps muscle contusion ("Charley Horse")', 'Myositis ossificans'];
        functionList = ['Primary extensor of the knee joint', 'Rectus femoris also assists in hip flexion'];
        clinicalNotes = 'Aggressive early massage of a deep quad contusion can trigger ectopic bone formation (myositis ossificans).';
      }

      found = {
        id,
        name: cleanTitle,
        commonName,
        latinName: `Anatomia ${cleanTitle}`,
        system,
        region,
        overview: `Authentic segmented 3D anatomical structure (${cleanTitle}) mapped within the human atlas.`,
        function: functionList,
        clinicalSignificance: {
          commonPathology,
          clinicalNotes,
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
