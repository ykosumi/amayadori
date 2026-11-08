import { clamp, outCubic, outBack, seg, smooth } from './ease.js';
// Dark-navy 2D science-diagram toolkit on Canvas2D. Every draw call takes a progress/time value, never mutates state.
export const C = { bg: '#0b1a33', grid: '#16305a', ink: '#eaf2ff', cyan: '#4fd1ff', yellow: '#ffd24f', pink: '#ff7aa8', green: '#6ee7a1', mute: '#7d93b8' };
export const FONT = '"Noto Sans JP","Hiragino Sans","Yu Gothic",system-ui,sans-serif';

export function bg(ctx, w, h, t = 0) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 2; const s = 90, o = (t * 12) % s;
  for (let x = -o; x < w; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = -o; y < h; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}
export function title(ctx, text, x, y, p = 1, { size = 72, color = C.ink, align = 'center' } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p * 1.5); ctx.translate(0, (1 - outCubic(p)) * 30);
  ctx.font = `800 ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  text.split('\n').forEach((ln, i) => ctx.fillText(ln, x, y + i * size * 1.25)); ctx.restore();
}
/** counter: value eased from a->b with unit + decimals */
export function counter(ctx, a, b, p, x, y, { unit = '', dec = 0, size = 150, color = C.yellow, label = '' } = {}) {
  const v = a + (b - a) * outCubic(p);
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = color; ctx.font = `900 ${size}px ${FONT}`;
  ctx.fillText(v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + unit, x, y);
  if (label) { ctx.font = `600 ${size * 0.3}px ${FONT}`; ctx.fillStyle = C.mute; ctx.fillText(label, x, y + size * 0.5); } ctx.restore();
}
export function arrow(ctx, x1, y1, x2, y2, p, { color = C.cyan, width = 10 } = {}) {
  const k = outCubic(p); const x = x1 + (x2 - x1) * k, y = y1 + (y2 - y1) * k; if (k <= 0) return;
  const a = Math.atan2(y2 - y1, x2 - x1); ctx.save(); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 36 * Math.cos(a - 0.45), y - 36 * Math.sin(a - 0.45)); ctx.lineTo(x - 36 * Math.cos(a + 0.45), y - 36 * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
}
/** horizontal comparison bars. items:[{label,value,color,text}] ; max scales to width */
export function bars(ctx, items, p, x, y, w, { barH = 70, gap = 110, max } = {}) {
  max = max || Math.max(...items.map((i) => i.value));
  items.forEach((it, i) => { const yy = y + i * gap, pp = outCubic(seg(p, i * 0.15, 0.6 + i * 0.15));
    ctx.fillStyle = C.mute; ctx.font = `600 38px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText(it.label, x, yy - 14);
    ctx.fillStyle = '#12284d'; roundRect(ctx, x, yy, w, barH, 18); ctx.fill();
    ctx.fillStyle = it.color || C.cyan; roundRect(ctx, x, yy, Math.max(8, (w * it.value / max) * pp), barH, 18); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = `800 44px ${FONT}`; ctx.textAlign = 'right'; ctx.fillText(it.text ?? String(it.value), x + w, yy - 14); });
}
export function gauge(ctx, value, max, p, cx, cy, r, { label = '', unit = '', color = C.yellow } = {}) {
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, v = clamp(value / max) * outCubic(p);
  ctx.save(); ctx.lineWidth = 36; ctx.lineCap = 'round'; ctx.strokeStyle = '#12284d'; ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
  ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + (a1 - a0) * v); ctx.stroke();
  const a = a0 + (a1 - a0) * v; ctx.strokeStyle = C.ink; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.font = `900 ${r * 0.5}px ${FONT}`; ctx.fillText(Math.round(value * outCubic(p)).toLocaleString('en-US') + unit, cx, cy + r * 0.75);
  if (label) { ctx.font = `600 ${r * 0.2}px ${FONT}`; ctx.fillStyle = C.mute; ctx.fillText(label, cx, cy + r * 1.0); } ctx.restore();
}
export function card(ctx, x, y, w, h, p, { color = '#12284d', stroke = C.cyan } = {}) {
  const k = outBack(p); ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.globalAlpha = clamp(p * 2);
  ctx.fillStyle = color; roundRect(ctx, -w / 2, -h / 2, w, h, 30); ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
}
export function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
export function caption(ctx, text, w, h, p = 1) { // bottom subtitle, safe-area aware for 9:16
  if (!text) return; ctx.save(); ctx.globalAlpha = clamp(p * 3); ctx.font = `800 58px ${FONT}`; ctx.textAlign = 'center';
  text.split('\n').forEach((ln, i, a) => { const y = h * (w > h ? 0.88 : 0.82) + (i - (a.length - 1) / 2) * 76; ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(8,16,36,.85)'; ctx.lineJoin = 'round'; ctx.strokeText(ln, w / 2, y); ctx.fillStyle = '#fff'; ctx.fillText(ln, w / 2, y); }); ctx.restore();
}
