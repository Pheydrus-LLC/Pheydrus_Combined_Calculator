/**
 * Voice notes from HeyJune introducing each pillar of the Invisible Forces report.
 *
 * Played inline in the report's pillar cards.
 *
 * To swap a recording: drop the file into public/audio/ and update its `src` below.
 * To hide a pillar's voice note everywhere, set its entry to null.
 */

export interface PillarVoiceNote {
  /** Path under public/, e.g. '/audio/pillar-1-intro.mp3' */
  src: string;
  label: string;
}

export const PILLAR_VOICE_NOTES: Record<1 | 2 | 3, PillarVoiceNote | null> = {
  1: {
    src: '/audio/pillar-1-intro.mp3',
    label: 'Hear Pillar 1 explained, from HeyJune herself',
  },
  2: {
    src: '/audio/pillar-2-intro.mp3',
    label: 'Hear Pillar 2 explained, from HeyJune herself',
  },
  3: {
    src: '/audio/pillar-3-intro.mp3',
    label: 'Hear Pillar 3 explained, from HeyJune herself',
  },
};

