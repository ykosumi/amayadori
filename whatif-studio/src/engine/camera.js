import * as THREE from 'three';
import { smooth } from './ease.js';
// Keyframed camera. keys: [{t, pos:[x,y,z], look:[x,y,z], fov}] -> smoothstep between keys. Functions of time only.
export function sampleCamera(cam, keys, t) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const k = b.t === a.t ? 0 : smooth((t - a.t) / (b.t - a.t));
  const L = (p, q) => p.map((v, n) => v + (q[n] - v) * k);
  const pos = L(a.pos, b.pos), look = L(a.look, b.look);
  cam.position.set(...pos); cam.lookAt(...look); cam.fov = a.fov + (b.fov - a.fov) * k; cam.updateProjectionMatrix();
}
/** Follow-cam helper: offset relative to a target position, with optional handheld shake (deterministic). */
export function followCam(cam, target, { offset = [3, 2.2, -5], look = [0, 1.2, 2], fov = 45, shake = 0, t = 0 } = {}) {
  const sx = Math.sin(t * 13.1) * shake, sy = Math.sin(t * 17.3 + 1) * shake;
  cam.position.set(target.x + offset[0] + sx, target.y + offset[1] + sy, target.z + offset[2]);
  cam.lookAt(target.x + look[0], target.y + look[1], target.z + look[2]); cam.fov = fov; cam.updateProjectionMatrix();
}
