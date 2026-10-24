import { hash, lerp, smootherstep } from './math.js';

// perlin noise seeded so every load draws the same terrain
const permutation = (() => {
  const table = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(hash(i, 7, 11) * (i + 1));
    [table[i], table[j]] = [table[j], table[i]];
  }
  return Uint8Array.from([...table, ...table]);
})();

function cornerGradient(hashValue, x, y, z) {
  const h = hashValue & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return (h & 1 ? -u : u) + (h & 2 ? -v : v);
}

export function noise(x, y, z) {
  const p = permutation;
  const cellX = Math.floor(x) & 255;
  const cellY = Math.floor(y) & 255;
  const cellZ = Math.floor(z) & 255;
  const fx = x - Math.floor(x);
  const fy = y - Math.floor(y);
  const fz = z - Math.floor(z);
  const u = smootherstep(fx);
  const v = smootherstep(fy);
  const w = smootherstep(fz);
  const a = p[cellX] + cellY;
  const b = p[cellX + 1] + cellY;
  const aa = p[a] + cellZ;
  const ab = p[a + 1] + cellZ;
  const ba = p[b] + cellZ;
  const bb = p[b + 1] + cellZ;
  return lerp(
    lerp(
      lerp(cornerGradient(p[aa], fx, fy, fz), cornerGradient(p[ba], fx - 1, fy, fz), u),
      lerp(cornerGradient(p[ab], fx, fy - 1, fz), cornerGradient(p[bb], fx - 1, fy - 1, fz), u),
      v,
    ),
    lerp(
      lerp(cornerGradient(p[aa + 1], fx, fy, fz - 1), cornerGradient(p[ba + 1], fx - 1, fy, fz - 1), u),
      lerp(cornerGradient(p[ab + 1], fx, fy - 1, fz - 1), cornerGradient(p[bb + 1], fx - 1, fy - 1, fz - 1), u),
      v,
    ),
    w,
  );
}
