import { describe, expect, it } from 'vitest';
import { generateClientReportTemplate } from '../clientReportTemplate';
import { BONUS_RESOURCE, PILLAR_RESOURCES } from '../../../data/freeResources';
import { DEMO_INTAKE, DEMO_RESULTS } from '../../../data/demoClientReport';

const html = generateClientReportTemplate(DEMO_RESULTS, DEMO_INTAKE, 'https://report.example.com');

// Escaped the same way the template escapes attribute values.
const inHtml = (s: string) => s.replace(/&/g, '&amp;');

describe('free resources', () => {
  it('offers 4 resources plus 1 bonus, covering every pillar', () => {
    expect(PILLAR_RESOURCES).toHaveLength(4);
    expect(new Set(PILLAR_RESOURCES.map((r) => r.pillar))).toEqual(new Set([1, 2, 3]));
    expect(BONUS_RESOURCE.pillar).toBeNull();
  });

  it.each([...PILLAR_RESOURCES, BONUS_RESOURCE])('PDF links to $title', (resource) => {
    expect(html).toContain(`href="${inHtml(resource.link)}"`);
    expect(html).toContain(resource.title);
  });

  it('PDF shows the checkout code for resources that need one', () => {
    for (const resource of PILLAR_RESOURCES.filter((r) => r.code)) {
      expect(html).toContain(resource.code);
    }
  });

  it('PDF no longer advertises the old paid trainings', () => {
    expect(html).not.toContain('VIPTraining');
    expect(html).not.toContain('mysamcart.com');
  });
});
