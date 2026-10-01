/**
 * Wording of the Invisible Forces report that both the scrolling report
 * (/client/results) and the book (/client/book) show, so the two always say
 * the same thing. Edit copy here, not in the page components.
 */

import type { GoalCategory } from '../services/pdfExport/clientInterpretations';
import { applyKmsStyle } from '../services/pdfExport/kmsStyle';
import type { GradeItem, PillarSummary } from '../models/diagnostic';

export const GOAL_LABEL: Record<GoalCategory, string> = {
  career: 'Career & Financial Growth',
  love: 'Love & Relationships',
  general: 'Your Goals',
};

export const GOAL_SHORT: Record<GoalCategory, string> = {
  career: 'career & financial growth',
  love: 'love & relationships',
  general: 'your goals',
};

/** A pillar's letter grade: any F makes it F, then any C makes it C, otherwise A. */
export function getPillarLetterGrade(pillar: PillarSummary): string {
  const grades = pillar.items.map((item) => item.grade);
  if (grades.includes('F') || pillar.fCount > 0) return 'F';
  if (grades.includes('C') || pillar.cCount > 0) return 'C';
  return 'A';
}

// ── Cover ────────────────────────────────────────────────────────────────────

const COVER_HEADLINES: Record<string, [string, string]> = {
  A: ['A means alignment is close.', 'One right move, and you can 10x your life.'],
  B: ["You're doing well - ", "'doing well' and 'living fully' are two different things."],
  C: ['A passing grade - ', 'but who wants a passing-grade life?'],
  D: ["D means you're one step away from failing - ", "and you're probably feeling the pressure."],
  F: [
    "Don't let the score alarm you - this isn't a class exam.",
    'This simply means you have an unseen force working AGAINST you. Once you address this force, the score (and your life) will improve dramatically!',
  ],
};

export function getCoverCopy({
  finalGrade,
  endYear,
  yearsRemaining,
  forceCount,
}: {
  finalGrade: string;
  endYear: number | null;
  yearsRemaining: number | null;
  forceCount: number;
}) {
  const [headline, emphasis] = COVER_HEADLINES[finalGrade] ?? ['Overall Deconditioning Score', ''];
  const forces = `${forceCount} specific force${forceCount !== 1 ? 's' : ''}`;
  const description =
    finalGrade === 'F'
      ? endYear
        ? `Getting an F simply means multiple invisible forces are holding you back behind the scenes. Left unaddressed, they can persist until ${endYear}: impacting your relationships, career, and overall well-being. The calculations below are based on thousands of case studies, where we identified exactly which configurations caused the biggest disruptions in people's lives.`
        : `Getting an F simply means multiple invisible forces are holding you back behind the scenes. Left unaddressed, they can persist for years to come, impacting your relationships, career, and overall well-being. The calculations below are based on thousands of case studies, where we identified exactly which configurations caused the biggest disruptions in people's lives.`
      : endYear && yearsRemaining
        ? `Your ${finalGrade} score traces back to ${forces} - all identified below. Left unaddressed, this configuration persists through ${endYear} - ${yearsRemaining} more year${yearsRemaining !== 1 ? 's' : ''} of a reality that passes, but doesn't 10x.`
        : `Your ${finalGrade} score traces back to ${forces} - all identified below. This configuration does not self-resolve without targeted intervention.`;
  const secondLine =
    finalGrade === 'F'
      ? "The good news? This report shows you precisely which invisible forces are at play, what they mean, and some initial steps you can take. The grade may seem harsh, but that's intentional: it's here to make sure addressing these forces becomes YOUR #1 priority. Once you do, you'll be surprised how quickly life feels in flow again."
      : 'This report shows exactly where momentum is leaking and what to change first. Every pressure point has a usable upside once you work it directly.';
  return { headline, emphasis, description, secondLine };
}

export const COVER_QUOTE =
  '"Pluto transiting your 1st house? Stop playing nice. Stop softening your edges. Step fully into your power - that is the higher octave." - Pheydrus team';

export const COVER_CLOSING_LINES = [
  'You did the mindset work, the strategy work, and the coaching. Results still stall at the same point.',
  'The missing variable is energetic structure. Thinking harder does not solve this layer.',
  'You already have the capacity. This report shows the sequence to unlock it.',
];

// ── Why this keeps happening ─────────────────────────────────────────────────

export const PATTERN_COPY = {
  quote:
    '"You did the degree, the career, and the inner work. Results still stall at the same point. This pressure pattern is the pre-upgrade signal this report maps."',
  lead: 'You are in an identity shift.',
  body: 'These patterns are the exact conditions that precede a major identity upgrade. Three invisible forces are pulling against each other, and that friction marks the edge where your previous identity loses control and your next identity takes over.',
  highlight: 'Your identity upgrade is around the corner, and the first signals are active now.',
  closing:
    'You now choose how you enter this window: with a map and deliberate action, or by repeating the same loop.',
};

export const LEGEND_CARDS = [
  {
    dot: '#C9A84C',
    label: 'IDENTITY/PERSONALITY - PILLAR 1',
    question: `Have people always called you 'too much' - or felt emotions more intensely, like you were wired differently from birth?`,
    desc: `Your permanent, energetic blueprint. Just as how you didn't choose your eye color or height, you are also born with certain personality traits. Once you become aware of them and learn how to channel them in a productive way, it could become your greatest asset.`,
  },
  {
    dot: '#9B8EC4',
    label: 'PLANETARY TIMING - PILLAR 2',
    question: `Did life suddenly shift - a separation, unexpected move, sudden urge to quit your job - even when you weren't asking for change?`,
    desc: `Slow-moving planets define your current window. Knowing when it lifts gives you a timeline, not an open question mark.`,
  },
  {
    dot: '#5BB5A5',
    label: 'ENVIRONMENT - PILLAR 3',
    question: `Ever since you moved to your current city, does it feel harder to be yourself - like opportunities now require twice the effort?`,
    desc: `Your address carries a frequency. It amplifies or dampens everything else in your chart - and it's the most immediately actionable layer.`,
  },
];

