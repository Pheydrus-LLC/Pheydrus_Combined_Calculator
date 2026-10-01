/**
 * Which graded findings a pillar shows in the client report, and in what order.
 * Shared by the web report and the PDF so both show the same findings.
 */

import type { GradeItem, PillarSummary } from '../../models/diagnostic';

const GRADE_ORDER: Record<string, number> = { F: 0, C: 1, A: 2, Neutral: 3 };

const isFooterSection = (i: GradeItem) => i.section === 'Life Cycle' || i.section === 'Address';

/**
 * Pressures (F, C) and positives (A); neutral placements are left out.
 * Each planet shows once per pillar. Order: F, then C, then A, with
 * Life Cycle and Address findings last regardless of grade.
 */
export function getReportItems(pillar: PillarSummary): GradeItem[] {
  const seenPlanets = new Set<string>();
  const items = pillar.items.filter((i) => {
    if (i.grade !== 'F' && i.grade !== 'C' && i.grade !== 'A') return false;
    if (i.planet) {
      if (seenPlanets.has(i.planet)) return false;
      seenPlanets.add(i.planet);
    }
    return true;
  });

  return items.sort((a, b) => {
    const aFooter = isFooterSection(a) ? 1 : 0;
    const bFooter = isFooterSection(b) ? 1 : 0;
    if (aFooter !== bFooter) return aFooter - bFooter;
    return (GRADE_ORDER[a.grade] ?? 3) - (GRADE_ORDER[b.grade] ?? 3);
  });
}
