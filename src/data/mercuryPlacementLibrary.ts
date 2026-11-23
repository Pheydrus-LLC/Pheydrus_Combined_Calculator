/**
 * Mercury Placement Tool — Content Library
 * Source: "Mercury Placement Tool — Content & Logic Spec" (Pheydrus Internal)
 *
 * One grounded, plain-language sentence per sign and per house (no high/low split),
 * short phrases for the nine classical/outer aspect planets, and a hedged
 * natal-retrograde clause bank.
 */

export const DIFFICULT_ASPECTS = ['Conjunction', 'Square', 'Opposition'];
export const EASY_ASPECTS = ['Trine', 'Sextile'];

export const MERCURY_ASPECT_PLANETS = [
  'Sun',
  'Moon',
  'Mars',
  'Venus',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

/** Mercury-in-sign communication style, one sentence per sign. */
export const MERCURY_SIGN_BLURBS: Record<string, string> = {
  Aries:
    'This gives your communication a bold, direct edge — you speak first and think out loud, unafraid of a little friction.',
  Taurus:
    "This gives your communication a slow, deliberate quality — you trust your gut over a rush to conclusions, and you're drawn to concrete, sensory language over abstraction.",
  Gemini:
    'This gives your communication a quick, curious edge — you take in the world fast, connect ideas easily, and have a natural affinity for writing and getting a message out.',
  Cancer:
    'This gives your communication an emotional, nurturing quality — you speak in a way that tends to and heals the people around you.',
  Leo: 'This gives your communication a dramatic, expressive edge — you have a need to be heard.',
  Virgo:
    'This gives your communication a precise, detail-oriented edge — you notice what others miss and communicate with real exactingness, whether you\'re mentoring, editing, or refining a craft.',
  Libra:
    "This gives your communication a diplomatic, charming edge — you're wired for relationship and aesthetics, and you're always learning how to bring more calm into the conversation.",
  Scorpio:
    "This gives your communication a deep, probing edge — you're comfortable going where others won't, examining what's hidden and unflinching in the face of the dark side of things.",
  Sagittarius:
    'This gives your communication an expansive, blunt edge — you think in big philosophical strokes and speak your beliefs plainly, even dogmatically.',
  Capricorn:
    'This gives your communication a structured, authoritative edge — you speak like someone building a legacy, with discipline behind every word.',
  Aquarius:
    "This gives your communication an unconventional, rebellious edge — you're the one breaking the rules, seeing the vision nobody else sees yet, comfortable as the loner in the room.",
  Pisces:
    'This gives your communication an intuitive, fluid edge — poetic, compassionate, and boundaryless, often channeling something beyond the purely rational.',
};

/** Mercury-in-house domain sentence, framed as "in [house]'s domain: ___". */
export const MERCURY_HOUSE_BLURBS: Record<number, string> = {
  1: 'In your 1st house\'s domain, that shows up in yourself — your very identity and physical presence carry the message.',
  2: 'In your 2nd house\'s domain, that shows up around value and resources — how you talk about money, and what you believe you and your work are worth.',
  3: "In your 3rd house's domain, that shows up in how you perceive the world — you see structures and patterns that nobody else does, often with a natural affinity for writing.",
  4: "In your 4th house's domain, that shows up in your private inner world — the personal, the emotional, home and family.",
  5: "In your 5th house's domain, that shows up in creativity and performance — children, entertainment, love affairs, and indulgence.",
  6: "In your 6th house's domain, that shows up in craft and daily life — mentorship, the grind, and a kind of devoted service.",
  7: "In your 7th house's domain, that shows up in your one-on-one relationships — romantic and otherwise.",
  8: "In your 8th house's domain, that shows up in deep, transformative conversations — the taboo, intimacy, and what's inherited.",
  9: "In your 9th house's domain, that shows up in philosophy, religion, education, law, and long-distance travel.",
  10: "In your 10th house's domain, that shows up in your public mission — legacy, reaching the masses, and career.",
  11: "In your 11th house's domain, that shows up in community and the collective — ideas that are ahead of their time.",
  12: "In your 12th house's domain, that shows up in the hidden and the spiritual — the unconscious, and what lies beyond the visible world.",
};

/** Short phrase for "Mercury also forms a [challenging/harmonious] [aspect] to your [Planet] — pointing to/bringing natural ease to ___". */
export const ASPECT_PLANET_PHRASES: Record<string, string> = {
  Sun: 'your identity and what makes you feel alive',
  Moon: 'your emotional undercurrent and what you need to feel nurtured',
  Mars: 'how anger, drive, and desire show up in the way you speak',
  Venus: 'how love, beauty, and money show up in your conversations',
  Jupiter: 'expansive, big-picture thinking — and where you might be doubting yourself',
  Saturn: 'hard-won lessons and discipline in how you think and speak',
  Uranus: "sudden, unconventional insight — and a willingness to say the thing nobody else will",
  Neptune: 'dreamy, imaginative thinking, and the stories you tell yourself that may or may not be true',
  Pluto: 'unflinching honesty and the deep, generational undercurrents running through your words',
};

/**
 * Hedged natal-retrograde clause bank. Each clause completes:
 * "some retrograde Mercury folks ${clause}"
 * Language must always stay hedged ("may," "can," "some") — never stated as fact.
 */
export const RETROGRADE_CLAUSES: string[] = [
  'are late bloomers with speech and expressing themselves',
  'learn best in quiet, with time to think and process',
  "can be prone to misinterpretation, so it's worth being careful with words",
  'find their brain works faster than the words can come out',
  'find Mercury retrograde transits feel easier than they do for most people',
  'were better at writing than speaking earlier in life',
];
