import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { generateClientReportTemplate } from '../clientReportTemplate';
import { PILLAR_VOICE_NOTES } from '../../../data/pillarVoiceNotes';
import { DEMO_INTAKE, DEMO_RESULTS } from '../../../data/demoClientReport';

const ORIGIN = 'https://report.example.com';
const pillars = [1, 2, 3] as const;

describe('pillar voice notes', () => {
  it.each(pillars)('pillar %i recording exists in public/', (num) => {
    const note = PILLAR_VOICE_NOTES[num];
    if (!note) return;
    expect(existsSync(path.join(process.cwd(), 'public', note.src))).toBe(true);
  });

  it.each(pillars)('PDF links to the pillar %i voice note with a full URL', (num) => {
    const note = PILLAR_VOICE_NOTES[num];
    if (!note) return;
    const html = generateClientReportTemplate(DEMO_RESULTS, DEMO_INTAKE, ORIGIN);
    expect(html).toContain(`href="${ORIGIN}${note.src}"`);
    expect(html).toContain(note.label);
  });

  it('PDF voice notes appear in pillar order', () => {
    const html = generateClientReportTemplate(DEMO_RESULTS, DEMO_INTAKE, ORIGIN);
    const positions = pillars
      .map((num) => PILLAR_VOICE_NOTES[num])
      .filter((note) => note !== null)
      .map((note) => html.indexOf(note.src));
    expect(positions.every((p) => p > -1)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});
