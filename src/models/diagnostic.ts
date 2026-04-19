/**
 * Angular Diagnostic — The Three Pillars Model
 * Type definitions for the grading system
 *
 * Pheydrus IP: Angular Houses = {1, 5, 7, 10, 11}
 * Malefics in angular houses → F (Pressure)
 * Benefics in angular houses → A (Support)
 * Final grade: weighted item score with pillar-level guardrails
 */

export type PillarGrade = 'F' | 'C' | 'A' | 'Neutral';
export type FinalGrade = 'A' | 'B' | 'C' | 'F';

export type DiagnosticSection =
  | 'Natal Angular'
  | 'Transit Angular'
  | 'Life Cycle'
  | 'Relocation Angular'
  | 'Address';

/**
 * Individual grade item — one planet or factor evaluated
 */
export interface GradeItem {
  source: string;
  pillar: 1 | 2 | 3;
  section: DiagnosticSection;
  planet?: string;
  house?: number;
  grade: PillarGrade;
  reason: string;
}

/**
 * Summary for one pillar
 */
export interface PillarSummary {
  pillar: 1 | 2 | 3;
  name: 'Structure' | 'Timing' | 'Environment';
  description: string;
  fCount: number;
  cCount: number;
  aCount: number;
  items: GradeItem[];
}

/**
 * Full diagnostic result
 */
export interface AngularDiagnosticResult {
  pillars: [PillarSummary, PillarSummary, PillarSummary];
  totalFs: number;
  totalCs: number;
  totalAs: number;
  score: number;
  finalGrade: FinalGrade;
  allItems: GradeItem[];
}

/**
 * Planet house result from destination calculation
 */
export interface PlanetHouseResult {
  planet: string;
  house: number;
}
