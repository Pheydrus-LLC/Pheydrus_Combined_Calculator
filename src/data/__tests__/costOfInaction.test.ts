import { describe, expect, it } from 'vitest';
import { COST_OF_INACTION_TITLE, getCostOfInactionCopy } from '../costOfInaction';
import { generateClientReportTemplate } from '../../services/pdfExport/clientReportTemplate';
import { DEMO_INTAKE, DEMO_RESULTS } from '../demoClientReport';

describe('cost of inaction copy', () => {
  it('names the end year and the years remaining', () => {
    const copy = getCostOfInactionCopy('career', 2033, 2026);
    expect(copy.yearLine).toContain('the data points to 2033.');
    expect(copy.goodNews.before).toMatch(/collapse those $/);
    expect(copy.goodNews.years).toBe('7 years');
  });

  it('uses the singular for one year', () => {
    expect(getCostOfInactionCopy('career', 2027, 2026).goodNews.years).toBe('1 year');
  });

  it('falls back gracefully when there is no end year', () => {
    const copy = getCostOfInactionCopy('career', null, 2026);
    expect(copy.yearLine).toContain('does not self-resolve');
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

  it('appears in the PDF', () => {
    const html = generateClientReportTemplate(DEMO_RESULTS, DEMO_INTAKE, 'https://report.example.com');
    expect(html).toContain(COST_OF_INACTION_TITLE.replace(/'/g, '&#039;'));
    expect(html).toContain('The pattern ends when you say it does.');
    expect(html).not.toContain('Or - you begin the decondition now.');
  });
});
