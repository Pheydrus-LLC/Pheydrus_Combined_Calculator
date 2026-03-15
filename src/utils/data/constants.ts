/**
 * Constants for all calculators
 * Includes numerology meanings, house themes, planet themes, and other data
 */

// ============================================================================
// NUMEROLOGY MEANINGS (1-9, 11, 22, 33)
// ============================================================================

export const NUMEROLOGY_MEANINGS: Record<number, { meaning: string; description: string }> = {
  1: {
    meaning: 'The Leader',
    description: 'masculine, independent, direct, leadership, originality, courage, new beginnings',
  },
  2: {
    meaning: 'The Peacemaker',
    description: 'feminine, partnership, balance, peaceful',
  },
  3: {
    meaning: 'The Communicator',
    description: 'social, network, friendships, cheating',
  },
  4: {
    meaning: 'The Worker',
    description: 'stability, security, responsibility, overworking',
  },
  5: {
    meaning: 'The Adventurer',
    description: 'change, travel, movement, chaos',
  },
  6: {
    meaning: 'The Nurturer',
    description: 'family, pets, romance, intimacy, overgiving',
  },
  7: {
    meaning: 'The Seeker',
    description: 'spirituality, creativity, artistic',
  },
  8: {
    meaning: 'The Achiever',
    description: 'money, karma, power, privacy, make money fast, lose money fast',
  },
  9: {
    meaning: 'The Humanitarian',
    description: 'wisdom, growth, mastery, shamanic journey',
  },
  11: {
    meaning: 'The Visionary',
    description:
      'partnership, inspiration, intuition, and enlightenment, visionary, the dreamer, and the seer. It is the number of the psychic, the healer, and the teacher.',
  },
  22: {
    meaning: 'The Master Builder',
    description:
      'building mastery, power, and achievement, master builder, the architect, and the engineer. It is the number of the visionary, the leader, and the manager.',
  },
  33: {
    meaning: 'The Master Teacher',
    description:
      'compassion, healing, and guidance, master teacher, the counselor, and the mentor. It is the number of the humanitarian, the philanthropist, and the healer.',
  },
};

// ============================================================================
// ASTROLOGY HOUSE THEMES (12 Houses)
// ============================================================================

export const HOUSE_THEMES = [
  'identity, self, appearance, personal approach',
  'money, values, possessions, self-worth',
  'communication, siblings, learning, local environment',
  'home, family, roots, inner foundation',
  'romance, creativity, children, joy',
  'work, health, service, daily routine, money',
  'committed relationships, marriage, contracts, balance',
  'intimacy, shared resources, money, transformation, taboo',
  'higher learning, travel, philosophy, beliefs',
  'career, money, public image, status, authority',
  'friendships, community, future goals',
  'spirituality, subconscious, endings, hidden realms',
];

// ============================================================================
// ASTROLOGY PLANET THEMES (for Transits)
// ============================================================================

export const PLANET_THEMES: Record<string, string> = {
  Pluto: 'transforms, intensifies, destroys & rebuilds, empowers, exposes, regenerates',
  Neptune: 'dissolves, spiritualizes, confuses, idealizes, inspires, transcends, mystifies',
  Saturn: 'structures, disciplines, restricts, tests, grounds, matures, crystallizes',
  Uranus: 'disrupts, liberates, shocks, awakens, innovates, revolutionizes',
  'North Node': 'directs, guides, grows, evolves, pushes toward destiny, expands purpose',
  'South Node': 'releases, depletes, drains, pulls back, exposes past patterns, lets go',
};

// ============================================================================
// ZODIAC SIGNS (in order: Aries to Pisces)
// ============================================================================

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

// ============================================================================
// ZODIAC SIGN COLORS (Aura Gradients for Transits)
// ============================================================================

