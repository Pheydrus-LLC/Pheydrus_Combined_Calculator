/**
 * Human Design constants: gate sequence, channels, center names, and
 * business-oriented descriptions for types, authorities, and profiles.
 */

// ── Gate Sequence ─────────────────────────────────────────────────────────────
// 64 gates ordered around the zodiac wheel, starting at 0° Aries.
// Each gate spans 5.625° (360 / 64). Index 0 → gate 41 starts at 0° Aries.
export const GATE_SEQUENCE: readonly number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2,  23, 8,  20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7,  4,  29, 59, 40, 64, 47, 6,  46, 18, 48, 57, 32, 50,
  28, 44, 1,  43, 14, 34, 9,  5,  26, 11, 10, 58, 38, 54, 61, 60,
];

// ── 9 Energy Centers ──────────────────────────────────────────────────────────
export const ALL_CENTERS = [
  'Head', 'Ajna', 'Throat', 'G-Center', 'Ego',
  'Sacral', 'Solar Plexus', 'Spleen', 'Root',
] as const;

export type CenterName = (typeof ALL_CENTERS)[number];

// ── 36 Channels ───────────────────────────────────────────────────────────────
// Each entry: [gate1, gate2, center1, center2, channelName]
export const CHANNELS: Array<[number, number, CenterName, CenterName, string]> = [
  [1,  8,  'G-Center',    'Throat',       'Inspiration'],
  [2,  14, 'G-Center',    'Sacral',       'The Beat'],
  [3,  60, 'Sacral',      'Root',         'Mutation'],
  [4,  63, 'Ajna',        'Head',         'Logic'],
  [5,  15, 'Sacral',      'G-Center',     'Rhythm'],
  [6,  59, 'Solar Plexus','Sacral',       'Mating'],
  [7,  31, 'G-Center',    'Throat',       'The Alpha'],
  [9,  52, 'Sacral',      'Root',         'Concentration'],
  [10, 20, 'G-Center',    'Throat',       'Awakening'],
  [10, 34, 'G-Center',    'Sacral',       'Exploration'],
  [10, 57, 'G-Center',    'Spleen',       'Perfected Form'],
  [11, 56, 'Ajna',        'Throat',       'Curiosity'],
  [12, 22, 'Throat',      'Solar Plexus', 'Openness'],
  [13, 33, 'G-Center',    'Throat',       'The Prodigal'],
  [16, 48, 'Throat',      'Spleen',       'The Wavelength'],
  [17, 62, 'Ajna',        'Throat',       'Acceptance'],
  [18, 58, 'Spleen',      'Root',         'Judgment'],
  [19, 49, 'Root',        'Solar Plexus', 'Synthesis'],
  [20, 34, 'Throat',      'Sacral',       'Charisma'],
  [20, 57, 'Throat',      'Spleen',       'The Brain Wave'],
  [21, 45, 'Ego',         'Throat',       'Money'],
  [23, 43, 'Throat',      'Ajna',         'Structuring'],
  [24, 61, 'Ajna',        'Head',         'Awareness'],
  [25, 51, 'G-Center',    'Ego',          'Initiation'],
  [26, 44, 'Ego',         'Spleen',       'Surrender'],
  [27, 50, 'Sacral',      'Spleen',       'Preservation'],
  [28, 38, 'Spleen',      'Root',         'Struggle'],
  [29, 46, 'Sacral',      'G-Center',     'Discovery'],
  [30, 41, 'Solar Plexus','Root',         'Recognition'],
  [32, 54, 'Spleen',      'Root',         'Transformation'],
  [34, 57, 'Sacral',      'Spleen',       'Power'],
  [35, 36, 'Throat',      'Solar Plexus', 'Transitoriness'],
  [37, 40, 'Solar Plexus','Ego',          'Community'],
  [39, 55, 'Root',        'Solar Plexus', 'Emoting'],
  [42, 53, 'Sacral',      'Root',         'Maturation'],
  [47, 64, 'Ajna',        'Head',         'Abstraction'],
];

// ── HD Types ──────────────────────────────────────────────────────────────────
export type HumanDesignType =
  | 'Generator'
  | 'Manifesting Generator'
  | 'Manifestor'
  | 'Projector'
  | 'Reflector';

export const TYPE_INFO: Record<
  HumanDesignType,
  { strategy: string; notSelf: string; businessRole: string; businessTip: string }
