// Flat 2D "Kurzgesagt-style x UPA vintage" kit on Canvas2D (1080x1920 design space). All pure functions of t.
// Palette (limited 5): cream, mustard, brick, teal, ink.
export const P = { cream: '#F2EAD8', mustard: '#D9A441', brick: '#B5502F', teal: '#3E7C74', ink: '#2B2620' };
export const FONT = '"Noto Sans JP","Hiragino Sans","Yu Gothic",system-ui,sans-serif';
export const HOLD_FPS = 12;                       // animation holds at 12fps (rendered at any output fps)
export const hold = (t) => Math.floor(t * HOLD_FPS + 1e-6) / HOLD_FPS;
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

/** spring 0->1 with overshoot. u = seconds since start */
export const spring = (u, k = 7, w = 16) => (u <= 0 ? 0 : 1 - Math.exp(-k * u) * Math.cos(w * u));
export const pop = (t, t0) => spring(t - t0);

/** boil: tiny per-element jitter that changes every hold-frame (stays subtle: <= ~1.5px, <= 0.2deg) */
export function boil(ctx, id, t, amp = 1) {
  const s = Math.floor(hold(t) * HOLD_FPS) % 3;
  ctx.translate((hash(id * 3.1 + s) - .5) * 3 * amp, (hash(id * 5.7 + s * 2) - .5) * 3 * amp); ctx.rotate((hash(id + s * 9) - .5) * 0.0035 * amp);
}
/** Shape with halftone-dot shadow. pathFn(ctx) builds the path (relative to current transform). */
export function shape(ctx, pathFn, fill, { shadow = true, dx = 26, dy = 30, grid = 15 } = {}) {
  if (shadow) {
    ctx.save(); ctx.translate(dx, dy); pathFn(ctx); ctx.clip(); ctx.translate(-dx, -dy);
    ctx.fillStyle = P.ink; ctx.globalAlpha = 0.32;
    for (let y = -1400; y < 1400; y += grid) for (let x = -1400; x < 1400; x += grid) { const o = ((y / grid) & 1) * grid / 2; ctx.beginPath(); ctx.arc(x + o + dx, y + dy, grid * 0.27, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  ctx.save(); pathFn(ctx); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}
export const rrect = (x, y, w, h, r) => (c) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

/** Offset-ghost headline (printing misregistration). */
export function headline(ctx, text, x, y, t, t0, { size = 92, color = P.ink, ghost = P.brick } = {}) {
  const p = Math.min(1, spring(t - t0, 8, 14)); if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, (t - t0) * 8); ctx.translate(x, y + (1 - p) * 60); ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  text.split('\n').forEach((ln, i) => { const yy = i * size * 1.22; ctx.fillStyle = ghost; ctx.fillText(ln, 7, yy + 7); ctx.fillStyle = color; ctx.fillText(ln, 0, yy); }); ctx.restore();
}

// ---------- frame furniture ----------
let _noise = []; function noise(step) {
  if (_noise[step]) return _noise[step]; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const im = g.createImageData(256, 256);
  for (let i = 0; i < 65536; i++) { const v = hash(i * 0.37 + step * 91.7) > .5 ? 255 : 0; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0); return (_noise[step] = c);
}
export function background(ctx, w, h) { ctx.fillStyle = P.cream; ctx.fillRect(0, 0, w, h); }
export function finish(ctx, w, h, t) { // grain + vignette + film strips (call last)
  const step = Math.floor(hold(t) * HOLD_FPS) % 3; ctx.save(); ctx.globalAlpha = 0.085; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(noise(step), 'repeat'); ctx.fillRect(0, 0, w, h); ctx.restore();
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.32, w / 2, h / 2, h * 0.75); g.addColorStop(0, 'rgba(43,38,32,0)'); g.addColorStop(1, 'rgba(43,38,32,.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, w, 64); ctx.fillRect(0, h - 64, w, 64); ctx.fillStyle = P.cream;
  for (let x = 20; x < w; x += 56) { ctx.fillRect(x, 20, 28, 24); ctx.fillRect(x, h - 44, 28, 24); }
}
/** ink caption band: series label + cue number + full narration text */
export function captionBand(ctx, w, h, { series = '失われたメディア考古学', cue = 1, cues = 7, text = '' } = {}) {
  const y0 = h - 64 - 440; ctx.fillStyle = P.ink; ctx.fillRect(0, y0, w, 440);
  ctx.fillStyle = P.mustard; ctx.font = `800 34px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(`${series}　${cue}/${cues}`, 60, y0 + 62);
  ctx.fillStyle = P.cream; ctx.font = `700 50px ${FONT}`; let line = '', y = y0 + 140; const max = w - 120;
  for (const ch of text) { if (ctx.measureText(line + ch).width > max && !'、。」）！？'.includes(ch)) { ctx.fillText(line, 60, y); y += 74; line = ''; } line += ch; } ctx.fillText(line, 60, y);
}

/** Faceless symbolic hero (geometric parts only). feet at (x,y). phase: gait phase (2PI = full stride), moving 0..1, lean rad. */
export function hero(ctx, { x, y, s = 1, phase = 0, moving = 0, lean = 0, dir = 1, squash = 0, t = 0, id = 1, body = P.teal, head = P.mustard, tilt = 0 } = {}) {
  ctx.save(); ctx.translate(x, y - Math.abs(Math.cos(phase)) * 10 * moving * s); ctx.scale(dir * s * (1 + squash * 0.5), s * (1 - squash)); boil(ctx, id, t, 0.6);
  const sn = Math.sin(phase), cs = Math.cos(phase), HIP = [0, -135];
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = P.ink; ctx.lineWidth = 26;
  [1, -1].forEach((side) => {  // legs (knee bends on the forward swing)
    const a = side * sn * 0.85 * moving, kb = Math.max(0, side * cs) * 1.0 * moving;
    const k = [HIP[0] + 65 * Math.sin(a), HIP[1] + 65 * Math.cos(a)], f = [k[0] + 65 * Math.sin(a - kb), k[1] + 65 * Math.cos(a - kb)];
    ctx.beginPath(); ctx.moveTo(...HIP); ctx.lineTo(...k); ctx.lineTo(...f); ctx.stroke();
    ctx.fillStyle = P.brick; ctx.beginPath(); ctx.ellipse(f[0] + 14, f[1] + 4, 32, 15, 0, 0, 7); ctx.fill();
  });
  ctx.save(); ctx.translate(0, HIP[1]); ctx.rotate(lean); ctx.translate(0, -HIP[1]);
  [1, -1].forEach((side) => { // arms swing opposite to legs
    const a = -side * sn * 0.95 * moving + 0.1, eb = (0.35 + 0.8 * moving), sh = [0, -250];
    const e = [sh[0] + 55 * Math.sin(a), sh[1] + 55 * Math.cos(a)], hnd = [e[0] + 55 * Math.sin(a + eb), e[1] + 55 * Math.cos(a + eb)];
    ctx.beginPath(); ctx.moveTo(...sh); ctx.lineTo(...e); ctx.lineTo(...hnd); ctx.stroke();
  });
  shape(ctx, rrect(-58, -300, 116, 175, 58), body, { dx: 18, dy: 22, grid: 11 });
  ctx.fillStyle = P.cream; ctx.fillRect(-58, -225, 116, 20);                // belt stripe (reads as "front" without a face)
  ctx.save(); ctx.translate(0, -365); ctx.rotate(tilt);
  shape(ctx, (c) => { c.beginPath(); c.arc(0, 0, 68, 0, 7); }, head, { dx: 18, dy: 22, grid: 11 });
  ctx.fillStyle = P.brick; ctx.beginPath(); ctx.arc(0, 0, 68, Math.PI, 0); ctx.fill(); ctx.fillStyle = head; ctx.beginPath(); ctx.arc(0, 6, 62, Math.PI, 0); ctx.fill(); // cap band
  ctx.restore(); ctx.restore(); ctx.restore();
}
/** art-area wrapper: clips to y 64..(h-64-440) and applies slow camera push (scale about centre). p = 0..1 progress of the shot */
export function art(ctx, w, h, p, fn, { push = 0.04 } = {}) {
  const y0 = 64, y1 = h - 64 - 440; ctx.save(); ctx.beginPath(); ctx.rect(0, y0, w, y1 - y0); ctx.clip();
  const cy = (y0 + y1) / 2, k = 1 + push * p; ctx.translate(w / 2, cy); ctx.scale(k, k); ctx.translate(-w / 2, -cy); fn(y0, y1, cy); ctx.restore();
}
export function text(ctx, str, x, y, size, color = P.ink, align = 'center', weight = 900) { ctx.save(); ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore(); }
export function bar(ctx, x, y, w, h, frac, color, p = 1) { shape(ctx, rrect(x, y, Math.max(h, w * frac * Math.min(1, p)), h, h / 2), color, { dx: 12, dy: 14, grid: 11 }); }
export function speedLines(ctx, w, y0, y1, t, k = 1, dir = -1) {
  ctx.save(); ctx.strokeStyle = P.ink; ctx.globalAlpha = 0.5 * k; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const yy = y0 + ((i * 97) % (y1 - y0)), len = 160 + (i * 53) % 200, xx = (((i * 211) + hold(t) * 1900) % (w + 400)); ctx.beginPath(); ctx.moveTo(w - xx + 0, yy); ctx.lineTo(w - xx + len * -dir * -1, yy); ctx.stroke(); }
  ctx.restore();
}
