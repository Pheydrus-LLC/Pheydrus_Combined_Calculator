import { describe, expect, it } from 'vitest';
import { waveformBars } from '../waveform';

describe('waveformBars', () => {
  it('returns the requested number of bars between 0 and 1', () => {
    const bars = waveformBars(44);
    expect(bars).toHaveLength(44);
    expect(bars.every((b) => b > 0 && b <= 1)).toBe(true);
  });

  it('is smooth: neighbouring bars never jump sharply', () => {
    const bars = waveformBars(44);
    for (let i = 1; i < bars.length; i++) expect(Math.abs(bars[i] - bars[i - 1])).toBeLessThan(0.2);
  });

  it('tapers to small dots at both ends', () => {
    const bars = waveformBars(44);
    expect(bars[0]).toBeLessThan(0.2);
    expect(bars[bars.length - 1]).toBeLessThan(0.2);
  });

  it('looks a little different for each pillar', () => {
    expect(waveformBars(44, 0)).not.toEqual(waveformBars(44, 1));
    expect(waveformBars(44, 1)).not.toEqual(waveformBars(44, 2));
  });
});