> = {
  Generator: {
    strategy: 'Wait to respond',
    notSelf: 'Frustration',
    businessRole: 'The Sustainable Builder — creates lasting business through mastery and genuine joy in the work.',
    businessTip:
      'Only start projects, partnerships, and offers that produce a clear gut "yes." Responding beats initiating. Frustration is your signal you\'re off-track.',
  },
  'Manifesting Generator': {
    strategy: 'Wait to respond, then inform',
    notSelf: 'Frustration & Anger',
    businessRole: 'The Multi-Passionate Entrepreneur — fast-paced, multi-tasking, efficiency engine.',
    businessTip:
      'Skip steps that feel wrong and pivot when needed — update your team before you move. Your speed is a feature, not a bug.',
  },
  Manifestor: {
    strategy: 'Inform before acting',
    notSelf: 'Anger',
    businessRole: 'The Impact Initiator — makes things happen that others cannot start on their own.',
    businessTip:
      'Reduce resistance by informing stakeholders BEFORE you act. Closed aura means people feel your impact, not your intent — communicate proactively.',
  },
  Projector: {
    strategy: 'Wait for the invitation',
    notSelf: 'Bitterness',
    businessRole: 'The Strategic Advisor — sees the whole picture, guides energy, and manages systems.',
    businessTip:
      'Build recognition first, then let the invitation come. Unsolicited advice creates bitterness. Your wisdom is worth waiting to be asked for.',
  },
  Reflector: {
    strategy: 'Wait 28–29 days (lunar cycle)',
    notSelf: 'Disappointment',
    businessRole: 'The Community Mirror — reflects and amplifies the health of their environment.',
    businessTip:
      'Your environment IS your business strategy. Sample a big decision across a full lunar cycle before committing. Curate your community carefully.',
  },
};

// ── HD Authorities ────────────────────────────────────────────────────────────
export type HumanDesignAuthority =
  | 'Emotional'
  | 'Sacral'
  | 'Splenic'
  | 'Ego'
  | 'Self/G'
  | 'Mental'
  | 'Lunar';

export const AUTHORITY_INFO: Record<
  HumanDesignAuthority,
  { description: string; businessDecision: string }
> = {
  Emotional: {
    description: 'Emotional wave — clarity emerges over time, not in the moment.',
    businessDecision:
      'Never sign contracts or make major commitments at the peak or pit of an emotional wave. Sleep on it, then sleep on it again. Clarity is your north star.',
  },
  Sacral: {
    description: 'Gut response — immediate yes/no from life-force energy.',
    businessDecision:
      'Trust your gut\'s instantaneous response (not your mind\'s reasoning). If your body contracts, it\'s a no. If it expands, it\'s a yes. This is non-negotiable.',
  },
  Splenic: {
    description: 'In-the-moment body wisdom — one quiet signal, never repeats.',
    businessDecision:
      'You get one chance to hear the signal. Act on subtle body awareness immediately — the spleen whispers, it never shouts. Fear is your guide: what are you afraid to do?',
  },
  Ego: {
    description: 'Willpower — only commit when your heart genuinely wants it.',
    businessDecision:
      'If you wouldn\'t fight for it, don\'t agree to it. Only make promises your ego can keep. Over-committing burns you out; under-promising and over-delivering is your edge.',
  },
  'Self/G': {
    description: 'Identity — clarity comes through speaking it aloud.',
    businessDecision:
      'Talk business decisions through with trusted sounding boards. The answer emerges from hearing your own words, not from others\' opinions.',
  },
  Mental: {
    description: 'Mind as sounding board — not for deciding, but for processing.',
    businessDecision:
      'Discuss with wise advisors across different environments. You\'re not looking for their answer — you\'re listening for clarity in your own response as you talk.',
  },
  Lunar: {
    description: 'Lunar cycle — sample all 64 gates over 28–29 days.',
    businessDecision:
      'Major business decisions require a full lunar cycle. Track how you feel about each option day-by-day. Rushing creates disappointment; patience creates alignment.',
  },
};

// ── HD Profiles ───────────────────────────────────────────────────────────────
export const PROFILE_INFO: Record<
  string,
  { name: string; businessArchetype: string; businessTip: string }
