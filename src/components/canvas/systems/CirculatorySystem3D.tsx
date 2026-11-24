'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAnatomyStore } from '@/store/anatomyStore';
import { loadGLB } from '@/lib/gltfLoader';

export const CirculatorySystem3D: React.FC = () => {
  const isVisible      = useAnatomyStore((s) => s.systemVisibility.circulatory);
  const selectedId     = useAnatomyStore((s) => s.selectedId);
  const hoveredId      = useAnatomyStore((s) => s.hoveredId);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure  = useAnatomyStore((s) => s.hoverStructure);
  const viewMode        = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode   = useAnatomyStore((s) => s.isIsolateMode);

  const [vesselsScene, setVesselsScene] = useState<THREE.Group | null>(null);
  const loadStartedRef = useRef(false);

  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;

    let cancelled = false;
    loadGLB('/models/vessels.glb').then((root) => {
      if (cancelled) return;
      root.updateMatrixWorld(true);
      const box    = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());

      root.position.set(-center.x, -center.y, -center.z);
      const scale = size.y > 0 ? 2.8 / size.y : 1;

      const container = new THREE.Group();
      container.add(root);
      container.scale.setScalar(scale);
      container.position.set(0, -0.41, 0.015);

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = mesh.receiveShadow = true;
          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
        }
      });
      setVesselsScene(container);
    }).catch((err) => console.warn('[CirculatorySystem3D] Error loading vessels.glb:', err));

    return () => { cancelled = true; };
  }, []);

  // Reactive material
  useEffect(() => {
    if (!vesselsScene || !isVisible) return;
    vesselsScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const isSelected = selectedId === mesh.name || selectedId === 'circulatory';
      const isHovered  = hoveredId  === mesh.name;
      const isDimmed   = isIsolateMode && selectedId !== null && !isSelected;

      if (isIsolateMode && selectedId !== null) {
        mesh.visible = isSelected;
        if (!isSelected) return;
      } else {
        mesh.visible = true;
      }

      if (viewMode === 'wireframe') {
        mesh.material = new THREE.MeshBasicMaterial({
          wireframe: true, side: THREE.DoubleSide,
          color: isSelected ? '#0284c7' : '#ef4444',
        });
      } else if (viewMode === 'xray') {
        mesh.material = new THREE.MeshStandardMaterial({
          color: isSelected ? '#0284c7' : '#ef4444',
          emissive: new THREE.Color(isSelected ? '#0284c7' : '#7f1d1d'),
          emissiveIntensity: isSelected ? 0.8 : 0.3,
          transparent: true,
          opacity: isSelected ? 0.95 : isDimmed ? 0.06 : 0.5,
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
          color: '#ef4444', emissive: new THREE.Color('#7f1d1d'),
          emissiveIntensity: 0.35, roughness: 0.3, side: THREE.DoubleSide,
        });
      } else {
        // Distinguish arteries (red) from veins (blue) by mesh name heuristic
        const isVein = mesh.name.toLowerCase().includes('vein') ||
                       mesh.name.toLowerCase().includes('venous');
        mesh.material = new THREE.MeshStandardMaterial({
          color: isVein ? '#3b82f6' : '#ef4444',
          roughness: 0.3, metalness: 0.05, side: THREE.DoubleSide,
        });
      }
    });
  }, [vesselsScene, selectedId, hoveredId, viewMode, isIsolateMode, isVisible]);

  if (!isVisible || !vesselsScene) return null;

  return (
    <primitive
      object={vesselsScene}
      onClick={(e: any) => {
        e.stopPropagation();
        const mesh = e.object as THREE.Mesh;
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const clickPos: [number, number, number] = e.point
          ? [e.point.x, e.point.y, e.point.z]
          : [center.x, center.y, center.z];
        selectStructure('circulatory', clickPos, mesh.name || 'Blood Vessel');
      }}
      onPointerOver={(e: any) => {
        e.stopPropagation();
        hoverStructure((e.object as THREE.Mesh).name || 'circulatory');
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => { hoverStructure(null); document.body.style.cursor = 'auto'; }}
    />
  );
};
