/**
 * Story content for the Once-In-A-Century Wealth & Identity Upgrade intro flow:
 * Page 1 (letter) and Page 2 (historical timeline), shown before the calculator.
 * Copy is author-provided verbatim; only the structural breakdown (paragraphs,
 * timeline nodes) is derived here for rendering.
 */

import type { TransitId } from './config';

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  highlight?: boolean;
}

// ── Page 1: Intro letter ─────────────────────────────────────────────────────

export const INTRO_LETTER_PARAGRAPHS: string[] = [
  'Look at who is making money right now.',
  'AI creators. People building digital businesses. Anyone who figured out how to use communication as a wealth tool. This is not luck or hustle. It is the final wave of a 130-year cycle that started in 1891 when Neptune and Pluto met in Gemini — the sign of communication, information, and the split world — and seeded every tool that followed. The telegraph. Radio. Television. The internet. Social media. AI. Same seed. Same cycle.',
  'For most of that 130 years, the tools were controlled by a small group. Hollywood. Governments. Corporations. The Boomer celebrity era. Switching lanes was hard — not impossible, but the system was not built for the average person to cross over. Power stayed concentrated.',
  'Then Pluto moved from Leo through Capricorn and into Aquarius. Power is now structurally moving toward the masses. For the first time in over a century, there is a genuine window to switch roads — to cross lanes and plant yourself on the side of history that is actually being built right now.',
  'That window is open in July 2026. And it will not stay open.',
  'In Outer Planets 1.0, you learned how the outer planets show up individually in your chart.',
  'This is different. In this training/calculator, you will learn for the first time:',
];

export const INTRO_LETTER_LEARN_LIST: string[] = [
  "The RELATIONSHIPS between these outer planets — how they are forming a configuration called Barbault's Basket that has never occurred in recorded history in this exact form",
  'How those relationships are having a direct effect on YOUR specific chart right now — which life areas, which identity upgrades, which wealth channels are being activated',
  'How to use that knowledge to participate in what is being built next — not watch it happen to someone else',
];

export const INTRO_LETTER_CLOSING_PARAGRAPHS: string[] = [
  'A new civilization is being seeded. This is the map for how you find your place in it.',
  'Select your rising sign in page 3 and begin.',
];

// ── Page 2: Historical timeline ──────────────────────────────────────────────

export const TIMELINE_INTRO_PARAGRAPHS: string[] = [
  'The inner planets (Sun, Moon, Mercury) affect your week. The outer planets (Uranus, Neptune, Pluto) shape civilizations. Some take over 100 years to orbit the sun once.',
  'Every major revolution, technological breakthrough, and collapse of empire has happened under a specific outer planet configuration. Most people never notice these patterns until after the fact.',
];

export const PATTERN_RECOGNITION_EVENTS: TimelineEvent[] = [
  { year: '1929', title: 'Great Depression', description: 'Uranus square Pluto.' },
  { year: '2001', title: 'Dot-com bust', description: 'Pluto in Sagittarius.' },
  { year: '2008', title: 'Housing market collapse', description: 'Pluto entering Capricorn.' },
  {
    year: '2020',
    title: 'COVID pandemic',
    description: 'The greatest single wealth transfer in modern history. Jupiter conjunct Pluto.',
  },
];

export const MASTER_TIMELINE: TimelineEvent[] = [
  {
    year: '1891',
    title: 'Neptune meets Pluto in Gemini',
    description:
      'The conjunction that seeds everything that follows for 130 years. Gemini is the sign of the twins — communication, information, duality, division. The telegraph, telephone, radio, film, television, the internet, social media, and AI all trace to this seed. So does every civilizational split: left versus right, East versus West, the Cold War, race wars, gender wars, class wars, vaxxed versus unvaxxed, globalists versus nationalists. Two sides, always, from the same seed.',
  },
  {
    year: '1929',
    title: 'The Great Depression',
    description: 'Uranus square Pluto.',
  },
  {
    year: '1940s–1950s',
    title: 'The consolidation era begins',
    description:
      'Pluto moves into Leo, Neptune moves into Libra. The Gemini communication tools get picked up by Leo (the king, the celebrity, singular creative authority) and filtered through Libra (beauty, image, optics, curated aesthetic). Hollywood, television networks, governments, and corporations broadcast their power through a controlled, beautiful, aspirational, gatekept lens.',
  },
  {
    year: '1950–1961',
    title: 'The Boomer celebrity era is born',
    description:
      'First tight Neptune sextile Pluto pass. Pluto in Leo, Neptune in Libra. Hollywood. The American Dream aesthetic. Elvis. Marilyn Monroe. A small number of chosen, beautiful, powerful people spoke, and everyone else listened.',
  },
  {
    year: '1960s',
    title: 'Institutions questioned at mass scale',
    description:
      'Uranus sextile Neptune. ARPANET — the direct predecessor of the internet — is initiated. Civil rights legislation passes. Collective consciousness permanently shifts.',
  },
  {
    year: '1977–1986',
    title: 'Individualism goes global',
    description: 'Second tight Neptune sextile Pluto pass. Punk, hip hop, MTV, the personal computer.',
  },
  {
    year: '1993',
    title: 'The Disclosure Project launches',
    description: 'The conversation about what governments have been hiding begins to go mainstream.',
  },
  {
    year: '2001',
    title: 'The dot-com bust',
    description: 'Pluto in Sagittarius.',
  },
  {
    year: '2002–2016',
    title: 'The most polarized decade in modern memory',
    description: 'Neptune and Pluto diverge to their widest point in the sextile cycle.',
  },
  {
    year: '2007–2008',
    title: 'The world reconnects — and the housing market collapses',
    description:
      'The North Node/South Node Aquarius-Leo axis was last active: the iPhone launches, social media is born, and the way humans connect is permanently restructured in 18 months. At the same time, Pluto enters Capricorn and the housing market collapses — the global financial system nearly breaks.',
  },
  {
    year: '2020',
    title: 'COVID and the greatest wealth transfer in modern history',
    description:
      'Jupiter conjunct Pluto. The pandemic begins. The greatest single transfer of wealth in modern history follows within 12 months.',
  },
  {
    year: '2025–2026',
    title: 'Disclosure returns',
    description:
      'Uranus sextile Neptune re-forms. UAP files are officially released. Deepfakes, AI-generated content, and personalized algorithm bubbles mean every person now lives inside a different version of what is real.',
  },
  {
    year: '2026',
    title: "Barbault's Basket — now",
    description:
      'All five transits converge: Neptune sextile Pluto (final chapter, peaking July 24), Jupiter opposite Pluto (exact July 20), Uranus trine Pluto, Uranus back in Gemini, and the North Node/South Node axis returning to Aquarius/Leo. A configuration that has never occurred in recorded history in this exact form.',
    highlight: true,
  },
];

