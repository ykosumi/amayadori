import * as THREE from 'three';
import { rng } from './ease.js';
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
const PASTEL = [0xffb5a7, 0xfcd5ce, 0xbde0fe, 0xcdeac0, 0xfff1a8, 0xd0c4f7];

/** Low-poly suburban street along +Z. All objects tagged userData.env so the character-only (alpha) pass can hide them. */
export function createSuburb({ length = 120, seed = 7 } = {}) {
  const g = new THREE.Group(); const R = rng(seed);
  const add = (o) => { o.userData.env = true; g.add(o); return o; };
  const ground = add(new THREE.Mesh(new THREE.PlaneGeometry(80, length * 2), M(0xbfe3a8))); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  const road = add(new THREE.Mesh(new THREE.PlaneGeometry(6, length * 2), M(0x6b7280, { roughness: 0.95 }))); road.rotation.x = -Math.PI / 2; road.position.y = 0.01; road.receiveShadow = true;
  for (let z = -length; z < length; z += 4) { const l = add(new THREE.Mesh(new THREE.PlaneGeometry(0.2, 2), M(0xfff6d6))); l.rotation.x = -Math.PI / 2; l.position.set(0, 0.02, z); }
  for (const side of [-1, 1]) {
    const walk = add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, length * 2), M(0xe9e4da))); walk.rotation.x = -Math.PI / 2; walk.position.set(side * 4.2, 0.015, 0); walk.receiveShadow = true;
    for (let z = -length; z < length; z += 11 + R() * 5) {
      const w = 5 + R() * 2.5, h = 3.2 + R() * 1.6, d = 5 + R() * 2; const x = side * (10 + R() * 1.5);
      const house = new THREE.Group(); house.position.set(x, 0, z);
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(PASTEL[(R() * PASTEL.length) | 0])); body.position.y = h / 2; body.castShadow = body.receiveShadow = true;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 2.2, 4), M(0xc8553d)); roof.position.y = h + 1.1; roof.rotation.y = Math.PI / 4; roof.castShadow = true;
      const door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 0.1), M(0x7a5c3e)); door.position.set(0, 0.9, -side * (d / 2 + 0.03));
      house.add(body, roof, door); add(house);
    }
    for (let z = -length; z < length; z += 6 + R() * 4) {
      const t = new THREE.Group(); t.position.set(side * 6.2, 0, z + R() * 2);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.4, 6), M(0x8b5e3c)); trunk.position.y = 0.7;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + R() * 0.4, 0), M(0x6fbf73, { flatShading: true })); crown.position.y = 2.2; crown.castShadow = true;
      t.add(trunk, crown); add(t);
    }
  }
  return g;
}

export function createCar(color = 0xff6b6b) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 3.8), M(color, { roughness: 0.4 })); body.position.y = 0.55; body.castShadow = true;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 1.9), M(0xdff3ff, { roughness: 0.15 })); cab.position.set(0, 1.1, -0.1); cab.castShadow = true;
  g.add(body, cab);
  g.userData.wheels = [];
  for (const [x, z] of [[-0.95, 1.2], [0.95, 1.2], [-0.95, -1.2], [0.95, -1.2]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 14), M(0x222222)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.38, z); g.add(w); g.userData.wheels.push(w);
  }
  g.userData.env = true; return g;
}

export function createLighting(scene) {
  scene.add(new THREE.HemisphereLight(0xdff1ff, 0xf1e2c6, 1.15));
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.4); sun.position.set(8, 14, -6); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const c = sun.shadow.camera; c.left = -14; c.right = 14; c.top = 14; c.bottom = -14; c.near = 1; c.far = 60; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target); return sun; // call sun.target.position.copy(...) to follow the hero
}
