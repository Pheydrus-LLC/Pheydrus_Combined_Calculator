/**
 * Decorative waveform for the voice note players: a smooth two-hump shape,
 * not the recording's real levels. Each value is a bar height from 0 to 1.
 *
 * `variant` nudges the humps so each pillar's note looks a little different.
 */
export function waveformBars(count = 44, variant = 0): number[] {
  const humps = [
    { center: 0.3 + 0.03 * variant, width: 0.13, height: 1 },
    { center: 0.72 - 0.025 * variant, width: 0.12, height: 0.88 - 0.04 * variant },
  ];
  return Array.from({ length: count }, (_, i) => {
    const x = i / (count - 1);
    const envelope = Math.max(
      ...humps.map((h) => h.height * Math.exp(-((x - h.center) ** 2) / (2 * h.width ** 2))),
    );
    // A small floor keeps the quiet ends as dots, like the line between phrases
    return Math.round((0.08 + 0.92 * envelope) * 100) / 100;
  });
}
