import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Garment } from './GarmentLayerManager';
import { ClothPhysicsEngine } from './ClothPhysicsEngine';
import type { Results } from '@mediapipe/pose';

interface ClothingRendererProps {
  garment: Garment;
  poseResults: Results | null;
}

export function ClothingRenderer({ garment, poseResults }: ClothingRendererProps) {
  const { scene } = useGLTF(garment.modelUrl);
  const meshRef = useRef<THREE.Group>(null);
  const physicsEngine = useRef(new ClothPhysicsEngine());
  const previousShoulderCenter = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!poseResults || !poseResults.poseLandmarks || !meshRef.current) return;

    const landmarks = poseResults.poseLandmarks;
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    if (leftShoulder.visibility! > 0.5 && rightShoulder.visibility! > 0.5) {
      const centerX = (leftShoulder.x + rightShoulder.x) / 2;
      const centerY = (leftShoulder.y + rightShoulder.y) / 2;
      const centerZ = (leftShoulder.z + rightShoulder.z) / 2;

      const targetPos = new THREE.Vector3((centerX - 0.5) * 5, -(centerY - 0.5) * 5, -centerZ * 5);
      const movementDelta = targetPos.clone().sub(previousShoulderCenter.current);
      previousShoulderCenter.current.copy(targetPos);

      meshRef.current.position.lerp(targetPos.add(new THREE.Vector3(...garment.positionOffset)), 0.5);

      const shoulderAngle = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
      meshRef.current.rotation.z = -shoulderAngle;
      
      const dx = rightShoulder.x - leftShoulder.x;
      const dy = rightShoulder.y - leftShoulder.y;
      const shoulderWidth = Math.sqrt(dx * dx + dy * dy);
      const baseScale = shoulderWidth * 5; 
      meshRef.current.scale.set(baseScale * garment.scale[0], baseScale * garment.scale[1], baseScale * garment.scale[2]);

      meshRef.current.children.forEach((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) {
            physicsEngine.current.updateVertices(mesh.geometry, movementDelta, delta);
          }
        }
      });
    }
  });

  return <primitive ref={meshRef} object={scene.clone()} />;
}
