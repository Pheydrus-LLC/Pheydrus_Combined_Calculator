import { describe, expect, it } from 'vitest';
import { ROADMAP_CLOSER, ROADMAP_PILLARS, ROADMAP_STEPS, ROADMAP_TITLE } from '../roadmap';
import { generateClientReportTemplate } from '../../services/pdfExport/clientReportTemplate';
import { DEMO_INTAKE, DEMO_RESULTS } from '../demoClientReport';

const html = generateClientReportTemplate(DEMO_RESULTS, DEMO_INTAKE, 'https://report.example.com');

// Same escaping the PDF template applies
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

describe('roadmap section in the PDF', () => {
  it.each([
    ROADMAP_TITLE,
    ROADMAP_CLOSER,
    ...ROADMAP_STEPS.flatMap((s) => [s.before, s.bold, s.after]),
    ...ROADMAP_PILLARS.flatMap((p) => [p.pillar, p.text]),
  ])('keeps the copy exactly as written: %s', (text) => {
    expect(html).toContain(esc(text));
  });

  it('replaces the old "bigger than fixing" box', () => {
    expect(html).not.toContain('This is bigger than fixing');
  });
});
