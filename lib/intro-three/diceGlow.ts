import * as THREE from 'three'

import { DICE_SIZE } from './dice'

export function createDiceGlow(): THREE.Mesh {
  const geo = new THREE.CircleGeometry(DICE_SIZE * 1.27, 48)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x4ec8b0,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -DICE_SIZE * 0.614
  return mesh
}

export function animateDiceGlow(mesh: THREE.Mesh, elapsed: number): void {
  const mat = mesh.material as THREE.MeshBasicMaterial
  mat.opacity = 0.14 + Math.sin(elapsed * 1.2) * 0.06
  mesh.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.05)
}
