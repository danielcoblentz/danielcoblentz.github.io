import { smoothstep } from './math.js';

const CONTENT_HALF_WIDTH = 360;
const FADE_INSET = 40;
const FADE_OUTSET = 140;
const GRADIENT_STOPS = 32;

// zero behind the text column rising to one toward the screen edges
export function edgeWeight(x, width) {
  const half = Math.min(CONTENT_HALF_WIDTH, width / 2);
  return smoothstep(half - FADE_INSET, half + FADE_OUTSET, Math.abs(x - width / 2));
}

export function fadeContentColumn({ ctx, width, height }, contentStrength) {
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  for (let stop = 0; stop <= GRADIENT_STOPS; stop++) {
    const offset = stop / GRADIENT_STOPS;
    const fade = (1 - contentStrength) * (1 - edgeWeight(offset * width, width));
    gradient.addColorStop(offset, `rgba(0, 0, 0, ${fade})`);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
