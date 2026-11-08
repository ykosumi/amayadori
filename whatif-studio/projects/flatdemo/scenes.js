// Style test for the flat 2D / UPA-vintage look (NOT a finished episode). Subject: floppy disk -> save icon.
import * as F from '../../src/engine/flat.js';
const { P } = F;
export const fps = 30; export const duration = 6;
export function setup() { return {}; }

function floppy(ctx, cx, cy, s, body, t, id) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); F.boil(ctx, id, t);
  const body_ = (c) => { c.beginPath(); c.moveTo(-380 + 40, -380); c.lineTo(380 - 120, -380); c.lineTo(380, -380 + 120); c.lineTo(380, 380 - 40); c.quadraticCurveTo(380, 380, 380 - 40, 380); c.lineTo(-380 + 40, 380); c.quadraticCurveTo(-380, 380, -380, 380 - 40); c.lineTo(-380, -380 + 40); c.quadraticCurveTo(-380, -380, -380 + 40, -380); c.closePath(); };
  F.shape(ctx, body_, body);
  F.shape(ctx, F.rrect(-230, -380, 440, 250, 14), P.cream, { shadow: false });  // metal shutter
  F.shape(ctx, F.rrect(80, -350, 80, 190, 10), P.ink, { shadow: false });
  F.shape(ctx, F.rrect(-290, 10, 580, 370, 18), P.cream, { shadow: false });  // label
  ctx.fillStyle = P.brick; [90, 170, 250].forEach((y) => ctx.fillRect(-240, y, 480, 16)); ctx.fillStyle = P.mustard; ctx.fillRect(-240, 40, 200, 24);
  ctx.restore();
}
export const shots = [
  { id: 'cue1', start: 0, end: 3, kind: 'info', draw(ctx, t, l, w, h) {
      t = F.hold(t); F.background(ctx, w, h); const p = F.pop(t, 0.15), push = 1 + 0.04 * (t / 3); // slow camera push
      ctx.save(); ctx.translate(w / 2, 780); ctx.scale(push, push); ctx.translate(-w / 2, -780);
      floppy(ctx, w / 2, 780, 0.95 * p, P.teal, t, 1); ctx.restore();
      F.headline(ctx, 'フロッピーディスク', w / 2, 1330, t, 0.9, { size: 96 });
      F.captionBand(ctx, w, h, { cue: 1, text: 'もう誰も使わないのに、この形だけが、今も画面の中に生きています。' }); F.finish(ctx, w, h, t); } },
  { id: 'cue2', start: 3, end: 6, kind: 'info', draw(ctx, t, l, w, h) {
      t = F.hold(t); l = t - 3; F.background(ctx, w, h); const p = F.pop(l, 0.1);
      ctx.save(); ctx.translate(w / 2, 780); ctx.scale(1 + 0.04 * (l / 3), 1 + 0.04 * (l / 3)); ctx.translate(-w / 2, -780);
      F.shape(ctx, (c) => { c.beginPath(); c.arc(w / 2, 780, 470 * p, 0, 7); }, P.mustard);
      floppy(ctx, w / 2, 780, 0.62 * p, P.ink, t, 2); ctx.restore();
      F.headline(ctx, '「保存」アイコン', w / 2, 1330, t, 3.7, { size: 96 });
      F.captionBand(ctx, w, h, { cue: 2, text: 'それが「保存」アイコン。物は死んでも、記号は生き残ります。' }); F.finish(ctx, w, h, t); } },
];
