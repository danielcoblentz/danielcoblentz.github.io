export const lerp = (a, b, t) => a + (b - a) * t;

export const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);

export function smoothstep(edge0, edge1, value) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function hash(a, b, salt) {
  const s = Math.sin(a * 127.1 + b * 311.7 + salt * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

// deterministic random numbers so generated layouts stay the same across loads
export function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