export const CIVILIZATION_ARC_PARAGRAPHS: string[] = [
  'The civilization we have been living in was built by these three planets — and it started in 1891.',
  'In 1891, Neptune and Pluto met in Gemini. That single conjunction seeded everything that followed for the next 130 years.',
  'Gemini is the sign of the twins. Communication, information, duality, division. And that is exactly what it built — both sides simultaneously.',
  'The communication tools it seeded: the telegraph, telephone, radio, film, television, the internet, social media, AI. Every tool that connected the modern world was born from that 1891 Gemini seed.',
  'The division it seeded: left versus right, East versus West, the Cold War, race wars, gender wars, class wars, vaxxed versus unvaxxed, globalists versus nationalists. Every civilizational split of the last 130 years carries the Gemini fingerprint. Two sides. Always two sides.',
  'Gemini built the most connected world in human history and the most divided one. The advancement and the fracture came from the same seed.',
  'Then as the cycle unfolded, Pluto moved into Leo and Neptune moved into Libra (1940s to late 1950s). This is when everything got consolidated.',
  'The communication tools built in Gemini got picked up by Leo (the sign of the king, the celebrity, the singular creative authority) and filtered through Libra (the sign of beauty, image, optics, and the perfectly curated aesthetic).',
  'A small number of people — Hollywood, television networks, governments, corporations — used the new Gemini tools to broadcast their Leo power through a Libra lens. Controlled. Beautiful. Aspirational. Gatekept.',
  'This is where the celebrity era was born. The Boomer generation. The American Dream aesthetic. Elvis. Marilyn Monroe. The idea that a small number of chosen, beautiful, powerful people spoke — and everyone else listened.',
  'Communication became a weapon of consolidation. The tools of connection were used to concentrate wealth, status, and narrative control in very few hands.',
  'That era is now closing. And what is happening next is a direct inversion of it.',
  'Pluto has moved from Leo into Aquarius — the exact opposite sign. Power is inverting. What was concentrated in the few is being distributed to the many.',
  'Neptune has moved from Libra into Aries. The era of curated optics, polished aesthetics, and beauty as currency is over. Aries is raw, direct, fast, and real. The new aesthetic is authenticity over perfection. Speed over beauty. Brass tacks over image.',
  'But here is what most people miss: Jupiter is still in Leo right now. The Leo creative energy did not disappear. It inverted in distribution. Before, one Leo — a celebrity, a network, a government — broadcast to millions of passive receivers. Now millions of individuals each get to be their own Leo. Everyone is the content creator. Everyone is the broadcaster. Everyone has the microphone.',
  'The same Gemini communication revolution that was hijacked by Leo power through a Libra filter for 130 years is now being handed back. The technology is the same. The distribution is inverted. The aesthetic is inverted. The gatekeeping is gone.',
  'Whether people use it for collective good or collective chaos — that is the Aquarius question. The information moves either way. The era of one voice speaking to millions is over. The era of millions of voices speaking simultaneously has begun. You are one of them.',
];

export interface TransitHistory {
  subtitle: string;
  timeline: TimelineEvent[];
}

