import { edgeWeight, fadeContentColumn } from '../content-column.js';
import { hash, lerp } from '../math.js';
import { noise } from '../noise.js';
import { fillBackground } from '../scene.js';

const TRAIL_REACH = 150;
const STEP_LENGTH = 2;
const TERRAIN_CELL = 12;
const SEED_SPACING = 26;
const DRIFT_ANGLE = 0.35;
const PULL = 1.6;
const GAIN = 0.28;
const OPACITY = 0.55;
const THREAD_TONE = 4;
const CONTENT_STRENGTH = 0.5;
const TONE_LEVELS = 256;
const TONES_PER_UNIT = 4;
const TONE_CURVE = 1.25;
const ZOOM_WIDTH_FACTOR = 0.6;
const ZOOM_MIN_EXTENT = 420;
const ZOOM_MAX_EXTENT = 900;
const DETAIL_WEIGHT = 0.3;
const DETAIL_FREQUENCY = 2.3;
const DETAIL_SPEED = 1.3;

const layer = document.createElement('canvas');
let layerImage = null;

// flow field where trails follow a constant drift plus the downhill slope of the absolute noise so they gather along valley lines without forming sinks
function terrainSlopes(width, height, time) {
  const zoom = 1 / Math.min(Math.max(width * ZOOM_WIDTH_FACTOR, ZOOM_MIN_EXTENT), ZOOM_MAX_EXTENT);
  const left = -TRAIL_REACH - TERRAIN_CELL;
  const top = -TRAIL_REACH - TERRAIN_CELL;
  const cols = Math.ceil((width + 2 * (TRAIL_REACH + TERRAIN_CELL)) / TERRAIN_CELL) + 1;
  const rows = Math.ceil((height + 2 * (TRAIL_REACH + TERRAIN_CELL)) / TERRAIN_CELL) + 1;

  const terrain = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = (left + i * TERRAIN_CELL) * zoom;
      const y = (top + j * TERRAIN_CELL) * zoom;
      terrain[j * cols + i] = Math.abs(
        noise(x, y, time) +
          DETAIL_WEIGHT * noise(x * DETAIL_FREQUENCY + 9.1, y * DETAIL_FREQUENCY + 3.7, time * DETAIL_SPEED),
      );
    }
  }

  const slopeX = new Float32Array(cols * rows);
  const slopeY = new Float32Array(cols * rows);
  let steepest = 0;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      slopeX[k] = terrain[j * cols + Math.min(i + 1, cols - 1)] - terrain[j * cols + Math.max(i - 1, 0)];
      slopeY[k] = terrain[Math.min(j + 1, rows - 1) * cols + i] - terrain[Math.max(j - 1, 0) * cols + i];
      steepest = Math.max(steepest, Math.hypot(slopeX[k], slopeY[k]));
    }
  }

  return { left, top, cols, rows, slopeX, slopeY, strength: PULL / steepest };
}

function traceDensity(width, height, slopes) {
  const { left, top, cols, rows, slopeX, slopeY, strength } = slopes;
  const driftX = Math.cos(DRIFT_ANGLE);
  const driftY = Math.sin(DRIFT_ANGLE);
  const density = new Float32Array(width * height);

  const deposit = (x, y) => {
    if (x < 0 || y < 0 || x >= width - 1 || y >= height - 1) return;
    const i = x | 0;
    const j = y | 0;
    const tx = x - i;
    const ty = y - j;
    const k = j * width + i;
    density[k] += (1 - tx) * (1 - ty);
    density[k + 1] += tx * (1 - ty);
    density[k + width] += (1 - tx) * ty;
    density[k + width + 1] += tx * ty;
  };

  const steps = Math.round(TRAIL_REACH / STEP_LENGTH);
  const trace = (x, y, direction) => {
    for (let n = 0; n < steps; n++) {
      const fx = (x - left) / TERRAIN_CELL;
      const fy = (y - top) / TERRAIN_CELL;
      const i = Math.floor(fx);
      const j = Math.floor(fy);
      if (i < 0 || j < 0 || i >= cols - 1 || j >= rows - 1) return;
      const tx = fx - i;
      const ty = fy - j;
      const k = j * cols + i;
      const sx = lerp(lerp(slopeX[k], slopeX[k + 1], tx), lerp(slopeX[k + cols], slopeX[k + cols + 1], tx), ty);
      const sy = lerp(lerp(slopeY[k], slopeY[k + 1], tx), lerp(slopeY[k + cols], slopeY[k + cols + 1], tx), ty);
      const vx = driftX - strength * sx;
      const vy = driftY - strength * sy;
      const length = Math.hypot(vx, vy) || 1;
      x += (direction * STEP_LENGTH * vx) / length;
      y += (direction * STEP_LENGTH * vy) / length;
      deposit(x, y);
    }
  };

  for (let row = -1; row * SEED_SPACING < height + SEED_SPACING; row++) {
    for (let col = -1; col * SEED_SPACING < width + SEED_SPACING; col++) {
      const x = (col + hash(col, row, 31)) * SEED_SPACING;
      const y = (row + hash(col, row, 32)) * SEED_SPACING;
      deposit(x, y);
      trace(x, y, -1);
      trace(x, y, 1);
    }
  }

  return density;
}

function toneTable(colors) {
  const [r, g, b] = colors.pattern.split(',').map(Number);
  const tones = new Uint32Array(TONE_LEVELS);
  for (let level = 0; level < TONE_LEVELS; level++) {
    const alpha = Math.round(255 * OPACITY * (1 - Math.exp(-(((level / TONES_PER_UNIT) * GAIN) ** TONE_CURVE))));
    tones[level] = ((alpha << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }
  return tones;
}

// trail density maps to alpha through a tone table and only thin threads are allowed inside the text column
function paintLayer(width, height, density, colors) {
  const layerCtx = layer.getContext('2d');
  if (layer.width !== width || layer.height !== height || !layerImage) {
    layer.width = width;
    layer.height = height;
    layerImage = layerCtx.createImageData(width, height);
  }

  const tones = toneTable(colors);
  const brightest = new Uint8Array(width);
  for (let x = 0; x < width; x++) {
    brightest[x] = Math.round(THREAD_TONE + (TONE_LEVELS - 1 - THREAD_TONE) * edgeWeight(x, width));
  }

  const pixels = new Uint32Array(layerImage.data.buffer);
  for (let y = 0, p = 0; y < height; y++) {
    for (let x = 0; x < width; x++, p++) {
      pixels[p] = density[p] ? tones[Math.min(brightest[x], (density[p] * TONES_PER_UNIT) | 0)] : 0;
    }
  }
  layerCtx.putImageData(layerImage, 0, 0);
}

export const topo = {
  start: 0,
  speed: 0.05,
  draw(scene, time) {
    const { ctx, width, height, colors } = scene;
    const density = traceDensity(width, height, terrainSlopes(width, height, time));
    paintLayer(width, height, density, colors);
    fillBackground(scene);
    ctx.drawImage(layer, 0, 0, width, height);
    fadeContentColumn(scene, CONTENT_STRENGTH);
  },
};
