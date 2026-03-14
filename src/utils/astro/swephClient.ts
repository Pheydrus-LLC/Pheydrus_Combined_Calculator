/**
 * Swiss Ephemeris WASM Client
 * Provides planet calculations and house systems via WASM
 * Requires ephemeris files in public/ephe/
 */

import type { Angles } from './types';
import { buildAngles, normalize360 } from './houses';

// Swiss Ephemeris WASM types
interface SwissEPHModule {
  SEFLG_SWIEPH: number;
  SEFLG_SPEED: number;

  SE_SUN: number;
  SE_MOON: number;
  SE_MERCURY: number;
  SE_VENUS: number;
  SE_MARS: number;
  SE_JUPITER: number;
  SE_SATURN: number;
  SE_URANUS: number;
  SE_NEPTUNE: number;
  SE_PLUTO: number;

  swe_calc_ut(jdUT: number, ipl: number, iflag: number): (number | null)[];
  swe_houses(
    jdUT: number,
    lat: number,
    lon: number,
    hsys: string
  ): {
    cusps: (number | null)[];
    ascmc: (number | null)[];
  };
  swe_set_ephe_path(baseUrl?: string, files?: string[]): Promise<void>;
}

let swe: SwissEPHModule | null = null;
let initPromise: Promise<void> | null = null;

const EPHE_BASE_URL = '/ephe';
const EPHE_FILES = ['seas_18.se1', 'sepl_18.se1', 'semo_18.se1'];

// Planet ID mappings (Swiss Ephemeris body IDs)
const PLANET_IDS: Record<string, number> = {
  Sun: 0,
  Moon: 1,
  Mercury: 2,
  Venus: 3,
  Mars: 4,
  Jupiter: 5,
  Saturn: 6,
  Uranus: 7,
  Neptune: 8,
  Pluto: 9,
  'Mean Node': 10,
  'True Node': 11,
  Lilith: 12,
  Chiron: 15,
  Ceres: 17,
  Pallas: 18,
  Juno: 19,
  Vesta: 20,
  Ascendant: -999, // Special: from swe_houses ascmc[0]
  Descendant: -999, // Special: ASC + 180
  MC: -999, // Special: from swe_houses ascmc[1]
  IC: -999, // Special: MC + 180
};

const PLANETS_TO_CALCULATE = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Mean Node',
  'True Node',
  'Lilith',
  'Chiron',
  'Ceres',
  'Pallas',
  'Juno',
  'Vesta',
];

/**
 * Check if code is running in browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Initialize Swiss Ephemeris WASM
 * Call once before making any calculations
 */
export async function initEphemeris(): Promise<void> {
  if (!isBrowser()) {
    throw new Error('Swiss Ephemeris requires browser environment');
  }

  if (swe) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[Swiss Ephemeris] Initializing WASM module...');

      // Dynamic import of sweph-wasm
      const mod = await import('sweph-wasm');
      console.log('[Swiss Ephemeris] WASM module loaded');

      const SwephModule = mod.default;
      console.log('[Swiss Ephemeris] Initializing SwephModule...');

      const instance = await SwephModule.init();
      console.log('[Swiss Ephemeris] SwephModule initialized');

      console.log(`[Swiss Ephemeris] Setting ephemeris path: ${EPHE_BASE_URL}, files:`, EPHE_FILES);
      await instance.swe_set_ephe_path(EPHE_BASE_URL, EPHE_FILES);
      console.log('[Swiss Ephemeris] Ephemeris path set successfully');

      swe = instance;
      console.log('[Swiss Ephemeris] ✅ Initialization complete');
    } catch (error) {
      initPromise = null; // Reset on error
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Swiss Ephemeris] ❌ Initialization failed:', errorMessage);
      console.error('[Swiss Ephemeris] Full error:', error);
      throw new Error(`Failed to initialize Swiss Ephemeris: ${errorMessage}`);
    }
  })();

  return initPromise;
}

/**
 * Get planet longitudes for a given Julian Day UT
 *
 * @param jdUT - Julian Day in UT
 * @returns Record mapping planet names to longitudes (0-360)
 */
