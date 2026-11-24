'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAnatomyStore } from '@/store/anatomyStore';
import { loadGLB, preloadGLB } from '@/lib/gltfLoader';

/**
 * Performance notes
 * -----------------
 * • Uses the shared singleton GLTFLoader (see src/lib/gltfLoader.ts).
 *   The DRACOLoader is initialised once and reused; DRACO wasm is
 *   fetched locally from /public/draco/ — no CDN round-trip.
 *
 * • body.glb is loaded immediately on mount (it is the primary visible
 *   model).  skeleton.glb is preloaded in the background so switching
 *   is instant.
 *
 * • Materials are computed inside a reactive useEffect keyed on the
 *   relevant state slices, NOT inside JSX render.  This prevents
 *   creating new MeshStandardMaterial instances on every React frame.
 */

const BONE_COLOR   = '#e8e3d6'; // warm cortical ivory
const MUSCLE_COLOR = '#8c2a2a'; // deep muscle crimson

function isMuscleMesh(rawName: string): boolean {
  const n = (rawName || '').toLowerCase();
  return (
    n.includes('muscle') || n.includes('tendon') || n.includes('aponeurosis') ||
    n.includes('sheath') || n.includes('fascia') || n.includes('ligament') ||
    n.includes('retinaculum') || n.includes('galea') || n.includes('platysma') ||
    n.includes('biceps') || n.includes('triceps') || n.includes('deltoid') ||
    n.includes('pectoral') || n.includes('rectus') || n.includes('oblique') ||
    n.includes('transversus') || n.includes('intercostal') || n.includes('diaphragm') ||
    n.includes('latissimus') || n.includes('trapezius') || n.includes('rhomboid') ||
    n.includes('levator') || n.includes('splenius') || n.includes('scalenus') ||
    n.includes('masseter') || n.includes('temporalis') || n.includes('pterygoid') ||
    n.includes('buccinator') || n.includes('bucinator') || n.includes('orbicularis') ||
    n.includes('zygomaticus') || n.includes('gluteus') || n.includes('piriformis') ||
    n.includes('obturator') || n.includes('quadriceps') || n.includes('sartorius') ||
    n.includes('gracilis') || n.includes('pectineus') || n.includes('adductor') ||
    n.includes('hamstring') || n.includes('semitendinosus') || n.includes('semimembranosus') ||
    n.includes('gastrocnemius') || n.includes('soleus') || n.includes('popliteus') ||
    n.includes('plantaris') || n.includes('peroneus') || n.includes('fibularis') ||
    n.includes('tibialis') || n.includes('extensor') || n.includes('flexor') ||
    n.includes('abductor') || n.includes('pronator') || n.includes('supinator') ||
    n.includes('brachialis') || n.includes('coracobrachialis') || n.includes('subscapularis') ||
    n.includes('supraspinatus') || n.includes('infraspinatus') || n.includes('teres') ||
    n.includes('serratus') || n.includes('erector') || n.includes('iliocostalis') ||
    n.includes('longissimus') || n.includes('spinalis') || n.includes('multifidus') ||
    n.includes('quadratus') || n.includes('psoas') || n.includes('iliacus') ||
    n.includes('omohyoid') || n.includes('sternocleidomastoid') || n.includes('sternohyoid') ||
    n.includes('thyrohyoid') || n.includes('mylohyoid') || n.includes('geniohyoid') ||
    n.includes('digastric') || n.includes('stylohyoid') || n.includes('palpebrae') ||
    n.includes('tarsus') || n.includes('trochlea') || n.includes('tendinous') ||
    n.includes('synovial') || n.includes('cruciform') || n.includes('corrugator') ||
    n.includes('depressor') || n.includes('mentalis') || n.includes('procerus') ||
    n.includes('risorius') || n.includes('anconeus') || n.includes('palmaris') ||
    n.includes('lumbrical') || n.includes('interossei') || n.includes('interosseous') ||
    n.includes('opponens') || n.includes('gemellus') || n.includes('tensor') ||
    n.includes('scalene') || n.includes('sphincter') || n.includes('perinei')
  );
}

function buildBaseMaterial(isExplicitMuscle: boolean): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial(
    isExplicitMuscle
      ? {
          color: MUSCLE_COLOR,
          roughness: 0.52,
          metalness: 0.03,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        }
      : {
          color: BONE_COLOR,
          roughness: 0.4,
          metalness: 0.03,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        }
  );
}

