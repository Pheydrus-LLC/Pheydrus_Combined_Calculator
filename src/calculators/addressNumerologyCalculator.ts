/**
 * Address Numerology Calculator Service
 * Calculates address numerology with dynamic levels
 * Returns L1-L3 only, with L3 derived from L1 + L2 when available
 * Determines zodiac compatibility between home year and birth year
 */

import type {
  AddressNumerologyInput,
  AddressNumerologyResult,
  NumerologyLevel,
  ZodiacMeaning,
} from '../models/calculators';
import { chaldeanNumerologyCalculator } from '../utils/numerology/chaldean';
import { getChineseZodiac } from '../utils/numerology/chineseZodiac';
import { areZodiacsCompatible } from '../utils/numerology/compatibility';
import {
  NUMEROLOGY_MEANINGS,
  EXTENDED_NUMEROLOGY_MEANINGS,
  CHINESE_ZODIAC_MEANINGS,
} from '../utils/data/constants';

/**
 * Get numerology meaning for a number (basic + extended)
 */
function getFullMeaning(num: number): {
  meaning: string;
  description: string;
  themes: string;
  challenges: string;
  gifts: string;
  reflection: string;
} {
  const basic = NUMEROLOGY_MEANINGS[num] || {
    meaning: 'Unknown',
    description: 'Numerology meaning not found',
  };
  const extended = EXTENDED_NUMEROLOGY_MEANINGS[num] || {
    themes: '',
    challenges: '',
    gifts: '',
    reflection: '',
  };
  return { ...basic, ...extended };
}

/**
 * Get Chinese zodiac meaning
 */
function getZodiacMeaning(zodiac: string): ZodiacMeaning | null {
  const meaning = CHINESE_ZODIAC_MEANINGS[zodiac];
  if (!meaning) return null;
  return {
    name: zodiac,
    themes: meaning.themes,
    challenges: meaning.challenges,
    gifts: meaning.gifts,
    reflection: meaning.reflection,
  };
}

/**
 * Common street suffixes and directionals to strip from street names
 * before calculating numerology. Case-insensitive, matched as whole words.
 * e.g. "Barnes Road" → "Barnes", "Park Avenue South" → "Park"
 */
const STREET_SUFFIXES = new Set([
  // Full names
  'road',
  'street',
  'avenue',
  'court',
  'boulevard',
  'drive',
  'lane',
  'place',
  'way',
  'circle',
  'trail',
  'terrace',
  'crescent',
  'highway',
  'parkway',
  'alley',
  'path',
  'pike',
  'plaza',
  'square',
  'loop',
  'run',
  'crossing',
  'point',
  'ridge',
  'view',
  'pass',
  'bend',
  // Abbreviations
  'rd',
  'st',
  'ave',
  'ct',
  'blvd',
  'dr',
  'ln',
  'pl',
  'cir',
  'trl',
  'ter',
  'cres',
  'hwy',
  'pkwy',
  'aly',
  'sq',
  // Directionals
  'north',
  'south',
  'east',
  'west',
  'n',
  's',
  'e',
  'w',
  'ne',
  'nw',
  'se',
  'sw',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
]);

/**
 * Strip street suffixes and directionals from a street name
 * Returns only the meaningful part for numerology calculation
 */
function stripStreetSuffixes(streetName: string): string {
  const words = streetName.trim().split(/\s+/);
  const meaningful = words.filter((w) => !STREET_SUFFIXES.has(w.toLowerCase()));
  return meaningful.length > 0 ? meaningful.join(' ') : streetName;
}

/**
 * Build a numerology level with full meanings
 */
function buildLevel(level: string, value: string, name: string): NumerologyLevel {
  // Strip street suffixes when calculating Street Name numerology
  const calcValue = name === 'Street Name' ? stripStreetSuffixes(value) : value;
  const number = chaldeanNumerologyCalculator([calcValue]);
  const meaning = getFullMeaning(number);

  return {
    level,
    value,
    name,
    number,
    meaning: meaning.meaning,
    description: meaning.description,
    themes: meaning.themes,
    challenges: meaning.challenges,
    gifts: meaning.gifts,
    reflection: meaning.reflection,
  };
}

/**
 * Calculate Address Numerology
 * Uses dynamic level numbering:
 * - Push non-empty fields in order: unitNumber, streetNumber, streetName, postalCode
 * - Insert derived L3 from L1 + L2 when at least two source fields are present
 * - Return only L1-L3 levels
 * - Chinese zodiac meanings for home and birth years
 *
 * @param input - Address and year inputs
 * @returns AddressNumerologyResult with all levels and compatibility
 */