export const SIGN_COLORS: Record<string, string> = {
  Aries: 'linear-gradient(135deg, #FFCBC8 0%, #FFDDD8 100%)',
  Taurus: 'linear-gradient(135deg, #D6EFC0 0%, #E9F5DC 100%)',
  Gemini: 'linear-gradient(135deg, #FFF9C4 0%, #FFFDE7 100%)',
  Cancer: 'linear-gradient(135deg, #DAEAFF 0%, #E8F1FF 100%)',
  Leo: 'linear-gradient(135deg, #FFE8CC 0%, #FFF3E6 100%)',
  Virgo: 'linear-gradient(135deg, #E2F5D3 0%, #F1FAE9 100%)',
  Libra: 'linear-gradient(135deg, #FFE6FF 0%, #FFF0FF 100%)',
  Scorpio: 'linear-gradient(135deg, #D9F5F5 0%, #E8FAFA 100%)',
  Sagittarius: 'linear-gradient(135deg, #FFDAE6 0%, #FFE9F0 100%)',
  Capricorn: 'linear-gradient(135deg, #E1ECFF 0%, #EDF4FF 100%)',
  Aquarius: 'linear-gradient(135deg, #E8D6FF 0%, #F2E6FF 100%)',
  Pisces: 'linear-gradient(135deg, #D6FFE8 0%, #E6FFF0 100%)',
};

// ============================================================================
// NUMEROLOGY BADGE COLORS
// ============================================================================

export const NUMEROLOGY_BADGE_COLORS: Record<number, string> = {
  1: 'bg-indigo-100',
  2: 'bg-emerald-100',
  3: 'bg-amber-100',
  4: 'bg-lime-100',
  5: 'bg-green-100',
  6: 'bg-orange-100',
  7: 'bg-sky-100',
  8: 'bg-blue-100',
  9: 'bg-red-100',
  11: 'bg-purple-100',
  22: 'bg-pink-100',
  33: 'bg-rose-100',
};

// ============================================================================
// ASTRO ASPECT DEFINITIONS
// ============================================================================

export interface AspectDefinition {
  name: string;
  angle: number;
  orb: number;
}

export const ASPECTS: AspectDefinition[] = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Opposition', angle: 180, orb: 8 },
  { name: 'Trine', angle: 120, orb: 8 },
  { name: 'Square', angle: 90, orb: 7 },
  { name: 'Sextile', angle: 60, orb: 6 },
];

// ============================================================================
// ADDRESS NUMEROLOGY LEVEL LABELS
// ============================================================================

export const NUMEROLOGY_LEVEL_LABELS: Record<string, string> = {
  L1: '(On-going life event/theme)',
  L2: '(What super-charges the personal event)',
  L3: '(Theme of friends/community)',
  L4: '(City theme)',
  bonus1: 'Chinese zodiac of home year',
  bonus2: 'Chinese zodiac of birth year',
  compatibility: 'Compatibility between home & birth year zodiacs',
};

// ============================================================================
// PLANETS IN CALCULATION ORDER
// ============================================================================

export const PLANETS_ORDERED = [
  'Ascendant',
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Descendant',
  'MC',
  'IC',
];

// ============================================================================
// PLANET CLASSIFICATION (for Relocation)
// ============================================================================

export const BENEFIC_PLANETS = ['Venus', 'Jupiter', 'Sun', 'Moon'];
export const MALEFIC_PLANETS = ['Mars', 'Saturn', 'Pluto'];

export function classifyPlanet(planet: string): 'benefic' | 'malefic' | 'neutral' {
  if (BENEFIC_PLANETS.includes(planet)) return 'benefic';
  if (MALEFIC_PLANETS.includes(planet)) return 'malefic';
  return 'neutral';
}

// ============================================================================
// BUSINESS HOUSE NUMBERS (for Relocation)
// ============================================================================

export const BUSINESS_HOUSES = [2, 6, 10]; // Wealth, Work, Career

// ============================================================================
// ANGLES
// ============================================================================

export type AngleKey = 'ASC' | 'DSC' | 'MC' | 'IC';
export const ANGLES: AngleKey[] = ['ASC', 'DSC', 'MC', 'IC'];

export function getAngleLabel(house: number): AngleKey | null {
  switch (house) {
    case 1:
      return 'ASC';
    case 4:
      return 'IC';
    case 7:
      return 'DSC';
    case 10:
      return 'MC';
    default:
      return null;
  }
}

// ============================================================================
// EXTENDED NUMEROLOGY MEANINGS (themes, challenges, gifts, reflection)
// Matches legacy PheydrusCalculators/src/app/numerology/aw/constants.ts
// ============================================================================

export const EXTENDED_NUMEROLOGY_MEANINGS: Record<
  number,
  { themes: string; challenges: string; gifts: string; reflection: string }
