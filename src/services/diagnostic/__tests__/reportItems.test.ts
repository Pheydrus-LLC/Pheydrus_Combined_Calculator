import { describe, expect, it } from 'vitest';
import { getReportItems } from '../reportItems';
import type { GradeItem, PillarSummary } from '../../../models/diagnostic';
import { generateClientReportTemplate } from '../../pdfExport/clientReportTemplate';
import { DEMO_INTAKE, DEMO_RESULTS } from '../../../data/demoClientReport';

const item = (over: Partial<GradeItem>): GradeItem => ({
  source: 'x',
  pillar: 1,
  section: 'Natal Angular',
  grade: 'Neutral',
  reason: '',
  ...over,
});

const pillarOf = (items: GradeItem[]): PillarSummary =>
  ({ items, fCount: 0, cCount: 0, aCount: 0 }) as unknown as PillarSummary;

describe('getReportItems', () => {
  it.each([
    [1, 'Natal Angular', 'Jupiter', 1],
    [2, 'Transit Angular', 'Venus', 10],
    [3, 'Relocation Angular', 'Sun', 7],
  ] as const)('keeps a positive (A) benefic placement in pillar %i', (pillar, section, planet, house) => {
    const positive = item({ pillar, section, planet, house, grade: 'A', source: `${planet} in House ${house}` });
    expect(getReportItems(pillarOf([positive]))).toContainEqual(positive);
  });

  it('keeps non-planet positives (life cycle, address)', () => {
    const lifeCycle = item({ pillar: 2, section: 'Life Cycle', grade: 'A', source: 'Life Cycle Year 5' });
    const address = item({ pillar: 3, section: 'Address', grade: 'A', source: 'L1: 7' });
    expect(getReportItems(pillarOf([lifeCycle]))).toEqual([lifeCycle]);
    expect(getReportItems(pillarOf([address]))).toEqual([address]);
  });

  it('leaves out neutral placements and shows each planet once', () => {
    const items = [
      item({ planet: 'Mars', house: 2, grade: 'Neutral' }),
      item({ planet: 'Saturn', house: 1, grade: 'F', source: 'first' }),
      item({ planet: 'Saturn', house: 7, grade: 'F', source: 'dupe' }),
    ];
    expect(getReportItems(pillarOf(items)).map((i) => i.source)).toEqual(['first']);
  });

  it('orders pressures before positives, with life cycle and address last', () => {
    const items = [
      item({ section: 'Life Cycle', grade: 'F', source: 'life' }),
      item({ planet: 'Jupiter', grade: 'A', source: 'A' }),
      item({ planet: 'Uranus', grade: 'C', source: 'C' }),
      item({ planet: 'Pluto', grade: 'F', source: 'F' }),
    ];
    expect(getReportItems(pillarOf(items)).map((i) => i.source)).toEqual(['F', 'C', 'A', 'life']);
  });
});

describe('positives in the PDF', () => {
  it('shows every positive the demo client has, in every pillar', () => {
    const html = generateClientReportTemplate(DEMO_RESULTS, DEMO_INTAKE, 'https://report.example.com');
    const positives = DEMO_RESULTS.diagnostic!.pillars.flatMap((p) => getReportItems(p)).filter((i) => i.grade === 'A');
    expect(positives.length).toBeGreaterThan(0);
    for (const p of positives) expect(html).toContain(p.source);
  });
});
