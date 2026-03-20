import * as THREE from 'three';

export interface PhysicsParams {
  stiffness: number;   // How strongly it returns to original shape
  damping: number;     // How quickly motion decays
  gravity: number;     // Downward force
  mass: number;        // Simulated mass of the fabric
  wind?: boolean;      // Optional wind effect
}

export class ClothPhysicsEngine {
  private params: PhysicsParams;
  private originalPositions: Float32Array | null = null;
  private velocities: Float32Array | null = null;
  private time: number = 0;

  constructor(params: PhysicsParams = { stiffness: 1.5, damping: 0.85, gravity: 9.8, mass: 1.0, wind: false }) {
    this.params = params;
  }

  public updateVertices(geometry: THREE.BufferGeometry, movementDelta: THREE.Vector3, deltaTime: number) {
    if (!geometry.attributes.position) return;
    
    // Clamp delta time to prevent physics explosions during lag spikes
    const dt = Math.min(deltaTime, 0.05);
    
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const count = positionAttribute.count;

    if (!this.originalPositions) {
      this.originalPositions = new Float32Array(positionAttribute.array);
      this.velocities = new Float32Array(count * 3);
    }

    this.time += dt;
    const currentPos = new THREE.Vector3();
    const restPos = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      currentPos.fromBufferAttribute(positionAttribute, i);
      restPos.fromArray(this.originalPositions, i * 3);
      
      // Calculate how free this vertex is to move. 
      // Vertices near the top (y > 0) are pinned to the body.
      // We use a non-linear curve for the swing factor so it bends smoothly and naturally.
      let swingFactor = 0;
      if (restPos.y < 0.2) {
        swingFactor = Math.pow(Math.abs(restPos.y - 0.2) + 0.1, 1.5) * 0.15;
      }

      if (swingFactor > 0) {
        // 1. External Forces (Movement + Gravity)
        // Convert instantaneous movement delta into an opposing inertial force
        const inertiaX = -movementDelta.x * (1 / this.params.mass) * 1500;
        const inertiaY = -movementDelta.y * (1 / this.params.mass) * 1500;
        const inertiaZ = -movementDelta.z * (1 / this.params.mass) * 1500;

        let windForceX = 0;
        let windForceZ = 0;

        if (this.params.wind) {
          windForceX = Math.sin(this.time * 2 + restPos.y * 5) * 2;
          windForceZ = Math.cos(this.time * 1.5 + restPos.x * 5) * 2;
        }

        // Apply forces to velocity
        this.velocities![i * 3] += (inertiaX + windForceX) * swingFactor * dt;
        this.velocities![i * 3 + 1] += (inertiaY - this.params.gravity * 20) * swingFactor * dt;
        this.velocities![i * 3 + 2] += (inertiaZ + windForceZ) * swingFactor * dt;

        // 2. Integration
        currentPos.x += this.velocities![i * 3] * dt;
        currentPos.y += this.velocities![i * 3 + 1] * dt;
        currentPos.z += this.velocities![i * 3 + 2] * dt;

        // 3. Structural Spring (return to original local position)
        // This simulates the fabric's internal structure resisting deformation
        const deltaX = restPos.x - currentPos.x;
        const deltaY = restPos.y - currentPos.y;
        const deltaZ = restPos.z - currentPos.z;

        // Spring force (Hooke's law)
        const springX = deltaX * this.params.stiffness * 50;
        const springY = deltaY * this.params.stiffness * 50;
        const springZ = deltaZ * this.params.stiffness * 50;

        this.velocities![i * 3] += springX * dt;
        this.velocities![i * 3 + 1] += springY * dt;
        this.velocities![i * 3 + 2] += springZ * dt;

        // 4. Damping (friction/air resistance)
        this.velocities![i * 3] *= this.params.damping;
        this.velocities![i * 3 + 1] *= this.params.damping;
        this.velocities![i * 3 + 2] *= this.params.damping;
        
        positionAttribute.setXYZ(i, currentPos.x, currentPos.y, currentPos.z);
      }
    }
    
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
  }
}
