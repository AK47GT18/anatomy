'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnatomyStore } from '@/store/anatomyStore';

interface CameraDirectorProps {
  orbitRef: React.RefObject<any>;
}

export const CameraDirector: React.FC<CameraDirectorProps> = ({ orbitRef }) => {
  const { camera } = useThree();
  const cameraFocusTarget = useAnatomyStore((s) => s.cameraFocusTarget);
  const cameraFocusDistance = useAnatomyStore((s) => s.cameraFocusDistance);
  const anatomicalPlane = useAnatomyStore((s) => s.anatomicalPlane);
  const cameraResetKey = useAnatomyStore((s) => s.cameraResetKey);

  const desiredTarget = useRef(new THREE.Vector3(0, -0.2, 0));
  const desiredPos = useRef(new THREE.Vector3(0, 0, 4.8));
  const isTransitioning = useRef(false);

  // Focus on selected organ / bone
  useEffect(() => {
    if (cameraFocusTarget) {
      const [tx, ty, tz] = cameraFocusTarget;
      desiredTarget.current.set(tx, ty, tz);
      const dist = cameraFocusDistance || 1.6;
      desiredPos.current.set(tx, ty, tz + dist);
      isTransitioning.current = true;
    }
  }, [cameraFocusTarget, cameraFocusDistance]);

  // Named anatomical-plane quick-views
  useEffect(() => {
    const setPlane = (px: number, py: number, pz: number, tx: number, ty: number, tz: number) => {
      desiredPos.current.set(px, py, pz);
      desiredTarget.current.set(tx, ty, tz);
      isTransitioning.current = true;
    };

    if (anatomicalPlane === 'sagittal') setPlane(4.6, -0.2, 0, 0, -0.2, 0);
    else if (anatomicalPlane === 'coronal') setPlane(0, -0.2, 4.8, 0, -0.2, 0);
    else if (anatomicalPlane === 'transverse') setPlane(0, 5.2, 0.01, 0, -0.2, 0);
  }, [anatomicalPlane]);

  // Full-body reset
  useEffect(() => {
    if (cameraResetKey > 0) {
      desiredTarget.current.set(0, -0.2, 0);
      desiredPos.current.set(0, 0, 4.8);
      isTransitioning.current = true;

      // Also sync the orbit target so damping doesn't fight the transition
      if (orbitRef.current) {
        orbitRef.current.target.set(0, -0.2, 0);
      }
    }
  }, [cameraResetKey]);

  useFrame((_, delta) => {
    if (!isTransitioning.current) return;

    const step = Math.min(delta * 5.5, 0.14);
    camera.position.lerp(desiredPos.current, step);

    // Keep orbit target tracking for smooth feel
    if (orbitRef.current) {
      orbitRef.current.target.lerp(desiredTarget.current, step);
      orbitRef.current.update();
    }

    if (camera.position.distanceTo(desiredPos.current) < 0.03) {
      camera.position.copy(desiredPos.current);
      isTransitioning.current = false;
    }
  });

  return null;
};
