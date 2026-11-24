'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Bvh } from '@react-three/drei';
import { RealAnatomyModel } from './RealAnatomyModel';
import { CameraDirector } from './CameraDirector';
import { useAnatomyStore } from '@/store/anatomyStore';

export const AnatomyCanvas: React.FC = () => {
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const orbitRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full bg-[#f4f6f8] overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 36, near: 0.05, far: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          logarithmicDepthBuffer: true,
          toneMapping: 3, // ACESFilmicToneMapping — clinical neutral film look
          toneMappingExposure: 1.15,
        }}
        onPointerMissed={() => selectStructure(null)}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Neutral clinical white background — matches the app shell */}
        <color attach="background" args={['#f4f6f8']} />

        {/* ── HIGH-PERFORMANCE CLINICAL LIGHTING RIG ─────────────────
            Even, diffuse illumination from 4 angles. Shadow mapping on
            800+ complex meshes was the primary source of runtime GPU
            lag; replacing it with pure studio lighting + contact shadow
            runs at smooth 60 FPS on all devices.
        ──────────────────────────────────────────────────────────── */}

        {/* Global ambient */}
        <ambientLight intensity={1.1} color="#f8fafc" />

        {/* Primary key light — upper-front-right */}
        <directionalLight position={[3.5, 6, 4.5]} intensity={1.5} color="#ffffff" />

        {/* Secondary fill — left side, slightly cool */}
        <directionalLight position={[-3.5, 3, 2]} intensity={0.7} color="#e8f0fe" />

        {/* Rim backlight — behind model */}
        <directionalLight position={[0, 2, -4]} intensity={0.6} color="#f1f5f9" />

        {/* Under-bounce — reveals feet & lower extremities */}
        <directionalLight position={[0, -3, 2]} intensity={0.35} color="#e2e8f0" />

        <Suspense fallback={null}>
          {/* BVH (Bounding Volume Hierarchy) accelerates raycasting by 10-50x */}
          <Bvh firstHitOnly>
            <RealAnatomyModel />
          </Bvh>

          {/* Soft contact shadow at foot level */}
          <ContactShadows
            position={[0, -1.62, 0]}
            opacity={0.22}
            scale={4.5}
            blur={2.5}
            far={2.5}
            color="#8094a8"
          />
        </Suspense>

        <CameraDirector orbitRef={orbitRef} />

        <OrbitControls
          ref={orbitRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={0.18}
          maxDistance={14}
          target={[0, -0.2, 0]}
          maxPolarAngle={Math.PI * 0.92}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  );
};
