import * as THREE from 'three';
import { createLighting } from './engine/env.js';
import { clamp } from './engine/ease.js';
import * as info from './engine/infographic.js';

const q = new URLSearchParams(location.search);
const project = q.get('project') || 'demo';
const W = +(q.get('w') || 1080), H = +(q.get('h') || 1920);
const pass = q.get('pass') || 'beauty'; // beauty | char (3D char+fx on transparent bg for AE) | env (no char)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').append(renderer.domElement);
const overlay = document.getElementById('info'); const LAND = W >= H; const DW = LAND ? 1920 : 1080, DH = LAND ? 1080 : 1920; /* 2D design space follows orientation */ overlay.width = DW; overlay.height = DH; overlay.style.width = W + 'px'; overlay.style.height = H + 'px'; const ctx = overlay.getContext('2d');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 400);
const sun = createLighting(scene);
const SKY = new THREE.Color(0xbfe6ff);

const mod = await import(`../projects/${project}/scenes.js`);
const world = mod.setup({ THREE, scene, camera, sun, W, H }); // project builds its own actors
const shots = mod.shots; // [{id,start,end,kind:'3d'|'info',update(t,local,w),draw(ctx,t,local,w,h)}]
const total = mod.duration ?? shots[shots.length - 1].end;

window.__meta = { duration: total, fps: mod.fps ?? 24, shots: shots.map(({ id, start, end, kind }) => ({ id, start, end, kind })) };

window.renderFrame = (t) => {
  const s = shots.find((x) => t >= x.start && t < x.end) || shots[shots.length - 1]; const local = t - s.start;
  ctx.clearRect(0, 0, DW, DH);
  if (s.kind === 'info') {
    renderer.domElement.style.visibility = 'hidden';
    s.draw(ctx, t, local, DW, DH, info);
  } else {
    renderer.domElement.style.visibility = 'visible';
    s.update(t, local, world);
    scene.traverse((o) => { if (o.userData.env) o.visible = pass !== 'char'; if (o.userData.hero) o.visible = pass !== 'env'; });
    scene.background = pass === 'beauty' ? SKY : null; scene.fog = pass === 'beauty' ? new THREE.Fog(SKY, 40, 120) : null;
    renderer.setClearColor(0x000000, pass === 'beauty' ? 1 : 0);
    renderer.render(scene, camera);
    if (s.captions) info.caption(ctx, s.captions(local), DW, DH, 1);
    if (s.overlay) s.overlay(ctx, t, local, DW, DH, info);
  }
  overlay.style.opacity = s.kind === 'info' || s.overlay || s.captions ? 1 : 0;
  window.__ready = true;
};
window.renderFrame(0);
