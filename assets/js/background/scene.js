export function readColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    background: styles.getPropertyValue('--background').trim(),
    pattern: styles.getPropertyValue('--pattern-rgb').trim(),
  };
}

export const patternColor = ({ colors }, alpha) => `rgba(${colors.pattern}, ${alpha})`;

export function fillBackground({ ctx, width, height, colors }) {
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);
}