export async function getPlanetLongitudes(jdUT: number): Promise<Record<string, number>> {
  await initEphemeris();

  if (!swe) {
    throw new Error('Swiss Ephemeris not initialized');
  }

  const iflag = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
  const out: Record<string, number> = {};

  for (const planet of PLANETS_TO_CALCULATE) {
    const planetId = PLANET_IDS[planet];

    if (planetId === undefined || planetId === -999) {
      continue;
    }

    const data = swe.swe_calc_ut(jdUT, planetId, iflag);
    const lon = data[0];

    if (typeof lon !== 'number') {
      throw new Error(`Invalid longitude for ${planet}`);
    }

    out[planet] = normalize360(lon);
  }

  return out;
}

/**
 * Get angles (ASC, DSC, MC, IC) for a given location and time
 *
 * @param jdUT - Julian Day in UT
 * @param lat - Latitude (-90 to 90)
 * @param lon - Longitude (-180 to 180)
 * @param hsys - House system ("P" = Placidus, "W" = Whole Sign, etc.)
 * @returns Angles object with ASC, DSC, MC, IC longitudes
 */
export async function getAngles(
  jdUT: number,
  lat: number,
  lon: number,
  hsys: string = 'P'
): Promise<Angles> {
  await initEphemeris();

  if (!swe) {
    throw new Error('Swiss Ephemeris not initialized');
  }

  try {
    console.log(`[swe_houses] Calling with: jdUT=${jdUT}, lat=${lat}, lon=${lon}, hsys='${hsys}'`);
    const res = swe.swe_houses(jdUT, lat, lon, hsys);
    console.log('[swe_houses] Result:', res);

    const asc = res.ascmc?.[0];
    const mc = res.ascmc?.[1];

    if (typeof asc !== 'number' || typeof mc !== 'number') {
      throw new Error(`Invalid angles: asc=${asc} (${typeof asc}), mc=${mc} (${typeof mc})`);
    }

    return buildAngles(normalize360(asc), normalize360(mc));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[swe_houses] ❌ Error:', errorMsg);
    console.error('[swe_houses] Full error:', error);
    throw error;
  }
}

/**
 * Get house cusps for a given location and time
 * Returns 12 house cusps
 *
 * @param jdUT - Julian Day in UT
 * @param lat - Latitude
 * @param lon - Longitude
 * @param hsys - House system
 * @returns Array of 12 house cusps (longitudes 0-360)
 */
export async function getHouseCusps(
  jdUT: number,
  lat: number,
  lon: number,
  hsys: string = 'P'
): Promise<number[]> {
  await initEphemeris();

  if (!swe) {
    throw new Error('Swiss Ephemeris not initialized');
  }

  const res = swe.swe_houses(jdUT, lat, lon, hsys);

  const cusps = res.cusps?.slice(0, 12) || [];

  return cusps.map((c) => (typeof c === 'number' ? normalize360(c) : 0));
}

/**
 * Get a single body's ecliptic longitude for any Julian Day
 * Used for iterative calculations (e.g. finding Human Design design date)
 *
 * @param jdUT - Julian Day in UT
 * @param bodyId - Swiss Ephemeris body ID (0=Sun, 1=Moon, 11=True Node, etc.)
 * @returns Ecliptic longitude 0–360
 */
export async function calcBodyLongitude(jdUT: number, bodyId: number): Promise<number> {
  await initEphemeris();

  if (!swe) {
    throw new Error('Swiss Ephemeris not initialized');
  }

  const iflag = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
  const data = swe.swe_calc_ut(jdUT, bodyId, iflag);
  const lon = data[0];

  if (typeof lon !== 'number') {
    throw new Error(`Invalid longitude for body ID ${bodyId}`);
  }

  return normalize360(lon);
}

/**
 * Reset ephemeris (for testing)
 */
export function resetEphemeris(): void {
  swe = null;
  initPromise = null;
}

/**
 * Check if ephemeris is initialized
 */
export function isEphemerisInitialized(): boolean {
  return swe !== null;
}
