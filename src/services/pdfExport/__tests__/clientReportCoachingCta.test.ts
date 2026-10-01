import { describe, expect, it } from 'vitest';
import { generateClientReportTemplate } from '../clientReportTemplate';
import {
  COACHING_CALL_URL,
  COACHING_CTA_PARAGRAPHS,
  COACHING_CTA_TITLE,
} from '../../../data/coachingCta';
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

  it('PDF books the same call the web report embeds', () => {
    expect(html).toContain(`href="${COACHING_CALL_URL}"`);
    expect(html).not.toContain('1-1-alignment-strategy-call-report');
  });

  it('PDF matches the 15-minute call described on the web report', () => {
    expect(html).toContain('Fifteen minutes');
    expect(html).not.toContain('30-minute');
  });
});
