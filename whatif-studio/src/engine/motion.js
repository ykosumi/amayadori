import { strideLength } from './character.js';
/** Integrate gait phase from speed so planted feet match ground travel. speed(t) m/s, gait(t) 0..1. Deterministic. */
export function integrate(speed, gait, t, dt = 1 / 120) {
  let phase = 0, dist = 0;
  for (let u = 0; u < t; u += dt) { const v = speed(u); dist += v * dt; phase += (v / strideLength(gait(u))) * Math.PI * 2 * dt; }
  return { phase, dist };
}
