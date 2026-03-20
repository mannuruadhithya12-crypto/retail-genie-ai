import * as THREE from 'three';

export interface PhysicsParams {
  stiffness: number;
  damping: number;
  gravity: number;
}

export class ClothPhysicsEngine {
  private params: PhysicsParams;

  constructor(params: PhysicsParams = { stiffness: 0.8, damping: 0.5, gravity: 9.8 }) {
    this.params = params;
  }

  public updateVertices(geometry: THREE.BufferGeometry, movementDelta: THREE.Vector3, deltaTime: number) {
    if (!geometry.attributes.position) return;
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute as THREE.BufferAttribute, i);
      
      const swingFactor = Math.max(0, -vertex.y) * 0.1;
      
      vertex.x -= movementDelta.x * swingFactor * this.params.damping;
      vertex.z -= movementDelta.z * swingFactor * this.params.damping;
      vertex.y -= this.params.gravity * deltaTime * 0.01;

      vertex.lerp(new THREE.Vector3(vertex.x, vertex.y, 0), this.params.stiffness * deltaTime);
      
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
  }
}
