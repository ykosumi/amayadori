import * as THREE from 'three';
import { clamp, smooth, seg, outCubic } from './ease.js';

// Reusable procedural cartoon character: round head, expressive eyes, thin jointed limbs, big shoes.
// Dimensions (units ~ metres, stylised): leg 0.9, torso 0.7, head r 0.42.
const LEG_U = 0.45, LEG_L = 0.45, ARM_U = 0.34, ARM_L = 0.34, HIP_H = 0.95;

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.65, metalness: 0, ...o });

function limb(len, r, color) { // pivot at top, mesh hangs down
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len - r * 2, 6, 12), mat(color));
  m.position.y = -len / 2; m.castShadow = true; g.add(m); return g;
}

export function createCharacter({ shirt = 0xff7a59, pants = 0x3d5a80, skin = 0xffd2b3, shoes = 0xf6f1e7, hair = 0x3b2a20 } = {}) {
  const root = new THREE.Group();           // world placement (feet on y=0)
  const body = new THREE.Group(); root.add(body); // squash/stretch + bob
  const hips = new THREE.Group(); hips.position.y = HIP_H; body.add(hips);

  const torso = new THREE.Group(); hips.add(torso);
  const tMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.42, 8, 16), mat(shirt));
  tMesh.position.y = 0.38; tMesh.castShadow = true; torso.add(tMesh);

  const neck = new THREE.Group(); neck.position.y = 0.82; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.34; neck.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), mat(skin)); skull.castShadow = true; head.add(skull);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.435, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), mat(hair));
  cap.rotation.x = -0.25; cap.position.y = 0.02; head.add(cap);

  const eyes = [-1, 1].map((s) => {
    const eye = new THREE.Group(); eye.position.set(s * 0.15, 0.06, 0.37);
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 16), mat(0xffffff, { roughness: 0.3 }));
    white.scale.z = 0.5;
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), mat(0x1b1b2b, { roughness: 0.2 }));
    pupil.position.z = 0.04; eye.add(white, pupil);
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.1, 4, 8), mat(hair));
    brow.rotation.z = Math.PI / 2; brow.position.set(0, 0.15, 0.0); eye.add(brow);
    head.add(eye); return { eye, pupil, brow, s };
  });
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), mat(0x7a2a2a));
  mouth.position.set(0, -0.17, 0.37); mouth.scale.set(1, 0.3, 0.4); head.add(mouth);

  const mkArm = (s) => { const sh = new THREE.Group(); sh.position.set(s * 0.34, 0.68, 0); torso.add(sh);
    const up = limb(ARM_U, 0.06, skin); sh.add(up); const el = new THREE.Group(); el.position.y = -ARM_U; up.add(el);
    const lo = limb(ARM_L, 0.055, skin); el.add(lo);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), mat(skin)); hand.position.y = -ARM_L; lo.add(hand);
    return { sh, el }; };
  const mkLeg = (s) => { const hp = new THREE.Group(); hp.position.set(s * 0.15, 0, 0); hips.add(hp);
    const up = limb(LEG_U, 0.075, pants); hp.add(up); const kn = new THREE.Group(); kn.position.y = -LEG_U; up.add(kn);
    const lo = limb(LEG_L, 0.065, pants); kn.add(lo);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), mat(shoes)); shoe.scale.set(0.8, 0.5, 1.45);
    shoe.position.set(0, -LEG_L - 0.02, 0.07); shoe.castShadow = true; lo.add(shoe);
    return { hp, kn }; };
  const armL = mkArm(-1), armR = mkArm(1), legL = mkLeg(-1), legR = mkLeg(1);
  const rig = { root, body, hips, torso, neck, head, eyes, mouth, armL, armR, legL, legR };
  rig.setPose = (p) => setPose(rig, p);
  return rig;
}

// stride length (metres per full cycle = 2 steps) for a given gait blend (0 walk .. 1 run).
// Drive phase from travelled distance:  phase = distance / strideLength(g) * 2PI   -> feet don't slide.
export const strideLength = (g) => 1.9 + g * 1.6;

/**
 * pose = { phase, gait(0..1), moving(0..1), lean, look:{yaw,pitch}, blink(0..1 closed), emote, jump:{u}, tAbs }
 * Pure function of its inputs.
 */
