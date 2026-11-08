#!/usr/bin/env node
// Concept art. usage: node scripts/concept.mjs --project demo      -> out/<p>/concept_character.png (turnaround+expressions+palette)
// World/mood key art: node scripts/render.mjs --project <p> --still 6.0 --format landscape  (single frame, set camera in scenes.js)
import { chromium } from 'playwright'; import { createServer } from 'vite'; import path from 'node:path'; import fs from 'node:fs';
const p = process.argv[process.argv.indexOf('--project') + 1] || 'demo'; const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const server = await createServer({ root, logLevel: 'error' }); await server.listen(); const url = server.resolvedUrls.local[0];
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-angle=' + (process.env.GPU ? 'default' : 'swiftshader')] });
const pg = await b.newPage({ viewport: { width: 2400, height: 1500 } }); pg.on('pageerror', (e) => { console.error(e.message); process.exit(1); });
await pg.goto(`${url}concept.html?project=${p}`); await pg.waitForFunction('window.__ready', null, { timeout: 60000 });
fs.mkdirSync(`${root}/out/${p}`, { recursive: true }); const o = `${root}/out/${p}/concept_character.png`; await pg.locator('canvas').screenshot({ path: o }); console.log('OK', o); await b.close(); await server.close();