export const TRANSIT_HISTORIES: Record<TransitId, TransitHistory> = {
  'nodes-aquarius-leo': {
    subtitle:
      'The cosmic compass flips from individual ego and spotlight toward collective intelligence and systems.',
    timeline: [
      {
        year: '2007–2008',
        title: 'Last time this axis was active',
        description:
          'The iPhone launched. Social media was born. The way humans connect was permanently restructured in 18 months.',
      },
      {
        year: 'Now',
        title: 'The axis returns',
        description: 'The question is not who gets the spotlight. The question is what we build together with it.',
        highlight: true,
      },
    ],
  },
  'neptune-sextile-pluto': {
    subtitle:
      'The final chapter of a 100-year relationship that has been the background frequency of every major collective shift since World War II.',
    timeline: [
      {
        year: '1891',
        title: 'The cycle begins',
        description: 'Neptune and Pluto meet in Gemini. The cycle that built the modern world began.',
      },
      {
        year: '1950–1961',
        title: 'First tight sextile',
        description:
          'Pluto in Leo, Neptune in Libra. The Boomer era. Hollywood. Celebrity. The birth of the American Dream aesthetic and the gatekept microphone.',
      },
      {
        year: '1977–1986',
        title: 'Second tight pass',
        description: 'Punk, hip hop, MTV, the personal computer. Individualism goes global.',
      },
      {
        year: '2002–2016',
        title: 'Widest divergence',
        description:
          'The planets diverged to their widest point. The most polarized, fractured decade in modern memory.',
      },
      {
        year: '2026–2032',
        title: 'The final chapter',
        description:
          'The final 13 exact passes. After this the sextile fades for nearly 200 years. July 24 is the peak of the final chapter. What gets seeded now carries forward for generations.',
        highlight: true,
      },
    ],
  },
  'jupiter-opposite-pluto': {
    subtitle: 'The classic signature of extreme reversals of fortune and massive wealth redistribution.',
    timeline: [
      {
        year: '2008',
        title: 'The housing market collapses',
        description: 'Pluto entered Capricorn. The global financial system nearly broke.',
      },
      {
        year: '2020',
        title: 'COVID and the greatest wealth transfer',
        description:
          'Jupiter conjunct Pluto. COVID began. The greatest single transfer of wealth in modern history followed within 12 months.',
      },
      {
        year: 'July 20, 2026',
        title: 'The fork in the road',
        description:
          'Jupiter opposite Pluto, exact. In 2020 it happened to people. An opposition places you at a fork — you choose which side of the transfer you land on.',
        highlight: true,
      },
    ],
  },
  'uranus-trine-pluto': {
    subtitle: 'A harmonious flow between disruption and collective transformation. Last seen in 1922.',
    timeline: [
      {
        year: '1860s',
        title: 'Continents connect',
        description: 'Uranus in Gemini. The transcontinental telegraph connected continents for the first time.',
      },
      {
        year: '1921–1922',
        title: 'Radio reaches the masses',
        description:
          'Last Uranus trine Pluto. Commercial radio invented. Information reached ordinary people at mass scale for the first time.',
      },
      {
        year: '1942–1948',
        title: 'The computer age begins',
        description:
          'Uranus in Gemini again. The first programmable computers invented. Radar. The entire information infrastructure of the post-war world.',
      },
      {
        year: '2026',
        title: 'AI takes the baton',
        description:
          'Uranus in Gemini again. AI is doing what the telegraph, the computer, and the internet did before it. The trine means disruption and transformation are working with each other, not against each other.',
        highlight: true,
      },
    ],
  },
  'uranus-sextile-neptune': {
    subtitle: 'The transit of disclosure. What has been hidden surfaces. Individual discernment becomes a survival skill.',
    timeline: [
      {
        year: '1960s',
        title: 'Institutions questioned at mass scale',
        description:
          'ARPANET initiated — the direct predecessor of the internet. Civil rights legislation passed. Collective consciousness permanently shifted.',
      },
      {
        year: '1993',
        title: 'Disclosure goes mainstream',
        description:
          'The Disclosure Project launched. The conversation about what governments have been hiding began to go mainstream.',
      },
      {
        year: '2025–2026',
        title: 'The files open',
        description:
          'UAP files officially released. Deep fakes, AI-generated content, and personalized algorithm bubbles mean every person now lives inside a different version of what is real. Trusting your own intelligence is not a spiritual practice anymore. It is a survival skill.',
        highlight: true,
      },
    ],
  },
};

export const WHAT_THIS_MEANS_PARAGRAPHS: string[] = [
  'The version of you that was built inside the old operating system is now working against you. That version was shaped by conditions that no longer exist.',
  'The gatekeeping era rewarded people who performed for the approval of a small number of powerful voices. That era is over.',
  'The new era hands you the microphone. But a microphone in the hands of someone still running old conditioning just amplifies the old pattern. Louder. Faster. To more people.',
  'This is why identity upgrade is not optional right now. The tools are available to everyone. What determines who benefits from them is who you have become on the inside.',
  'Where these transits land in your chart tells you exactly which area of your life is being rebuilt and which old identity is being asked to release.',
  'This worksheet is the map. One rising sign. Five transits. A written record of who you are choosing to become during the most significant civilizational shift in over a century.',
];
