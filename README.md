# 🫀 Human Anatomy 3D Atlas

An interactive, high-fidelity 3D human anatomy atlas designed for medical students, clinicians, educators, and anatomy researchers. Built with **Next.js 14**, **React Three Fiber**, **Three.js**, **Zustand**, and **Tailwind CSS**, powered by clinical 3D datasets from the **HuBMAP Human Reference Atlas (HRA)** and the **Visible Human Project**.

---

## ✨ Features

### 1. Multi-System Anatomical Explorer
Freely toggle, combine, and inspect all major human physiological systems:
- 💀 **Skeletal System**: Full axial and appendicular skeleton, featuring individual cranial, vertebral, thoracic, pelvic, upper, and lower limb bones.
- 💪 **Muscular System**: Superficial and deep skeletal musculature, colored in clinical crimson contrast over ivory bone geometry.
- 🫁 **Visceral Organs**: Anatomically calibrated Thoracic and Abdominopelvic viscera:
  - **Heart** (mediastinum behind sternal body, between 2nd & 5th ribs)
  - **Lungs** (bilateral thoracic cavities from 1st rib apex to diaphragm)
  - **Liver** (right hypochondrium directly beneath right hemidiaphragm)
  - **Stomach** (left hypochondrium & epigastrium)
  - **Kidneys** (retroperitoneal T12–L3 posterior abdominal wall)
  - **Urinary Bladder** (true lesser pelvis posterior to pubic symphysis)
- 🩸 **Circulatory System**: Ascending aorta, aortic arch, carotid trunks, and major peripheral arterial and venous vessels aligned directly with the heart.
- 🧠 **Nervous System**: Cranial vault brain (cerebrum & cerebellum), vertebral canal spinal cord, and peripheral nerve plexuses.
- 🧬 **Reproductive System (Male ♂ & Female ♀)**:
  - **Female ♀**: Complete internal pelvic reproductive viscera from the NIH HuBMAP Visible Human Female reference library (uterus, cervix, fallopian tubes, ovaries, vagina, uterosacral ligaments, and uterine vasculature).
  - **Male ♂**: Prostate gland, testes, seminal structures, and associated genitalia.

---

### 2. Clinical Inspection & Pathology Inspector
- **Precise 3D Raycasting**: Click on any bone, muscle, or organ to inspect its exact 3D centroid.
- **Plain English Common Names**: Displays user-friendly everyday names (e.g. *Collarbone* for Clavicle, *Calf Muscle* for Gastrocnemius, *Upper Jaw* for Maxilla) alongside official Latin terminologia anatomica.
- **Physiological Functions**: Bulleted breakdown of biomechanical, metabolic, and neurological roles.
- **Pathologies & Clinical Notes**: High-yield medical summaries of common fractures, injuries, diseases (e.g. Colles' fracture, rotator cuff tears, disc herniations, appendicitis, DVT), and clinical exam findings (e.g. Thompson squeeze test, radial nerve sensory testing).

---

### 3. Navigation, Planes & Diagnostic Modes
- **Structure Isolation Mode (`I`)**: Instantly hides all other structures to allow 360° examination of a single bone, organ, or muscle in isolation.
- **Diagnostic View Modes**:
  - **Atlas**: Clinical opaque anatomical rendering with natural tissue hues.
  - **X-Ray (`2`)**: Translucent depth-buffered rendering to observe interior organ-bone relationships.
  - **Wireframe (`3`)**: Structural polygonal topology display.
- **Anatomical Planes**: Instant orthographic alignment to standard clinical planes:
  - **Coronal** (Frontal plane)
  - **Sagittal** (Lateral profile)
  - **Transverse** (Axial superior view)
- **Quick Focus Regions**: 1-click zoom to **Head**, **Thorax**, **Abdomen**, **Pelvis**, **Arms & Hands**, and **Legs & Feet**.

---

### 4. Gestures & Keyboard Hotkeys

| Action | Mouse / Touch Gesture | Keyboard Shortcut |
| :--- | :--- | :---: |
| **Rotate View** | Left Click + Drag (or 1 finger) | — |
| **Pan Camera** | Right Click + Drag (or 2 fingers) | — |
| **Zoom In / Out** | Mouse Wheel (or Pinch) | — |
| **Inspect Structure** | Click on any bone/organ/muscle | — |
| **Reset View** | Click "Reset" button | <kbd>R</kbd> |
| **Toggle Isolate Mode** | Click "Isolate" button | <kbd>I</kbd> |
| **Close Inspector / Deselect** | Click "✕" button | <kbd>Esc</kbd> |
| **Atlas View Mode** | Toolbar "Atlas" | <kbd>1</kbd> |
| **X-Ray View Mode** | Toolbar "X-Ray" | <kbd>2</kbd> |
| **Wireframe View Mode** | Toolbar "Wireframe" | <kbd>3</kbd> |

---

## ⚡ Performance Optimizations

1. **Skeleton-First Default**: Boots into a lightweight skeleton model for instantaneous first paint on mobile and low-power devices.
2. **Lazy System Streaming**: Circulatory, Visceral, Nervous, and Reproductive layers are dynamically imported and preloaded only when first requested.
3. **Singleton GLB Cache**: Centralized Three.js GLTF loader cache prevents redundant HTTP requests or duplicate vertex decoding.
4. **O(1) Hover Updates**: Mouse hover events query a dedicated UUID lookup map, bypassing traversal of 800+ meshes per frame.
5. **Static Production Delivery**: Assets are served statically with immutable cache headers and CORS headers.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React Server Components)
- **3D Graphics**: [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (`@react-three/fiber`, `@react-three/drei`)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Language**: TypeScript

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/AK47GT18/anatomy.git
cd anatomy

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the atlas.

### Production Build
```bash
# Generate optimized production build
npm run build

# Start production server
npm run start
```

---

## 📄 Dataset Attributions & Licensing

- **HuBMAP Human Reference Atlas (HRA) 3D Reference Object Library**:
  - Visible Human Female reference organs: Uterus, Fallopian Tubes, Ovaries, Vagina, Ligaments, Uterine Vasculature, Urinary Bladder.
  - Creators: Kristen Browne, Heidi Schlehlein, Bruce W. Herr II, Ellen Quardokus, Andreas Bueckle, and Katy Börner.
  - Publisher: HuBMAP (NIH Award OT2OD026671).
  - License: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- Detailed source hashes, DOIs, and transforms: see [`public/models/ATTRIBUTION.md`](public/models/ATTRIBUTION.md) and [`public/models/manifest.json`](public/models/manifest.json).
