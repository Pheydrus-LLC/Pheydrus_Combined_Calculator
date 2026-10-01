/**
 * The per-client values the report is built from (goal, location, transits,
 * end year of the active pattern, and so on), worked out once from the
 * calculator results and intake answers.
 */

import type { ConsolidatedResults } from '../../models';
import type { ClientIntakeData } from '../../models/clientIntake';
import { GOAL_LABEL, GOAL_SHORT } from '../../data/reportCopy';
import { detectGoalCategory, getLongestMaleficTransit } from '../pdfExport/clientInterpretations';

export function getReportContext(results: ConsolidatedResults, intake: ClientIntakeData, now = new Date()) {
  const diagnostic = results.diagnostic!;
  const goal = detectGoalCategory(intake.desiredOutcome);
  const transits = results.calculators.transits?.transits ?? [];
  const [p1, p2, p3] = diagnostic.pillars;
  const diagnosticItems =
    diagnostic.allItems.length > 0 ? diagnostic.allItems : [...p1.items, ...p2.items, ...p3.items];
  const longest = getLongestMaleficTransit(diagnosticItems, transits);
  const endYear = longest?.endYear ?? null;

  return {
    goal,
    goalShort: GOAL_SHORT[goal],
    goalLabel: GOAL_LABEL[goal],
    goalText: intake.desiredOutcome,
    location: results.userInfo.currentLocation || '',
    transits,
    pillars: [p1, p2, p3] as const,
    finalGrade: diagnostic.finalGrade,
    longest,
    endYear,
    yearsRemaining: endYear ? endYear - now.getFullYear() : null,
    forceCount: (diagnostic.totalFs ?? 0) + (diagnostic.totalCs ?? 0),
  };
}

export type ReportContext = ReturnType<typeof getReportContext>;
