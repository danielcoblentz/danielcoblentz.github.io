import { fadeContentColumn } from '../content-column.js';
import { samplePoissonDisk, triangulate, uniqueEdges } from '../geometry.js';
import { seededRandom } from '../math.js';
import { noise } from '../noise.js';
import { fillBackground, patternColor } from '../scene.js';

const SEED = 2025;
const SAMPLE_RADIUS = 46;
const RELIEF = 260;
const TERRAIN_ZOOM = 1 / 380;
const TERRAIN_DRIFT = 0.4;
const LIGHT_ELEVATION = 0.6;
const LIGHT_AZIMUTH = 0.8;
const LIGHT_ORBIT = 0.7;
const CONTENT_STRENGTH = 0.6;
const FACE_ALPHA_MIN = 0.01;
const FACE_ALPHA_RANGE = 0.2;
const EDGE_ALPHA = 0.08;
const EDGE_WIDTH = 0.5;
const VERTEX_ALPHA = 0.22;
const VERTEX_SIZE = 1.5;

let surface = null;

// poisson disk samples joined into a delaunay mesh with faces lit from their normals
function buildSurface(extent) {
  const margin = SAMPLE_RADIUS * 2;
  const size = extent + 2 * margin;
  const points = samplePoissonDisk(size, size, SAMPLE_RADIUS, seededRandom(SEED)).map((point) => ({
    x: point.x - margin,
    y: point.y - margin,
  }));
  const triangles = triangulate(points);
  return { extent, points, triangles, edges: uniqueEdges(triangles) };
}

export const mesh = {
  start: 0,
  speed: 0.3,
  draw(scene, time) {
    const { ctx, width, height } = scene;
    const extent = Math.max(width, height);
    if (!surface || surface.extent < extent) surface = buildSurface(extent);
    const { points, triangles, edges } = surface;

    const heights = points.map(
      (point) => noise(point.x * TERRAIN_ZOOM, point.y * TERRAIN_ZOOM, time * TERRAIN_DRIFT) * RELIEF,
    );
    const azimuth = LIGHT_AZIMUTH + time * LIGHT_ORBIT;
    const lightX = Math.cos(azimuth) * Math.cos(LIGHT_ELEVATION);
    const lightY = Math.sin(azimuth) * Math.cos(LIGHT_ELEVATION);
    const lightZ = Math.sin(LIGHT_ELEVATION);
    const visible = (point) =>
      point.x > -SAMPLE_RADIUS &&
      point.y > -SAMPLE_RADIUS &&
      point.x < width + SAMPLE_RADIUS &&
      point.y < height + SAMPLE_RADIUS;

    fillBackground(scene);

    for (const [a, b, c] of triangles) {
      const p = points[a];
      const q = points[b];
      const r = points[c];
      if (!visible(p) && !visible(q) && !visible(r)) continue;
      const ux = q.x - p.x;
      const uy = q.y - p.y;
      const uz = heights[b] - heights[a];
      const vx = r.x - p.x;
      const vy = r.y - p.y;
      const vz = heights[c] - heights[a];
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      // lambert shading so faces turned away from the light are drawn darker
      const facing = (Math.sign(nz) * (nx * lightX + ny * lightY + nz * lightZ)) / Math.hypot(nx, ny, nz);
      ctx.fillStyle = patternColor(scene, FACE_ALPHA_MIN + FACE_ALPHA_RANGE * (1 - Math.max(0, facing)));
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.lineTo(r.x, r.y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    for (const [u, v] of edges) {
      ctx.moveTo(points[u].x, points[u].y);
      ctx.lineTo(points[v].x, points[v].y);
    }
    ctx.lineWidth = EDGE_WIDTH;
    ctx.strokeStyle = patternColor(scene, EDGE_ALPHA);
    ctx.stroke();

    ctx.beginPath();
    for (const point of points) {
      if (visible(point)) ctx.rect(point.x - VERTEX_SIZE / 2, point.y - VERTEX_SIZE / 2, VERTEX_SIZE, VERTEX_SIZE);
    }
    ctx.fillStyle = patternColor(scene, VERTEX_ALPHA);
    ctx.fill();

    fadeContentColumn(scene, CONTENT_STRENGTH);
  },
};
