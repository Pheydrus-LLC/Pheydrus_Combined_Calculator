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
  BackCoverPage,
  ScorePage,
  ScoreMeaningPage,
  BeforeYouBeginPage,
  PatternPage,
  ForcesPage,
  ChapterOpenerPage,
  FindingPage,
  SolutionOpenerPage,
  CostPage,
  RoadmapStepsPage,
  RoadmapPillarsPage,
  RepairKitIntroPage,
  RepairKitPage,
  CoachingPage,
} from './BookPageContent';

export interface BookPage {
  id: string;
  /** Chapter name, shown in the header and the contents list */
  chapter: string;
  content: ReactNode;
  /** Covers and chapter title pages: artwork runs to the page edges, with no page frame or number */
  fullBleed?: boolean;
  /** Name in the table of contents, when it differs from `chapter` (e.g. "Chapter 4 · Your Solution") */
  contentsName?: string;
  /** Text starts at the top of the page, as in a printed book, rather than centred */
  alignTop?: boolean;
}

/** Pillar methods that fit on the first roadmap page alongside the two steps */
const ROADMAP_FIRST_PAGE_PILLARS = 2;

export function buildBookPages(
  results: ConsolidatedResults,
  intake: ClientIntakeData,
  options: { onOpenReport?: () => void } = {},
): BookPage[] {
  const ctx = getReportContext(results, intake);
  const date = new Date(results.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const findingCtx = { goal: ctx.goal, goalShort: ctx.goalShort, goalText: ctx.goalText, transits: ctx.transits };

  const pages: BookPage[] = [
    { id: 'cover', chapter: 'Cover', fullBleed: true, content: <CoverPage name={results.userInfo.name} /> },
    { id: 'score', chapter: 'Your Score', content: <ScorePage ctx={ctx} date={date} /> },
    { id: 'score-meaning', chapter: 'Your Score', content: <ScoreMeaningPage ctx={ctx} /> },
    { id: 'before', chapter: 'Your Score', content: <BeforeYouBeginPage /> },
    { id: 'pattern', chapter: 'Why This Happens', content: <PatternPage /> },
    { id: 'forces', chapter: 'Why This Happens', content: <ForcesPage /> },
  ];

  ([1, 2, 3] as const).forEach((n) => {
    const chapter = `Chapter ${n} · ${PILLAR_TITLES[n].title}`;
    const pillar = ctx.pillars[n - 1];
    const items = getReportItems(pillar);
    pages.push({ id: `pillar-${n}`, chapter, fullBleed: true, content: <ChapterOpenerPage ctx={ctx} n={n} /> });
    items.forEach((item, i) => {
      pages.push({
        id: `pillar-${n}-finding-${i + 1}`,
        chapter,
        content: (
          <FindingPage
            content={getFindingContent(item, findingCtx)}
            item={item}
            pillarItems={pillar.items}
            n={n}
            position={i + 1}
            total={items.length}
          />
        ),
      });
    });
  });

  pages.push(
    { id: 'solution', chapter: 'Your Solution', contentsName: 'Chapter 4 · Your Solution', fullBleed: true, content: <SolutionOpenerPage /> },
    { id: 'cost', chapter: 'Your Solution', content: <CostPage ctx={ctx} /> },
    { id: 'roadmap', chapter: 'Your Solution', content: <RoadmapStepsPage pillarCount={ROADMAP_FIRST_PAGE_PILLARS} /> },
    { id: 'roadmap-pillars', chapter: 'Your Solution', alignTop: true, content: <RoadmapPillarsPage fromPillar={ROADMAP_FIRST_PAGE_PILLARS} /> },
    { id: 'kit', chapter: 'Your Pillar Repair Kit', contentsName: 'Chapter 5 · Your Pillar Repair Kit', content: <RepairKitIntroPage /> },
    ...PILLAR_RESOURCE_CARDS.map((_, i) => ({ id: `kit-${i + 1}`, chapter: 'Your Pillar Repair Kit', content: <RepairKitPage index={i} /> })),
    { id: 'coaching', chapter: 'Beyond the Report', contentsName: 'Chapter 6 · Beyond the Report', content: <CoachingPage /> },
    { id: 'back-cover', chapter: 'Not The End', content: <BackCoverPage onOpenReport={options.onOpenReport} /> },
  );
  return pages;
}
