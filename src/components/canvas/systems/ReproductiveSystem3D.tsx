'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useAnatomyStore } from '@/store/anatomyStore';

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

/**
 * World-space Y landmarks:
 *   Sacrum      -0.093   Pelvic floor ~-0.14
 *   Pubic sym.  ~-0.09   Below pubis  ~-0.15
 *
 * Male reproductive: prostate sits posterior to pubic symphysis,
 *   below the bladder. World Y ≈ -0.17, anterior (+Z).
 *
 * Female reproductive: uterus and ovaries in lesser pelvis,
 *   above pelvic floor. World Y ≈ -0.11.
 */

export const ReproductiveSystem3D: React.FC = () => {
  const isVisible = useAnatomyStore((s) => s.systemVisibility.reproductive);
  const sex = useAnatomyStore((s) => s.sex);
  const selectedId = useAnatomyStore((s) => s.selectedId);
  const hoveredId = useAnatomyStore((s) => s.hoveredId);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure = useAnatomyStore((s) => s.hoverStructure);
  const viewMode = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode = useAnatomyStore((s) => s.isIsolateMode);

  const [maleScene, setMaleScene] = useState<THREE.Group | null>(null);
  const [femaleScene, setFemaleScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let isMounted = true;
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // ── Male reproductive system (prostate.glb) ───────────────────────────────
    loader.load('/models/prostate.glb', (gltf) => {
      if (!isMounted) return;
      const root = gltf.scene;
      root.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      root.position.x = -center.x;
      root.position.y = -center.y;
      root.position.z = -center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 0.26;
      const scale = maxDim > 0 ? targetSize / maxDim : 1;

      const container = new THREE.Group();
      container.add(root);
      container.scale.setScalar(scale);
      // World Y ≈ -0.17: just below pubic symphysis (sacrum at -0.093)
      container.position.set(0, -0.17, 0.09);

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      setMaleScene(container);
    });

    // ── Female reproductive system (reproductive.glb) ─────────────────────────
    loader.load('/models/reproductive.glb', (gltf) => {
      if (!isMounted) return;
      const root = gltf.scene;
      root.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      root.position.x = -center.x;
      root.position.y = -center.y;
      root.position.z = -center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 0.26;
      const scale = maxDim > 0 ? targetSize / maxDim : 1;

      const container = new THREE.Group();
      container.add(root);
      container.scale.setScalar(scale);
      // World Y ≈ -0.11: lesser pelvis, above pelvic floor
      container.position.set(0, -0.11, 0.045);

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      setFemaleScene(container);
    });

    return () => {
      isMounted = false;
      dracoLoader.dispose();
    };
  }, []);

  // ── Reactive material application ────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible) return;
    const isMale = sex === 'male';
    const activeScene = isMale ? maleScene : femaleScene;
    if (!activeScene) return;

    const currentId = isMale ? 'male_genitalia' : 'female_genitalia';
    const isSelected = selectedId === currentId;
    const isHovered = hoveredId === currentId;
    const isDimmed = isIsolateMode && selectedId !== null && !isSelected;
    const baseColor = isMale ? '#93c5fd' : '#f472b6';

    activeScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        if (viewMode === 'wireframe') {
          mesh.material = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: isSelected ? '#0284c7' : baseColor,
            side: THREE.DoubleSide,
          });
        } else if (viewMode === 'xray') {
          mesh.material = new THREE.MeshStandardMaterial({
            color: isSelected ? '#0284c7' : baseColor,
            emissive: new THREE.Color(isSelected ? '#0284c7' : isMale ? '#1e3a8a' : '#831843'),
            emissiveIntensity: isSelected ? 0.8 : 0.2,
            transparent: true,
            opacity: isSelected ? 0.95 : isDimmed ? 0.06 : 0.45,
            roughness: 0.2,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
        } else if (isDimmed) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#cbd5e1',
            transparent: true,
            opacity: 0.08,
            roughness: 0.9,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
        } else if (isSelected) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#38bdf8',
            emissive: new THREE.Color('#0369a1'),
            emissiveIntensity: 0.6,
            roughness: 0.25,
            metalness: 0.1,
            side: THREE.DoubleSide,
          });
        } else if (isHovered) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: baseColor,
            emissive: new THREE.Color('#475569'),
            emissiveIntensity: 0.35,
            roughness: 0.3,
            side: THREE.DoubleSide,
          });
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.35,
            metalness: 0.05,
            side: THREE.DoubleSide,
          });
        }
      }
    });
  }, [maleScene, femaleScene, sex, selectedId, hoveredId, viewMode, isIsolateMode, isVisible]);

  if (!isVisible) return null;

  const isMale = sex === 'male';
  const activeScene = isMale ? maleScene : femaleScene;
  const currentId = isMale ? 'male_genitalia' : 'female_genitalia';

  if (!activeScene) return null;

  // No outer offset group — container placed in world space directly
  return (
    <primitive
      object={activeScene}
      onClick={(e: any) => {
        e.stopPropagation();
        const worldPos = new THREE.Vector3();
        activeScene.getWorldPosition(worldPos);
        selectStructure(currentId, [worldPos.x, worldPos.y, worldPos.z]);
      }}
      onPointerOver={(e: any) => {
        e.stopPropagation();
        hoverStructure(currentId);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        hoverStructure(null);
        document.body.style.cursor = 'auto';
      }}
    />
  );
};
