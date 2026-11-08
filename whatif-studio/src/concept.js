// Concept-art sheet: character turnaround + expression sheet + palette, in the chosen style (chalk = crayon reference look).
import * as THREE from 'three';
import { createCharacter } from './engine/character.js';
import { createChalk } from './engine/chalk.js';
const q = new URLSearchParams(location.search); const project = q.get('project') || 'demo';
const cfg = await (await fetch(`/projects/${project}/character.json`)).json();
const col = (v) => (typeof v === 'string' ? parseInt(v, 16) : v);
const style = cfg.style || 'chalk', bgs = cfg.backgrounds || ['#8fa3c8'];
const W = 2400, H = 1500;
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true }); r.setPixelRatio(1); r.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 2.6)); const l = new THREE.DirectionalLight(0xffffff, 0.8); l.position.set(2, 4, 6); scene.add(l);
const opts = { style }; for (const k of ['shirt', 'collar', 'pants', 'skin', 'shoes', 'hair', 'blush']) if (cfg[k] != null) opts[k] = col(cfg[k]);
if (cfg.headScale) opts.headScale = cfg.headScale; if (cfg.hat) opts.hat = cfg.hat.map((h) => ({ ...h, color: col(h.color) }));
const hero = createCharacter(opts); scene.add(hero.root);
const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
const sheet = document.createElement('canvas'); sheet.width = W; sheet.height = H; document.body.append(sheet); const c = sheet.getContext('2d');
c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, W, H);
let seed = 0;
function shot(x, y, w, h, bg, { yaw = 0, emote = 'neutral', face = false } = {}) {
  r.setSize(w, h); scene.background = new THREE.Color(bg); const ch = createChalk(r, w, h, { bg: new THREE.Color(bg), grain: 0.3 }); ch.setPaper(bg);
  hero.root.rotation.y = yaw; hero.setPose({ emote, tAbs: 0 }); cam.aspect = w / h;
  if (face) { cam.fov = 26; cam.position.set(0, 2.35, 4.6); cam.lookAt(0, 2.45, 0); } else { cam.fov = 28; cam.position.set(0, 2.0, 11.5); cam.lookAt(0, 1.95, 0); }
  cam.updateProjectionMatrix(); ch.render(scene, cam, seed++ / 8); c.drawImage(r.domElement, x, y, w, h);
}
const views = [['FRONT', 0], ['3/4', Math.PI / 4], ['SIDE', Math.PI / 2], ['BACK', Math.PI]];
views.forEach(([n, yaw], i) => shot(i * 600, 90, 600, 800, bgs[i % bgs.length], { yaw }));
const ex = ['neutral', 'happy', 'shock', 'worry', 'dizzy'];
ex.forEach((e, i) => shot(i * 480, 900, 480, 400, bgs[(i + 1) % bgs.length], { emote: e, face: true }));
c.font = '700 34px sans-serif'; c.fillStyle = '#333'; c.fillText(`${cfg.name || project} — Character Sheet (${style})`, 30, 52);
c.font = '600 26px sans-serif'; views.forEach(([n], i) => c.fillText(n, i * 600 + 260, 880)); ex.forEach((e, i) => c.fillText(e, i * 480 + 190, 1320));
(cfg.palette || []).forEach((p, i) => { c.fillStyle = p; c.fillRect(30 + i * 120, 1390, 100, 80); c.fillStyle = '#333'; c.font = '18px monospace'; c.fillText(p, 30 + i * 120, 1490); });
c.font = '22px sans-serif'; c.fillStyle = '#555'; c.fillText(cfg.notes || '', 780, 1440);
window.__ready = true;