export function setPose(r, p) {
  const { phase = 0, gait = 0, moving = 0, look = { yaw: 0, pitch: 0 }, blink = 0, emote = 'neutral', squash = 0, tAbs = 0 } = p;
  const amp = (0.45 + 0.35 * gait) * moving;
  const s = Math.sin(phase), c = Math.cos(phase);
  // legs: hip swing + knee bend on the recovery half
  const kneeA = (0.35 + 0.9 * gait) * moving;
  const swingL = s * amp, swingR = -s * amp;
  r.legL.hp.rotation.x = swingL; r.legR.hp.rotation.x = swingR;
  // knee bends while the leg swings forward (recovery half of the cycle)
  r.legL.kn.rotation.x = kneeA * Math.max(0, c) + 0.05;
  r.legR.kn.rotation.x = kneeA * Math.max(0, -c) + 0.05;
  // arms counter-swing, elbows bend more when running
  const aAmp = (0.55 + 0.5 * gait) * moving;
  r.armL.sh.rotation.x = -s * aAmp; r.armR.sh.rotation.x = s * aAmp;
  r.armL.sh.rotation.z = 0.12; r.armR.sh.rotation.z = -0.12;
  r.armL.el.rotation.x = -(0.25 + 0.9 * gait) * moving - 0.1; r.armR.el.rotation.x = r.armL.el.rotation.x;
  // body bob (2 per cycle), lean into run, torso twist
  const bob = Math.abs(Math.cos(phase)) * (0.05 + 0.06 * gait) * moving;
  r.body.position.y = bob;
  r.torso.rotation.x = (0.05 + 0.3 * gait) * moving + (p.lean || 0);
  r.torso.rotation.y = -s * 0.12 * moving;
  r.hips.rotation.y = s * 0.1 * moving;
  // idle breathing so a standing character is never frozen
  const breath = Math.sin(tAbs * 2.2) * 0.012;
  r.torso.scale.set(1 + breath, 1 - breath, 1 + breath);
  // head: counter-rotates torso, look target, tiny idle sway
  r.head.rotation.y = look.yaw + Math.sin(tAbs * 0.9) * 0.04;
  r.head.rotation.x = look.pitch - r.torso.rotation.x * 0.6;
  // blink (eyes scale y) and emotes
  const open = 1 - blink;
  const E = { neutral: { brow: 0, mouth: [1, 0.3], eyeS: 1 }, happy: { brow: 0.1, mouth: [1.8, 0.5], eyeS: 1 },
    shock: { brow: 0.45, mouth: [0.9, 1.4], eyeS: 1.35 }, worry: { brow: -0.35, mouth: [1.2, 0.2], eyeS: 1.1 }, dizzy: { brow: -0.2, mouth: [1.0, 0.7], eyeS: 0.9 } }[emote] || {};
  r.eyes.forEach(({ eye, pupil, brow, s: side }) => {
    eye.scale.set(E.eyeS, E.eyeS * Math.max(0.08, open), E.eyeS);
    pupil.position.x = look.yaw * -0.05; pupil.position.y = look.pitch * 0.05;
    brow.position.y = 0.15 + E.brow * 0.12; brow.rotation.z = Math.PI / 2 + side * E.brow * 0.6 * -1;
  });
  r.mouth.scale.set(E.mouth[0], E.mouth[1], 0.4);
  // squash & stretch on body root (volume preserving)
  r.body.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5);
  if (p.armsUp) { const u = p.armsUp; r.armL.sh.rotation.x = lerpN(r.armL.sh.rotation.x, -2.6, u); r.armR.sh.rotation.x = lerpN(r.armR.sh.rotation.x, -2.6, u); }
}
const lerpN = (a, b, t) => a + (b - a) * t;

/** Jump with anticipation -> launch -> arc -> landing squash. returns {y, squash, armsUp, tuck, airborne} for local time u (s). */
export function jumpCurve(u, { anticip = 0.28, air = 0.7, land = 0.3, height = 1.6 } = {}) {
  if (u < 0) return { y: 0, squash: 0, armsUp: 0, tuck: 0, airborne: false };
  if (u < anticip) { const k = smooth(u / anticip); return { y: -0.15 * k, squash: 0.28 * k, armsUp: -0.3 * k, tuck: 0, airborne: false }; }
  const a = u - anticip;
  if (a < air) { const k = a / air; return { y: 4 * height * k * (1 - k), squash: -0.16 * Math.sin(k * Math.PI) * (k < 0.5 ? 1 : 0.3), armsUp: Math.sin(k * Math.PI), tuck: Math.sin(k * Math.PI), airborne: true }; }
  const l = (a - air) / land;
  if (l < 1) return { y: 0, squash: 0.3 * Math.sin(l * Math.PI) * (1 - l), armsUp: 0, tuck: 0, airborne: false, landed: l };
  return { y: 0, squash: 0, armsUp: 0, tuck: 0, airborne: false };
}

/** automatic blink schedule: pseudo-random but deterministic, ~every 3s */
export function blinkAt(t, seed = 0) {
  const period = 3.1, k = ((t + seed * 0.7) % period);
  const d = 0.14; return k < d ? Math.sin((k / d) * Math.PI) : 0;
}
