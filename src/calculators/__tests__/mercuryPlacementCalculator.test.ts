/**
 * Unit tests for the Mercury Placement Calculator.
 * Mocks calculateNatalChart + getPlanetSpeed (both ephemeris-backed) so aspect
 * finding, retrograde detection, and blurb assembly can be verified deterministically
 * without a live Swiss Ephemeris/WASM instance.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AstrologyPlanet, NatalChartResult } from '../../models/calculators';

const calculateNatalChartMock = vi.fn();
const getPlanetSpeedMock = vi.fn();

vi.mock('../natalChartCalculator', () => ({
  calculateNatalChart: (...args: unknown[]) => calculateNatalChartMock(...args),
  validateNatalChartInput: vi.fn(),
}));

vi.mock('../../utils/astro/swephClient', () => ({
  getPlanetSpeed: (...args: unknown[]) => getPlanetSpeedMock(...args),
}));

import { calculateMercuryPlacement } from '../mercuryPlacementCalculator';

const BASE_INPUT = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 12,
  minute: 0,
  latitude: 40.7128,
  longitude: -74.006,
  timeZone: 'America/New_York',
};

function makePlanet(name: string, fullDegree: number, extra: Partial<AstrologyPlanet> = {}): AstrologyPlanet {
  return {
    planet: { en: name },
    fullDegree,
    normDegree: fullDegree % 30,
    isRetro: 'False',
    zodiac_sign: { number: Math.floor(fullDegree / 30) + 1, name: { en: 'Gemini' } },
    ...extra,
  };
}

function makeChart(planets: AstrologyPlanet[]): NatalChartResult {
  return {
    planets,
    aspects: [],
    angleAspects: { asc: [], dsc: [], mc: [], ic: [] },
    risingSign: 'Aries',
  };
}

describe('calculateMercuryPlacement', () => {
  beforeEach(() => {
    calculateNatalChartMock.mockReset();
    getPlanetSpeedMock.mockReset();
  });

  it('returns sign, house, and no aspect/retrograde sections when nothing qualifies', async () => {
    const mercury = makePlanet('Mercury', 65, {
      house: 3,
      zodiac_sign: { number: 3, name: { en: 'Gemini' } },
    });
    calculateNatalChartMock.mockResolvedValue(makeChart([mercury]));
    getPlanetSpeedMock.mockResolvedValue(1.2); // direct motion

    const result = await calculateMercuryPlacement(BASE_INPUT);

    expect(result.sign).toBe('Gemini');
    expect(result.house).toBe(3);
    expect(result.isRetrograde).toBe(false);
    expect(result.retrogradeLine).toBeNull();
    expect(result.aspects).toEqual([]);
    expect(result.blurb).toContain('Your Mercury is in Gemini in your 3rd house.');
    expect(result.blurb).not.toContain('retrograde');
  });

  it('includes a hedged retrograde section when Mercury speed is negative', async () => {
    const mercury = makePlanet('Mercury', 65, {
      house: 3,
      zodiac_sign: { number: 3, name: { en: 'Gemini' } },
    });
    calculateNatalChartMock.mockResolvedValue(makeChart([mercury]));
    getPlanetSpeedMock.mockResolvedValue(-0.4); // retrograde

    const result = await calculateMercuryPlacement(BASE_INPUT);

    expect(result.isRetrograde).toBe(true);
    expect(result.retrogradeLine).toBeTruthy();
    expect(result.retrogradeLine).toMatch(/may|can|some retrograde Mercury folks/);
    expect(result.blurb).toContain(result.retrogradeLine as string);
  });

  it('finds every qualifying aspect within a 10° orb, in reference planet order', async () => {
    const mercury = makePlanet('Mercury', 0, {
      house: 10,
      zodiac_sign: { number: 1, name: { en: 'Aries' } },
    });
    // Jupiter trine (exact, 0° orb) — easy. Saturn square (2° orb) — difficult.
    const jupiter = makePlanet('Jupiter', 120);
    const saturn = makePlanet('Saturn', 92);
    // Pluto at 50° from Mercury — no aspect within 10° of any angle (nearest is 60°, 10° away — exactly on the edge, so make it clearly outside).
    const pluto = makePlanet('Pluto', 45);

    calculateNatalChartMock.mockResolvedValue(makeChart([mercury, jupiter, saturn, pluto]));
    getPlanetSpeedMock.mockResolvedValue(1.0);

    const result = await calculateMercuryPlacement(BASE_INPUT);

    expect(result.aspects).toHaveLength(2);
    // Jupiter precedes Saturn in MERCURY_ASPECT_PLANETS reference order.
    expect(result.aspects[0]).toMatchObject({ planet: 'Jupiter', aspect: 'Trine', nature: 'easy' });
    expect(result.aspects[1]).toMatchObject({ planet: 'Saturn', aspect: 'Square', nature: 'difficult' });
    expect(result.aspects[1].orb).toBeCloseTo(2, 1);

    expect(result.aspects[0].line).toContain('harmonious trine');
    expect(result.aspects[1].line).toContain('challenging square');
  });

  it('omits the aspect section entirely when nothing is within orb', async () => {
    const mercury = makePlanet('Mercury', 0, {
      house: 1,
      zodiac_sign: { number: 1, name: { en: 'Aries' } },
    });
    const venus = makePlanet('Venus', 45); // 45° from Mercury — outside every 10° window
    calculateNatalChartMock.mockResolvedValue(makeChart([mercury, venus]));
    getPlanetSpeedMock.mockResolvedValue(1.0);

    const result = await calculateMercuryPlacement(BASE_INPUT);

    expect(result.aspects).toEqual([]);
  });

  it('throws if Mercury cannot be found in the chart', async () => {
    calculateNatalChartMock.mockResolvedValue(makeChart([]));
    getPlanetSpeedMock.mockResolvedValue(1.0);

    await expect(calculateMercuryPlacement(BASE_INPUT)).rejects.toThrow(
      'Mercury placement could not be calculated'
    );
  });
});
