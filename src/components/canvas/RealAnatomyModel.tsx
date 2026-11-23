'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useAnatomyStore } from '@/store/anatomyStore';
import { VisceralOrgans3D } from './systems/VisceralOrgans3D';
import { NervousSystemComplete3D } from './systems/NervousSystemComplete3D';
import { ReproductiveSystem3D } from './systems/ReproductiveSystem3D';
import { CirculatorySystem3D } from './systems/CirculatorySystem3D';

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

// Anatomically correct PBR colours
const BONE_COLOR = '#e8e3d6';    // warm cortical bone ivory
const MUSCLE_COLOR = '#8c2a2a';  // natural deep muscle crimson

export const RealAnatomyModel: React.FC = () => {
  const [modelRoot, setModelRoot] = useState<THREE.Group | null>(null);
  const activeModel = useAnatomyStore((s) => s.activeModel);
  const selectedId = useAnatomyStore((s) => s.selectedId);
  const hoveredId = useAnatomyStore((s) => s.hoveredId);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure = useAnatomyStore((s) => s.hoverStructure);
  const viewMode = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode = useAnatomyStore((s) => s.isIsolateMode);
  const systemVisibility = useAnatomyStore((s) => s.systemVisibility);

  const originalMaterialsRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const meshListRef = useRef<THREE.Mesh[]>([]);
  const prevModelRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevModelRef.current === activeModel) return;
    prevModelRef.current = activeModel;

    let isMounted = true;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const modelPath = activeModel === 'skeleton' ? '/models/skeleton.glb' : '/models/body.glb';

    loader.load(
      modelPath,
      (gltf) => {
        if (!isMounted) return;

        const container = new THREE.Group();
        const content = gltf.scene;
        container.add(content);

        // Centre and scale to canonical 2.8-unit height
        content.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(content);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        content.position.set(-center.x, -center.y, -center.z);

        const targetHeight = 2.8;
        const scale = size.y > 0 ? targetHeight / size.y : 1;
        container.scale.setScalar(scale);
        container.position.set(0, -0.2, 0);

        const meshList: THREE.Mesh[] = [];
        const matMap = new Map<string, THREE.MeshStandardMaterial>();

        content.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
          mesh.raycast = THREE.Mesh.prototype.raycast;

          const name = (mesh.name || '').toLowerCase();

          // Strict muscular classification — only meshes where the asset uses "muscle" or specific named muscles
          const isExplicitMuscle =
            name.endsWith('muscle') ||
            name.includes(' muscle') ||
            name.includes('muscle ') ||
            name.includes('muscle.') ||
            name.includes('rectus') || name.includes('oblique') ||
            name.includes('pectoral') || name.includes('deltoid') ||
            name.includes('biceps') || name.includes('triceps') ||
            name.includes('gluteus') || name.includes('trapezius') ||
            name.includes('latissimus') || name.includes('gastrocnemius') ||
            name.includes('soleus') || name.includes('sartorius') ||
            name.includes('gracilis') || name.includes('quadriceps') ||
            name.includes('brachialis') || name.includes('subscapularis') ||
            name.includes('infraspinatus') || name.includes('supraspinatus');

          mesh.userData.isMuscle = isExplicitMuscle;

          const mat = new THREE.MeshStandardMaterial(
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

          mesh.material = mat;
          matMap.set(mesh.uuid, mat);
          meshList.push(mesh);
        });

        originalMaterialsRef.current = matMap;
        meshListRef.current = meshList;
        setModelRoot(container);
      },
      undefined,
      (err) => console.error('[RealAnatomyModel] Error loading model:', err)
    );

    return () => {
      isMounted = false;
      dracoLoader.dispose();
    };
  }, [activeModel]);

  // Reactive material updates for selection, hover, view mode and system visibility
  useEffect(() => {
    if (!modelRoot || meshListRef.current.length === 0) return;

    meshListRef.current.forEach((mesh) => {
      const original = originalMaterialsRef.current.get(mesh.uuid);
      if (!original) return;

      const isMuscle = Boolean(mesh.userData.isMuscle);

      // Layer visibility
      if (isMuscle && !systemVisibility.muscular) { mesh.visible = false; return; }
      if (!isMuscle && !systemVisibility.skeletal) { mesh.visible = false; return; }
      mesh.visible = true;

      const isSelected = selectedId === mesh.uuid || selectedId === mesh.name;
      const isHovered = hoveredId === mesh.uuid || hoveredId === mesh.name;
      const isDimmed = isIsolateMode && selectedId !== null && !isSelected;

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
      } else if (isHovered) {
        mat = new THREE.MeshStandardMaterial({
          color: isMuscle ? '#c0393a' : '#f1f5f9',
          emissive: '#1e293b',
          emissiveIntensity: 0.2,
          roughness: original.roughness,
          side: THREE.DoubleSide,
        });
      } else {
        mat = original;
      }

      mesh.material = mat;
    });
  }, [modelRoot, selectedId, hoveredId, viewMode, isIsolateMode, systemVisibility]);

  return (
    <>
      {modelRoot && (
        <primitive
          object={modelRoot}
          onClick={(e: any) => {
            e.stopPropagation();
            const clickedMesh = e.object as THREE.Mesh;
            const meshName = clickedMesh.name || '';
            const worldPos = new THREE.Vector3();
            clickedMesh.getWorldPosition(worldPos);
            const fallbackId = clickedMesh.userData.isMuscle ? 'muscular_tissue' : 'skeleton';
            selectStructure(fallbackId, [worldPos.x, worldPos.y, worldPos.z], meshName);
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

      <VisceralOrgans3D />
      <CirculatorySystem3D />
      <NervousSystemComplete3D />
      <ReproductiveSystem3D />
    </>
  );
};