export const RealAnatomyModel: React.FC = () => {
  const [modelRoot, setModelRoot] = useState<THREE.Group | null>(null);
  const activeModel      = useAnatomyStore((s) => s.activeModel);
  const selectedId       = useAnatomyStore((s) => s.selectedId);
  const hoveredId        = useAnatomyStore((s) => s.hoveredId);
  const selectStructure  = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure   = useAnatomyStore((s) => s.hoverStructure);
  const viewMode         = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode    = useAnatomyStore((s) => s.isIsolateMode);
  const systemVisibility = useAnatomyStore((s) => s.systemVisibility);

  const originalMaterialsRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const meshListRef          = useRef<THREE.Mesh[]>([]);
  const meshByUuidRef        = useRef<Map<string, THREE.Mesh>>(new Map());
  const prevHoveredMeshRef   = useRef<THREE.Mesh | null>(null);
  const prevModelRef         = useRef<string | null>(null);

  // Kick off skeleton preload immediately so toggle is instant
  useEffect(() => {
    preloadGLB('/models/skeleton.glb');
  }, []);

  // ── Load body / skeleton via shared singleton loader ────────────────────────
  useEffect(() => {
    if (prevModelRef.current === activeModel) return;
    prevModelRef.current = activeModel;

    let cancelled = false;
    const modelPath = activeModel === 'skeleton' ? '/models/skeleton.glb' : '/models/body.glb';

    loadGLB(modelPath).then((root) => {
      if (cancelled) return;

      const container = new THREE.Group();
      container.add(root);

      root.updateMatrixWorld(true);
      const box    = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());

      root.position.set(-center.x, -center.y, -center.z);

      const targetHeight = 2.8;
      const scale = size.y > 0 ? targetHeight / size.y : 1;
      container.scale.setScalar(scale);
      container.position.set(0, -0.2, 0);

      const meshList: THREE.Mesh[] = [];
      const matMap = new Map<string, THREE.MeshStandardMaterial>();
      const uuidMap = new Map<string, THREE.Mesh>();

      root.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        const mesh = child as THREE.Mesh;
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeBoundingSphere();
        mesh.raycast = THREE.Mesh.prototype.raycast;

        const isExplicitMuscle = activeModel === 'skeleton' ? false : isMuscleMesh(mesh.name);

        mesh.userData.isMuscle = isExplicitMuscle;
        const mat = buildBaseMaterial(isExplicitMuscle);
        mesh.material = mat;
        matMap.set(mesh.uuid, mat);
        uuidMap.set(mesh.uuid, mesh);
        if (mesh.name) uuidMap.set(mesh.name, mesh);
        meshList.push(mesh);
      });

      originalMaterialsRef.current = matMap;
      meshListRef.current = meshList;
      meshByUuidRef.current = uuidMap;
      setModelRoot(container);
    }).catch((err) => {
      console.error('[RealAnatomyModel] Error loading model:', err);
    });

    return () => { cancelled = true; };
  }, [activeModel]);

  // ── Reactive material updates (selection / viewMode / isolate / visibility) ─
  // Excludes hoveredId to avoid traversing all 826 meshes on every mouse movement!
  useEffect(() => {
    if (!modelRoot || meshListRef.current.length === 0) return;

    meshListRef.current.forEach((mesh) => {
      const original = originalMaterialsRef.current.get(mesh.uuid);
      if (!original) return;

      const isMuscle = Boolean(mesh.userData.isMuscle);
      const isSelected = selectedId === mesh.uuid || selectedId === mesh.name;
      const isDimmed   = isIsolateMode && selectedId !== null && !isSelected;

      // Layer visibility & Isolate mode
      if (isIsolateMode && selectedId !== null) {
        mesh.visible = isSelected;
        if (!isSelected) return;
      } else {
        if (isMuscle  && !systemVisibility.muscular) { mesh.visible = false; return; }
        if (!isMuscle && !systemVisibility.skeletal) { mesh.visible = false; return; }
        mesh.visible = true;
      }

      let mat: THREE.Material;

      if (viewMode === 'wireframe') {
        mat = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: isSelected ? '#0ea5e9' : isMuscle ? '#991b1b' : '#94a3b8',
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -1,
        });
      } else if (viewMode === 'xray') {
        mat = new THREE.MeshStandardMaterial({
          color: isSelected ? '#0ea5e9' : isMuscle ? '#991b1b' : '#94a3b8',
          transparent: true,
          opacity: isSelected ? 0.95 : isDimmed ? 0.04 : isMuscle ? 0.22 : 0.3,
          roughness: 0.2,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
      } else if (isDimmed) {
        mat = new THREE.MeshStandardMaterial({
          color: '#d1d5db',
          transparent: true,
          opacity: 0.07,
          roughness: 0.9,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
      } else if (isSelected) {
        mat = new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          emissive: '#075985',
          emissiveIntensity: 0.55,
          roughness: 0.22,
          metalness: 0.08,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -2,
        });
      } else {
        mat = original;
      }

      mesh.material = mat;
    });

    prevHoveredMeshRef.current = null;
  }, [modelRoot, selectedId, viewMode, isIsolateMode, systemVisibility]);

  // ── Targeted O(1) hover update — only touches the 1 hovered mesh ──────────
  useEffect(() => {
    // Restore previous hovered mesh
    if (prevHoveredMeshRef.current) {
      const prevMesh = prevHoveredMeshRef.current;
      const isSelected = selectedId === prevMesh.uuid || selectedId === prevMesh.name;
      if (!isSelected) {
        const orig = originalMaterialsRef.current.get(prevMesh.uuid);
        if (orig) prevMesh.material = orig;
      }
      prevHoveredMeshRef.current = null;
    }

    if (!hoveredId) return;

    // Fast O(1) map lookup
    const targetMesh = meshByUuidRef.current.get(hoveredId);
    if (!targetMesh) return;

    const isSelected = selectedId === targetMesh.uuid || selectedId === targetMesh.name;
    if (isSelected) return;

    const isMuscle = Boolean(targetMesh.userData.isMuscle);
    const orig = originalMaterialsRef.current.get(targetMesh.uuid);

    targetMesh.material = new THREE.MeshStandardMaterial({
      color: isMuscle ? '#c0393a' : '#f1f5f9',
      emissive: new THREE.Color('#1e293b'),
      emissiveIntensity: 0.2,
      roughness: orig?.roughness ?? 0.4,
      side: THREE.DoubleSide,
    });

    prevHoveredMeshRef.current = targetMesh;
  }, [hoveredId, selectedId]);

  return (
    <>
      {modelRoot && (
        <primitive
          object={modelRoot}
          onClick={(e: any) => {
            e.stopPropagation();
            const clickedMesh = e.object as THREE.Mesh;
            const meshName = clickedMesh.name || '';
            const box = new THREE.Box3().setFromObject(clickedMesh);
            const center = box.getCenter(new THREE.Vector3());
            const clickPos: [number, number, number] = e.point
              ? [e.point.x, e.point.y, e.point.z]
              : [center.x, center.y, center.z];
            const structureId = meshName || clickedMesh.uuid;
            selectStructure(structureId, clickPos, meshName || structureId);
          }}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            hoverStructure((e.object as THREE.Mesh).uuid);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            hoverStructure(null);
            document.body.style.cursor = 'auto';
          }}
        />
      )}

      <VisceralOrgans3DLazy />
      <CirculatorySystem3DLazy />
      <NervousSystemLazy />
      <ReproductiveSystemLazy />
    </>
  );
};

