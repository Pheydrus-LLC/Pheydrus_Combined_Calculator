import { describe, expect, it } from 'vitest';
import { generateClientReportTemplate } from '../clientReportTemplate';
import { COACHING_CTA_PARAGRAPHS, COACHING_CTA_TITLE } from '../../../data/coachingCta';
import { DEMO_INTAKE, DEMO_RESULTS } from '../../../data/demoClientReport';

const html = generateClientReportTemplate(DEMO_RESULTS, DEMO_INTAKE, 'https://report.example.com');

describe('coaching call-to-action', () => {
  it('PDF uses the shared coaching title', () => {
    expect(html).toContain(COACHING_CTA_TITLE);
  });

  it.each(COACHING_CTA_PARAGRAPHS)('PDF keeps the copy exactly as written: %s', (paragraph) => {
    // esc() turns quotes into entities; compare against the escaped form
    expect(html).toContain(paragraph.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'));
  });

  it('PDF matches the 15-minute call described on the web report', () => {
    expect(html).toContain('In 15 minutes');
    expect(html).not.toContain('30-minute');
  });
});
