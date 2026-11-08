// whatif10x — "もしも あなたの動きが10倍速くなったら？"  flat 2D (UPA-vintage) / 7 cues / 62s / 1080x1920 30fps (12fps hold)
import * as F from '../../src/engine/flat.js';
const { P, hold, pop, spring } = F; const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)); const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const fps = 30; export const duration = 62; export function setup() { return {}; }
const CUES = 7;
const NARR = [
  'もしも、あなたの動きが10倍速くなったら？ 朝の支度は3分、歩く速さは時速50キロです。',
  'ただし、空気は甘くありません。速さが10倍になると、空気抵抗の力は100倍、必要なパワーは1000倍になります。',
  '通勤の10キロは、徒歩の2時間から12分に。マラソンの約8時間も、約51分で走れます。',
  '世界記録のボルトでも、最高速度は時速およそ45キロ。あなたは、歩くだけでそれを超えます。',
  'でも、止まれません。反応に1秒、ブレーキに約14メートル。合計で約28メートルも進みます。',
  '結局、朝の支度は3分で終わりました。',
  'でも、電車はいつもと同じ時刻に来ます。10倍速くなっても、待つ時間は変わりません。'];
const T = [0, 8, 18, 27, 35, 47, 54, 62];
function frame(i, bg, drawArt, push = 0.04) { // common scaffold
  return { id: `cue${i + 1}`, start: T[i], end: T[i + 1], kind: 'info', draw(ctx, t, l, w, h) {
    t = hold(t); l = t - T[i]; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    F.art(ctx, w, h, l / (T[i + 1] - T[i]), (y0, y1, cy) => drawArt(ctx, t, l, w, y0, y1, cy), { push });
    F.captionBand(ctx, w, h, { cue: i + 1, cues: CUES, text: NARR[i] }); F.finish(ctx, w, h, t); } };
}
const ground = (ctx, w, y, c = P.ink) => { ctx.fillStyle = c; ctx.fillRect(0, y, w, 14); };
const house = (ctx, x, y, s, col) => { F.shape(ctx, F.rrect(x, y - 190 * s, 170 * s, 190 * s, 8), col, { dx: 14, dy: 16, grid: 12 }); ctx.fillStyle = P.brick; ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 190 * s); ctx.lineTo(x + 85 * s, y - 290 * s); ctx.lineTo(x + 184 * s, y - 190 * s); ctx.fill(); ctx.fillStyle = P.cream; ctx.fillRect(x + 60 * s, y - 120 * s, 50 * s, 120 * s); };
const dust = (ctx, x, y, age, id) => { if (age < 0 || age > 0.5) return; const u = age / 0.5; for (let k = 0; k < 4; k++) { ctx.globalAlpha = (1 - u) * 0.8; ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(x - u * 90 - k * 22, y - 10 - u * 40 * (k % 2 + 1), 14 + u * 26, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; };

export const shots = [
  // CUE 1: 「10倍」→ 3コマで朝の支度 → 走り出す
  frame(0, P.cream, (ctx, t, l, w, y0, y1, cy) => {
    const gy = y1 - 230;
    if (l < 4.2) { // 支度: 3 icons, stopwatch 3:00 racing
      F.headline(ctx, '10倍', w / 2, y0 + 190, t, 0.2, { size: 230 });
      const icons = [['歯みがき', P.teal], ['着替え', P.mustard], ['出発', P.brick]];
      icons.forEach(([lab, c], i) => { const p = pop(l, 1.0 + i * 0.7), x = 220 + i * 320; ctx.save(); ctx.translate(x, cy + 140); ctx.scale(p, p); F.shape(ctx, F.rrect(-110, -110, 220, 220, 36), c); F.text(ctx, lab, 0, 0, 44, P.cream); if (l > 1.4 + i * 0.7) { ctx.strokeStyle = P.cream; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-34, 78); ctx.lineTo(-10, 100); ctx.lineTo(38, 56); ctx.stroke(); } ctx.restore(); });
      F.text(ctx, '3:00', w / 2, cy + 440, 150, P.ink); F.hero(ctx, { x: w / 2, y: y0 + 690, s: 0.78, t, tilt: Math.sin(l * 3) * 0.05, moving: 0, id: 3 });
    } else { // 走り出す: world scrolls, hero fixed at centre, speed lines
      const lt = l - 4.2, scroll = lt * 2300, m = ease(lt / 0.5);
      for (let i = -1; i < 6; i++) { const x = ((i * 520 - scroll * 0.35) % 2600 + 2600) % 2600 - 300; house(ctx, x, gy, 1.2, [P.mustard, P.teal, P.brick][i & 1 ? 1 : 0]); }
      ground(ctx, w, gy);
      const ph = lt * 14 * (0.2 + 0.8 * m);
      F.speedLines(ctx, w, y0 + 80, gy - 40, t, m);
      for (let k = 0; k < 8; k++) dust(ctx, w / 2 - 80, gy, (lt - k * 0.15) % 0.5 < 0 ? 9 : (lt % 0.5) + (k % 3) * 0.1, k);
      F.hero(ctx, { x: w / 2 - 40 + (1 - m) * 0, y: gy + 6, s: 1.5, phase: ph, moving: 0.4 + 0.6 * m, lean: 0.2 * m, t, id: 4 });
      F.text(ctx, '時速 50km', w / 2, y0 + 150, 110, P.ink); F.text(ctx, '歩く速さ 5km/h の10倍', w / 2, y0 + 250, 46, P.brick, 'center', 700);
    } }),
  // CUE 2: 空気抵抗 (墨背景の図解)
  frame(1, P.ink, (ctx, t, l, w, y0, y1, cy) => {
    F.text(ctx, '空気抵抗', w / 2, y0 + 130, 120, P.cream);
    F.text(ctx, '歩く 5km/h', 110, y0 + 330, 56, P.mustard, 'left', 800); F.text(ctx, '10倍 50km/h', 110, y0 + 520, 56, P.brick, 'left', 800);
    F.bar(ctx, 110, y0 + 370, 860, 70, 0.1, P.mustard, ease(l / 1.0)); F.bar(ctx, 110, y0 + 560, 860, 70, 1, P.brick, ease((l - 0.6) / 1.2));
    const a = pop(l, 3.0), b = pop(l, 5.4);
    ctx.save(); ctx.translate(w / 2 - 250, y0 + 860); ctx.scale(a, a); F.text(ctx, '力', 0, -120, 60, P.cream); F.text(ctx, '×100', 0, 0, 170, P.mustard); ctx.restore();
    ctx.save(); ctx.translate(w / 2 + 250, y0 + 860); ctx.scale(b, b); F.text(ctx, 'パワー', 0, -120, 60, P.cream); F.text(ctx, '×1000', 0, 0, 150, P.brick); ctx.restore();
    F.text(ctx, '※空気抵抗は概算(直立した人を想定)', w / 2, y1 - 50, 34, P.cream, 'center', 600);
  }),
  // CUE 3: 通勤と マラソン (時計 + 比較バー)
  frame(2, P.cream, (ctx, t, l, w, y0, y1, cy) => {
    const A = l < 4.6;
    if (A) { // clock hand spins fast then stops at 12 min
      const cx = w / 2, cyy = cy - 80, r = 300, spin = ease(l / 2.4); ctx.save(); ctx.translate(cx, cyy);
      F.shape(ctx, (c) => { c.beginPath(); c.arc(0, 0, r, 0, 7); }, P.cream); ctx.strokeStyle = P.ink; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(Math.sin(a) * (r - 40), -Math.cos(a) * (r - 40)); ctx.lineTo(Math.sin(a) * (r - 14), -Math.cos(a) * (r - 14)); ctx.stroke(); }
      const ang = (Math.PI * 2 * 6) * spin * 1 + (Math.PI / 30) * 12 * spin * 0; ctx.rotate(ang % (Math.PI * 2) * (1 - 0) ); ctx.strokeStyle = P.brick; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r + 60); ctx.stroke(); ctx.restore();
      F.text(ctx, '通勤 10km', w / 2, y0 + 130, 100, P.ink);
      const sw = pop(l, 2.8), nw = pop(l, 3.4); F.text(ctx, '徒歩 2時間', 290, y1 - 240, 70 * sw, P.mustard); F.text(ctx, '→ 12分', 760, y1 - 240, 100 * nw, P.brick);
    } else { const k = l - 4.6;
      F.text(ctx, 'マラソン 42km', w / 2, y0 + 130, 100, P.ink);
      F.text(ctx, '徒歩', 110, cy - 150, 56, P.ink, 'left', 800); F.bar(ctx, 110, cy - 110, 860, 90, 1, P.mustard, ease(k / 1.2)); F.text(ctx, '約8時間', 930, cy - 150, 56, P.mustard, 'right');
      F.text(ctx, '10倍', 110, cy + 120, 56, P.ink, 'left', 800); F.bar(ctx, 110, cy + 160, 860, 90, 51 / 506, P.brick, ease((k - 0.8) / 1.0)); F.text(ctx, '約51分', 930, cy + 120, 56, P.brick, 'right');
      F.hero(ctx, { x: 110 + 860 * ease((k - 0.8) / 1.0) * 51 / 506 + 40, y: cy + 520, s: 0.8, phase: k * 14, moving: 1, lean: 0.3, t, id: 5 }); ground(ctx, w, cy + 526, P.ink);
    } }),
  // CUE 4: ボルト vs あなた
  frame(3, P.cream, (ctx, t, l, w, y0, y1, cy) => {
    F.headline(ctx, 'ボルト 最高速度', w / 2, y0 + 130, t, T[3] + 0.1, { size: 84 });
    const x0 = 100, x1 = 980, sc = (v) => x0 + (x1 - x0) * v / 60, ty = cy + 40; ctx.fillStyle = P.ink; ctx.fillRect(x0, ty, x1 - x0, 12);
    for (let v = 0; v <= 60; v += 10) { ctx.fillRect(sc(v) - 3, ty - 24, 6, 24); F.text(ctx, String(v), sc(v), ty + 52, 40, P.ink, 'center', 700); } F.text(ctx, 'km/h', x1 - 10, ty + 110, 36, P.ink, 'right', 700);
    const bolt = sc(44.7 * ease(l / 2.5)); F.hero(ctx, { x: bolt, y: ty - 6, s: 0.62, phase: l * 12, moving: 1, lean: 0.25, t, id: 6, body: P.ink, head: P.ink }); F.text(ctx, '約44.7', bolt, ty - 330, 56, P.ink);
    const mine = sc(50 * ease((l - 3.2) / 2.6)); if (l > 3.2) { F.hero(ctx, { x: mine, y: ty + 250, s: 0.62, phase: l * 12, moving: 0.4, lean: 0.1, t, id: 7 }); F.text(ctx, '50 歩くだけ', mine - 40, ty + 560, 58, P.brick); }
    ctx.fillStyle = P.brick; ctx.fillRect(sc(44.7) - 3, ty - 90, 6, 90 + 300);
  }),
  // CUE 5: 止まれない 28m
  frame(4, P.cream, (ctx, t, l, w, y0, y1, cy) => {
    const gy = cy + 60, X0 = 110, MPX = 24, ph1 = seg(l, 0.6, 5.0), ph2 = seg(l, 5.0, 9.4); let x = X0 + MPX * 14 * ph1 + MPX * 14 * (1 - Math.pow(1 - ph2, 2));
    const stopped = l > 9.4; ground(ctx, w, gy);
    F.speedLines(ctx, w, y0 + 120, gy - 60, t, (l < 5.0 ? 0.7 : 0.7 * (1 - ph2)) * (l > 0.5 ? 1 : 0));
    // dog
    const dx = X0 + MPX * 28 + 70; F.shape(ctx, F.rrect(dx, gy - 150, 150, 80, 36), P.brick, { dx: 12, dy: 14, grid: 11 }); F.shape(ctx, (c) => { c.beginPath(); c.arc(dx + 170, gy - 160, 44, 0, 7); }, P.brick, { dx: 10, dy: 12, grid: 11 });
    ctx.fillStyle = P.ink; [20, 120].forEach((o) => ctx.fillRect(dx + o, gy - 78, 18, 70));
    F.text(ctx, '!', dx + 170, gy - 290, 140 * pop(l, 0.6), P.brick);
    const brake = ph2 > 0 && ph2 < 1; F.hero(ctx, { x, y: gy + 6, s: 1.0, phase: ph1 * 40 + (brake ? ph2 * 3 : 0), moving: brake ? 0.5 * (1 - ph2) + 0.15 : (stopped ? 0 : 1), lean: brake ? -0.35 * (1 - ph2) : (stopped ? 0 : 0.3), t, id: 8, squash: brake ? 0.06 : 0, tilt: stopped ? -0.1 : 0 });
    if (brake) dust(ctx, x - 20, gy, (ph2 * 3 % 0.5), 1);
    // ruler
    const ry = gy + 120; const r1 = Math.min(1, Math.max(0, (x - X0) / (MPX * 14)));
    F.bar(ctx, X0, ry, MPX * 14, 50, 1, P.mustard, ease(l / 1.0)); F.bar(ctx, X0 + MPX * 14, ry, MPX * 14, 50, 1, P.brick, ease((l - 5.0) / 1.2));
    F.text(ctx, '反応 1秒 14m', X0 + MPX * 7, ry + 90, 44, P.ink, 'center', 800); F.text(ctx, 'ブレーキ 14m', X0 + MPX * 21, ry + 90, 44, P.ink, 'center', 800);
    if (stopped) { const p = pop(l, 9.6); ctx.save(); ctx.translate(w / 2, gy + 330); ctx.scale(p, p); F.text(ctx, '合計 約28m', 0, 0, 130, P.brick); ctx.restore(); }
  }),
  // CUE 6: 3分で終わった
  frame(5, P.teal, (ctx, t, l, w, y0, y1, cy) => {
    const p = pop(l, 0.3); ctx.save(); ctx.translate(w / 2, y0 + 300); ctx.scale(p, p); F.shape(ctx, F.rrect(-330, -150, 660, 300, 40), P.cream); F.text(ctx, '6:03', 0, 0, 230, P.ink); ctx.restore();
    F.hero(ctx, { x: w / 2, y: y1 - 120, s: 1.5, t, moving: 0, tilt: Math.sin(l * 2.2) * 0.06, id: 9 });
    ctx.save(); ctx.strokeStyle = P.cream; ctx.lineWidth = 12; ctx.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, r1 = 170 + 30 * spring(l - 1.2, 6, 12), r2 = r1 + 50; if (l > 1.2) { ctx.beginPath(); ctx.moveTo(w / 2 + Math.cos(a) * r1, y1 - 500 + Math.sin(a) * r1); ctx.lineTo(w / 2 + Math.cos(a) * r2, y1 - 500 + Math.sin(a) * r2); ctx.stroke(); } } ctx.restore();
  }),
  // CUE 7: 電車は同じ時刻に来る
  frame(6, P.cream, (ctx, t, l, w, y0, y1, cy) => {
    const gy = y1 - 200; ctx.fillStyle = P.mustard; ctx.fillRect(0, gy + 6, w, 160); ctx.fillStyle = P.ink; ctx.fillRect(0, gy, w, 12);
    ctx.save(); ctx.translate(180, y0 + 220); F.shape(ctx, (c) => { c.beginPath(); c.arc(0, 0, 100, 0, 7); }, P.cream); ctx.strokeStyle = P.ink; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 100, 0, 7); ctx.stroke(); ctx.rotate(l * 0.5); ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -70); ctx.stroke(); ctx.restore();
    const tx = w + 700 - (w + 700 - 330) * ease(l / 5.2) ** 1.0; // train glides in slowly
    for (let i = 0; i < 3; i++) { const x = tx + i * 520; F.shape(ctx, F.rrect(x, gy - 330, 500, 330, 30), i % 2 ? P.teal : P.brick); ctx.fillStyle = P.cream; [40, 190, 340].forEach((o) => ctx.fillRect(x + o, gy - 270, 110, 110)); }
    F.hero(ctx, { x: 190, y: gy + 40, s: 1.3, t, moving: 0, tilt: Math.sin(l * 2) * 0.05, id: 10 });
    F.headline(ctx, '待つ時間は、\n変わらない。', w / 2, y0 + 400, t, T[6] + 3.6, { size: 96 });
  }, 0.03),
];
