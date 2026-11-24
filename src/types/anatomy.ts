export type AnatomicalSystem = 
  | 'skeletal' 
  | 'muscular' 
  | 'visceral' 
  | 'circulatory' 
  | 'nervous' 
  | 'reproductive'
  | 'integumentary';

export type AnatomicalRegion = 
  | 'Head & Neck'
  | 'Thorax'
  | 'Abdomen & Pelvis'
  | 'Vertebral Column'
  | 'Upper Limb'
  | 'Lower Limb';

export type AnatomicalPlane = 'perspective' | 'sagittal' | 'coronal' | 'transverse';

export type ViewMode = 'standard' | 'xray' | 'isolated' | 'wireframe';

export type AnatomicalSex = 'male' | 'female';

export interface ClinicalSignificance {
  commonPathology: string[];
  fractureRisk?: 'Low' | 'Moderate' | 'High' | 'Critical';
  clinicalNotes: string;
}

export interface AnatomicalStructure {
  id: string;
  name: string;
  commonName?: string;
  latinName: string;
  system: AnatomicalSystem;
  subsystem?: string;
  region: AnatomicalRegion;
  sex?: AnatomicalSex | 'both';
  overview: string;
  function: string[];
  articulations?: string[];
  innervation?: string;
  bloodSupply?: string;
  clinicalSignificance: ClinicalSignificance;
  cameraFocus?: {
    target: [number, number, number];
    position: [number, number, number];
  };
}

export interface SystemLayerConfig {
  id: AnatomicalSystem;
  label: string;
  description: string;
  color: string;
  visible: boolean;
  opacity: number;
  count: number;
}
