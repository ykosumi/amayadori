#!/usr/bin/env node
// Deterministic frame renderer: Vite dev server + headless Chromium (WebGL) -> PNG frames -> FFmpeg.
// usage: node scripts/render.mjs --project demo [--w 1080 --h 1920 --fps 24] [--pass beauty|char|env]
//        [--from 0 --to 5] [--subframes 4] [--frames-only] [--audio out/demo/mix.wav] [--crf 17] [--out out/x.mp4]
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const a = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : acc), []));
const project = a.project || 'demo', W = +(a.w || 1080), H = +(a.h || 1920), pass = a.pass || 'beauty';
const sub = +(a.subframes || 1), crf = a.crf || 17;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'out', project, `frames_${pass}`);
fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true });

const server = await createServer({ root, logLevel: 'error', server: { port: 5199, strictPort: false } }); await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-angle=' + (process.env.GPU ? 'default' : 'swiftshader')] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { console.error('PAGE ERROR', e.message); process.exit(1); });
await page.goto(`${url}?project=${project}&w=${W}&h=${H}&pass=${pass}`); await page.waitForFunction('window.__ready === true', null, { timeout: 120000 });
const meta = await page.evaluate('window.__meta'); const fps = +(a.fps || meta.fps);
const t0 = +(a.from || 0), t1 = +(a.to || meta.duration); const n = Math.round((t1 - t0) * fps), N = n * sub;
console.log(`${project} ${W}x${H} ${fps}fps pass=${pass} frames=${n} subframes=${sub}`);
for (let i = 0; i < N; i++) {
  const t = t0 + (i / sub) / fps + (sub > 1 ? 0 : 0);
  await page.evaluate((tt) => window.renderFrame(tt), t);
  await page.screenshot({ path: path.join(outDir, `f_${String(i).padStart(6, '0')}.png`), omitBackground: pass !== 'beauty' });
  if (i % 24 === 0) process.stdout.write(`\r${i}/${N}`);
}
console.log(); await browser.close(); await server.close();
if (a['frames-only']) { console.log('frames:', outDir); process.exit(0); }

const mixer = sub > 1 ? `tmix=frames=${sub},select='not(mod(n\\,${sub}))',` : '';
const outFile = path.join(root, a.out || `out/${project}_${pass}.mp4`); fs.mkdirSync(path.dirname(outFile), { recursive: true });
const args = ['-y', '-framerate', String(fps * sub), '-i', path.join(outDir, 'f_%06d.png')];
if (a.audio) args.push('-i', a.audio);
args.push('-vf', `${mixer}format=yuv420p`, '-r', String(fps), '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-pix_fmt', 'yuv420p');
if (a.audio) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest'); args.push('-movflags', '+faststart', outFile);
const r = spawnSync('ffmpeg', args, { stdio: 'inherit' }); console.log(r.status === 0 ? `OK ${outFile}` : 'ffmpeg failed');
