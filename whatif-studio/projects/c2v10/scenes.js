// c2v10 — X報告用ティーザー「AI動画生成より、いまは c2v」  flat 2D (UPA-vintage) / 4 shots / 10s / 1080x1920 30fps (12fps hold)
// 文字のみ・ナレなし（無音でも伝わる構成）。縦横は draw() の w>h で分岐可能（現状は縦設計）。
import * as F from '../../src/engine/flat.js';
const { P, hold, pop, spring } = F;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)); const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const fps = 30; export const duration = 10; export function setup() { return {}; }
const T = [0, 2.8, 4.6, 8.0, 10];
const MONO = '"DejaVu Sans Mono","Consolas",monospace';
const ground = (ctx, w, y) => { ctx.fillStyle = P.ink; ctx.fillRect(0, y, w, 14); };
const sym = (ctx, k, x, y, r) => { // gacha symbols: circle / triangle / square / ? (geometric only)
  const c = [P.brick, P.teal, P.mustard, P.cream][k % 4]; ctx.save(); ctx.translate(x, y);
  if (k % 4 === 0) F.shape(ctx, (g) => { g.beginPath(); g.arc(0, 0, r, 0, 7); }, c, { dx: 8, dy: 10, grid: 9 });
  else if (k % 4 === 1) F.shape(ctx, (g) => { g.beginPath(); g.moveTo(0, -r); g.lineTo(r, r * .8); g.lineTo(-r, r * .8); g.closePath(); }, c, { dx: 8, dy: 10, grid: 9 });
  else if (k % 4 === 2) F.shape(ctx, F.rrect(-r * .85, -r * .85, r * 1.7, r * 1.7, 10), c, { dx: 8, dy: 10, grid: 9 });
  else F.text(ctx, '?', 0, 6, r * 2, P.cream);
  ctx.restore();
};
function shot(i, bg, fn) {
  return { id: `s${i + 1}`, start: T[i], end: T[i + 1], kind: 'info', draw(ctx, t, l, w, h) {
    t = hold(t); l = t - T[i]; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    const d = T[i + 1] - T[i], cy = h / 2, k = 1 + 0.035 * (l / d); // slow push
    ctx.save(); ctx.translate(w / 2, cy); ctx.scale(k, k); ctx.translate(-w / 2, -cy); fn(ctx, t, l, w, h); ctx.restore();
    F.finish(ctx, w, h, t); } };
}