// ── Lazy system wrappers ─────────────────────────────────────────────────────
// Each wrapper delays loading the actual component until the system is first
// toggled ON, keeping initial JS + network cost minimal.

import { VisceralOrgans3D }         from './systems/VisceralOrgans3D';
import { CirculatorySystem3D }       from './systems/CirculatorySystem3D';
import { NervousSystemComplete3D }   from './systems/NervousSystemComplete3D';
import { ReproductiveSystem3D }      from './systems/ReproductiveSystem3D';

function VisceralOrgans3DLazy() {
  const isVisible = useAnatomyStore((s) => s.systemVisibility.visceral);
  const [everVisible, setEverVisible] = useState(isVisible);
  useEffect(() => { if (isVisible) setEverVisible(true); }, [isVisible]);
  if (!everVisible) return null;
  return <VisceralOrgans3D />;
}

function CirculatorySystem3DLazy() {
  const isVisible = useAnatomyStore((s) => s.systemVisibility.circulatory);
  const [everVisible, setEverVisible] = useState(false); // off by default → load on demand
  useEffect(() => { if (isVisible) setEverVisible(true); }, [isVisible]);
  if (!everVisible) return null;
  return <CirculatorySystem3D />;
}

function NervousSystemLazy() {
  const isVisible = useAnatomyStore((s) => s.systemVisibility.nervous);
  const [everVisible, setEverVisible] = useState(false);
  useEffect(() => { if (isVisible) setEverVisible(true); }, [isVisible]);
  if (!everVisible) return null;
  return <NervousSystemComplete3D />;
}

function ReproductiveSystemLazy() {
  const isVisible = useAnatomyStore((s) => s.systemVisibility.reproductive);
  const [everVisible, setEverVisible] = useState(false);
  useEffect(() => { if (isVisible) setEverVisible(true); }, [isVisible]);
  if (!everVisible) return null;
  return <ReproductiveSystem3D />;
}
