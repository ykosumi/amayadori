// Pure helpers. Everything in this system is a pure function of time t (seconds) -> deterministic frames.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const outBack = (t) => { t = clamp(t); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const outCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const inCubic = (t) => Math.pow(clamp(t), 3);
export const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const seg = (t, a, b) => clamp((t - a) / (b - a)); // 0..1 progress of t within [a,b]
// seeded random so particles are identical on every render
export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
