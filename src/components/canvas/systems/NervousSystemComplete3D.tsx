'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useAnatomyStore } from '@/store/anatomyStore';

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

/**
 * World-space Y landmarks (body centred, Y-up):
 *   Head top     +1.213    Mandible    +0.921
 *   Top thorax   +0.756    Diaphragm   +0.263
 *   Sacrum       -0.093    Feet        -1.587
 *
 * Brain: occupies cranial vault — mandible (~0.921) to head top (~1.213)
 *   World centre Y ≈ 1.07, slightly anterior (+Z)
 *
 * Spinal cord: foramen magnum (~0.80) to L2 (~0.158)
 *   World centre Y = (0.80 + 0.158) / 2 ≈ 0.48
 *   Located posterior (−Z)
 *
 * Peripheral nerves: full-body model — same container offset as the
 *   body.glb (0, -0.2, 0) so the nerve mesh aligns with the skeleton.
 */

const makeMat = (
  color: string,
  opts?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, ...opts });

export const NervousSystemComplete3D: React.FC = () => {
  const isVisible = useAnatomyStore((s) => s.systemVisibility.nervous);
  const selectedId = useAnatomyStore((s) => s.selectedId);
  const hoveredId = useAnatomyStore((s) => s.hoveredId);
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const hoverStructure = useAnatomyStore((s) => s.hoverStructure);
  const viewMode = useAnatomyStore((s) => s.viewMode);
  const isIsolateMode = useAnatomyStore((s) => s.isIsolateMode);

  const [brainScene, setBrainScene] = useState<THREE.Group | null>(null);
  const [spinalCordScene, setSpinalCordScene] = useState<THREE.Group | null>(null);
  const [nervesScene, setNervesScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let isMounted = true;
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // ── 1. Brain ──────────────────────────────────────────────────────────────
    loader.load('/models/brain.glb', (gltf) => {
      if (!isMounted) return;
      const root = gltf.scene;
      root.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      root.position.x = -center.x;
      root.position.y = -center.y;
      root.position.z = -center.z;

      // Brain height target: fills cranial vault (~0.29 units from mandible to top)
      const targetBrainSize = 0.33;
      const scale = size.y > 0 ? targetBrainSize / size.y : 1;

      const container = new THREE.Group();
      container.add(root);
      container.scale.setScalar(scale);
      // World Y ≈ 1.07: mid-point of cranial vault, slight anterior offset
      container.position.set(0, 1.07, 0.02);

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      setBrainScene(container);
    });

    // ── 2. Spinal Cord ────────────────────────────────────────────────────────
    loader.load('/models/spinal-cord.glb', (gltf) => {
      if (!isMounted) return;
      const root = gltf.scene;
      root.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      root.position.x = -center.x;
      root.position.y = -center.y;
      root.position.z = -center.z;

      // Cord runs foramen magnum (~0.80) → L2 (~0.158): length ≈ 0.642 units
      const targetCordLength = 0.65;
      const scale = size.y > 0 ? targetCordLength / size.y : 1;

      const container = new THREE.Group();
      container.add(root);
      container.scale.setScalar(scale);
      // World Y = midpoint of (0.80 + 0.158)/2 = 0.479, posterior to vertebrae
      container.position.set(0, 0.48, -0.045);

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      setSpinalCordScene(container);
    });

    // ── 3. Peripheral Nerves ──────────────────────────────────────────────────
    loader.load(
      '/models/nerves.glb',
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

        // Full body height — same scale+offset as body.glb so nerves align
        const targetHeight = 2.8;
        const scale = size.y > 0 ? targetHeight / size.y : 1;

        const container = new THREE.Group();
        container.add(root);
        container.scale.setScalar(scale);
        // Match body.glb container offset so nerves sit inside the same body
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

        setNervesScene(container);
      },
      undefined,
      (err) => console.warn('[NervousSystemComplete3D] Error loading nerves.glb:', err)
    );

    return () => {
      isMounted = false;
      dracoLoader.dispose();
    };
  }, []);

  // ── Reactive material updates ───────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible) return;

    const isBrainSelected = Boolean(
      selectedId === 'brain' || selectedId?.includes('cortex') || selectedId?.includes('cerebell')
    );
    const isSpineSelected = Boolean(selectedId === 'spinal_cord' || selectedId?.includes('nerve'));
    const isBrainHovered = Boolean(hoveredId === 'brain');
    const isSpineHovered = Boolean(hoveredId === 'spinal_cord');

    const applyMat = (
      scene: THREE.Group,
      isSelected: boolean,
      isHovered: boolean,
      defaultColor: string
    ) => {
      const isDimmed = isIsolateMode && selectedId !== null && !isSelected;
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (viewMode === 'wireframe') {
            mesh.material = new THREE.MeshBasicMaterial({
              wireframe: true,
              color: isSelected ? '#0284c7' : defaultColor,
              side: THREE.DoubleSide,
            });
          } else if (viewMode === 'xray') {
            mesh.material = makeMat(isSelected ? '#0284c7' : defaultColor, {
              emissive: new THREE.Color(isSelected ? '#0284c7' : '#eab308'),
              emissiveIntensity: isSelected ? 0.8 : 0.25,
              transparent: true,
              opacity: isSelected ? 0.95 : isDimmed ? 0.06 : 0.5,
              roughness: 0.2,
              depthWrite: false,
            });
          } else if (isDimmed) {
            mesh.material = makeMat('#cbd5e1', {
              transparent: true,
              opacity: 0.08,
              roughness: 0.9,
              depthWrite: false,
            });
          } else if (isSelected) {
            mesh.material = makeMat('#38bdf8', {
              emissive: new THREE.Color('#0369a1'),
              emissiveIntensity: 0.6,
              roughness: 0.25,
              metalness: 0.1,
            });
          } else if (isHovered) {
            mesh.material = makeMat(defaultColor, {
              emissive: new THREE.Color('#eab308'),
              emissiveIntensity: 0.35,
              roughness: 0.3,
            });
          } else {
            mesh.material = makeMat(defaultColor, { roughness: 0.35, metalness: 0.05 });
          }
        }
      });
    };

    if (brainScene) applyMat(brainScene, isBrainSelected, isBrainHovered, '#e2b170');
    if (spinalCordScene) applyMat(spinalCordScene, isSpineSelected, isSpineHovered, '#facc15');

    if (nervesScene) {
      nervesScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const isNerveSelected = selectedId === mesh.name || selectedId === 'spinal_cord';
          const isNerveHovered = hoveredId === mesh.name;
          const isDimmed = isIsolateMode && selectedId !== null && !isNerveSelected;

          if (viewMode === 'wireframe') {
            mesh.material = new THREE.MeshBasicMaterial({
              wireframe: true,
              color: isNerveSelected ? '#0284c7' : '#facc15',
              side: THREE.DoubleSide,
            });
          } else if (viewMode === 'xray') {
            mesh.material = makeMat(isNerveSelected ? '#0284c7' : '#facc15', {
              emissive: new THREE.Color(isNerveSelected ? '#0284c7' : '#ca8a04'),
              emissiveIntensity: isNerveSelected ? 0.8 : 0.3,
              transparent: true,
              opacity: isNerveSelected ? 0.95 : isDimmed ? 0.06 : 0.5,
              roughness: 0.2,
              depthWrite: false,
            });
          } else if (isDimmed) {
            mesh.material = makeMat('#cbd5e1', {
              transparent: true,
              opacity: 0.08,
              roughness: 0.9,
              depthWrite: false,
            });
          } else if (isNerveSelected) {
            mesh.material = makeMat('#38bdf8', {
              emissive: new THREE.Color('#0369a1'),
              emissiveIntensity: 0.6,
              roughness: 0.25,
              metalness: 0.1,
            });
          } else if (isNerveHovered) {
            mesh.material = makeMat('#facc15', {
              emissive: new THREE.Color('#ca8a04'),
              emissiveIntensity: 0.4,
              roughness: 0.3,
            });
          } else {
            mesh.material = makeMat('#facc15', { roughness: 0.35, metalness: 0.05 });
          }
        }
      });
    }
  }, [brainScene, spinalCordScene, nervesScene, selectedId, hoveredId, viewMode, isIsolateMode, isVisible]);

  if (!isVisible) return null;

  // No outer offset group — all containers placed in world space directly
  return (
    <>
      {brainScene && (
        <primitive
          object={brainScene}
          onClick={(e: any) => {
            e.stopPropagation();
            // World centre of brain
            selectStructure('brain', [0, 1.07, 0.02]);
          }}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            hoverStructure('brain');
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            hoverStructure(null);
            document.body.style.cursor = 'auto';
          }}
        />
      )}

      {spinalCordScene && (
        <primitive
          object={spinalCordScene}
          onClick={(e: any) => {
            e.stopPropagation();
            selectStructure('spinal_cord', [0, 0.48, -0.045]);
          }}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            hoverStructure('spinal_cord');
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            hoverStructure(null);
            document.body.style.cursor = 'auto';
          }}
        />
      )}

      {nervesScene && (
        <primitive
          object={nervesScene}
          onClick={(e: any) => {
            e.stopPropagation();
            const clickedMesh = e.object as THREE.Mesh;
            const name = clickedMesh?.name || 'Peripheral Nerve';
            const worldPos = new THREE.Vector3();
            clickedMesh.getWorldPosition(worldPos);
            selectStructure('spinal_cord', [worldPos.x, worldPos.y, worldPos.z], name);
          }}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            const name = (e.object as THREE.Mesh)?.name || 'Peripheral Nerve';
            hoverStructure(name);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            hoverStructure(null);
            document.body.style.cursor = 'auto';
          }}
        />
      )}
    </>
  );
};
