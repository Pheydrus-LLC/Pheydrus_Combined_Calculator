/**
 * Mercury Placement Calculator
 * Computes Mercury's sign, house, natal retrograde status, and every qualifying
 * aspect to Mercury (10° orb, all aspect types), then assembles the plain-language
 * blurb described in the "Mercury Placement Tool — Content & Logic Spec".
 *
 * Reuses calculateNatalChart for planet positions/houses rather than duplicating
 * the ephemeris + house-assignment logic.
 */

import type { NatalChartInput } from '../models/calculators';
import { calculateNatalChart, validateNatalChartInput } from './natalChartCalculator';
import { birthLocalToJulianDay } from '../utils/astro/time';
import { getPlanetSpeed } from '../utils/astro/swephClient';
import {
  MERCURY_SIGN_BLURBS,
  MERCURY_HOUSE_BLURBS,
  ASPECT_PLANET_PHRASES,
  RETROGRADE_CLAUSES,
  DIFFICULT_ASPECTS,
  MERCURY_ASPECT_PLANETS,
} from '../data/mercuryPlacementLibrary';

export type MercuryPlacementInput = NatalChartInput;

export interface MercuryAspectHit {
  planet: string;
  aspect: string;
  orb: number;
  nature: 'difficult' | 'easy';
}

export interface MercuryAspectLine extends MercuryAspectHit {
  line: string;
}

export interface MercuryPlacementResult {
  sign: string;
  house: number;
  isRetrograde: boolean;
  aspects: MercuryAspectLine[];
  /** Sign + house sentence, e.g. "Your Mercury is in Leo in your 10th house." */
  headlineLine: string;
  /** Sign keyword sentence + house domain sentence, combined. */
  openingLine: string;
  /** Hedged retrograde sentence, or null if Mercury is not retrograde. */
  retrogradeLine: string | null;
  /** Full blurb — headlineLine + openingLine + retrogradeLine + each aspect line, joined. */
  blurb: string;
}

/** Every aspect type checked at a flat 10° orb, per spec (not the app-wide ASPECTS table). */
const MERCURY_ASPECT_ANGLES: Array<{ name: string; angle: number }> = [
  { name: 'Conjunction', angle: 0 },
  { name: 'Sextile', angle: 60 },
  { name: 'Square', angle: 90 },
  { name: 'Trine', angle: 120 },
  { name: 'Opposition', angle: 180 },
];

const MERCURY_ASPECT_ORB = 10;

function angularDistance(deg1: number, deg2: number): number {
  const diff = Math.abs(deg1 - deg2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function findMercuryAspect(mercuryLon: number, otherLon: number): { name: string; orb: number } | null {
  const distance = angularDistance(mercuryLon, otherLon);
  for (const candidate of MERCURY_ASPECT_ANGLES) {
    const orb = Math.abs(distance - candidate.angle);
    if (orb <= MERCURY_ASPECT_ORB) {
      return { name: candidate.name, orb: Math.round(orb * 10) / 10 };
    }
  }
  return null;
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function buildAspectLine(hit: MercuryAspectHit): string {
  const nature = hit.nature === 'difficult' ? 'challenging' : 'harmonious';
  const connector = hit.nature === 'difficult' ? 'pointing to' : 'bringing natural ease to';
  const phrase = ASPECT_PLANET_PHRASES[hit.planet];
  return `Mercury also forms a ${nature} ${hit.aspect.toLowerCase()} to your ${hit.planet}, ${connector} ${phrase}.`;
}

function buildMercuryBlurb(params: {
  sign: string;
  house: number;
  isRetrograde: boolean;
  aspects: MercuryAspectHit[];
  seed: number;
}): Pick<MercuryPlacementResult, 'headlineLine' | 'openingLine' | 'retrogradeLine' | 'blurb'> & {
  aspectLines: string[];
} {
  const { sign, house, isRetrograde, aspects, seed } = params;

  const headlineLine = `Your Mercury is in ${sign} in your ${ordinal(house)} house.`;

  const signLine = MERCURY_SIGN_BLURBS[sign];
  const houseLine = MERCURY_HOUSE_BLURBS[house];
  const openingLine = [signLine, houseLine].filter(Boolean).join(' ');

  let retrogradeLine: string | null = null;
  if (isRetrograde) {
    const clauseA = RETROGRADE_CLAUSES[seed % RETROGRADE_CLAUSES.length];
    const clauseB = RETROGRADE_CLAUSES[(seed + 3) % RETROGRADE_CLAUSES.length];
    retrogradeLine = `Your Mercury is also retrograde, which can mean you process language a little differently than most — some retrograde Mercury folks ${clauseA}, or ${clauseB}. This tends to ease up over time.`;
  }

  const aspectLines = aspects.map(buildAspectLine);

  const blurb = [headlineLine, openingLine, retrogradeLine, ...aspectLines]
    .filter((line): line is string => Boolean(line))
    .join(' ');

  return { headlineLine, openingLine, retrogradeLine, aspectLines, blurb };
}

/**
 * Calculate Mercury's placement: sign, house, natal retrograde status, and every
 * qualifying aspect within a 10° orb — then assemble the plain-language blurb.
 */
export async function calculateMercuryPlacement(
  input: MercuryPlacementInput
): Promise<MercuryPlacementResult> {
  const chart = await calculateNatalChart(input);

  const mercury = chart.planets.find((p) => p.planet.en === 'Mercury');
  if (!mercury || mercury.house === undefined) {
    throw new Error('Mercury placement could not be calculated');
  }

  const sign = mercury.zodiac_sign.name.en;
  const house = mercury.house;

  const jdUT = birthLocalToJulianDay({
    date: `${input.year.toString().padStart(4, '0')}-${input.month.toString().padStart(2, '0')}-${input.day.toString().padStart(2, '0')}`,
    time: `${input.hour.toString().padStart(2, '0')}:${input.minute.toString().padStart(2, '0')}`,
    timeZone: input.timeZone,
  });
  const mercurySpeed = await getPlanetSpeed(jdUT, 'Mercury');
  const isRetrograde = mercurySpeed < 0;

  const aspects: MercuryAspectHit[] = [];
  for (const planetName of MERCURY_ASPECT_PLANETS) {
    const planet = chart.planets.find((p) => p.planet.en === planetName);
    if (!planet) continue;

    const hit = findMercuryAspect(mercury.fullDegree, planet.fullDegree);
    if (hit) {
      aspects.push({
        planet: planetName,
        aspect: hit.name,
        orb: hit.orb,
        nature: DIFFICULT_ASPECTS.includes(hit.name) ? 'difficult' : 'easy',
      });
    }
  }

  const seed = mercury.zodiac_sign.number * 31 + house;
  const { headlineLine, openingLine, retrogradeLine, aspectLines, blurb } = buildMercuryBlurb({
    sign,
    house,
    isRetrograde,
    aspects,
    seed,
  });

  const aspectsWithLines: MercuryAspectLine[] = aspects.map((hit, i) => ({
    ...hit,
    line: aspectLines[i],
  }));

  return {
    sign,
    house,
    isRetrograde,
    aspects: aspectsWithLines,
    headlineLine,
    openingLine,
    retrogradeLine,
    blurb,
  };
}

export { validateNatalChartInput as validateMercuryPlacementInput };
