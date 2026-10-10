/**
 * What a single finding (one graded placement) says in the client report:
 * its label, grade, and either HeyJune's library write-up or, for placements
 * the library doesn't cover, the interpretation fallback. Shared by the
 * report's finding cards and the book's finding pages.
 */

import type { GradeItem } from '../../models/diagnostic';
import type { PlanetaryTransit } from '../../models/calculators';
import { getLibraryEntry, getDefaultSteps2 } from '../../data/planetHouseLibrary';
import { getMirrorLine, getTransmuteLine } from '../../data/reportCopy';
import {
  getItemInterpretation,
  getTransitEndYear,
  type GoalCategory,
} from '../pdfExport/clientInterpretations';
import { applyKmsStyle } from '../pdfExport/kmsStyle';

export interface FindingContext {
  goal: GoalCategory;
  goalShort: string;
  goalText: string;
  transits: PlanetaryTransit[];
}

export interface FindingContent {
  label: string;
  grade: GradeItem['grade'];
  /** When a transit-driven finding ends, if known */
  endYear: number | null;
  impact: 'hurts' | 'caution' | 'helps' | null;
  /** HeyJune's write-up, when the library covers this placement */
  library: { hurtOrHelp: string; note: string | null; steps: [string, string] } | null;
  /** Used when there's no library entry */
  fallback: { mirror: string | null; interpretation: string; transmute: string | null } | null;
  /** Small print shown under the finding (address findings only) */
  disclaimer: string | null;
}

export const ADDRESS_DISCLAIMER =
  'If your address is unique, the calculator will default to giving the L1 instead of the L3.';

const IMPACT: Partial<Record<GradeItem['grade'], FindingContent['impact']>> = {
  F: 'hurts',
  C: 'caution',
  A: 'helps',
};

export function getFindingContent(item: GradeItem, ctx: FindingContext): FindingContent {
  // Clients see the graded address level labelled L1, with ADDRESS_DISCLAIMER explaining it
  const addressLevel =
    item.section === 'Address' && item.source ? ` (${item.source.split(':')[0].replace('L3', 'L1')})` : '';
  const disclaimer = item.section === 'Address' ? ADDRESS_DISCLAIMER : null;
  const label = item.section === 'Address' ? `🏠 Address Energy${addressLevel}` : item.source;
  const endYear =
    item.section === 'Transit Angular' || item.section === 'Life Cycle'
      ? getTransitEndYear(item.planet ?? '', ctx.transits)
      : null;
  const entry = getLibraryEntry(item.planet, item.house, item.pillar);

  if (entry) {
    return {
      label,
      grade: item.grade,
      endYear,
      impact: IMPACT[item.grade] ?? null,
      library: {
        hurtOrHelp: applyKmsStyle(entry.hurt_or_help),
        note: entry.note ? applyKmsStyle(entry.note) : null,
        steps: [
          applyKmsStyle(entry.steps),
          applyKmsStyle(entry.steps2 ?? getDefaultSteps2(item.planet ?? '', item.pillar)),
        ],
      },
      fallback: null,
      disclaimer,
    };
  }

  return {
    label,
    grade: item.grade,
    endYear,
    impact: null,
    library: null,
    fallback: {
      mirror: getMirrorLine(item, ctx.goalShort),
      interpretation: applyKmsStyle(getItemInterpretation(item, ctx.goal, ctx.transits, ctx.goalText)),
      transmute: getTransmuteLine(item),
    },
    disclaimer,
  };
}
