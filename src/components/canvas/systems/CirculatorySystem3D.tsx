'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useAnatomyStore } from '@/store/anatomyStore';

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

export const CirculatorySystem3D: React.FC = () => {
  const isVisible = useAnatomyStore((s) => s.systemVisibility.circulatory);
  const selectedId = useAnatomyStore((s) => s.selectedId);
  const hoveredId = useAnatomyStore((s) => s.hoveredId);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure = useAnatomyStore((s) => s.hoverStructure);
  const viewMode = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode = useAnatomyStore((s) => s.isIsolateMode);

  const [vesselsScene, setVesselsScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let isMounted = true;
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/vessels.glb',
      (gltf) => {
        if (!isMounted) return;
        const root = gltf.scene;
        root.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        root.position.x = -center.x;
        root.position.y = -center.y;
        root.position.z = -center.z;

        // Height calibrated to full body height (2.8 units)
        const targetHeight = 2.8;
        const scale = size.y > 0 ? targetHeight / size.y : 1;

        const container = new THREE.Group();
        container.add(root);
        container.scale.setScalar(scale);
        container.position.set(0, -0.2, 0);

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.computeBoundingBox();
            mesh.geometry.computeBoundingSphere();
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        setVesselsScene(container);
      },
      undefined,
      (err) => console.warn('[CirculatorySystem3D] Error loading vessels.glb:', err)
    );

    return () => {
      isMounted = false;
      dracoLoader.dispose();
    };
  }, []);

  if (!isVisible || !vesselsScene) return null;

  vesselsScene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const meshName = (mesh.name || '').toLowerCase();
      const isArtery = meshName.includes('arter') || meshName.includes('aort') || meshName.includes('trunk');
      const baseColor = isArtery ? '#ef4444' : '#3b82f6';

      const isSelected = selectedId === mesh.name || selectedId === 'aorta' || selectedId === 'vena_cava';
      const isHovered = hoveredId === mesh.name;
      const isDimmed = isIsolateMode && selectedId !== null && !isSelected;

      if (viewMode === 'wireframe') {
        mesh.material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: isSelected ? '#0284c7' : baseColor,
        });
      } else if (viewMode === 'xray') {
        mesh.material = new THREE.MeshStandardMaterial({
          color: isSelected ? '#0284c7' : baseColor,
          emissive: isSelected ? '#0284c7' : isArtery ? '#991b1b' : '#1e3a8a',
          emissiveIntensity: isSelected ? 0.8 : 0.25,
          transparent: true,
          opacity: isSelected ? 0.95 : isDimmed ? 0.06 : 0.5,
          roughness: 0.25,
          depthWrite: false,
        });
      } else if (isDimmed) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#cbd5e1',
          transparent: true,
          opacity: 0.08,
          roughness: 0.9,
          depthWrite: false,
        });
      } else if (isSelected) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          emissive: '#0369a1',
          emissiveIntensity: 0.6,
          roughness: 0.25,
          metalness: 0.1,
        });
      } else if (isHovered) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: baseColor,
          emissive: '#ffffff',
          emissiveIntensity: 0.35,
          roughness: 0.3,
        });
      } else {
        mesh.material = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.35,
          metalness: 0.08,
        });
      }
    }
  });

  return (
    <primitive
      object={vesselsScene}
      onClick={(e: any) => {
        e.stopPropagation();
        const clickedMesh = e.object as THREE.Mesh;
        const name = clickedMesh?.name || 'Vascular Network';
        const isArtery = name.toLowerCase().includes('arter') || name.toLowerCase().includes('aort');
        const fallbackId = isArtery ? 'aorta' : 'vena_cava';
        const worldPos = new THREE.Vector3();
        clickedMesh.getWorldPosition(worldPos);
        selectStructure(fallbackId, [worldPos.x, worldPos.y, worldPos.z], name);
      }}
      onPointerOver={(e: any) => {
        e.stopPropagation();
        const name = (e.object as THREE.Mesh)?.name || 'Vascular Structure';
        hoverStructure(name);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        hoverStructure(null);
        document.body.style.cursor = 'auto';
      }}
    />
  );
};
