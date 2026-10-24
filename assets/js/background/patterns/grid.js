import { fillBackground, patternColor } from '../scene.js';

const CELL = 20;
const TILE = 16;
const MAX_ALPHA = 0.16;
const MIN_ALPHA = 0.03;

export const grid = {
  start: 4.2,
  speed: 1.2,
  draw(scene, time) {
    const { ctx, width, height } = scene;
    fillBackground(scene);
    for (let x = 0; x < width; x += CELL) {
      for (let y = 0; y < height; y += CELL) {
        const wave = (Math.sin(0.01 * x + 0.006 * y + time * 0.4) + Math.cos(0.006 * x - 0.008 * y - time * 0.3)) / 2;
        const alpha = (0.5 * wave + 0.5) * MAX_ALPHA;
        if (alpha <= MIN_ALPHA) continue;
        ctx.fillStyle = patternColor(scene, alpha);
        ctx.fillRect(x, y, TILE, TILE);
      }
    }
  },
};
