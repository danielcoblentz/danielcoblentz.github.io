const PLACEMENT_ATTEMPTS = 30;
const SUPER_TRIANGLE_SPAN = 1e5;

const edgeKey = (u, v) => (u < v ? `${u},${v}` : `${v},${u}`);

// poisson disk sampling giving evenly spaced points no closer than the radius
export function samplePoissonDisk(width, height, radius, random) {
  const cellSize = radius / Math.SQRT2;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid = new Int32Array(cols * rows).fill(-1);
  const points = [];
  const active = [];

  const place = (x, y) => {
    grid[Math.floor(y / cellSize) * cols + Math.floor(x / cellSize)] = points.length;
    active.push(points.length);
    points.push({ x, y });
  };

  const isFree = (x, y) => {
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    for (let j = Math.max(0, row - 2); j <= Math.min(rows - 1, row + 2); j++) {
      for (let i = Math.max(0, col - 2); i <= Math.min(cols - 1, col + 2); i++) {
        const neighbor = points[grid[j * cols + i]];
        if (neighbor && (neighbor.x - x) ** 2 + (neighbor.y - y) ** 2 < radius * radius) return false;
      }
    }
    return true;
  };

  place(random() * width, random() * height);
  while (active.length) {
    const slot = Math.floor(random() * active.length);
    const origin = points[active[slot]];
    let placed = false;
    for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS && !placed; attempt++) {
      const angle = random() * Math.PI * 2;
      const distance = radius * (1 + random());
      const x = origin.x + Math.cos(angle) * distance;
      const y = origin.y + Math.sin(angle) * distance;
      if (x >= 0 && y >= 0 && x < width && y < height && isFree(x, y)) {
        place(x, y);
        placed = true;
      }
    }
    if (!placed) {
      active[slot] = active[active.length - 1];
      active.pop();
    }
  }
  return points;
}

function circumcircle(points, a, b, c) {
  const p = points[a];
  const q = points[b];
  const r = points[c];
  const d = 2 * (p.x * (q.y - r.y) + q.x * (r.y - p.y) + r.x * (p.y - q.y));
  const p2 = p.x * p.x + p.y * p.y;
  const q2 = q.x * q.x + q.y * q.y;
  const r2 = r.x * r.x + r.y * r.y;
  const x = (p2 * (q.y - r.y) + q2 * (r.y - p.y) + r2 * (p.y - q.y)) / d;
  const y = (p2 * (r.x - q.x) + q2 * (p.x - r.x) + r2 * (q.x - p.x)) / d;
  return { a, b, c, x, y, radiusSquared: (p.x - x) ** 2 + (p.y - y) ** 2 };
}

// delaunay triangulation that inserts points one at a time and retriangulates the cavity
export function triangulate(points) {
  const count = points.length;
  const span = SUPER_TRIANGLE_SPAN;
  const vertices = [...points, { x: -span, y: -span }, { x: 2 * span, y: -span }, { x: -span, y: 2 * span }];
  let triangles = [circumcircle(vertices, count, count + 1, count + 2)];

  for (let i = 0; i < count; i++) {
    const { x, y } = vertices[i];
    const boundary = new Map();
    triangles = triangles.filter((triangle) => {
      if ((x - triangle.x) ** 2 + (y - triangle.y) ** 2 > triangle.radiusSquared) return true;
      for (const [u, v] of [
        [triangle.a, triangle.b],
        [triangle.b, triangle.c],
        [triangle.c, triangle.a],
      ]) {
        const key = edgeKey(u, v);
        boundary.set(key, boundary.has(key) ? null : [u, v]);
      }
      return false;
    });
    for (const edge of boundary.values()) {
      if (edge) triangles.push(circumcircle(vertices, edge[0], edge[1], i));
    }
  }

  return triangles
    .filter((triangle) => triangle.a < count && triangle.b < count && triangle.c < count)
    .map((triangle) => [triangle.a, triangle.b, triangle.c]);
}

export function uniqueEdges(triangles) {
  const edges = new Map();
  for (const [a, b, c] of triangles) {
    for (const [u, v] of [
      [a, b],
      [b, c],
      [c, a],
    ])
      edges.set(edgeKey(u, v), [u, v]);
  }
  return [...edges.values()];
}
