'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAnatomyStore } from '@/store/anatomyStore';
import { loadGLB, preloadGLB } from '@/lib/gltfLoader';

interface OrganModelSpec {
  id: string;
  name: string;
  url: string;
  position: [number, number, number];
  targetSize: number;
  rotation?: [number, number, number];
  baseColor: string;
  roughness: number;
}

/**
 * All positions are WORLD SPACE (Y-up, body centred at origin).
 *
 * Key anatomical landmarks (world Y):
 *   Head top     +1.213   Top thorax   +0.756
 *   Mandible     +0.921   Sternum body +0.527  (measured: 0.529)
 *   Diaphragm    +0.263   L1           +0.206
 *   Sacrum       -0.093   Feet         -1.587
 */
const VISCERAL_SPECS: OrganModelSpec[] = [
  {
    id: 'heart', name: 'Heart', url: '/models/heart.glb',
    // Mediastinum: posterior to body of sternum (0.529), between 2nd & 5th ribs
    position: [0.015, 0.46, 0.05], targetSize: 0.16,
    rotation: [0, 0, -0.05], baseColor: '#b91c1c', roughness: 0.25,
  },
  {
    id: 'lungs', name: 'Lungs', url: '/models/lungs.glb',
    // Bilateral thoracic cavities: apex at 1st rib (0.68), base at diaphragm (0.27)
    position: [0, 0.47, 0.01], targetSize: 0.41,
    baseColor: '#fda4af', roughness: 0.4,
  },
  {
    id: 'liver', name: 'Liver', url: '/models/liver.glb',
    // Right hypochondrium: immediately inferior to right hemidiaphragm
    position: [0.065, 0.22, 0.045], targetSize: 0.21,
    baseColor: '#854d0e', roughness: 0.3,
  },
  {
    id: 'stomach', name: 'Stomach', url: '/models/stomach.glb',
    // Left hypochondrium/epigastrium: inferior to left hemidiaphragm, anterior to pancreas
    position: [-0.05, 0.18, 0.055], targetSize: 0.16,
    baseColor: '#ea580c', roughness: 0.32,
  },
  {
    id: 'kidneys', name: 'Kidneys', url: '/models/kidneys.glb',
    // Retroperitoneal: T12 to L3, deeply embedded in posterior abdominal wall
    position: [0, 0.19, -0.065], targetSize: 0.15,
    baseColor: '#991b1b', roughness: 0.35,
  },
  {
    id: 'urinary_bladder', name: 'Urinary Bladder', url: '/models/bladder.glb',
    // True lesser pelvis: resting directly on pelvic diaphragm behind pubic symphysis
    position: [0, -0.16, 0.05], targetSize: 0.12,
    baseColor: '#f59e0b', roughness: 0.3,
  },
];

function buildContainer(root: THREE.Group, spec: OrganModelSpec): THREE.Group {
  root.updateMatrixWorld(true);
  const box    = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());

  root.position.set(-center.x, -center.y, -center.z);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale  = maxDim > 0 ? spec.targetSize / maxDim : 1;

  const container = new THREE.Group();
  container.add(root);
  container.scale.setScalar(scale);
  container.position.set(...spec.position);
  if (spec.rotation) container.rotation.set(...spec.rotation);
  container.name = spec.id;

  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.geometry.computeBoundingBox();
      mesh.geometry.computeBoundingSphere();
      mesh.userData.organId   = spec.id;
      mesh.userData.partName  = mesh.name || spec.name;
    }
  });
  return container;
}