export function calculateAddressNumerology(input: AddressNumerologyInput): AddressNumerologyResult {
  const { unitNumber, streetNumber, streetName, postalCode, homeYear, birthYear } = input;

  // Validate required fields
  if (!birthYear) {
    throw new Error('Birth year is required');
  }

  const birthYearNum = Number(birthYear);
  const homeYearNum = homeYear ? Number(homeYear) : null;

  // Build levels dynamically (matching legacy getLevelsArray)
  const levelsRaw: Array<{ value: string; name: string }> = [];

  const L1 = unitNumber ? { value: unitNumber, name: 'Unit Number' } : null;
  const L2A = streetNumber ? { value: streetNumber, name: 'Building/House Number' } : null;
  const L3 = streetName ? { value: streetName, name: 'Street Name' } : null;
  const L4 = postalCode ? { value: postalCode, name: 'Postal Code' } : null;

  if (L1?.value) levelsRaw.push(L1);
  if (L2A?.value) levelsRaw.push(L2A);
  if (L3?.value) levelsRaw.push(L3);
  if (L4?.value) levelsRaw.push(L4);

  // Build base levels dynamically (L1, L2, L3, ...)
  const baseLevels: NumerologyLevel[] = levelsRaw.map((raw, index) =>
    buildLevel(`L${index + 1}`, raw.value, raw.name)
  );

  // Sheet rule: L3 is derived from L1 + L2. Any remaining source fields (e.g., postal) come after that.
  // This ensures single-family inputs render as:
  // L1: Street/Building Number, L2: Street Name, L3: L1 + L2, L4: Postal Code.
  const levels: NumerologyLevel[] = [...baseLevels];
  if (baseLevels.length >= 2) {
    let l3Num = baseLevels[0].number + baseLevels[1].number;
    while (l3Num > 9 && l3Num !== 11) {
      let s = 0;
      let n = l3Num;
      while (n) {
        s += n % 10;
        n = Math.floor(n / 10);
      }
      l3Num = s;
    }

    const meaning = getFullMeaning(l3Num);
    const combinedLevel: NumerologyLevel = {
      level: 'L3',
      value: `${baseLevels[0].value} + ${baseLevels[1].value}`,
      name: 'L1 + L2',
      number: l3Num,
      meaning: meaning.meaning,
      description: meaning.description,
      themes: meaning.themes,
      challenges: meaning.challenges,
      gifts: meaning.gifts,
      reflection: meaning.reflection,
    };

    levels.splice(2, 0, combinedLevel);
  }

  // Keep only L1-L3 as requested.
  const cappedLevels = levels.slice(0, 3).map((level, index) => ({
    ...level,
    level: `L${index + 1}`,
  }));

  // Calculate Chinese Zodiacs
  const homeZodiac = homeYearNum ? getChineseZodiac(homeYearNum) : 'Unknown';
  const birthZodiac = getChineseZodiac(birthYearNum);

  // Get zodiac meanings
  const homeZodiacMeaning = homeZodiac !== 'Unknown' ? getZodiacMeaning(homeZodiac) : null;
  const birthZodiacMeaning = getZodiacMeaning(birthZodiac);

  // Calculate Compatibility
  let compatibility = 'unknown';
  if (homeZodiac !== 'Unknown') {
    compatibility = areZodiacsCompatible(homeZodiac, birthZodiac);
  }

  return {
    levels: cappedLevels,
    homeZodiac,
    birthZodiac,
    homeZodiacMeaning,
    birthZodiacMeaning,
    compatibility,
  };
}

/**
 * Validate address numerology input
 */
export function validateAddressNumerologyInput(input: AddressNumerologyInput): {
  valid: boolean;
  error?: string;
} {
  if (!input.birthYear) {
    return { valid: false, error: 'Birth year is required' };
  }

  const birthYear = Number(input.birthYear);
  if (isNaN(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) {
    return { valid: false, error: 'Invalid birth year' };
  }

  if (input.homeYear) {
    const homeYear = Number(input.homeYear);
    if (isNaN(homeYear) || homeYear < 1500 || homeYear > new Date().getFullYear() + 100) {
      return { valid: false, error: 'Invalid home year' };
    }
  }

  return { valid: true };
}

/**
 * Get summary of address numerology
 */
export function getAddressNumerologySummary(result: AddressNumerologyResult): string {
  const levelSummary = result.levels.map((l) => `${l.level}: ${l.number}`).join(', ');
  return `${levelSummary} | ${result.homeZodiac} \u2665 ${result.birthZodiac}: ${result.compatibility}`;
}
