import { describe, expect, it } from 'vitest';
import {
  lightBorder,
  lightShape,
  lightSurface,
  lightText,
  lightness,
  mapColors,
  parseColor,
  toCss,
} from '../lightTheme';

const c = (s: string) => parseColor(s)!;

describe('parseColor', () => {
  it('reads rgb, rgba and hex', () => {
    expect(parseColor('rgb(12, 17, 40)')).toEqual({ r: 12, g: 17, b: 40, a: 1 });
    expect(parseColor('rgba(201, 168, 76, 0.07)')).toEqual({ r: 201, g: 168, b: 76, a: 0.07 });
    expect(parseColor('#0C1128')).toEqual({ r: 12, g: 17, b: 40, a: 1 });
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });
});

describe('light theme rules', () => {
  it('turns the navy surfaces near-white, keeping cards lighter than the page', () => {
    const page = lightSurface(c('#050A18'));
    const card = lightSurface(c('#0C1128'));
    expect(lightness(page)).toBeGreaterThan(0.95);
    expect(lightness(card)).toBeGreaterThan(lightness(page));
  });

  it('keeps accent fills like gold buttons and green tags', () => {
    expect(lightSurface(c('#C9A84C'))).toEqual(c('#C9A84C'));
    expect(lightSurface(c('#1E7B45'))).toEqual(c('#1E7B45'));
  });

  it('keeps coloured tints, flips neutral washes', () => {
    expect(lightSurface(c('rgba(201,168,76,0.07)'))).toEqual(c('rgba(201,168,76,0.07)'));
    expect(lightness(lightSurface(c('rgba(255,255,255,0.1)')))).toBeLessThan(0.1);
  });

  it('makes light text dark, deepens gold, and leaves dark text alone', () => {
    expect(lightness(lightText(c('#E8DEFF')))).toBeLessThan(0.15);
    expect(lightness(lightText(c('#F87171')))).toBeLessThan(0.45);
    expect(lightness(lightText(c('#C9A84C')))).toBeCloseTo(0.34, 2);
    expect(lightText(c('#1C1A2E'))).toEqual(c('#1C1A2E'));
  });

  it('flips neutral borders and keeps coloured ones', () => {
    expect(lightness(lightBorder(c('rgba(255,255,255,0.1)')))).toBeLessThan(0.1);
    expect(lightBorder(c('#C9A84C'))).toEqual(c('#C9A84C'));
  });

  it('keeps chart colours so F / C / A coding survives', () => {
    for (const color of ['#ef4444', '#fcd34d', '#6ee7b7']) expect(lightShape(c(color))).toEqual(c(color));
  });

  it('rewrites every colour inside gradients and shadows', () => {
    const out = mapColors('linear-gradient(180deg, rgba(201,168,76,0.10) 0%, #0C1128 70%)', lightSurface);
    expect(out).toContain('rgba(201, 168, 76, 0.1)');
    expect(out).not.toContain('#0C1128');
    expect(toCss(c('#0C1128'))).toBe('rgb(12, 17, 40)');
  });
});
