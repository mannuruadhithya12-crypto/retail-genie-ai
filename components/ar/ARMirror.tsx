'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
  const [hasCameraError, setHasCameraError] = useState(false);
  const engineRef = useRef<PoseTrackingEngine | null>(null);
  const layerManager = useRef(new GarmentLayerManager());

  useEffect(() => {
    engineRef.current = new PoseTrackingEngine((results) => {
      setPoseResults(results);
    });

    if (videoRef.current) {
      engineRef.current.start(videoRef.current, (err) => {
        console.error("Camera/Pose tracking failed:", err);
        setHasCameraError(true);
      });
    }

    return () => {
      if (engineRef.current) engineRef.current.stop();
    };
  }, []);

  const layeredGarments = React.useMemo(() => {
    const manager = new GarmentLayerManager();
    selectedGarments.forEach((g) => manager.addGarment(g));
    return manager.getLayeredGarments();
  }, [selectedGarments]);

  const toggleMirror = () => setIsMirrorMode((prev) => !prev);
  const resetAlignment = () => setPoseResults(null);
  const captureScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasWrapperRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isMirrorMode) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const threeCanvas = canvasWrapperRef.current.querySelector('canvas');
    if (threeCanvas) {
      ctx.drawImage(threeCanvas, 0, 0, canvas.width, canvas.height);
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Genie-Snap-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, [isMirrorMode]);

  if (hasCameraError) {
    return (
      <div className="relative w-full h-full bg-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-4 bg-primary text-white text-xs px-3 py-1 rounded-full z-20">Fallback 3D Preview Mode</div>
        <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <OrbitControls />
          {layeredGarments.map(garment => (
            <ClothingRenderer 
              key={garment.id} 
              garment={garment} 
              poseResults={null} 
            />
          ))}
        </Canvas>
      </div>
    );
  }

  return (
    <div ref={canvasWrapperRef} className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden">
      <video 
        ref={videoRef} 
        className={`absolute inset-0 w-full h-full object-cover ${isMirrorMode ? 'scale-x-[-1]' : ''}`}
        playsInline 
        muted 
      />

      <div className={`absolute inset-0 z-10 ${isMirrorMode ? 'scale-x-[-1]' : ''}`}>
        <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          {layeredGarments.map(garment => (
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
