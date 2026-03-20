'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PoseTrackingEngine } from './PoseTrackingEngine';
import { GarmentLayerManager, type Garment } from './GarmentLayerManager';
import { ClothingRenderer } from './ClothingRenderer';
import { ARControls } from './ARControls';
import type { Results } from '@mediapipe/pose';

interface ARMirrorProps {
  selectedGarments: Garment[];
}

export function ARMirror({ selectedGarments }: ARMirrorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [poseResults, setPoseResults] = useState<Results | null>(null);
  const [isMirrorMode, setIsMirrorMode] = useState(true);
  const engineRef = useRef<PoseTrackingEngine | null>(null);
  const layerManager = useRef(new GarmentLayerManager());

  useEffect(() => {
    engineRef.current = new PoseTrackingEngine((results) => {
      setPoseResults(results);
    });

    if (videoRef.current) {
      engineRef.current.start(videoRef.current);
    }

    return () => {
      if (engineRef.current) engineRef.current.stop();
    };
  }, []);

  useEffect(() => {
    layerManager.current.clear();
    selectedGarments.forEach((g) => layerManager.current.addGarment(g));
  }, [selectedGarments]);

  const toggleMirror = () => setIsMirrorMode((prev) => !prev);
  const resetAlignment = () => setPoseResults(null);
  const captureScreenshot = useCallback(async () => {
    if (!canvasWrapperRef.current) return;
    try {
      await fetch('/api/ar/capture', { method: 'POST', body: JSON.stringify({ captureId: Date.now() }) });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div ref={canvasWrapperRef} className="relative w-full h-[80vh] bg-gray-900 rounded-2xl overflow-hidden">
      <video 
        ref={videoRef} 
        className={`absolute inset-0 w-full h-full object-cover ${isMirrorMode ? 'scale-x-[-1]' : ''}`}
        playsInline 
        muted 
      />

      <div className={`absolute inset-0 z-10 ${isMirrorMode ? 'scale-x-[-1]' : ''}`}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          {layerManager.current.getLayeredGarments().map(garment => (
            <ClothingRenderer 
              key={garment.id} 
              garment={garment} 
              poseResults={poseResults} 
            />
          ))}
        </Canvas>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <ARControls 
            onToggleMirror={toggleMirror}
            onResetAlignment={resetAlignment}
            onCaptureScreenshot={captureScreenshot}
            isMirrorMode={isMirrorMode}
          />
        </div>
      </div>
    </div>
  );
}
