/**
 * "What Another Year of This Pattern Could Cost You" section of the
 * Invisible Forces report. Shared by the web report and the PDF export.
 *
 * The year and number of years come from the client's longest malefic
 * transit, so the copy is built per client.
 */

import type { GoalCategory } from '../services/pdfExport/clientInterpretations';

export const COST_OF_INACTION_TITLE =
  "What Another Year of This Pattern Could Cost You (And Why It Doesn't Have To)";

const STUNTED_LINE: Record<GoalCategory, string> = {
  career: 'No more stunted career and financial growth.',
  love: 'No more stunted love and relationships.',
  general: 'No more stunted growth toward your goals.',
};

export interface CostOfInactionCopy {
  intro: string;
  /** Shown in red */
  yearLine: string;
  /** "The good news?" sentence, split so the years and "fraction of the time." can be bold */
  goodNews: { before: string; years: string; middle: string; fraction: string };
  noMore: string[];
  closer: string;
}

export function getCostOfInactionCopy(
  goal: GoalCategory,
  endYear: number | null,
  currentYear: number = new Date().getFullYear(),
): CostOfInactionCopy {
  const yearsRemaining = endYear ? endYear - currentYear : null;
  const hasYears = yearsRemaining !== null && yearsRemaining > 0;

  return {
    intro:
      'Right now, your pattern has a default path: another year of almost-breakthroughs, unfinished ideas, and promises that next month will be different.',
    yearLine: endYear
      ? `Without targeted deconditioning, the data shows these patterns will last well into ${endYear}.`
      : 'Without targeted deconditioning, the data shows these patterns will not resolve on their own.',
    goodNews: {
      before: `The good news? Patterns that can be identified can be broken. And you have the power to collapse ${hasYears ? 'those ' : ''}`,
      years: hasYears ? `${yearsRemaining} year${yearsRemaining === 1 ? '' : 's'}` : 'that timeline',
      middle: ' into a ',
      fraction: 'fraction of the time.',
    },
    noMore: [
      'No more 12 months of knowing exactly what to do, and watching yourself not do it.',
      STUNTED_LINE[goal],
      'No more brilliant ideas quietly collecting dust.',
      'No more telling yourself next month will be different.',
    ],
    closer: 'The pattern ends when you say it does.',
  };
}
