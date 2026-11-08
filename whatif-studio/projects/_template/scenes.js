// DEMO project: proves the pipeline (rig, walk->run->jump, dust, streaks, camera, info scene).
import { createCharacter, jumpCurve, blinkAt } from '../../src/engine/character.js';
import { createSuburb, createCar } from '../../src/engine/env.js';
import { Dust, Streaks, impactRing } from '../../src/engine/fx.js';
import { followCam } from '../../src/engine/camera.js';
import { integrate } from '../../src/engine/motion.js';
import { smooth, seg, lerp, outCubic } from '../../src/engine/ease.js';

export const fps = 24;
export const duration = 12;

const speed = (t) => (t < 3.5 ? 1.5 : lerp(1.5, 5.5, smooth(seg(t, 3.5, 4.5))));
const gait = (t) => smooth(seg(t, 3.5, 4.5));
const JUMP_T = 7.0;

export function setup({ scene, sun, camera }) {
  scene.add(createSuburb());
  const hero = createCharacter(); hero.root.userData.hero = true; scene.add(hero.root);
  const car = createCar(); car.position.set(-2.2, 0, 80); scene.add(car);
  const dust = new Dust(scene); const streaks = new Streaks(scene); const ring = impactRing(scene);
  // dust events: a puff at each foot strike (every half cycle) while running, and at jump launch/land
  return { hero, car, dust, streaks, ring, sun, camera };
}

function heroState(t) {
  const { phase, dist } = integrate(speed, gait, t);
  const j = jumpCurve(t - JUMP_T);
  return { phase, z: dist, j };
}

export const shots = [
  {
    id: 'run', start: 0, end: 9, kind: '3d',
    update(t, local, w) {
      const { hero, dust, streaks, ring, car, sun } = w; const s = heroState(t); const g = gait(t);
      hero.root.position.set(0, j0(s), s.z);
      hero.setPose({ phase: s.phase, gait: g, moving: 1, tAbs: t, blink: blinkAt(t), squash: s.j.squash,
        armsUp: Math.max(0, s.j.armsUp), emote: t > 6.8 && t < 8 ? 'shock' : t < 3 ? 'neutral' : 'happy', look: { yaw: Math.sin(t * 0.7) * 0.25, pitch: 0.05 } });
      if (s.j.airborne) { hero.legL.hp.rotation.x = -0.9 * s.j.tuck; hero.legR.hp.rotation.x = 0.3 * s.j.tuck; hero.legL.kn.rotation.x = 1.2 * s.j.tuck; hero.legR.kn.rotation.x = 0.6 * s.j.tuck; }
      // deterministic dust: rebuild events list from time (cheap)
      dust.events.length = 0; for (let k = 0; ; k++) { const ts = 4.4 + k * 0.24; if (ts > t + 0.01) break; if (ts > 4.4 && ts < JUMP_T - 0.1) dust.emit(ts, 0.1 * (k % 2 ? 1 : -1), heroZ(ts), 4, 0.7); }
      dust.emit(JUMP_T + 0.28, 0, heroZ(JUMP_T + 0.28), 8, 1); dust.emit(JUMP_T + 0.28 + 0.7, 0, heroZ(JUMP_T + 0.98), 12, 1.6);
      dust.update(t); ring(t - (JUMP_T + 0.98), 0, heroZ(JUMP_T + 0.98));
      streaks.update(t, hero.root.position, smooth(seg(t, 4, 5)) * (t < 8 ? 1 : 0.4));
      car.position.z = 80 - t * 12; car.userData.wheels.forEach((x) => (x.rotation.x = -t * 30));
      sun.target.position.copy(hero.root.position); sun.position.set(8, 14, hero.root.position.z - 6);
      const k = smooth(seg(t, 3.5, 5)), kj = smooth(seg(t, 6.6, 7.3));
      followCam(w.camera, hero.root.position, {
        offset: [lerp(2.2, 3.0, k) - kj * 2.4, lerp(1.9, 1.3, k) + kj * 1.2, lerp(-6.2, -4.4, k) - kj * 1.4], look: [-0.5, lerp(1.2, 1.0, k), lerp(1.5, 3, k)],
        fov: lerp(42, 58, k) - kj * 8, shake: 0.03 * k, t });
    },
    captions: (l) => (l < 3.5 ? 'もしも あなたが 10倍 速かったら？' : l < 6.5 ? 'まずは ウォーミングアップ…' : ''),
  },
  {
    id: 'diagram', start: 9, end: 12, kind: 'info',
    draw(ctx, t, l, w, h, I) {
      I.bg(ctx, w, h, t); I.title(ctx, 'SPEED\nCOMPARISON', w / 2, 260, seg(l, 0, 0.5), { size: 96, color: I.C.cyan });
      I.counter(ctx, 0, 36, seg(l, 0.3, 1.6), w / 2, 720, { unit: ' km/h', label: 'Usain Bolt (peak)' });
      I.bars(ctx, [{ label: '人 (散歩)', value: 5, text: '5 km/h', color: I.C.green }, { label: '10倍', value: 50, text: '50 km/h', color: I.C.yellow }, { label: '自動車 (市街地)', value: 50, text: '50 km/h', color: I.C.pink }], l / 3, 120, 1000, 840, { max: 50 });
      I.arrow(ctx, 200, 1500, 880, 1500, seg(l, 1, 2));
    },
  },
];
function heroZ(t) { return integrate(speed, gait, t).dist; }
function j0(s) { return s.j.y; }
