import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { PILLAR_VOICE_NOTES } from '../pillarVoiceNotes';

describe('pillar voice notes', () => {
  it.each([1, 2, 3] as const)('pillar %i recording exists in public/', (num) => {
    const note = PILLAR_VOICE_NOTES[num];
    if (!note) return;
    expect(existsSync(path.join(process.cwd(), 'public', note.src))).toBe(true);
  });
});
