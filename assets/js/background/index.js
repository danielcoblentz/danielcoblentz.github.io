import { grid } from './patterns/grid.js';
import { mesh } from './patterns/mesh.js';
import { topo } from './patterns/topo.js';
import { readColors } from './scene.js';

const patterns = { mesh, topo, grid };
const MAX_FRAME_GAP = 100;

export function initBackground() {
  const canvas = document.getElementById('background');
  const playButton = document.querySelector('.play-button');
  const patternButtons = document.querySelectorAll('.pattern-button');
  const scene = { ctx: canvas.getContext('2d'), width: 0, height: 0, colors: readColors() };

  let current = document.querySelector('.pattern-button.active').dataset.pattern;
  let time = 0;
  let playing = false;
  let animationFrame = 0;
  let lastFrameTime = 0;

  const resize = () => {
    const ratio = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    scene.width = window.innerWidth;
    scene.height = window.innerHeight;
    canvas.width = Math.floor(scene.width * ratio);
    canvas.height = Math.floor(scene.height * ratio);
    canvas.style.width = `${scene.width}px`;
    canvas.style.height = `${scene.height}px`;
    scene.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const render = () => {
    patterns[current]?.draw(scene, time);
  };

  // advance by elapsed time so animation speed is the same at any refresh rate
  const tick = (now) => {
    if (lastFrameTime) time += (patterns[current].speed * Math.min(now - lastFrameTime, MAX_FRAME_GAP)) / 1000;
    lastFrameTime = now;
    render();
    animationFrame = requestAnimationFrame(tick);
  };

  const setPlaying = (next) => {
    playing = next;
    cancelAnimationFrame(animationFrame);
    lastFrameTime = 0;
    if (playing) animationFrame = requestAnimationFrame(tick);
    playButton.classList.toggle('active', playing);
    playButton.setAttribute('aria-pressed', String(playing));
    playButton.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
    playButton.textContent = playing ? 'pause' : 'play';
  };

  const setPattern = (name) => {
    current = name;
    patternButtons.forEach((button) => {
      const active = button.dataset.pattern === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const pattern = patterns[name];
    canvas.hidden = !pattern;
    playButton.disabled = !pattern;
    if (!pattern) {
      setPlaying(false);
      return;
    }
    time = pattern.start;
    render();
  };

  patternButtons.forEach((button) => {
    button.addEventListener('click', () => setPattern(button.dataset.pattern));
  });
  playButton.addEventListener('click', () => {
    if (patterns[current]) setPlaying(!playing);
  });
  window.addEventListener('resize', () => {
    resize();
    render();
  });
  window.addEventListener('themechange', () => {
    scene.colors = readColors();
    render();
  });

  resize();
  setPattern(current);
}
