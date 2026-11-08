// Concept-art sheet: character turnaround (front/3-4/side/back) + expression sheet + palette. Flat soft light, no env.
import * as THREE from 'three';
import { createCharacter } from './engine/character.js';
const q = new URLSearchParams(location.search); const project = q.get('project') || 'demo';
const cfg = await (await fetch(`/projects/${project}/character.json`)).json();
const col = (v) => (typeof v === 'string' ? parseInt(v, 16) : v);
const W = 2400, H = 1500;
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r.setSize(W, H); r.setPixelRatio(1); r.setScissorTest(true);
r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; document.body.append(r.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf4f1ea);
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cdb8, 1.6)); const l = new THREE.DirectionalLight(0xffffff, 2.2); l.position.set(3, 6, 5); scene.add(l);
const hero = createCharacter({ shirt: col(cfg.shirt), pants: col(cfg.pants), skin: col(cfg.skin), shoes: col(cfg.shoes), hair: col(cfg.hair) });
scene.add(hero.root);
const floor = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), new THREE.MeshBasicMaterial({ color: 0xe2dccf })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.01; scene.add(floor);
const cam = new THREE.PerspectiveCamera(22, 1, 0.1, 50);
function shot(x, y, w, h, { yaw = 0, emote = 'neutral', face = false, pose = {} } = {}) {
  hero.root.rotation.y = yaw; hero.setPose({ emote, tAbs: 0, ...pose }); cam.aspect = w / h;
  if (face) { cam.fov = 18; cam.position.set(0, 2.35, 3.4); cam.lookAt(0, 2.2, 0); } else { cam.fov = 24; cam.position.set(0, 1.25, 8.2); cam.lookAt(0, 1.2, 0); }
  cam.updateProjectionMatrix(); r.setViewport(x, H - y - h, w, h); r.setScissor(x, H - y - h, w, h); r.render(scene, cam);
}
const ov = document.createElement('canvas'); ov.width = W; ov.height = H; ov.style.cssText = 'position:absolute;left:0;top:0'; document.body.append(ov); const c = ov.getContext('2d');
// turnaround row
const views = [['FRONT', 0], ['3/4', Math.PI / 4], ['SIDE', Math.PI / 2], ['BACK', Math.PI]];
views.forEach(([n, yaw], i) => { shot(i * 600, 90, 600, 800, { yaw }); });
const ex = ['neutral', 'happy', 'shock', 'worry', 'dizzy'];
ex.forEach((e, i) => { shot(i * 480, 900, 480, 400, { emote: e, face: true }); });
c.font = '700 34px sans-serif'; c.fillStyle = '#333'; c.fillText(`${cfg.name || project} — Character Sheet`, 30, 52);
c.font = '600 26px sans-serif'; views.forEach(([n], i) => c.fillText(n, i * 600 + 260, 880)); ex.forEach((e, i) => c.fillText(e, i * 480 + 190, 1320));
(cfg.palette || []).forEach((p, i) => { c.fillStyle = p; c.fillRect(30 + i * 120, 1390, 100, 80); c.fillStyle = '#333'; c.font = '18px monospace'; c.fillText(p, 30 + i * 120, 1490); });
c.font = '22px sans-serif'; c.fillStyle = '#555'; c.fillText(cfg.notes || '', 780, 1440);
window.__ready = true;
