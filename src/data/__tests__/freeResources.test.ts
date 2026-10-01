import { describe, expect, it } from 'vitest';
import { BONUS_RESOURCE_CARD, PILLAR_RESOURCE_CARDS, PILLAR_RESOURCES } from '../freeResources';

describe('free resources', () => {
  it('offers 4 resources across one card per pillar, plus 1 bonus', () => {
    expect(PILLAR_RESOURCES).toHaveLength(4);
    expect(PILLAR_RESOURCE_CARDS.map((c) => c.pillar)).toEqual([1, 2, 3]);
    expect(BONUS_RESOURCE_CARD.pillar).toBeNull();
    expect(BONUS_RESOURCE_CARD.resources).toHaveLength(1);
  });

  it('gives every resource a full https link and a button label', () => {
    for (const r of [...PILLAR_RESOURCES, ...BONUS_RESOURCE_CARD.resources]) {
      expect(r.link).toMatch(/^https:\/\//);
      expect(r.cta.length).toBeGreaterThan(0);
    }
  });
});