> = {
  '1/3': {
    name: 'Investigator / Martyr',
    businessArchetype: 'The Research-Driven Experimenter',
    businessTip:
      'Build on rock-solid foundations of knowledge, then test boldly. Mistakes are your curriculum — document them and turn failures into frameworks.',
  },
  '1/4': {
    name: 'Investigator / Opportunist',
    businessArchetype: 'The Expert Networker',
    businessTip:
      'Deep expertise + warm relationships = your business formula. Opportunities arrive through your network once you\'ve established credibility.',
  },
  '2/4': {
    name: 'Hermit / Opportunist',
    businessArchetype: 'The Natural-Talent Connector',
    businessTip:
      'You have gifts you may not fully see. Let your network call you out and recognize you. Protect deep-work time; your best insights come in solitude.',
  },
  '2/5': {
    name: 'Hermit / Heretic',
    businessArchetype: 'The Projected Problem-Solver',
    businessTip:
      'Others will project savior expectations onto you — develop your natural gifts to meet those projections. Boundaries protect your creative solitude.',
  },
  '3/5': {
    name: 'Martyr / Heretic',
    businessArchetype: 'The Practical Wisdom Sharer',
    businessTip:
      'Your tested, real-world solutions are your product. Embrace the trial-and-error path; every "failure" builds the credibility that makes you a trusted guide.',
  },
  '3/6': {
    name: 'Martyr / Role Model',
    businessArchetype: 'The Transitioning Authority',
    businessTip:
      'First half of life: experiment and learn by doing. Second half: lead and advise from lived experience. Let your journey be the content.',
  },
  '4/6': {
    name: 'Opportunist / Role Model',
    businessArchetype: 'The Trusted Authority Builder',
    businessTip:
      'Deepen key relationships over time — your network is your business infrastructure. You become the role model others look to as you mature.',
  },
  '4/1': {
    name: 'Opportunist / Investigator',
    businessArchetype: 'The Network-Backed Expert',
    businessTip:
      'Relationships open the door; expertise closes the deal. Cultivate both simultaneously. Stability in your foundational knowledge anchors your network.',
  },
  '5/1': {
    name: 'Heretic / Investigator',
    businessArchetype: 'The Practical Problem-Solver',
    businessTip:
      'People expect you to fix their problems — have the research to back it up. Under-promise and over-deliver to manage the high expectations projected onto you.',
  },
  '5/2': {
    name: 'Heretic / Hermit',
    businessArchetype: 'The Projected Natural',
    businessTip:
      'Your natural gifts will be called out by others. Develop them in private so you\'re ready when recognized. Withdraw to recharge between public engagements.',
  },
  '6/2': {
    name: 'Role Model / Hermit',
    businessArchetype: 'The Inspiring Example',
    businessTip:
      'Life has three acts: experimentation (1–30), roof time & integration (30–50), and embodied wisdom (50+). Trust the process — your example is your legacy.',
  },
  '6/3': {
    name: 'Role Model / Martyr',
    businessArchetype: 'The Experienced Overseer',
    businessTip:
      'Trial-and-error early on builds the objectivity you need to lead with authority later. Your experiential wisdom becomes the credibility that others follow.',
  },
};

// ── Center Business Descriptions ──────────────────────────────────────────────
export const CENTER_INFO: Record<
  CenterName,
  { defined: string; undefined: string }
> = {
  Head: {
    defined: 'Consistent source of mental inspiration and pressure. You drive inquiry and generate ideas reliably — a steady creative spark.',
    undefined: 'Open to diverse inspirations. You amplify others\' mental energy and questions. Release the pressure to answer every question you think about.',
  },
  Ajna: {
    defined: 'Fixed, consistent way of analyzing and processing information. Your perspective is reliable and recognizable — a signature mental framework.',
    undefined: 'Flexible, adaptive thinker. You try on different viewpoints and reflect others\' certainty back to them. Avoid pretending to be certain.',
  },
  Throat: {
    defined: 'Consistent, recognizable voice. You communicate and express in a reliable way — your presence is felt when you speak.',
    undefined: 'Variable self-expression. You\'re masterful at speaking at the right moment. Avoid speaking just to be heard — timing is your superpower.',
  },
  'G-Center': {
    defined: 'Clear, consistent sense of identity, direction, and love. Magnetic presence — others feel drawn to your consistent self.',
    undefined: 'Fluid sense of identity that adapts to environment. You sample different directions and identities. Your environment strongly shapes who you are — choose carefully.',
  },
  Ego: {
    defined: 'Consistent willpower and capacity for commitment. You can make and keep promises reliably. Natural authority in material-world matters.',
    undefined: 'Variable willpower — not designed for relentless hustle. Avoid over-promising. Rest and recovery are not optional; they\'re strategic.',
  },
  Sacral: {
    defined: 'Sustainable life-force energy. You can work long hours doing work you love and regenerate overnight. The engine of the business world.',
    undefined: 'Non-sacral being. You amplify others\' energy but don\'t generate it yourself. More rest is required. Avoid burning yourself out matching sacral people\'s pace.',
  },
  'Solar Plexus': {
    defined: 'Emotional wave creates a rich creative landscape. Over time, emotional clarity becomes your most powerful asset in business.',
    undefined: 'You absorb and amplify others\' emotions. Deeply empathic and sensitive. Create emotional space before making decisions; what you feel may not be yours.',
  },
  Spleen: {
    defined: 'Consistent intuitive immune system. In-the-moment body awareness keeps you safe and healthy. A reliable survival instinct.',
    undefined: 'Highly sensitive to health, fear, and environment. You may hold onto things (jobs, clients, relationships) for security. Practice releasing what no longer serves.',
  },
  Root: {
    defined: 'Consistent adrenalized drive and pressure. You propel projects forward under deadline and thrive with structured urgency.',
    undefined: 'You absorb and amplify others\' stress and deadline pressure. Decompress regularly. Work at your own pace — rushed decisions rarely serve you.',
  },
};
