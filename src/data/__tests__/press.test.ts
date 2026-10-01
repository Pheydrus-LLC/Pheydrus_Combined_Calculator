import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { PRESS_LOGOS_DARK, PRESS_LOGOS_LIGHT, PRESS_URL } from '../press';
import { generateClientReportTemplate } from '../../services/pdfExport/clientReportTemplate';
import { DEMO_INTAKE, DEMO_RESULTS } from '../demoClientReport';

const ORIGIN = 'https://report.example.com';

describe('press strip', () => {
  it.each([PRESS_LOGOS_LIGHT, PRESS_LOGOS_DARK])('logo file %s exists in public/', (src) => {
    expect(existsSync(path.join(process.cwd(), 'public', src))).toBe(true);
  });

  it('PDF shows the logos and links to the press page', () => {
    const html = generateClientReportTemplate(DEMO_RESULTS, DEMO_INTAKE, ORIGIN);
    expect(html).toContain(`src="${ORIGIN}${PRESS_LOGOS_DARK}"`);
    expect(html).toContain(`href="${PRESS_URL}"`);
    expect(html).toContain('As Seen On');
  });
});
