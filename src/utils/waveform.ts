/**
 * Decorative waveform for the voice note players: a smooth shape, not the
 * recording's real levels. Each value is a bar height from 0 to 1.
 *
 * Two shapes alternate by `variant`:
 *   even → two gentle humps
 *   odd  → three rolling waves, the middle one tallest
 */

const SHAPES = [
  [
    { center: 0.3, width: 0.13, height: 1 },
    { center: 0.72, width: 0.12, height: 0.88 },
  ],
  [
    { center: 0.2, width: 0.085, height: 0.7 },
    { center: 0.5, width: 0.1, height: 1 },
    { center: 0.8, width: 0.085, height: 0.75 },
  ],
];

export function waveformBars(count = 44, variant = 0): number[] {
  const humps = SHAPES[Math.abs(variant) % SHAPES.length];
  return Array.from({ length: count }, (_, i) => {
    const x = i / (count - 1);
    const envelope = Math.max(
      ...humps.map((h) => h.height * Math.exp(-((x - h.center) ** 2) / (2 * h.width ** 2))),
    );
    // A small floor keeps the quiet ends as dots, like the line between phrases
    return Math.round((0.08 + 0.92 * envelope) * 100) / 100;
  });
}
