import * as THREE from 'three';
import { rng, clamp, outCubic } from './ease.js';

/** Deterministic dust puffs: emit events [{t0,x,z,n}] -> positions are pure functions of (t - t0). */
export class Dust {
  constructor(scene, max = 400) {
    this.max = max; this.events = [];
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: 0xf4eadb, transparent: true, opacity: 0.8, depthWrite: false }), max);
    this.mesh.frustumCulled = false; scene.add(this.mesh); this.m = new THREE.Object3D();
  }
  emit(t0, x, z, n = 6, power = 1) { this.events.push({ t0, x, z, n, power, seed: Math.floor(t0 * 1000) }); }
  update(t) {
    let i = 0; const life = 0.6;
    for (const e of this.events) {
      const age = t - e.t0; if (age < 0 || age > life) continue; const R = rng(e.seed);
      for (let k = 0; k < e.n && i < this.max; k++, i++) {
        const a = R() * Math.PI * 2, sp = (0.5 + R()) * e.power, u = age / life;
        this.m.position.set(e.x + Math.cos(a) * sp * outCubic(u) * 0.9, 0.1 + outCubic(u) * 0.5 * R(), e.z + Math.sin(a) * sp * outCubic(u) * 0.9);
        this.m.scale.setScalar((0.6 + R()) * (1 + u * 1.6) * (1 - u * u)); this.m.updateMatrix(); this.mesh.setMatrixAt(i, this.m.matrix);
      }
    }
    for (; i < this.max; i++) { this.m.scale.setScalar(0); this.m.updateMatrix(); this.mesh.setMatrixAt(i, this.m.matrix); }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** Speed streaks: thin planes that slide past camera along z. Pure function of t & intensity. */
export class Streaks {
  constructor(scene, n = 40, seed = 3) {
    this.n = n; const R = rng(seed); this.items = [];
    this.group = new THREE.Group(); scene.add(this.group);
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 2 + R() * 3), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide }));
      m.rotation.x = Math.PI / 2; this.group.add(m); this.items.push({ m, ox: (R() - 0.5) * 8, oy: 0.3 + R() * 3.5, ph: R() * 40, sp: 18 + R() * 14 });
    }
  }
  update(t, center, intensity) { // intensity 0..1
    this.items.forEach((s) => { const z = ((s.ph + t * s.sp) % 40) - 10; s.m.position.set(center.x + s.ox, s.oy, center.z + z); s.m.material.opacity = 0.55 * clamp(intensity); s.m.visible = intensity > 0.02; });
  }
}

/** Impact ring flash at world pos (pure function of age). */
export function impactRing(scene) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.05; scene.add(m);
  return (age, x, z) => { const u = clamp(age / 0.4); m.visible = age >= 0 && u < 1; m.position.x = x; m.position.z = z; m.scale.setScalar(0.5 + u * 4); m.material.opacity = (1 - u) * 0.8; };
}