> = {
  1: {
    themes: 'Leadership, independence, originality, self-reliance, innovation.',
    challenges: 'Ego, isolation, stubbornness, fear of dependence, controlling tendencies.',
    gifts: 'Confidence, courage, self-motivation, trailblazing energy, pioneering spirit.',
    reflection:
      'When I feel unsupported or unseen, how can I turn that energy into self-trust and lead myself forward with conviction?',
  },
  2: {
    themes: 'Partnership, diplomacy, intuition, harmony, sensitivity.',
    challenges: 'People-pleasing, indecision, emotional dependency, avoidance of conflict.',
    gifts: 'Empathy, balance, cooperation, deep connection, emotional intelligence.',
    reflection:
      'When I start doubting my worth in relationships, how can I center myself in calm confidence and co-create harmony without losing authenticity?',
  },
  3: {
    themes: 'Creativity, self-expression, joy, communication, social connection.',
    challenges: 'Scattered focus, overindulgence, superficiality, self-doubt.',
    gifts: 'Optimism, charisma, storytelling, inspiration, artistic flair.',
    reflection:
      'When I feel blocked or self-critical, how can I reconnect to joy and express myself as if my voice already mattered to the world?',
  },
  4: {
    themes: 'Structure, discipline, responsibility, practicality, building foundations.',
    challenges: 'Rigidity, fear of change, workaholism, limitation by routine.',
    gifts: 'Stability, reliability, endurance, groundedness, strong work ethic.',
    reflection:
      'When I feel trapped or stuck, what new system or boundary could I create that restores both stability and freedom?',
  },
  5: {
    themes: 'Freedom, adventure, change, curiosity, experience.',
    challenges: 'Restlessness, inconsistency, impulsiveness, avoidance of responsibility.',
    gifts: 'Adaptability, magnetism, exploration, communication, liberation.',
    reflection:
      'When I crave escape or stimulation, how can I channel that energy into bold change that expands\u2014not scatters\u2014my freedom?',
  },
  6: {
    themes: 'Responsibility, love, family, service, harmony, beauty.',
    challenges: 'Over-giving, perfectionism, control in relationships, guilt.',
    gifts: 'Compassion, healing, nurturing, community leadership, loyalty.',
    reflection:
      'When I feel drained by others\u2019 needs, how can I refill my own cup so that my care comes from love instead of duty?',
  },
  7: {
    themes: 'Introspection, wisdom, spirituality, truth-seeking, research.',
    challenges: 'Isolation, cynicism, overthinking, detachment, secrecy.',
    gifts: 'Intuition, insight, intellectual depth, spiritual connection, analysis.',
    reflection:
      'When I feel disconnected or lost in thought, how can I turn inward not to escape\u2014but to rediscover my connection to something greater?',
  },
  8: {
    themes: 'Power, success, ambition, material mastery, influence.',
    challenges: 'Greed, control, fear of failure, power struggles, detachment from emotions.',
    gifts: 'Leadership, manifestation, financial acumen, resilience, mastery.',
    reflection:
      'When I feel powerless or consumed by control, how can I realign my ambition with purpose and lead from integrity instead of fear?',
  },
  9: {
    themes: 'Completion, compassion, humanitarianism, release, spiritual wisdom.',
    challenges: 'Victim mindset, emotional burnout, martyrdom, resentment.',
    gifts: 'Forgiveness, service, global vision, empathy, transcendence.',
    reflection:
      'When I feel weighed down by the past, how can I choose forgiveness and let go so that compassion becomes my strength, not my wound?',
  },
  11: {
    themes: 'Intuition, illumination, spiritual leadership, visionary creativity.',
    challenges: 'Anxiety, overwhelm, self-doubt, fear of visibility.',
    gifts: 'Divine inspiration, healing presence, charisma, spiritual guidance.',
    reflection:
      'When fear or doubt cloud my vision, how can I ground into trust and let my intuition guide me to illuminate others through example?',
  },
  22: {
    themes: 'Master builder, large-scale manifestation, practical vision, legacy creation.',
    challenges: 'Perfectionism, pressure, burnout, fear of failure on a large scale.',
    gifts: 'Visionary leadership, grounded manifestation, world impact, legacy building.',
    reflection:
      'When I feel overwhelmed by the size of my dreams, how can I return to small, aligned action that anchors my vision into reality?',
  },
  33: {
    themes: 'Master teacher, unconditional love, service through wisdom and creativity.',
    challenges: 'Over-responsibility, emotional exhaustion, fear of not doing enough.',
    gifts: 'Healing communication, compassion in action, spiritual teaching, inspiration.',
    reflection:
      'When I feel burdened by others\u2019 pain, how can I return to love as my teacher and allow compassion to flow without depleting me?',
  },
};

