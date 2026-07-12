import * as THREE from 'three'

const AURORA_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const AURORA_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uPhase;
  varying vec2 vUv;

  void main() {
    float sway = sin(vUv.x * 6.0 + uTime * 0.25 + uPhase) * 0.5 + 0.5;
    float ripple = sin(vUv.x * 14.0 - uTime * 0.4 + uPhase * 2.0) * 0.15;
    float curtain = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.35, vUv.y);
    float beam = pow(sway + ripple, 1.4) * curtain;
    float fadeX = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
    float alpha = beam * fadeX * 0.42;
    vec3 color = mix(uColorA, uColorB, sway);
    gl_FragColor = vec4(color, alpha);
  }
`

export interface AuroraRibbon {
  mesh: THREE.Mesh
  material: THREE.ShaderMaterial
}

export function createAuroraRibbons(): THREE.Group {
  const group = new THREE.Group()

  const configs = [
    { x: -4, rotZ: 0.12, colorA: [0.05, 0.28, 0.38], colorB: [0.2, 0.75, 0.68], phase: 0 },
    { x: 2, rotZ: -0.08, colorA: [0.08, 0.22, 0.42], colorB: [0.35, 0.82, 0.78], phase: 1.8 },
    { x: -1, rotZ: 0.04, colorA: [0.04, 0.18, 0.32], colorB: [0.15, 0.55, 0.62], phase: 3.2 },
    { x: 5, rotZ: -0.15, colorA: [0.06, 0.25, 0.35], colorB: [0.28, 0.7, 0.72], phase: 4.5 },
  ]

  for (const cfg of configs) {
    const geo = new THREE.PlaneGeometry(9, 14, 1, 1)
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: cfg.phase },
        uColorA: { value: new THREE.Vector3(...cfg.colorA) },
        uColorB: { value: new THREE.Vector3(...cfg.colorB) },
      },
      vertexShader: AURORA_VERTEX,
      fragmentShader: AURORA_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(cfg.x, 1.5, -8)
    mesh.rotation.z = cfg.rotZ
    mesh.rotation.y = 0.15
    group.add(mesh)
  }

  return group
}

export function animateAurora(group: THREE.Group, elapsed: number, paused: boolean): void {
  if (paused) return
  for (const child of group.children) {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
      child.material.uniforms.uTime!.value = elapsed
      child.position.y = 1.5 + Math.sin(elapsed * 0.35 + child.material.uniforms.uPhase!.value) * 0.25
    }
  }
}
