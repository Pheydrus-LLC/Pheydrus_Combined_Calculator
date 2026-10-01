import { describe, expect, it } from 'vitest';
import { buildBookPages } from '../bookPages';
import { DEMO_INTAKE, DEMO_RESULTS } from '../../../../data/demoClientReport';
import { getReportItems } from '../../../../services/diagnostic/reportItems';
import { PILLAR_RESOURCE_CARDS } from '../../../../data/freeResources';

const pages = buildBookPages(DEMO_RESULTS, DEMO_INTAKE);

describe('book pages', () => {
  it('opens on the cover and closes on the back cover', () => {
    expect(pages[0].id).toBe('cover');
    expect(pages[pages.length - 1].id).toBe('back-cover');
  });

  it('gives every page a unique id', () => {
    expect(new Set(pages.map((p) => p.id)).size).toBe(pages.length);
  });

  it('has an opener plus one page per finding for every pillar, in pillar order', () => {
    for (const n of [1, 2, 3] as const) {
      const findings = getReportItems(DEMO_RESULTS.diagnostic!.pillars[n - 1]);
      const ids = pages.filter((p) => p.id.startsWith(`pillar-${n}`)).map((p) => p.id);
      expect(ids).toEqual([`pillar-${n}`, ...findings.map((_, i) => `pillar-${n}-finding-${i + 1}`)]);
    }
    const order = pages.map((p) => p.id);
    expect(order.indexOf('pillar-1')).toBeLessThan(order.indexOf('pillar-2'));
    expect(order.indexOf('pillar-2')).toBeLessThan(order.indexOf('pillar-3'));
  });

  it('includes every Repair Kit card and the booking page', () => {
    for (let i = 1; i <= PILLAR_RESOURCE_CARDS.length; i++) expect(pages.some((p) => p.id === `kit-${i}`)).toBe(true);
    expect(pages.some((p) => p.id === 'coaching')).toBe(true);
  });

  it('keeps each chapter in one continuous run, so the contents list makes sense', () => {
    const seen: string[] = [];
    for (const p of pages) {
      if (seen[seen.length - 1] !== p.chapter) {
        expect(seen).not.toContain(p.chapter);
        seen.push(p.chapter);
      }
    }
  });
});
