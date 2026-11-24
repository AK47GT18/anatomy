'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAnatomyStore } from '@/store/anatomyStore';
import { loadGLB } from '@/lib/gltfLoader';

const makeMat = (
  color: string,
  opts?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, ...opts });

export const NervousSystemComplete3D: React.FC = () => {
  const isVisible      = useAnatomyStore((s) => s.systemVisibility.nervous);
  const selectedId     = useAnatomyStore((s) => s.selectedId);
  const hoveredId      = useAnatomyStore((s) => s.hoveredId);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure  = useAnatomyStore((s) => s.hoverStructure);
  const viewMode        = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode   = useAnatomyStore((s) => s.isIsolateMode);

  const [brainScene,     setBrainScene]     = useState<THREE.Group | null>(null);
  const [spinalScene,    setSpinalScene]    = useState<THREE.Group | null>(null);
  const [nervesScene,    setNervesScene]    = useState<THREE.Group | null>(null);
  const loadStartedRef = useRef(false);

  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    let cancelled = false;

    // Brain — highest priority in this system
    loadGLB('/models/brain.glb').then((root) => {
      if (cancelled) return;
      root.updateMatrixWorld(true);
      const box    = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      root.position.set(-center.x, -center.y, -center.z);

      const container = new THREE.Group();
      container.add(root);
      // Anatomical cranial vault: floor at 0.95 (sphenoid), roof at 1.19 (parietal/frontal), depth centered at -0.035
      container.scale.setScalar(size.y > 0 ? 0.30 / size.y : 1);
      container.position.set(0, 1.045, -0.035);

      root.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          (c as THREE.Mesh).geometry.computeBoundingBox();
          (c as THREE.Mesh).geometry.computeBoundingSphere();
          (c as THREE.Mesh).castShadow = (c as THREE.Mesh).receiveShadow = true;
        }
      });
      setBrainScene(container);
    }).catch((e) => console.warn('[NervousSystem] brain.glb:', e));

    // Spinal cord — load with 80 ms offset
    setTimeout(() => {
      loadGLB('/models/spinal-cord.glb').then((root) => {
        if (cancelled) return;
        root.updateMatrixWorld(true);
        const box    = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        root.position.set(-center.x, -center.y, -center.z);

        const container = new THREE.Group();
        container.add(root);
        // Vertebral canal: runs from C1 (0.93) to L2 (0.16) inside the neural arches at Z -0.070
        container.scale.setScalar(size.y > 0 ? 0.72 / size.y : 1);
        container.position.set(0, 0.54, -0.070);

        root.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            (c as THREE.Mesh).geometry.computeBoundingBox();
            (c as THREE.Mesh).geometry.computeBoundingSphere();
            (c as THREE.Mesh).castShadow = (c as THREE.Mesh).receiveShadow = true;
          }
        });
        setSpinalScene(container);
      }).catch((e) => console.warn('[NervousSystem] spinal-cord.glb:', e));
    }, 80);

    // Peripheral nerves — largest/lowest priority, 160 ms offset
    setTimeout(() => {
      loadGLB('/models/nerves.glb').then((root) => {
        if (cancelled) return;
        root.updateMatrixWorld(true);
        const box    = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        root.position.set(-center.x, -center.y, -center.z);

        const container = new THREE.Group();
        container.add(root);
        container.scale.setScalar(size.y > 0 ? 2.8 / size.y : 1);
        container.position.set(0, -0.2, 0);

        root.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            (c as THREE.Mesh).geometry.computeBoundingBox();
            (c as THREE.Mesh).geometry.computeBoundingSphere();
            (c as THREE.Mesh).castShadow = (c as THREE.Mesh).receiveShadow = true;
          }
        });
        setNervesScene(container);
      }).catch((e) => console.warn('[NervousSystem] nerves.glb:', e));
    }, 160);

    return () => { cancelled = true; };
  }, []);

  // ── Reactive materials ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible) return;
    const isBrainSel  = Boolean(selectedId === 'brain' || selectedId?.includes('cortex') || selectedId?.includes('cerebell'));
    const isSpineSel  = Boolean(selectedId === 'spinal_cord' || selectedId?.includes('nerve'));
    const isBrainHov  = hoveredId === 'brain';
    const isSpineHov  = hoveredId === 'spinal_cord';

    const applyMat = (scene: THREE.Group, isSel: boolean, isHov: boolean, col: string) => {
      if (isIsolateMode && selectedId !== null) {
        scene.visible = isSel;
        if (!isSel) return;
      } else {
        scene.visible = true;
      }
      const isDimmed = isIsolateMode && selectedId !== null && !isSel;
      scene.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        const mesh = child as THREE.Mesh;
        if (viewMode === 'wireframe') {
          mesh.material = new THREE.MeshBasicMaterial({ wireframe: true, side: THREE.DoubleSide, color: isSel ? '#0284c7' : col });
        } else if (viewMode === 'xray') {
          mesh.material = makeMat(isSel ? '#0284c7' : col, { emissive: new THREE.Color(isSel ? '#0284c7' : '#eab308'), emissiveIntensity: isSel ? 0.8 : 0.25, transparent: true, opacity: isSel ? 0.95 : isDimmed ? 0.06 : 0.5, roughness: 0.2, depthWrite: false });
        } else if (isDimmed) {
          mesh.material = makeMat('#cbd5e1', { transparent: true, opacity: 0.08, roughness: 0.9, depthWrite: false });
        } else if (isSel) {
          mesh.material = makeMat('#38bdf8', { emissive: new THREE.Color('#0369a1'), emissiveIntensity: 0.6, roughness: 0.25, metalness: 0.1 });
        } else if (isHov) {
          mesh.material = makeMat(col, { emissive: new THREE.Color('#eab308'), emissiveIntensity: 0.35, roughness: 0.3 });
        } else {
          mesh.material = makeMat(col, { roughness: 0.35, metalness: 0.05 });
        }
      });
    };

    if (brainScene)  applyMat(brainScene,  isBrainSel, isBrainHov, '#e2b170');
    if (spinalScene) applyMat(spinalScene, isSpineSel, isSpineHov, '#facc15');

    if (nervesScene) {
      const isNervesSel = selectedId === 'spinal_cord' || (selectedId?.toLowerCase().includes('nerve') ?? false);
      if (isIsolateMode && selectedId !== null) {
        nervesScene.visible = isNervesSel;
        if (!isNervesSel) return;
      } else {
        nervesScene.visible = true;
      }

      nervesScene.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        const mesh = child as THREE.Mesh;
        const isSel    = selectedId === mesh.name || selectedId === 'spinal_cord';
        const isHov    = hoveredId  === mesh.name;
        const isDimmed = isIsolateMode && selectedId !== null && !isSel;
        if (viewMode === 'wireframe') {
          mesh.material = new THREE.MeshBasicMaterial({ wireframe: true, side: THREE.DoubleSide, color: isSel ? '#0284c7' : '#facc15' });
        } else if (viewMode === 'xray') {
          mesh.material = makeMat(isSel ? '#0284c7' : '#facc15', { emissive: new THREE.Color(isSel ? '#0284c7' : '#ca8a04'), emissiveIntensity: isSel ? 0.8 : 0.3, transparent: true, opacity: isSel ? 0.95 : isDimmed ? 0.06 : 0.5, roughness: 0.2, depthWrite: false });
        } else if (isDimmed) {
          mesh.material = makeMat('#cbd5e1', { transparent: true, opacity: 0.08, roughness: 0.9, depthWrite: false });
        } else if (isSel) {
          mesh.material = makeMat('#38bdf8', { emissive: new THREE.Color('#0369a1'), emissiveIntensity: 0.6, roughness: 0.25, metalness: 0.1 });
        } else if (isHov) {
          mesh.material = makeMat('#facc15', { emissive: new THREE.Color('#ca8a04'), emissiveIntensity: 0.4, roughness: 0.3 });
        } else {
          mesh.material = makeMat('#facc15', { roughness: 0.35, metalness: 0.05 });
        }
      });
    }
  }, [brainScene, spinalScene, nervesScene, selectedId, hoveredId, viewMode, isIsolateMode, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {brainScene && (
        <primitive object={brainScene}
          onClick={(e: any) => { e.stopPropagation(); selectStructure('brain', [0, 1.07, 0.02]); }}
          onPointerOver={(e: any) => { e.stopPropagation(); hoverStructure('brain'); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { hoverStructure(null); document.body.style.cursor = 'auto'; }}
        />
      )}
      {spinalScene && (
        <primitive object={spinalScene}
          onClick={(e: any) => { e.stopPropagation(); selectStructure('spinal_cord', [0, 0.48, -0.045]); }}
          onPointerOver={(e: any) => { e.stopPropagation(); hoverStructure('spinal_cord'); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { hoverStructure(null); document.body.style.cursor = 'auto'; }}
        />
      )}
      {nervesScene && (
        <primitive object={nervesScene}
          onClick={(e: any) => {
            e.stopPropagation();
            const mesh = e.object as THREE.Mesh;
            const wp   = new THREE.Vector3();
            mesh.getWorldPosition(wp);
            const clickPos: [number, number, number] = e.point
              ? [e.point.x, e.point.y, e.point.z]
              : [wp.x, wp.y, wp.z];
            selectStructure('spinal_cord', clickPos, mesh?.name || 'Peripheral Nerve');
          }}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            hoverStructure((e.object as THREE.Mesh)?.name || 'Peripheral Nerve');
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => { hoverStructure(null); document.body.style.cursor = 'auto'; }}
        />
      )}
    </>
  );
};
