import { AnatomicalStructure, SystemLayerConfig } from '@/types/anatomy';

export const SYSTEM_LAYERS: SystemLayerConfig[] = [
  { id: 'skeletal', label: 'Skeletal System', description: 'Osteological framework, articulations, hands, feet', color: '#c8b89a', visible: true, opacity: 1.0, count: 206 },
  { id: 'muscular', label: 'Muscular System', description: 'Contractile skeletal muscle bellies and tendons', color: '#c0392b', visible: true, opacity: 0.95, count: 650 },
  { id: 'visceral', label: 'Visceral Organs', description: 'Heart, lungs, liver, stomach, kidneys, intestines', color: '#e67e22', visible: true, opacity: 1.0, count: 78 },
  { id: 'nervous', label: 'Nervous System', description: 'Brain hemispheres, cerebellum, spinal cord, somatic nerves', color: '#f1c40f', visible: true, opacity: 1.0, count: 43 },
  { id: 'reproductive', label: 'Genital & Pelvis', description: 'Male & Female reproductive viscera and external genitalia', color: '#9b59b6', visible: true, opacity: 1.0, count: 18 },
  { id: 'circulatory', label: 'Vascular Network', description: 'Aorta, vena cava, carotids, femoral neurovascular bundles', color: '#e74c3c', visible: true, opacity: 1.0, count: 120 },
  { id: 'integumentary', label: 'Body Envelope', description: 'Translucent anatomical silhouette', color: '#5dade2', visible: true, opacity: 0.22, count: 1 },
];