// ── Pillars ──────────────────────────────────────────────────────────────────

export const PILLAR_TITLES: Record<1 | 2 | 3, { title: string; subtitle: string }> = {
  1: { title: 'Structure', subtitle: 'Your Energetic Blueprint' },
  2: { title: 'Timing', subtitle: 'The Window You Are In' },
  3: { title: 'Environment', subtitle: 'Location & Address' },
};

export const PILLAR_CALLOUT: Record<1 | 2 | 3, (goal: string, loc: string) => string> = {
  1: (goal) => `Here is how Pillar 1 is specifically blocking your goal of ${goal}:`,
  2: (goal) => `Here is how your current timing window is directly affecting your ability to reach ${goal}:`,
  3: (goal, loc) =>
    `Here is how your current address${loc ? ` in ${loc}` : ''} is interacting with your goal of ${goal}:`,
};

// ── Findings without a library entry ─────────────────────────────────────────

/** Mirror line for known planet+house combos */
export function getMirrorLine(item: GradeItem, goalShort: string): string | null {
  const prefix = item.section === 'Address' ? 'Env' : '';
  const key = `${prefix}${item.planet ?? ''}-${item.house ?? 0}`;
  const lines: Record<string, string> = {
    'Sun-7': `Your most powerful connections - romantic or professional - tend to find you. But converting that natural draw into lasting partnership for ${goalShort} feels like a different skill entirely.`,
    'Saturn-5': `Does this sound familiar? You build the offer, get excited, draft the content - and then pull back right before you publish. Every time. The same wall appears in romance: you open up enough, then go quiet - not from lack of feeling, but from fear of being truly seen.`,
    'Uranus-5': `You've probably started building toward ${goalShort} more than once - with real momentum - and then watched yourself abandon it before it could pay off. In relationships, the same cycle: intense connection, then withdrawal before real intimacy takes hold.`,
    'Neptune-5': `You can see the ${goalShort} version of your life clearly - and the relationship you want. The gap is in bridging vision to reality: both in business and in love, the fog lifts only when you commit to what's already in front of you.`,
    'Pluto-6': `Are you stuck in performative busyness - doing work that feels productive but isn't moving the needle toward ${goalShort}?`,
    'Neptune-8': `Have you felt confused about your pricing or what you're worth charging - making ${goalShort} feel like a moving target?`,
    'Uranus-10': `Does your professional path feel chaotic - like you can't commit to one lane long enough to build real momentum toward ${goalShort}?`,
    'Saturn-8': `Has accessing the financial partnerships or investment needed to scale toward ${goalShort} felt blocked or fear-inducing?`,
    'EnvSaturn-2': `Since living at your current address, has there been an invisible ceiling on how much you allow yourself to charge or earn?`,
    'EnvUranus-2': `Does your income feel erratic - breakthrough months followed by drought - while ${goalShort} stays out of reach?`,
    'EnvNeptune-2': `Are you chronically undercharging for your work - or genuinely unclear about what to charge?`,
  };
  const text = lines[key] ?? null;
  return text ? applyKmsStyle(text) : null;
}

/** Higher octave / transmute line */
export function getTransmuteLine(item: GradeItem): string | null {
  const prefix = item.section === 'Address' ? 'Env' : '';
  const key = `${prefix}${item.planet ?? ''}-${item.house ?? 0}`;
  const lines: Record<string, string> = {
    'Sun-7': `Your highest alignment comes through partnership - in love and in business. The right relationship is not a distraction from your goal. It is the path to it.`,
    'Saturn-5': `Once activated, you become the most disciplined, unshakeable builder in your market - and the partner who loves with rare, earned depth. Saturn in H5 blocks both at the same threshold; breaking one breaks both.`,
    'Uranus-5': `The most innovative, category-defining offer in any market - and the most electric, committed romantic connection, once the fear of staying is transmuted into the courage to remain.`,
    'Neptune-5': `Once grounded, your visionary capacity becomes your greatest differentiator in business - and in love, your depth of feeling becomes a rare gift rather than a source of confusion.`,
    'Pluto-6': `Pluto in the 6th, activated, builds the most sustainable work machine - systems that compound instead of drain.`,
    'Neptune-8': `Pricing rooted in genuine purpose becomes your most magnetic quality.`,
    'Uranus-10': `You're not meant to build a predictable business. You're meant to build one nobody's seen before. That's what's coming next.`,
    'Saturn-8': `Once fear is transmuted, Saturn in the 8th gives you the most durable financial architecture of anyone in your field.`,
    'EnvSaturn-2': `Environmental realignment removes the invisible ceiling - and what was once a block becomes a foundation of genuine financial stability.`,
    'EnvUranus-2': `Environmental shift converts erratic income into breakthrough cycles - shorter troughs, higher peaks.`,
    'EnvNeptune-2': `Once aligned, your address supports clarity around value - and undercharging becomes a thing of the past.`,
  };
  const text = lines[key] ?? null;
  return text ? applyKmsStyle(text) : null;
}
