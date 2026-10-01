/**
 * The Invisible Forces report as a list of book pages. Both book viewers
 * (page-turning spreads on wide screens, swipeable pages on phones) show this
 * same list, so the content is written once.
 *
 * Every word comes from the same sources as the scrolling report
 * (reportCopy, findingContent, the data files), so the two never disagree.
 */

import type { ReactNode } from 'react';
import type { ConsolidatedResults } from '../../../models';
import type { ClientIntakeData } from '../../../models/clientIntake';
import { getReportContext } from '../../../services/diagnostic/reportContext';
import { getReportItems } from '../../../services/diagnostic/reportItems';
import { getFindingContent } from '../../../services/diagnostic/findingContent';
import { PILLAR_TITLES } from '../../../data/reportCopy';
import { PILLAR_RESOURCE_CARDS } from '../../../data/freeResources';
import {
  CoverPage,
  ScorePage,
  BeforeYouBeginPage,
  PatternPage,
  ForcesPage,
  WindowPage,
  PillarOpenerPage,
  FindingPage,
  CostPage,
  RoadmapStepsPage,
  RoadmapPillarsPage,
  RepairKitPage,
  CoachingPage,
  BackCoverPage,
} from './BookPageContent';

export interface BookPage {
  id: string;
  /** Chapter name, shown in the header and the contents list */
  chapter: string;
  content: ReactNode;
}

// ── The book ─────────────────────────────────────────────────────────────────

export function buildBookPages(
  results: ConsolidatedResults,
  intake: ClientIntakeData,
  options: { onOpenReport?: () => void } = {},
): BookPage[] {
  const ctx = getReportContext(results, intake);
  const date = new Date(results.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const findingCtx = { goal: ctx.goal, goalShort: ctx.goalShort, goalText: ctx.goalText, transits: ctx.transits };

  const pages: BookPage[] = [
    { id: 'cover', chapter: 'Overview', content: <CoverPage ctx={ctx} name={results.userInfo.name} date={date} /> },
    { id: 'score', chapter: 'Overview', content: <ScorePage ctx={ctx} /> },
    { id: 'before', chapter: 'Overview', content: <BeforeYouBeginPage /> },
    { id: 'pattern', chapter: 'Why This Happens', content: <PatternPage /> },
    { id: 'forces', chapter: 'Why This Happens', content: <ForcesPage /> },
    { id: 'window', chapter: 'Why This Happens', content: <WindowPage ctx={ctx} /> },
  ];

  ([1, 2, 3] as const).forEach((n) => {
    const chapter = `Pillar ${n} · ${PILLAR_TITLES[n].title}`;
    const items = getReportItems(ctx.pillars[n - 1]);
    pages.push({ id: `pillar-${n}`, chapter, content: <PillarOpenerPage ctx={ctx} n={n} /> });
    items.forEach((item, i) => {
      pages.push({
        id: `pillar-${n}-finding-${i + 1}`,
        chapter,
        content: <FindingPage content={getFindingContent(item, findingCtx)} n={n} position={i + 1} total={items.length} />,
      });
    });
  });

  pages.push(
    { id: 'cost', chapter: 'Your Solution', content: <CostPage ctx={ctx} /> },
    { id: 'roadmap', chapter: 'Your Solution', content: <RoadmapStepsPage /> },
    { id: 'roadmap-pillars', chapter: 'Your Solution', content: <RoadmapPillarsPage /> },
    ...PILLAR_RESOURCE_CARDS.map((_, i) => ({ id: `kit-${i + 1}`, chapter: 'Your Pillar Repair Kit', content: <RepairKitPage index={i} /> })),
    { id: 'coaching', chapter: 'Your Next Step', content: <CoachingPage /> },
    { id: 'back-cover', chapter: 'Your Next Step', content: <BackCoverPage onOpenReport={options.onOpenReport} /> },
  );
  return pages;
}
