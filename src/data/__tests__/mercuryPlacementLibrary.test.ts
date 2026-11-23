import { describe, it, expect } from 'vitest';
import { ZODIAC_SIGNS } from '../../utils/data/constants';
import {
  MERCURY_SIGN_BLURBS,
  MERCURY_HOUSE_BLURBS,
  ASPECT_PLANET_PHRASES,
  RETROGRADE_CLAUSES,
  DIFFICULT_ASPECTS,
  EASY_ASPECTS,
  MERCURY_ASPECT_PLANETS,
} from '../mercuryPlacementLibrary';

describe('mercuryPlacementLibrary', () => {
  it('has a sign blurb for all 12 zodiac signs', () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(MERCURY_SIGN_BLURBS[sign]).toBeTruthy();
    }
    expect(Object.keys(MERCURY_SIGN_BLURBS)).toHaveLength(12);
  });

  it('has a house blurb for all 12 houses', () => {
    for (let house = 1; house <= 12; house++) {
      expect(MERCURY_HOUSE_BLURBS[house]).toBeTruthy();
    }
    expect(Object.keys(MERCURY_HOUSE_BLURBS)).toHaveLength(12);
  });

  it('has an aspect phrase for every aspect planet', () => {
    for (const planet of MERCURY_ASPECT_PLANETS) {
      expect(ASPECT_PLANET_PHRASES[planet]).toBeTruthy();
    }
    expect(MERCURY_ASPECT_PLANETS).toHaveLength(9);
  });

  it('has at least a handful of hedged retrograde clauses with no unhedged claims', () => {
    expect(RETROGRADE_CLAUSES.length).toBeGreaterThanOrEqual(4);
    for (const clause of RETROGRADE_CLAUSES) {
      expect(clause).not.toMatch(/\bwill\b|\balways\b|\bnever\b/i);
    }
  });

  it('keeps difficult and easy aspect lists disjoint and covering the 5 aspect types', () => {
    const all = [...DIFFICULT_ASPECTS, ...EASY_ASPECTS];
    expect(new Set(all).size).toBe(5);
    for (const aspect of DIFFICULT_ASPECTS) {
      expect(EASY_ASPECTS).not.toContain(aspect);
    }
  });
});
