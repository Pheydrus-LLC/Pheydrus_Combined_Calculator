/**
 * Angular Diagnostic Constants
 * Planet classifications, angular houses, and grading thresholds
 *
 * OWNER OVERRIDE: These classifications take precedence over the source PDFs.
 * - Mars is malefic in Pillars 1 and 3
 * - Neptune is malefic in all 3 Pillars
 * - Jupiter is benefic in all 3 Pillars
 * - Sun is benefic in all 3 Pillars
 */

// Pheydrus Angular Houses (NOT traditional {1,4,7,10})
export const PHEYDRUS_ANGULAR_HOUSES = new Set([1, 5, 7, 10]);

// ---------------------------------------------------------------------------
// Pillar 1 — STRUCTURE (Natal)
// ---------------------------------------------------------------------------
export const PILLAR_1_MALEFICS = new Set(['Pluto', 'Saturn', 'Uranus', 'Mars', 'Neptune']);
export const PILLAR_1_BENEFICS = new Set(['Sun', 'Moon', 'Venus', 'Jupiter']);
// Sun or Venus in 8th or 12th house → F regardless of angular status
export const PILLAR_1_SOFT_SPOT_PLANETS = new Set(['Sun', 'Venus']);
export const PILLAR_1_SOFT_SPOT_HOUSES = new Set([8, 12]);

// ---------------------------------------------------------------------------
// Pillar 2 — TIMING (Transits)
// ---------------------------------------------------------------------------
export const PILLAR_2_MALEFICS = new Set(['Neptune', 'Pluto', 'Saturn', 'Uranus']);
// Benefics captured but NOT scored (short duration)
export const PILLAR_2_BENEFICS = new Set(['Sun', 'Moon', 'Venus', 'Jupiter']);
// Malefic transiting these non-angular houses also → F
export const PILLAR_2_PRESSURE_HOUSES = new Set([2, 6, 8, 11]);

// ---------------------------------------------------------------------------
// Pillar 3 — ENVIRONMENT (Relocation)
// ---------------------------------------------------------------------------
export const PILLAR_3_MALEFICS = new Set(['Neptune', 'Pluto', 'Saturn', 'Uranus', 'Mars']);
export const PILLAR_3_BENEFICS = new Set(['Sun', 'Moon', 'Venus', 'Jupiter']);
// Sun or Venus in 8th or 12th house at current location → F (mirrors Pillar 1 soft-spot rule)
export const PILLAR_3_SOFT_SPOT_PLANETS = new Set(['Sun', 'Venus']);
export const PILLAR_3_SOFT_SPOT_HOUSES = new Set([8, 12]);
// Outer malefics in pressure houses → C (mirrors Pillar 2 pressure rule; Mars excluded)
export const PILLAR_3_PRESSURE_PLANETS = new Set(['Neptune', 'Pluto', 'Saturn', 'Uranus']);
export const PILLAR_3_PRESSURE_HOUSES = new Set([2, 6, 8, 11]);

// ---------------------------------------------------------------------------
// Life Cycle grading
// ---------------------------------------------------------------------------
export const LIFE_CYCLE_F_YEARS = new Set([1, 4, 9]);
export const LIFE_CYCLE_A_YEARS = new Set([5]);

// ---------------------------------------------------------------------------
// Address grading
// ---------------------------------------------------------------------------
export const ADDRESS_F_NUMBERS = new Set([3, 6, 8, 9]);
export const ADDRESS_C_NUMBERS = new Set([1, 4, 5]);
export const ADDRESS_A_NUMBERS = new Set([2, 7, 11]);

// Address level names to grade (from address calculator output)
// 'L3' = combined Unit Number + Building Number + Street Name, reduced to single digit (11 preserved)
export const ADDRESS_GRADED_LEVELS = ['L3'] as const;

// ---------------------------------------------------------------------------
// Final grade thresholds
// ---------------------------------------------------------------------------
// Score = (F count × 1) + (C count × 0.5)
export function computeFinalGrade(score: number): 'A' | 'B' | 'C' | 'F' {
  if (score > 6) return 'F';
  if (score >= 4) return 'C';
  if (score >= 2) return 'B';
  return 'A';
}
