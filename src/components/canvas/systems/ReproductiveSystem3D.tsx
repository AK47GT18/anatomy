'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAnatomyStore } from '@/store/anatomyStore';
import { loadGLB } from '@/lib/gltfLoader';

export const ReproductiveSystem3D: React.FC = () => {
  const isVisible      = useAnatomyStore((s) => s.systemVisibility.reproductive);
  const sex            = useAnatomyStore((s) => s.sex);
  const selectedId     = useAnatomyStore((s) => s.selectedId);
  const hoveredId      = useAnatomyStore((s) => s.hoveredId);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure  = useAnatomyStore((s) => s.hoverStructure);
  const viewMode        = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode   = useAnatomyStore((s) => s.isIsolateMode);

  const [maleScene,   setMaleScene]   = useState<THREE.Group | null>(null);
  const [femaleScene, setFemaleScene] = useState<THREE.Group | null>(null);
  const loadStartedRef = useRef(false);

  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    let cancelled = false;

    const load = (url: string, targetSize: number, pos: [number,number,number], setter: (g: THREE.Group) => void) => {
      loadGLB(url).then((root) => {
        if (cancelled) return;
        root.updateMatrixWorld(true);
        const box    = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        root.position.set(-center.x, -center.y, -center.z);
        const maxDim = Math.max(size.x, size.y, size.z);

        const container = new THREE.Group();
        container.add(root);
        container.scale.setScalar(maxDim > 0 ? targetSize / maxDim : 1);
        container.position.set(...pos);

        root.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            (c as THREE.Mesh).geometry.computeBoundingBox();
            (c as THREE.Mesh).geometry.computeBoundingSphere();
            (c as THREE.Mesh).castShadow = (c as THREE.Mesh).receiveShadow = true;
          }
        });
        setter(container);
      }).catch((e) => console.warn('[ReproductiveSystem3D] Error loading', url, e));
    };

    load('/models/prostate.glb',      0.22, [0, -0.20, 0.055], setMaleScene);
    setTimeout(() => load('/models/reproductive.glb', 0.22, [0, -0.15, 0.015], setFemaleScene), 80);

    return () => { cancelled = true; };
  }, []);

  // ── Reactive materials ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible) return;
    const isMale      = sex === 'male';
    const activeScene = isMale ? maleScene : femaleScene;
    if (!activeScene) return;

    const currentId   = isMale ? 'male_genitalia' : 'female_genitalia';
    const isSelected  = selectedId === currentId;
    const isHovered   = hoveredId  === currentId;
    const isDimmed    = isIsolateMode && selectedId !== null && !isSelected;
    const baseColor   = isMale ? '#93c5fd' : '#f472b6';

    if (isIsolateMode && selectedId !== null) {
      activeScene.visible = isSelected;
      if (!isSelected) return;
    } else {
      activeScene.visible = true;
    }

    activeScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      if (viewMode === 'wireframe') {
        mesh.material = new THREE.MeshBasicMaterial({ wireframe: true, side: THREE.DoubleSide, color: isSelected ? '#0284c7' : baseColor });
      } else if (viewMode === 'xray') {
        mesh.material = new THREE.MeshStandardMaterial({ color: isSelected ? '#0284c7' : baseColor, emissive: new THREE.Color(isSelected ? '#0284c7' : isMale ? '#1e3a8a' : '#831843'), emissiveIntensity: isSelected ? 0.8 : 0.2, transparent: true, opacity: isSelected ? 0.95 : isDimmed ? 0.06 : 0.45, roughness: 0.2, depthWrite: false, side: THREE.DoubleSide });
      } else if (isDimmed) {
        mesh.material = new THREE.MeshStandardMaterial({ color: '#cbd5e1', transparent: true, opacity: 0.08, roughness: 0.9, depthWrite: false, side: THREE.DoubleSide });
      } else if (isSelected) {
        mesh.material = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: new THREE.Color('#0369a1'), emissiveIntensity: 0.6, roughness: 0.25, metalness: 0.1, side: THREE.DoubleSide });
      } else if (isHovered) {
        mesh.material = new THREE.MeshStandardMaterial({ color: baseColor, emissive: new THREE.Color('#475569'), emissiveIntensity: 0.35, roughness: 0.3, side: THREE.DoubleSide });
      } else {
        mesh.material = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.35, metalness: 0.05, side: THREE.DoubleSide });
      }
    });
  }, [maleScene, femaleScene, sex, selectedId, hoveredId, viewMode, isIsolateMode, isVisible]);

  if (!isVisible) return null;

  const isMale      = sex === 'male';
  const activeScene = isMale ? maleScene : femaleScene;
  const currentId   = isMale ? 'male_genitalia' : 'female_genitalia';

  if (!activeScene) return null;

  return (
    <primitive
      object={activeScene}
      onClick={(e: any) => {
        e.stopPropagation();
        const wp = new THREE.Vector3();
        activeScene.getWorldPosition(wp);
        const clickPos: [number, number, number] = e.point
          ? [e.point.x, e.point.y, e.point.z]
          : [wp.x, wp.y, wp.z];
        selectStructure(currentId, clickPos);
      }}
      onPointerOver={(e: any) => { e.stopPropagation(); hoverStructure(currentId); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { hoverStructure(null); document.body.style.cursor = 'auto'; }}
    />
  );
};
