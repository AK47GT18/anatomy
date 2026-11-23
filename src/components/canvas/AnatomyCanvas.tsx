'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { RealAnatomyModel } from './RealAnatomyModel';
import { CameraDirector } from './CameraDirector';
import { useAnatomyStore } from '@/store/anatomyStore';

export const AnatomyCanvas: React.FC = () => {
  const selectStructure = useAnatomyStore((s) => s.selectStructure);
  const orbitRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full bg-[#f4f6f8] overflow-hidden select-none">
      <Canvas
        shadows
        camera={{ position: [0, 0, 4.8], fov: 36, near: 0.05, far: 60 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          logarithmicDepthBuffer: true,
          toneMapping: 3, // ACESFilmicToneMapping — clinical neutral film look
          toneMappingExposure: 1.1,
        }}
        onPointerMissed={() => selectStructure(null)}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Neutral clinical white background — matches the app shell */}
        <color attach="background" args={['#f4f6f8']} />

        {/* ── STUDIO LIGHTING RIG ───────────────────────────────────
            Mimics a clinical lightbox: even, neutral, shadowless fill
            with a subtle key-to-fill ratio to reveal form clearly.
        ──────────────────────────────────────────────────────────── */}

        {/* Soft global ambient — keeps shadows from going jet black */}
        <ambientLight intensity={0.95} color="#f8fafc" />

        {/* Primary key light — upper-front-right, daylight white */}
        <directionalLight
          position={[3.5, 6, 4.5]}
          intensity={1.6}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={18}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={7}
          shadow-camera-bottom={-5}
          shadow-bias={-0.0003}
        />

        {/* Secondary fill — left side, slightly cooler to give subtle contrast */}
        <directionalLight position={[-3.5, 3, 2]} intensity={0.65} color="#e8f0fe" />

        {/* Rim backlight — behind model to separate it from background */}
        <directionalLight position={[0, 2, -4]} intensity={0.55} color="#f1f5f9" />

        {/* Under-bounce — lifts shadows from below so feet read clearly */}
        <directionalLight position={[0, -3, 2]} intensity={0.3} color="#e2e8f0" />

        <Suspense fallback={null}>
          <RealAnatomyModel />

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
          dampingFactor={0.055}
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
