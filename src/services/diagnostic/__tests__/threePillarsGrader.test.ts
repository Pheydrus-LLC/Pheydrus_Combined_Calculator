/**
 * Regression test: Pillar 3 must always grade the address numerology L3 level.
 *
 * Context: on 2026-06-18, the address calculator's derived combined level was
 * renamed from name: 'L3' to name: 'L1 + L2', but the grader's lookup
 * (`levels.find(l => l.name === 'L3')`) was never updated. That lookup silently
 * matched nothing for a month, so the Pillar 3 Address card and the address
 * contribution to the Final Grade / score silently disappeared with no test
 * or type error catching it. These tests exist so a similar rename can't
 * silently zero out the address grading again.
 */
import { describe, it, expect } from 'vitest';
import { calculateAddressNumerology } from '../../../calculators/addressNumerologyCalculator';
import { gradeThreePillars } from '../threePillarsGrader';

function baseGraderInput(addressNumerology: ReturnType<typeof calculateAddressNumerology> | null) {
  return {
    natalChart: null,
    transits: null,
    lifePath: null,
    destinationPlanetHouses: null,
    addressNumerology,
  };
}

describe('Pillar 3 address grading', () => {
  it('produces a non-empty Address item whenever address numerology data is present', () => {
    const addressNumerology = calculateAddressNumerology({
      unitNumber: '',
      streetNumber: '12345',
      streetName: 'Maple Lane',
      postalCode: '90210',
      homeYear: '2000',
      birthYear: '1995',
    });

    const result = gradeThreePillars(baseGraderInput(addressNumerology));
    const pillar3 = result.pillars.find((p) => p.pillar === 3);
    const addressItems = pillar3?.items.filter((i) => i.section === 'Address') ?? [];

    expect(addressItems.length).toBeGreaterThan(0);
  });

  it('grades using the derived L3 (L1 + L2) level, not a level literally named "L3"', () => {
    const addressNumerology = calculateAddressNumerology({
      unitNumber: '',
      streetNumber: '12345',
      streetName: 'Maple Lane',
      postalCode: '90210',
      homeYear: '2000',
      birthYear: '1995',
    });

    // Sanity-check the assumption the grader relies on: no level's *name* is 'L3'.
    expect(addressNumerology.levels.some((l) => l.name === 'L3')).toBe(false);
    expect(addressNumerology.levels.some((l) => l.level === 'L3')).toBe(true);

    const result = gradeThreePillars(baseGraderInput(addressNumerology));
    const pillar3 = result.pillars.find((p) => p.pillar === 3);
    const addressItem = pillar3?.items.find((i) => i.section === 'Address');

    expect(addressItem).toBeDefined();
    expect(addressItem?.source).toMatch(/^L3: /);
  });

  it('counts the address item toward the pillar and overall F/C/A totals', () => {
    // Street number 12345 (=6) + Maple (stripped, =3) -> L3 = 9, an F number.
    const addressNumerology = calculateAddressNumerology({
      unitNumber: '',
      streetNumber: '12345',
      streetName: 'Maple Lane',
      postalCode: '90210',
      homeYear: '2000',
      birthYear: '1995',
    });

    const result = gradeThreePillars(baseGraderInput(addressNumerology));
    const pillar3 = result.pillars.find((p) => p.pillar === 3);

    expect(pillar3?.fCount).toBeGreaterThan(0);
    expect(result.totalFs).toBeGreaterThan(0);
  });

  it('returns no Address items when there is no address numerology data', () => {
    const result = gradeThreePillars(baseGraderInput(null));
    const pillar3 = result.pillars.find((p) => p.pillar === 3);
    const addressItems = pillar3?.items.filter((i) => i.section === 'Address') ?? [];

    expect(addressItems.length).toBe(0);
  });
});
