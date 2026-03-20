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
  const previousCenter = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!poseResults || !poseResults.poseLandmarks || !meshRef.current) return;

    const landmarks = poseResults.poseLandmarks;
    
    // Points 11: left shoulder, 12: right shoulder
    // Points 23: left hip, 24: right hip
    // Points 25: left knee, 26: right knee

    let centerX = 0, centerY = 0, centerZ = 0;
    let targetAngle = 0;
    let baseScale = 1;

    let canTrack = false;

    if (garment.attachmentType === 'upper_body') {
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      if (leftShoulder.visibility! > 0.5 && rightShoulder.visibility! > 0.5 && leftHip.visibility! > 0.5 && rightHip.visibility! > 0.5) {
        canTrack = true;
        // Torso center
        centerX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
        centerY = (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4;
        centerZ = (leftShoulder.z + rightShoulder.z + leftHip.z + rightHip.z) / 4;

        targetAngle = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
        
        const dx = rightShoulder.x - leftShoulder.x;
        const dy = rightShoulder.y - leftShoulder.y;
        const shoulderWidth = Math.sqrt(dx * dx + dy * dy);
        
        const torsoDy = ((leftHip.y + rightHip.y) / 2) - ((leftShoulder.y + rightShoulder.y) / 2);
        
        // Base scale derived from shoulder width and torso height
        baseScale = (shoulderWidth * 6 + torsoDy * 3);
      }
    } else if (garment.attachmentType === 'lower_body') {
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];

      if (leftHip.visibility! > 0.5 && rightHip.visibility! > 0.5) {
        canTrack = true;
        let bottomY = (leftHip.y + rightHip.y) / 2 + 0.2; // default down if knees aren't visible
        
        if (leftKnee.visibility! > 0.5 && rightKnee.visibility! > 0.5) {
           bottomY = (leftKnee.y + rightKnee.y) / 2;
        }

        centerX = (leftHip.x + rightHip.x) / 2;
        centerY = ((leftHip.y + rightHip.y) / 2 + bottomY) / 2; // Midpoint between hips and knees
        centerZ = (leftHip.z + rightHip.z) / 2;

        targetAngle = Math.atan2(rightHip.y - leftHip.y, rightHip.x - leftHip.x);
        
        const dx = rightHip.x - leftHip.x;
        const dy = rightHip.y - leftHip.y;
        const hipWidth = Math.sqrt(dx * dx + dy * dy);
        
        baseScale = hipWidth * 7;
      }
    }

    if (canTrack) {
      // Convert normalized MediaPipe coordinates (0 to 1) to Three.js coordinates
      const targetPos = new THREE.Vector3((centerX - 0.5) * 5, -(centerY - 0.5) * 5, -centerZ * 5);
      const movementDelta = targetPos.clone().sub(previousCenter.current);
      previousCenter.current.copy(targetPos);

      // Lerp for smooth translation
      meshRef.current.position.lerp(targetPos.add(new THREE.Vector3(...garment.positionOffset)), 0.5);
      
      // Smooth rotation
      meshRef.current.rotation.z = -targetAngle;
      
      meshRef.current.scale.set(baseScale * garment.scale[0], baseScale * garment.scale[1], baseScale * garment.scale[2]);

      // Apply cloth physics to the vertices
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