export const ANATOMY_DATABASE: AnatomicalStructure[] = [
  // ── REPRODUCTIVE & GENITAL ORGANS ─────────────────────────
  {
    id: 'male_genitalia',
    name: 'Male Reproductive System (Testes, Prostate & Penis)',
    commonName: 'Male Reproductive Organs',
    latinName: 'Systema Genitale Masculinum',
    system: 'reproductive',
    subsystem: 'Pelvic Viscera & Perineum',
    region: 'Abdomen & Pelvis',
    sex: 'male',
    overview: 'The male reproductive apparatus comprising the bilateral testes (endocrine and spermatogenic gonads), epididymides, ductus deferentia, prostate gland, and penis.',
    function: [
      'Spermatogenesis and testosterone hormone synthesis in testicular Leydig cells',
      'Prostatic secretion of alkaline fluid neutralizing vaginal acidity',
      'Erection, ejaculation, and urinary conduction via prostatic and penile urethra'
    ],
    innervation: 'Pudendal nerve (S2-S4) and prostatic autonomic plexus',
    bloodSupply: 'Internal pudendal artery and testicular arteries from abdominal aorta',
    clinicalSignificance: {
      commonPathology: ['Benign prostatic hyperplasia (BPH)', 'Prostate adenocarcinoma', 'Testicular torsion', 'Erectile dysfunction'],
      clinicalNotes: 'Testicular torsion is a surgical emergency; ischemia exceeding 6 hours causes irreversible testicular necrosis.'
    },
  },
  {
    id: 'female_genitalia',
    name: 'Female Reproductive System (Uterus, Ovaries & Vulva)',
    commonName: 'Female Reproductive Organs (Womb & Ovaries)',
    latinName: 'Systema Genitale Femininum',
    system: 'reproductive',
    subsystem: 'Pelvic Viscera & Perineum',
    region: 'Abdomen & Pelvis',
    sex: 'female',
    overview: 'The female reproductive system consisting of the muscular pear-shaped uterus, paired ovaries, uterine (Fallopian) tubes, cervix, vagina, and external vulva.',
    function: [
      'Oogenesis and cycloid secretion of estrogen and progesterone',
      'Fertilization in fallopian ampulla and embryonic blastocyst implantation in endometrium',
      'Gestation, fetal development, and labor myometrial contractions'
    ],
    innervation: 'Uterovaginal plexus (Frankenhäuser plexus) and pudendal nerve',
    bloodSupply: 'Uterine arteries (branch of internal iliac) and ovarian arteries (aortic origin)',
    clinicalSignificance: {
      commonPathology: ['Endometriosis', 'Uterine leiomyomas (fibroids)', 'Ectopic tubal pregnancy', 'Cervical dysplasia (HPV)'],
      clinicalNotes: 'The ureter passes directly inferior to the uterine artery ("water under the bridge"); a key hazard during hysterectomy.'
    },
  },
  {
    id: 'urinary_bladder',
    name: 'Urinary Bladder & Ureters',
    commonName: 'Bladder',
    latinName: 'Vesica Urinaria',
    system: 'visceral',
    subsystem: 'Urinary Viscera',
    region: 'Abdomen & Pelvis',
    sex: 'both',
    overview: 'Hollow distensible muscular reservoir situated extraperitoneally behind the pubic symphysis, featuring the detrusor muscle and mucosal trigone.',
    function: [
      'Stores 400-600 mL of urine under low hydrostatic pressure',
      'Executes micturition through coordinated parasympathetic detrusor contraction and urethral sphincter relaxation'
    ],
    innervation: 'Pelvic splanchnic nerves (S2-S4, parasympathetic) and hypogastric plexus',
    bloodSupply: 'Superior and inferior vesical arteries (internal iliac branches)',
    clinicalSignificance: {
      commonPathology: ['Urinary tract infection (cystitis)', 'Urothelial bladder carcinoma', 'Neurogenic bladder', 'Urinary retention'],
      clinicalNotes: 'Full bladder rises above the pubic crest and is vulnerable to rupture in blunt seatbelt pelvic trauma.'
    },
  },

  // ── NERVOUS SYSTEM & BRAIN ────────────────────────────────
  {
    id: 'brain_cerebrum',
    name: 'Brain (Cerebrum, Cerebellum & Brainstem)',
    commonName: 'Brain',
    latinName: 'Encephalon',
    system: 'nervous',
    subsystem: 'Central Nervous System',
    region: 'Head & Neck',
    sex: 'both',
    overview: 'The central organ of the human nervous system hosting 86 billion neurons, partitioned into cerebral cortex (frontal, parietal, temporal, occipital lobes), cerebellum, and brainstem.',
    function: [
      'Conscious perception, executive cognition, decision-making, and emotional processing',
      'Cerebellar motor coordination, postural equilibrium, and proprioceptive integration',
      'Autonomous autonomic centers in medulla regulating respiration, heart rate, and blood pressure'
    ],
    innervation: '12 pairs of cranial nerves originating from brainstem and cerebrum',
    bloodSupply: 'Circle of Willis (Bilateral internal carotid and vertebrobasilar arteries)',
    clinicalSignificance: {
      commonPathology: ['Ischemic stroke (MCA territory)', 'Intracranial hemorrhage', 'Glioblastoma', 'Traumatic brain injury (TBI)'],
      clinicalNotes: 'The brain accounts for 20% of resting oxygen consumption; total arterial cessation causes irreversible necrosis within 4 minutes.'
    },
  },
  {
    id: 'spinal_cord',
    name: 'Spinal Cord & Spinal Nerves',
    commonName: 'Spinal Cord & Nerves',
    latinName: 'Medulla Spinalis',
    system: 'nervous',
    subsystem: 'Central Nervous System',
    region: 'Vertebral Column',
    sex: 'both',
    overview: 'Cylindrical neural conduit extending from the foramen magnum to the L1-L2 vertebral interspace, terminating as conus medullaris and cauda equina.',
    function: [
      'Transmits ascending sensory tracts (spinothalamic, dorsal columns) to the brain',
      'Transmits descending motor tracts (corticospinal) to skeletal muscle effectors',
      'Executes intrinsic somatic reflex arcs (patellar, Achilles reflexes)'
    ],
    innervation: '31 pairs of bilateral spinal nerves (8C, 12T, 5L, 5S, 1Co)',
    bloodSupply: 'Anterior spinal artery and paired posterior spinal arteries',
    clinicalSignificance: {
      commonPathology: ['Spinal cord compression', 'Cauda equina syndrome', 'Amyotrophic lateral sclerosis (ALS)'],
      clinicalNotes: 'Cauda equina syndrome manifests with saddle anesthesia and sphincter dysfunction; requires decompression within 24-48 hours.'
    },
  },

  // ── VISCERAL THORACIC & ABDOMINAL ORGANS ───────────────────
  {
    id: 'heart_organ',
    name: 'Heart (Cor) & Pericardium',
    commonName: 'Heart',
    latinName: 'Cor (Myocardium)',
    system: 'visceral',
    subsystem: 'Cardiovascular',
    region: 'Thorax',
    sex: 'both',
    overview: 'Four-chambered muscular muscular pump located in the middle mediastinum, contracting 100,000 times daily to pump 7,500 liters of blood.',
    function: ['Drives systemic high-pressure arterial circulation', 'Drives pulmonary low-pressure oxygenation circulation'],
    innervation: 'Cardiac autonomic plexus (Sympathetic T1-T4, Parasympathetic Vagus CN X)',
    bloodSupply: 'Right and Left coronary arteries (LAD and Circumflex)',
    clinicalSignificance: {
      commonPathology: ['Myocardial infarction', 'Congestive heart failure', 'Cardiac tamponade'],
      clinicalNotes: 'LAD coronary artery occlusion ("widow-maker") rapidly causes anterior wall infarction and lethal arrhythmias.'
    },
  },
  {
    id: 'lungs_viscera',
    name: 'Lungs (Right 3 Lobes & Left 2 Lobes)',
    commonName: 'Lungs',
    latinName: 'Pulmones',
    system: 'visceral',
    subsystem: 'Respiratory System',
    region: 'Thorax',
    sex: 'both',
    overview: 'Paired spongy respiratory organs (Right lung: superior, middle, inferior lobes; Left lung: superior, inferior lobes with cardiac notch) hosting 300 million alveoli.',
    function: ['Alveolar gas exchange (O2 uptake & CO2 elimination)', 'Acid-base balance regulation'],
    bloodSupply: 'Pulmonary arteries (functional), Bronchial arteries (nutritive)',
    clinicalSignificance: {
      commonPathology: ['Pneumonia', 'Pulmonary embolism', 'COPD / Emphysema', 'Pneumothorax'],
      clinicalNotes: 'Saddle pulmonary embolus obstructing the pulmonary bifurcation produces acute right ventricular heart failure and arrest.'
    },
  },
  {
    id: 'liver_viscera',
    name: 'Liver (Hepar) & Gallbladder',
    commonName: 'Liver',
    latinName: 'Hepar et Vesica Biliaris',
    system: 'visceral',
    subsystem: 'Digestive & Metabolic',
    region: 'Abdomen & Pelvis',
    sex: 'both',
    overview: 'The largest internal solid organ and metabolic factory, occupying the right hypochondrium and epigastrium, partitioned into 8 Couinaud functional segments.',
    function: ['Detoxification of metabolic waste and drugs', 'Synthesis of albumin and coagulation factors (II, VII, IX, X)', 'Bile secretion'],
    bloodSupply: 'Portal vein (75% flow, nutrient-rich) & Hepatic artery (25% flow, oxygen-rich)',
    clinicalSignificance: {
      commonPathology: ['Cirrhosis and portal hypertension', 'Hepatocellular carcinoma', 'Cholelithiasis'],
      clinicalNotes: 'Portal hypertension engorges portosystemic anastomoses: esophageal varices carry high mortality if ruptured.'
    },
  },
  {
    id: 'stomach_viscera',
    name: 'Stomach & Duodenum',
    commonName: 'Stomach',
    latinName: 'Gaster / Ventriculus',
    system: 'visceral',
    subsystem: 'Gastrointestinal',
    region: 'Abdomen & Pelvis',
    sex: 'both',
    overview: 'J-shaped muscular reservoir expanding between esophagus and duodenum, featuring cardia, fundus, body, and antrum with rugal mucosal folds.',
    function: ['Gastric hydrochloric acid (HCl) and pepsin protein breakdown', 'Mechanical churning of food bolus into chyme'],
    bloodSupply: 'Celiac trunk branches (left gastric, right gastric, gastroepiploic arteries)',
    clinicalSignificance: {
      commonPathology: ['Peptic ulcer disease', 'Gastric adenocarcinoma', 'Perforated ulcer causing acute peritonitis'],
      clinicalNotes: 'Posterior peptic ulcer erosion into the splenic artery causes massive hematemesis and hemorrhagic shock.'
    },
  },
  {
    id: 'kidneys_viscera',
    name: 'Kidneys (Renes) & Adrenal Glands',
    commonName: 'Kidneys',
    latinName: 'Renes et Glandulae Suprarenales',
    system: 'visceral',
    subsystem: 'Renal & Endocrine',
    region: 'Abdomen & Pelvis',
    sex: 'both',
    overview: 'Paired retroperitoneal bean-shaped filtration organs positioned at T12-L3, processing 180 liters of plasma daily through 2 million nephrons.',
    function: ['Regulates extracellular fluid volume, osmolarity, and electrolytes', 'Excretes urea and creatinine', 'Secretes erythropoietin and renin'],
    bloodSupply: 'Renal arteries directly branching from abdominal aorta',
    clinicalSignificance: {
      commonPathology: ['Acute kidney injury', 'Chronic kidney disease', 'Nephrolithiasis (kidney stones)'],
      clinicalNotes: 'Ureteral stones cause agonizing colicky flank pain radiating to the ipsilateral groin.'
    },
  },
  {
    id: 'intestines_viscera',
    name: 'Intestines (Small Intestine & Colon)',
    commonName: 'Intestines (Bowels)',
    latinName: 'Intestinum Tenue et Crassum',
    system: 'visceral',
    subsystem: 'Gastrointestinal',
    region: 'Abdomen & Pelvis',
    sex: 'both',
    overview: 'Extensive folded tract consisting of 6 meters of small intestine (duodenum, jejunum, ileum) framed by the large colon (cecum, ascending, transverse, descending, sigmoid).',
    function: ['Nutrient and electrolyte absorption', 'Microbiome fermentation and vitamin K synthesis'],
    bloodSupply: 'Superior mesenteric artery (SMA) & Inferior mesenteric artery (IMA)',
    clinicalSignificance: {
      commonPathology: ['Acute appendicitis', 'Crohn disease and Ulcerative Colitis', 'Mesenteric ischemia', 'Bowel obstruction'],
      clinicalNotes: 'Acute appendicitis starts with periumbilical visceral pain that later shifts to McBurney point in the right lower quadrant.'
    },
  },

  // ── SKELETON: BONES OF HANDS & FEET ───────────────────────
  {
    id: 'hand_bones',
    name: 'Bones of Hand (Carpals, Metacarpals & Phalanges)',
    commonName: 'Hand Bones (Fingers, Palm & Wrist)',
    latinName: 'Ossa Manus (Carpus, Metacarpus, Phalanges)',
    system: 'skeletal',
    subsystem: 'Appendicular Skeleton',
    region: 'Upper Limb',
    sex: 'both',
    overview: 'Complex assembly of 27 bones: 8 carpals (Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate), 5 metacarpals, and 14 phalanges.',
    function: ['Enables precision pincer grasp and high-force power grip', 'Houses carpal tunnel transmitting median nerve and digital flexor tendons'],
    articulations: ['Distal radius and articular disc (Radiocarpal joint)', 'Intercarpal and carpometacarpal joints'],
    innervation: 'Median, Ulnar, and Radial nerves',
    bloodSupply: 'Superficial and deep palmar arterial arches',
    clinicalSignificance: {
      commonPathology: ['Scaphoid fracture (high risk of avascular necrosis)', 'Carpal tunnel syndrome', 'Boxer fracture (5th metacarpal neck)'],
      fractureRisk: 'High',
      clinicalNotes: 'Scaphoid fractures display anatomical snuffbox tenderness; retrograde blood supply puts proximal pole at high risk of osteonecrosis.'
    },
  },
  {
    id: 'foot_bones',
    name: 'Bones of Foot (Tarsals, Metatarsals & Phalanges)',
    commonName: 'Foot Bones (Toes, Arch & Ankle)',
    latinName: 'Ossa Pedis (Tarsus, Metatarsus, Phalanges)',
    system: 'skeletal',
    subsystem: 'Appendicular Skeleton',
    region: 'Lower Limb',
    sex: 'both',
    overview: 'Architecture of 26 bones arranged into longitudinal and transverse biomechanical shock-absorbing arches: Talus, Calcaneus, Navicular, Cuboid, 3 Cuneiforms, 5 Metatarsals, and 14 Phalanges.',
    function: ['Dynamic ground contact absorption and toe-off propulsion', 'Distributes body mass during upright bipedal stance'],
    articulations: ['Talocrural ankle mortise', 'Subtalar joint', 'Transverse tarsal joint'],
    innervation: 'Tibial nerve branches (Medial & Lateral plantar nerves) and Peroneal nerves',
    bloodSupply: 'Dorsalis pedis artery and posterior tibial artery',
    clinicalSignificance: {
      commonPathology: ['Calcaneal fracture from high falls', 'Jones fracture (base of 5th metatarsal)', 'Lisfranc fracture-dislocation'],
      fractureRisk: 'High',
      clinicalNotes: 'A high fall producing a calcaneal fracture mandates spinal imaging to rule out associated thoracolumbar burst fractures.'
    },
  },

  // ── CORE SKELETAL STRUCTURES ──────────────────────────────
  {
    id: 'cranium',
    name: 'Cranium (Skull Vault & Facial Skeleton)',
    commonName: 'Skull',
    latinName: 'Cranium / Calvaria',
    system: 'skeletal',
    subsystem: 'Axial Skeleton',
    region: 'Head & Neck',
    sex: 'both',
    overview: 'The bony protective vault enclosing the cerebral hemispheres, paired with the facial skeleton supporting orbital and nasal cavities.',
    function: ['Protects cerebral hemispheres and brainstem', 'Houses visual, auditory, and olfactory sensory organs'],
    articulations: ['Mandible (TMJ)', 'Atlas C1 (Atlanto-occipital joint)'],
    clinicalSignificance: {
      commonPathology: ['Epidural hematoma (pterion fracture)', 'Basilar skull fracture'],
      fractureRisk: 'High',
      clinicalNotes: 'Pterion trauma tears the underlying anterior branch of the middle meningeal artery, precipitating rapid epidural hematoma.'
    },
  },
  {
    id: 'femur',
    name: 'Femur (Thigh Bone)',
    commonName: 'Thighbone',
    latinName: 'Femur',
    system: 'skeletal',
    subsystem: 'Appendicular Skeleton',
    region: 'Lower Limb',
    sex: 'both',
    overview: 'The longest, heaviest, and strongest long bone in the human body, engineered with a 125-degree femoral neck angle of inclination.',
    function: ['Primary mechanical weight-bearing lever for upright locomotion', 'Deep insertion site for gluteal and quadriceps musculature'],
    articulations: ['Pelvic acetabulum (hip joint)', 'Tibia & Patella (knee joint)'],
    clinicalSignificance: {
      commonPathology: ['Subcapital femoral neck fracture', 'Intertrochanteric fracture', 'Femoral shaft fracture'],
      fractureRisk: 'High',
      clinicalNotes: 'Femoral neck fractures disrupt retinacular arteries from medial circumflex femoral artery, often leading to avascular necrosis.'
    },
  },
];
