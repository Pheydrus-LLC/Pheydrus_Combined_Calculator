import { describe, expect, it } from 'vitest';
import { getCostOfInactionCopy } from '../costOfInaction';

describe('cost of inaction copy', () => {
  it('names the end year and the years remaining', () => {
    const copy = getCostOfInactionCopy('career', 2033, 2026);
    expect(copy.yearLine).toBe(
      'Without targeted deconditioning, the data shows these patterns will last well into 2033.',
    );
    expect(copy.goodNews.before).toMatch(/collapse those $/);
    expect(copy.goodNews.years).toBe('7 years');
  });

  it('uses the singular for one year', () => {
    expect(getCostOfInactionCopy('career', 2027, 2026).goodNews.years).toBe('1 year');
  });

  it('falls back gracefully when there is no end year', () => {
    const copy = getCostOfInactionCopy('career', null, 2026);
    expect(copy.yearLine).toContain('will not resolve on their own');
    expect(copy.goodNews.before).not.toContain('those');
    expect(copy.goodNews.years).toBe('that timeline');
  });

  it('tailors the growth line to the goal', () => {
    expect(getCostOfInactionCopy('career', null).noMore).toContain(
      'No more stunted career and financial growth.',
    );
    expect(getCostOfInactionCopy('love', null).noMore).toContain(
      'No more stunted love and relationships.',
    );
    expect(getCostOfInactionCopy('general', null).noMore).toContain(
      'No more stunted growth toward your goals.',
    );
  });
});