export const shots = [
  // S1 0–2.8: 「AI動画生成」= ガチャ。回しても揃わない → キャラ首をかしげる
  shot(0, P.cream, (ctx, t, l, w, h) => {
    F.headline(ctx, 'AI動画生成', w / 2, 300, t, 0.1, { size: 120 });
    F.text(ctx, '…って、ほぼガチャ。', w / 2, 450, 60, P.brick, 'center', 800);
    const gy = 1560, p = pop(l, 0.25);
    ctx.save(); ctx.translate(w / 2 + 120, 1000); ctx.scale(p, p);           // gacha box
    F.shape(ctx, F.rrect(-330, -260, 660, 520, 40), P.teal);
    F.shape(ctx, F.rrect(-280, -150, 560, 220, 24), P.ink, { shadow: false });
    const stop = [1.5, 1.85, 2.2], fin = [0, 1, 3];                         // reels stop on mismatched symbols
    for (let r = 0; r < 3; r++) { const spinning = l < stop[r]; const kk = spinning ? Math.floor(hold(t) * 12 + r * 2) : fin[r];
      const jig = spinning ? ((Math.floor(hold(t) * 12) % 2) ? -10 : 10) : (1 - spring(l - stop[r], 9, 20)) * -30;
      sym(ctx, kk, -180 + r * 180, -40 + jig, 60); }
    ctx.fillStyle = P.cream; ctx.font = `800 40px ${F.FONT}`; ctx.textAlign = 'center'; ctx.fillText('PROMPT ▶ ???', 0, 180);
    ctx.restore();
    ground(ctx, w, gy);
    const confused = seg(l, 2.25, 2.5);
    F.hero(ctx, { x: 200, y: gy + 6, s: 1.05, t, id: 1, tilt: -0.28 * ease(confused) + Math.sin(l * 9) * 0.02 * (1 - confused) });
    if (confused > 0) F.text(ctx, '?', 290, gy - 560 - 20 * spring(l - 2.3), 110, P.brick);
  }),
  // S2 2.8–4.6: キャラが背を向けて歩き出す → 「でも最近は…」
  shot(1, P.mustard, (ctx, t, l, w, h) => {
    const gy = 1560; ground(ctx, w, gy);
    F.headline(ctx, 'でも最近は…', w / 2, 420, t, T[1] + 0.15, { size: 112, ghost: P.cream });
    const m = ease(l / 0.4), x = 160 + l * 520;                             // phase from distance (no foot slide)
    F.hero(ctx, { x, y: gy + 6, s: 1.25, phase: (x - 160) / 46, moving: m, lean: 0.08 * m, t, id: 2, body: P.teal, head: P.cream });
    for (let k = 0; k < 4; k++) { const sx = ((k * 330 + l * 160) % 1300) - 100; F.shape(ctx, F.rrect(sx, 760 + (k % 2) * 180, 200, 34, 17), P.cream, { dx: 10, dy: 12, grid: 10 }); }
  }),
  // S3 4.6–8.0: コードを打つ → 1行ごとに画が組み上がる（このショット自体の実コード）
  shot(2, P.cream, (ctx, t, l, w, h) => {
    const lines = [['hero', '({ x, phase })'], ['shape', '(circle, mustard)'], ['pop', '(t, 0.3)']];
    const LT = [0.2, 1.1, 2.0], CPS = 26;
    ctx.save(); F.boil(ctx, 30, t, 0.4);
    F.shape(ctx, F.rrect(90, 150, 900, 470, 34), P.ink);
    ctx.fillStyle = P.brick; [0, 1, 2].forEach((i) => { ctx.beginPath(); ctx.arc(150 + i * 48, 205, 14, 0, 7); ctx.fill(); });
    F.text(ctx, 'scenes.js', 940, 205, 34, P.cream, 'right', 600);
    ctx.font = `700 56px ${MONO}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    let cursor = null;
    lines.forEach(([fn, args], i) => { const n = Math.floor((l - LT[i]) * CPS); if (n <= 0) return; const s = (fn + args).slice(0, n), y = 310 + i * 100;
      ctx.fillStyle = P.cream; ctx.globalAlpha = 0.45; ctx.fillText(String(i + 1), 130, y); ctx.globalAlpha = 1;
      const f = s.slice(0, fn.length), rest = s.slice(fn.length); ctx.fillStyle = P.mustard; ctx.fillText(f, 200, y); const fw = ctx.measureText(f).width; ctx.fillStyle = P.cream; ctx.fillText(rest, 200 + fw, y);
      if (n < (fn + args).length || i === 2) cursor = [200 + ctx.measureText(s).width + 8, y]; });
    if (cursor && Math.floor(hold(t) * 3) % 2 === 0) { ctx.fillStyle = P.mustard; ctx.fillRect(cursor[0], cursor[1] - 30, 26, 60); }
    ctx.restore();
    // stage
    const gy = 1580, done = (i) => LT[i] + lines[i].join('').length / CPS;
    const sun = pop(l, done(1)); if (sun > 0) F.shape(ctx, (c) => { c.beginPath(); c.arc(w / 2 + 40, 1160, 330 * sun, 0, 7); }, P.mustard);
    ground(ctx, w, gy);
    const hp = pop(l, done(0));
    if (hp > 0) { const jt = l - done(2), jump = jt > 0 ? Math.max(0, Math.sin(Math.min(Math.PI, jt * 5))) : 0, sq = jt > 0 && jt < 0.12 ? 0.12 : 0;
      F.hero(ctx, { x: w / 2, y: gy + 6 - jump * 160, s: 1.35 * hp, t, id: 3, squash: sq, head: P.ink, tilt: jump * 0.06 }); }
    F.text(ctx, 'コードで、動かす。', w / 2, 1760, 70, P.ink, 'center', 900);
  }),
  // S4 8.0–10: エンドタイトル
  shot(3, P.brick, (ctx, t, l, w, h) => {
    const r = pop(l, 0.0); F.shape(ctx, (c) => { c.beginPath(); c.arc(w / 2, 900, 470 * r, 0, 7); }, P.cream);
    F.text(ctx, 'いまハマってるのは', w / 2, 300, 62, P.cream, 'center', 800);
    F.headline(ctx, 'c2v', w / 2, 820, t, T[3] + 0.15, { size: 300, ghost: P.mustard });
    F.text(ctx, 'code → video', w / 2, 1060, 66, P.teal, 'center', 800);
    const gy = 1650; ctx.fillStyle = P.ink; ctx.fillRect(0, gy, w, 14);
    const b = Math.abs(Math.sin(l * 6)) * 40 * seg(l, 0.4, 0.6);
    F.hero(ctx, { x: w / 2, y: gy + 6 - b, s: 0.85, t, id: 4, head: P.mustard, tilt: Math.sin(l * 6) * 0.08 });
    F.text(ctx, 'AI動画生成  <  コードで組む動画', w / 2, 1760, 46, P.cream, 'center', 700);
  }),
];
