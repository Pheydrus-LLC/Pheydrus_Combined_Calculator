/**
 * Barbault Configuration 2026 — fixed transit facts.
 * Sign placements confirmed against user-supplied example (Virgo Rising -> Leo 12th, Aquarius 6th)
 * using the existing whole-sign house formula. No ephemeris computation needed for this feature.
 */

import type { ZODIAC_SIGNS } from '../../utils/data/constants';

export type TransitId =
  | 'neptune-sextile-pluto'
  | 'jupiter-opposite-pluto'
  | 'uranus-trine-pluto'
  | 'uranus-sextile-neptune'
  | 'nodes-aquarius-leo';

export interface TransitPlanetPlacement {
  planet: string;
  sign: (typeof ZODIAC_SIGNS)[number];
}

export interface TransitConfig {
  id: TransitId;
  tabLabel: string;
  title: string;
  aspectSummary: string;
  universalContext: string;
  placements: TransitPlanetPlacement[];
  reflectionQuestions: [string, string];
  actionPrompt: string;
}

export const BARBAULT_TRANSITS_2026: TransitConfig[] = [
  {
    id: 'neptune-sextile-pluto',
    tabLabel: 'Neptune ✶ Pluto',
    title: 'Neptune Sextile Pluto',
    aspectSummary: 'Neptune in Aries sextile Pluto in Aquarius',
    universalContext:
      'A 6-year cycle with 13 passes that last began at the Neptune-Pluto conjunction of 1891 — the era that birthed labor movements, civil rights, and the fight for individual rights — and is now returning with AI and technology as the new frontier.',
    placements: [
      { planet: 'Neptune', sign: 'Aries' },
      { planet: 'Pluto', sign: 'Aquarius' },
    ],
    reflectionQuestions: [
      "What system, industry, or belief that you've outgrown are you still complying with out of habit rather than truth?",
      'Where in your life is technology (AI, automation, new tools) already knocking on the door — and are you the one steering it, or reacting to it?',
    ],
    actionPrompt:
      "Name one outdated rule you're personally retiring in the next 30 days — in your work, your money, or your identity.",
  },
  {
    id: 'jupiter-opposite-pluto',
    tabLabel: 'Jupiter ☍ Pluto',
    title: 'Jupiter Opposite Pluto',
    aspectSummary: 'Jupiter in Leo opposite Pluto in Aquarius',
    universalContext:
      'The classic astrology signature of big money and extreme reversals of fortune — the last Jupiter-Pluto meeting in 2020 marked the beginning of lockdowns and the greatest transfer of wealth in modern history.',
    placements: [
      { planet: 'Jupiter', sign: 'Leo' },
      { planet: 'Pluto', sign: 'Aquarius' },
    ],
    reflectionQuestions: [
      'Where have you been playing small with money out of fear of being seen — and where is that costing you in the wealth transfer happening right now?',
      'What extreme reversal (in income, opportunity, or exposure) have you sensed coming, and are you positioned to catch it or be caught by it?',
    ],
    actionPrompt:
      "Name the one bold financial or visibility move you'll make in the next 90 days to get in front of this wealth transfer, not behind it.",
  },
  {
    id: 'uranus-trine-pluto',
    tabLabel: 'Uranus △ Pluto',
    title: 'Uranus Trine Pluto',
    aspectSummary: 'Uranus in Gemini trine Pluto in Aquarius',
    universalContext:
      'A harmonious air sign trine between Gemini and Aquarius that last occurred in 1922 — the era that gave birth to radio, mass communication, and the rewiring of how information moves through civilization.',
    placements: [
      { planet: 'Uranus', sign: 'Gemini' },
      { planet: 'Pluto', sign: 'Aquarius' },
    ],
    reflectionQuestions: [
      'What new way of communicating, learning, or connecting has felt effortless to you lately — and are you actually using it, or ignoring the opening?',
      'If information and networks are rewiring how influence spreads, where could you be an early mover instead of a late adopter?',
    ],
    actionPrompt:
      "Pick one new channel, platform, or network you'll actually commit to building on in the next 60 days.",
  },
  {
    id: 'uranus-sextile-neptune',
    tabLabel: 'Uranus ✶ Neptune',
    title: 'Uranus Sextile Neptune',
    aspectSummary: 'Uranus in Gemini sextile Neptune in Aries',
    universalContext:
      'The aspect tied to disclosure of what has been hidden — UFO files, shadow systems, the blurring of reality and illusion — demanding that individuals learn to trust their own intelligence and discernment in an age of deep fakes and AI.',
    placements: [
      { planet: 'Uranus', sign: 'Gemini' },
      { planet: 'Neptune', sign: 'Aries' },
    ],
    reflectionQuestions: [
      'Where have you been trusting an external authority, algorithm, or narrative more than your own gut — and what would change if you trusted yourself instead?',
      "What 'hidden' truth about yourself, your industry, or the world is surfacing for you right now that you can no longer unsee?",
    ],
    actionPrompt:
      "Name one decision you'll make this month based purely on your own discernment, even if it goes against consensus.",
  },
  {
    id: 'nodes-aquarius-leo',
    tabLabel: 'NN Aquarius / SN Leo',
    title: 'North Node in Aquarius / South Node in Leo',
    aspectSummary: 'The nodal axis: North Node in Aquarius, South Node in Leo',
    universalContext:
      'The collective axis is shifting from individual ego and spotlight toward community intelligence and collective systems — and it is altering the energy of both Jupiter in Leo and Pluto in Aquarius simultaneously.',
    placements: [
      { planet: 'North Node', sign: 'Aquarius' },
      { planet: 'South Node', sign: 'Leo' },
    ],
    reflectionQuestions: [
      'Where have you been over-relying on personal spotlight or ego-recognition instead of building something collective and system-wide?',
      'What community, network, or shared mission could you plug into that matters more than being the sole hero of your own story?',
    ],
    actionPrompt:
      "Name one way you'll contribute to something bigger than your personal brand in the next 30 days.",
  },
];