// ============================================================================
// CHINESE ZODIAC MEANINGS (themes, challenges, gifts, reflection)
// Matches legacy PheydrusCalculators/src/app/numerology/aw/constants.ts
// ============================================================================

export const CHINESE_ZODIAC_MEANINGS: Record<
  string,
  { themes: string; challenges: string; gifts: string; reflection: string }
> = {
  Rat: {
    themes: 'Intelligence, strategy, adaptability, alertness',
    challenges: 'Sneakiness, overthinking, anxiety, control',
    gifts: 'Clever solutions, resourcefulness, sharp instincts',
    reflection: 'Where am I trying to manipulate or outsmart life instead of trusting my wisdom?',
  },
  Ox: {
    themes: 'Stability, discipline, patience, perseverance',
    challenges: 'Stubbornness, rigidity, emotional detachment',
    gifts: 'Long-term strength, grounded action, reliability',
    reflection: 'What belief am I holding onto that\u2019s keeping me stuck?',
  },
  Tiger: {
    themes: 'Courage, boldness, independence, rebellion',
    challenges: 'Impulsiveness, ego, aggressive dominance',
    gifts: 'Fearless leadership, catalytic energy, protector spirit',
    reflection: 'Where can I channel my fire into inspired action instead of reaction?',
  },
  Rabbit: {
    themes: 'Grace, diplomacy, softness, intuition',
    challenges: 'Avoidance, fear of conflict, indecision',
    gifts: 'Peacekeeping, beauty, emotional intelligence',
    reflection: 'Where am I avoiding discomfort that would help me grow?',
  },
  Dragon: {
    themes: 'Power, charisma, innovation, spiritual strength',
    challenges: 'Arrogance, drama, control issues',
    gifts: 'Visionary potential, magnetism, transformative force',
    reflection: 'Am I embodying power through presence or projection?',
  },
  Snake: {
    themes: 'Wisdom, mysticism, charm, strategy',
    challenges: 'Manipulation, secrecy, jealousy',
    gifts: 'Deep perception, seduction, psychological mastery',
    reflection: 'Where can I speak truth instead of hiding behind illusion?',
  },
  Horse: {
    themes: 'Freedom, movement, joy, momentum',
    challenges: 'Restlessness, burnout, lack of follow-through',
    gifts: 'Inspiration, speed, trailblazing spirit',
    reflection: 'What does freedom actually mean to me now?',
  },
  Goat: {
    themes: 'Compassion, creativity, gentleness, emotional depth',
    challenges: 'Over-sensitivity, indecision, dependency',
    gifts: 'Artistic gifts, healing energy, nurturing leadership',
    reflection: 'Where can I hold myself the way I hold others?',
  },
  Monkey: {
    themes: 'Wit, playfulness, innovation, communication',
    challenges: 'Scattered energy, deception, performance-based identity',
    gifts: 'Creative genius, joyful expression, sharp thinking',
    reflection: 'Am I being clever or being real?',
  },
  Rooster: {
    themes: 'Precision, integrity, beauty, truth',
    challenges: 'Perfectionism, judgment, rigidity',
    gifts: 'Clarity, style, accountability',
    reflection: 'What would shift if I let go of being right?',
  },
  Dog: {
    themes: 'Loyalty, justice, protection, community',
    challenges: 'Cynicism, fear-based loyalty, defensiveness',
    gifts: 'Grounded faith, service, honorable leadership',
    reflection: 'Is my loyalty empowering or enabling?',
  },
  Pig: {
    themes: 'Compassion, pleasure, abundance, sensuality',
    challenges: 'Laziness, indulgence, victimhood',
    gifts: 'Emotional generosity, deep joy, spiritual softness',
    reflection: 'Where am I confusing comfort with fulfillment?',
  },
};
