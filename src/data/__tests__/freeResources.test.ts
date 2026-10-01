import { describe, expect, it } from 'vitest';
import { PILLAR_RESOURCE_CARDS, PILLAR_RESOURCES } from '../freeResources';

describe('free resources', () => {
  it('offers 5 resources across one card per pillar', () => {
    expect(PILLAR_RESOURCES).toHaveLength(5);
    expect(PILLAR_RESOURCE_CARDS.map((c) => c.pillar)).toEqual([1, 2, 3]);
  });

  it('puts the Astrological Calendar under Pillar 2: Timing', () => {
    const pillar2 = PILLAR_RESOURCE_CARDS.find((c) => c.pillar === 2)!;
    expect(pillar2.resources.map((r) => r.title)).toContain('Astrological Calendar');
  });

  it('gives every resource a full https link and a button label', () => {
    for (const r of PILLAR_RESOURCES) {
      expect(r.link.startsWith('https://')).toBe(true);
      expect(r.cta.length).toBeGreaterThan(0);
    }
  });
});