export const VisceralOrgans3D: React.FC = () => {
  const isVisible      = useAnatomyStore((s) => s.systemVisibility.visceral);
  const selectedId     = useAnatomyStore((s) => s.selectedId);
  const hoveredId      = useAnatomyStore((s) => s.hoveredId);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure  = useAnatomyStore((s) => s.hoverStructure);
  const viewMode        = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode   = useAnatomyStore((s) => s.isIsolateMode);

  const [loadedGroups, setLoadedGroups] = useState<{ spec: OrganModelSpec; scene: THREE.Group }[]>([]);
  const loadStartedRef = useRef(false);

  // ── Load all visceral organs using the shared singleton loader ─────────────
  // Organs are preloaded immediately on mount (this component is only mounted
  // when the system is first turned ON, so this never fires unnecessarily).
  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;

    let cancelled = false;
    // Stagger loads slightly so the browser can render body.glb first
    const groups: { spec: OrganModelSpec; scene: THREE.Group }[] = [];
    let done = 0;

    // Preload the smaller organs immediately; heart + lungs together
    VISCERAL_SPECS.forEach((spec, i) => {
      // Small delay between requests to avoid saturating fetch threads
      setTimeout(() => {
        loadGLB(spec.url).then((root) => {
          if (cancelled) return;
          groups.push({ spec, scene: buildContainer(root, spec) });
          done++;
          if (done === VISCERAL_SPECS.length) {
            // Sort to match VISCERAL_SPECS order for stable rendering
            groups.sort((a, b) =>
              VISCERAL_SPECS.findIndex(s => s.id === a.spec.id) -
              VISCERAL_SPECS.findIndex(s => s.id === b.spec.id)
            );
            setLoadedGroups([...groups]);
          }
        }).catch((err) => {
          console.warn('[VisceralOrgans3D] Could not load', spec.url, err);
          done++;
          if (done === VISCERAL_SPECS.length && !cancelled) setLoadedGroups([...groups]);
        });
      }, i * 60); // 60 ms stagger per organ
    });

    return () => { cancelled = true; };
  }, []);

  // ── Reactive material updates (useEffect, NOT render-loop) ────────────────
  useEffect(() => {
    loadedGroups.forEach(({ spec, scene }) => {
      const isSelected = selectedId === spec.id;
      const isHovered  = hoveredId  === spec.id;
      const isDimmed   = isIsolateMode && selectedId !== null && !isSelected;

      scene.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        const mesh = child as THREE.Mesh;

        if (viewMode === 'wireframe') {
          mesh.material = new THREE.MeshBasicMaterial({
            wireframe: true, side: THREE.DoubleSide,
            color: isSelected ? '#0284c7' : spec.baseColor,
          });
        } else if (viewMode === 'xray') {
          mesh.material = new THREE.MeshStandardMaterial({
            color: isSelected ? '#0284c7' : spec.baseColor,
            emissive: new THREE.Color(isSelected ? '#0284c7' : '#1e293b'),
            emissiveIntensity: isSelected ? 0.8 : 0.2,
            transparent: true,
            opacity: isSelected ? 0.95 : isDimmed ? 0.06 : 0.45,
            roughness: 0.2, depthWrite: false, side: THREE.DoubleSide,
          });
        } else if (isDimmed) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#cbd5e1', transparent: true, opacity: 0.08,
            roughness: 0.9, depthWrite: false, side: THREE.DoubleSide,
          });
        } else if (isSelected) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#38bdf8', emissive: new THREE.Color('#0369a1'),
            emissiveIntensity: 0.6, roughness: 0.25, metalness: 0.1,
            side: THREE.DoubleSide,
          });
        } else if (isHovered) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: spec.baseColor, emissive: new THREE.Color('#334155'),
            emissiveIntensity: 0.35, roughness: spec.roughness,
            side: THREE.DoubleSide,
          });
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            color: spec.baseColor, roughness: spec.roughness,
            metalness: 0.05, side: THREE.DoubleSide,
          });
        }
      });
    });
  }, [loadedGroups, selectedId, hoveredId, viewMode, isIsolateMode]);

  if (!isVisible) return null;

  return (
    <>
      {loadedGroups.map(({ spec, scene }) => (
        <primitive
          key={spec.id}
          object={scene}
          onClick={(e: any) => {
            e.stopPropagation();
            const wp = new THREE.Vector3();
            scene.getWorldPosition(wp);
            selectStructure(spec.id, [wp.x, wp.y, wp.z]);
          }}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            hoverStructure(spec.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => { hoverStructure(null); document.body.style.cursor = 'auto'; }}
        />
      ))}
    </>
  );
};
