/**
 * Client Report Interpretations
 * Goal-aware text copy for the 3-pillar client PDF report.
 *
 * F grade = shadow/unconscious - how this placement actively blocks the goal
 * C grade = can go either way - conscious vs. unconscious path described
 * Transit items include the remaining duration of the transit
 */

import type { GradeItem } from '../../models/diagnostic';
import type { PlanetaryTransit } from '../../models/calculators';
import { applyKmsStyle } from './kmsStyle';

// ── Goal detection ──────────────────────────────────────────────────────────

export type GoalCategory = 'career' | 'love' | 'general';

const CAREER_KEYWORDS = [
 'money', 'career', 'business', 'income', 'revenue', 'client', 'sale', 'job',
 'wealth', 'financial', 'work', 'launch', 'company', 'startup', 'invest',
 'profit', 'scale', 'brand', 'grow', 'promotion', 'success', 'entrepreneur',
];
const LOVE_KEYWORDS = [
 'love', 'relationship', 'partner', 'marriage', 'date', 'romantic', 'soulmate',
 'boyfriend', 'girlfriend', 'husband', 'wife', 'connection', 'intimacy', 'heart',
 'meet someone', 'find love',
];

export function detectGoalCategory(text: string): GoalCategory {
 const t = text.toLowerCase();
 const c = CAREER_KEYWORDS.filter((k) => t.includes(k)).length;
 const l = LOVE_KEYWORDS.filter((k) => t.includes(k)).length;
 return l > c ? 'love' : 'career';
}

// ── Transit duration helpers ─────────────────────────────────────────────────

function parseEndYear(s: string): number {
 const nums = s
 .replace(/[^\d/]/g, '')
 .split('/')
 .map(Number)
 .filter((n) => n > 2000);
 return nums.length ? Math.max(...nums) : 2030;
}

export function getTransitEndYear(planet: string, transits: PlanetaryTransit[]): number | null {
 const t = transits.find((x) => x.planet === planet);
 return t ? parseEndYear(t.current.end) : null;
}

export function formatDuration(endYear: number): string {
 const rem = endYear - new Date().getFullYear();
 if (rem <= 0) return `through ${endYear}`;
 return `through ${endYear} (~${rem} more year${rem === 1 ? '' : 's'})`;
}

export function getLongestMaleficTransit(
 items: GradeItem[],
 transits: PlanetaryTransit[]
): { planet: string; house: number; endYear: number } | null {
 const fItems = items.filter(
 (i) =>
 i.pillar === 2 &&
 i.section === 'Transit Angular' &&
 i.grade === 'F' &&
 i.planet &&
 i.house
 );
 const cItems = items.filter(
 (i) =>
 i.pillar === 2 &&
 i.section === 'Transit Angular' &&
 i.grade === 'C' &&
 i.planet &&
 i.house
 );
 const pool = fItems.length > 0 ? fItems : cItems;
 let best: { planet: string; house: number; endYear: number } | null = null;
 for (const item of pool) {
 if (!item.planet || !item.house) continue;
 const y = getTransitEndYear(item.planet, transits);
 if (y && (!best || y > best.endYear))
 best = { planet: item.planet, house: item.house, endYear: y };
 }
 return best;
}

// ── F grade interpretation copy (natal, relocation, angular transit) ─────────

const F_INTERP: Record<string, Partial<Record<number, { career: string; love: string }>>> = {};

// ── C grade interpretation copy (Pillar 2 pressure-house transits) ────────────

const TRANSIT_C_INTERP: Record<string, Partial<Record<number, (year: number) => string>>> = {
 Pluto: {
 2: (_y) =>
 `A Pheydrus client's income went from $8k to $0 to $35k in a 14-month window - the volatility wasn't random, it was the pattern of something being torn down and rebuilt. This period doesn't reward consistency; it rewards the willingness to burn the old financial structure before the new one is visible.`,
 6: (_y) =>
 `Clients with this transit describe working 10-12 hour days and somehow making less progress than ever. Pluto here doesn't reward more hours - it demands you burn everything that isn't your highest-leverage activity and rebuild from there.`,
 8: (_y) =>
 `A Pheydrus client walked away from a seven-figure joint venture three months before closing because she couldn't stomach the power dynamics in the room. This period forces a reckoning with how you handle shared money and resources - every financial partnership becomes a mirror for the power you're willing to claim.`,
 11: (_y) =>
 `A Pheydrus client described her entire professional network dissolving in an 18-month window - not through conflict, but through people simply moving in directions that no longer included her. The connections that reformed afterward were fewer, deeper, and worth ten times what the broader network had ever produced.`,
 },
 Saturn: {
 2: (_y) =>
 `A Pheydrus client tracked her income for the year and discovered she had worked 40% more hours than the year before and made 20% less. This period creates a ceiling that only breaks when the work becomes more disciplined, not more voluminous - and when rates stop being negotiable.`,
 6: (_y) =>
 `A Pheydrus client described going through an entire year feeling like she was pushing a boulder uphill at work - maximum effort, minimum progress. This period rewards the decision to stop doing everything and build an airtight system around the 20% that produces results.`,
 8: (_y) =>
 `A client with this transit turned down a $50k investment offer because the paperwork 'felt off.' Saturn here creates a fear of financial entanglement so strong that it blocks the partnerships that could scale your work.`,
 11: (_y) =>
 `A Pheydrus client's most important professional relationship - a mentor who had opened three major opportunities - went completely silent during this period with no explanation. What survives becomes foundational; what falls away was never as solid as it appeared.`,
 },
 Uranus: {
 2: (_y) =>
 `A Pheydrus client made more money in a single month during this period than in the prior six months combined - and then made almost nothing for the next three. The income pattern that conventional advice tries to smooth out is the signal, not the problem. Asymmetric structures work; linear pricing collapses.`,
 6: (_y) =>
 `A Pheydrus client described her most productive year and her most chaotic year being the same year - she did her best work and also missed three deadlines for the first time in her career. This period rewards innovating your entire approach to how you work, not optimizing the system you already have.`,
 8: (_y) =>
 `A Pheydrus client had a business partnership go from signed agreement to complete dissolution in 60 days - the fastest breakdown she'd ever experienced. This period creates volatility in shared financial arrangements that only structures built for flexibility can withstand.`,
 10: (_y) =>
 `Three Pheydrus clients with this transit quit stable jobs in the same 6-month window - none of them planned it. This transit makes conventional career paths feel physically suffocating. The ones who stopped fighting it and built unconventional businesses broke through. The ones who kept trying to 'be normal' stayed stuck.`,
 11: (_y) =>
 `A Pheydrus client described her entire professional peer group reorganizing around her during this period - she lost three key relationships and accidentally became the center of a new community she hadn't tried to build. This period disrupts networks to make room for ones that match where you're going.`,
 },
 Neptune: {
 2: (_y) =>
 `A Pheydrus client realized she had been charging the same rate for three years and genuinely couldn't explain why - not market conditions, not strategy. an inability to translate what her work was worth into a number she could say out loud. Lifting the fog requires deliberate clarity, not more time.`,
 6: (_y) =>
 `A Pheydrus client described an entire year where she could never tell whether she was doing enough - even on her best days, the work felt unfinished. This period blurs the line between inspired work and productive delay. Clarity comes from naming the difference, not from working harder.`,
 8: (_y) =>
	`A client with this transit had been coaching for two years and still flinched every time someone asked her price. She was consistently charging 60% less than her peers because this transit creates a fog between your value and what you're willing to ask for.`,
 11: (_y) =>
 `A Pheydrus client built an online community of 3,000 people during this period and described it as the loneliest professional year of her life. The visibility was real; the genuine connection she was building it for kept receding out of reach. Shared purpose has to be explicit here, or it becomes projection.`,
 },
};

// ── C grade interpretation copy (Pillar 3 relocation pressure-house) ─────────

const RELOCATION_C_INTERP: Record<string, Partial<Record<number, (goal: GoalCategory) => string>>> = {
 Saturn: {
 2: (_goal) =>
 `A client who moved to her current address noticed her income plateau within 3 months - even though she was working harder than ever before. This address rewards builders who show up with extreme consistency. It punishes those who charge inconsistently or avoid financial conversations.`,
 6: (_goal) =>
 `A Pheydrus client described her current city as the place where she works the hardest and sees the least return - and she had been telling herself that for four years. This address rewards the decision to stop optimizing effort and start eliminating everything that isn't producing clear, direct results.`,
 8: (_goal) =>
 `A Pheydrus client turned down a co-founder offer at this address because she couldn't get comfortable with the financial structure - even though the opportunity was exactly what she'd been looking for. This address creates friction around shared money that only resolves when agreements are made completely explicit and trust is built in writing, not in good faith.`,
 11: (_goal) =>
 `A Pheydrus client described her professional network at her current address as the smallest it had been in a decade - not from conflict, from a gradual pulling back from communities that no longer felt worth the energy. This address concentrates connection toward depth; what's real becomes very real, and what isn't stops pretending.`,
 },
 Uranus: {
 2: (_goal) =>
 `Clients at addresses with this configuration describe the same income pattern: a $8k month, then a $1k month, then $6k, then $500. The breakthroughs are real - but so is the volatility. Unconventional income structures (retainers, packages, asymmetric pricing) stabilize everything. Traditional pricing models collapse.`,
 6: (_goal) =>
 `A Pheydrus client described her most innovative client work and her most chaotic work schedule both happening since she moved to this address. This location amplifies the unconventional - the systems that work for everyone else won't work here, but systems designed around how she thinks produce results she couldn't replicate anywhere else.`,
 8: (_goal) =>
 `A Pheydrus client had two financial partnerships dissolve unexpectedly in the two years after moving to this address - both with people she had worked with before, without incident, elsewhere. This address introduces volatility into shared financial arrangements that only structures built for flexibility can withstand.`,
 11: (_goal) =>
 `A Pheydrus client's professional community at this address had completely reorganized twice in three years - the people who seemed central to her network at move-in were mostly gone. This address accelerates how fast communities evolve; the disorientation lifts when she realizes the ones who stayed are the only ones that matter.`,
 },
 Neptune: {
 2: (_goal) =>
 `One client raised her rates 40% within 30 days of her Pillar 3 session and signed her highest-paying client that same week. Neptune in the financial house at your address creates a fog around self-worth and money - it's the most immediately fixable layer in this entire report.`,
 6: (_goal) =>
 `A Pheydrus client described her work at this address as simultaneously more inspired and more undisciplined than anywhere she'd ever lived - she had her best ideas and missed more deadlines. This address requires building separate containers for vision and execution, because they stop regulating each other naturally here.`,
 8: (_goal) =>
 `A Pheydrus client discovered after two years at this address that a financial partnership she'd trusted completely had terms she'd never fully read - and she had signed them. This address creates a fog around shared money that requires the most rigorous paper trail and explicit agreements she has ever demanded from anyone.`,
 11: (_goal) =>
 `A Pheydrus client built a following of thousands at this address and described it as the most professionally isolated period of her life. The community existed; the genuine mutual investment she was building it for kept being replaced by people who wanted to receive without reciprocating. Shared purpose has to be explicit here, or it becomes projection.`,
 },
 Pluto: {
 2: (_goal) =>
 `A Pheydrus client described her income at this address as either transforming completely or threatening to collapse - there was no flat year. This address concentrates financial intensity until the old relationship with money is burned down and a new one is built deliberately in its place.`,
 6: (_goal) =>
 `A Pheydrus client described her work environment at this address as one where she either produced the best work of her career or hit walls that felt immovable - sometimes in the same week. This address amplifies the gap between high-leverage activity and everything else, and it will keep intensifying until that gap is finally closed.`,
 8: (_goal) =>
 `A Pheydrus client walked away from the most significant financial partnership of her career two years after moving to this address - she described it as a power struggle neither person could win. This address forces a reckoning with how control operates in shared financial structures, and it doesn't relent until the pattern is genuinely resolved.`,
 11: (_goal) =>
 `A Pheydrus client's most important professional community completely reorganized around her at this address - the people she had built with were gradually replaced by people operating at a different level. The loss was real. So was what replaced it. This address transforms networks at the root, not the surface.`,
 },
};

// ── Address interpretation ────────────────────────────────────────────────────

const ADDRESS_THEMES: Partial<Record<number, string>> = {
 1: 'independence, initiation, and self-leadership',
 2: 'cooperation, partnership, and emotional harmony',
 3: 'creative expression, social energy, and scattered focus',
 4: 'structure, discipline, and foundational stability',
 5: 'freedom, change, and restless expansion',
 6: 'responsibility, care, and family obligation',
 7: 'reflection, analysis, and inner mastery',
 8: 'material power, ambition, and financial intensity',
 9: 'completion, release, and universal service',
 11: 'spiritual illumination, heightened intuition, and inspired vision',
};

export function getAddressInterpretation(item: GradeItem, goal: GoalCategory): string {
 const numMatch = item.source.match(/:\s*(\d+)/);
 const num = numMatch ? parseInt(numMatch[1]) : null;
 const theme = num !== null ? (ADDRESS_THEMES[num] ?? 'neutral energy') : 'neutral energy';
 const gw = goal === 'love' ? 'relationship goals' : 'career and financial goals';

 if (item.grade === 'F') {
 if (num === 3) return `Your address is a 3. It scatters focus, drains momentum, and keeps your ${gw} in idea mode instead of execution mode.`;
 if (num === 6) return `Your address is a 6. It keeps pulling your energy toward duty and other people's needs, away from the focused action your ${gw} require.`;
 if (num === 8) return `Your address is an 8. It adds pressure, power struggle, and money stress. You spend energy proving yourself instead of building your ${gw}.`;
 if (num === 9) return `Your address is a 9. It favors release and completion, not build and scale. That slows your ${gw}.`;
 return `Your address number ${num ?? ' - '} (${theme}) creates friction that slows your ${gw}.`;
 }

 if (item.grade === 'C') {
 if (num === 1) return `Your address is a 1. It boosts independence. Use it for bold action, not isolation.`;
 if (num === 4) return `Your address is a 4. It rewards structure and consistency. Used well, it becomes a stable base for your ${gw}. Used poorly, it feels rigid and slow.`;
 if (num === 5) return `Your address is a 5. It amplifies movement and change. Without focus, it scatters you. With focus, it accelerates your ${gw}.`;
 return `Your address number ${num ?? ' - '} (${theme}) is mixed for your ${gw}. Outcome depends on how you work the pattern.`;
 }

 if (item.grade === 'A') {
 if (num === 2) return `Your address is a 2. It supports harmony, collaboration, and steady momentum for your ${gw}.`;
 if (num === 7) return `Your address is a 7. It supports depth, strategy, and mastery. Strong match for your ${gw}.`;
 if (num === 11) return `Your address is an 11. It supports intuition, clarity, and inspired decision-making for your ${gw}.`;
 return `Your address number ${num ?? ' - '} (${theme}) supports your ${gw}.`;
 }

 return `Your address (${theme}) has a neutral environmental impact relative to your ${gw}.`;
}

// ── Life Cycle interpretation ─────────────────────────────────────────────────

export function getLifeCycleInterpretation(item: GradeItem): string {
 if (item.grade === 'F') {
 return `Your current personal year is heavy. It brings pressure, exposure, and forced growth. Pushing harder into old patterns creates resistance. Facing what this cycle is surfacing creates movement.`;
 }
 if (item.grade === 'A') {
 return `Your current personal year is supportive. Momentum is available now, and results can move faster than usual.`;
 }
 return `Your current personal year is neutral. The direction is yours to set.`;
}

// ── Fallback copy (for combos not in the lookup) ─────────────────────────────

const PLANET_BRIEF: Record<string, string> = {
 Pluto: 'power and transformation',
 Saturn: 'restriction and delay',
 Uranus: 'disruption and instability',
 Mars: 'aggression and impulsivity',
 Neptune: 'confusion and illusion',
};
const HOUSE_BRIEF: Partial<Record<number, string>> = {
 1: 'identity and self-presentation',
 2: 'income and financial security',
 5: 'romance and creative expression',
 6: 'work, daily productivity, and money',
 7: 'committed relationships and marriage',
 8: 'shared resources, money, and transformation',
 10: 'career, money, reputation, and public standing',
 11: 'networks, goals, and community',
};

function fallbackF(planet: string, house: number, goal: GoalCategory): string {
 const pt = PLANET_BRIEF[planet] ?? 'challenging planetary energy';
 const ht = HOUSE_BRIEF[house] ?? `house ${house}`;
 const g = goal === 'love' ? 'love and relationship goals' : 'career and financial goals';
 return `${planet}'s energy of ${pt} in your ${ht} house creates persistent pressure on your ${g}. Until this energy is consciously mastered, it acts as a recurring drag on the progress you're working toward.`;
}

function fallbackC(planet: string, house: number, goal: GoalCategory, dur: string): string {
 const pt = PLANET_BRIEF[planet] ?? 'challenging planetary energy';
 const ht = HOUSE_BRIEF[house] ?? `house ${house}`;
 const g = goal === 'love' ? 'love and relationship goals' : 'career and financial goals';
 return `${planet}'s ${pt} energy is in your ${ht} house${dur ? ` ${dur}` : ''} - a pressure that can go either way for your ${g}. Shadow path: self-sabotage in this area that confirms the pattern. Conscious path: channeling ${planet}'s energy at its highest expression to break through the very limitation it represents.`;
}

// ── Main interpretation dispatcher ───────────────────────────────────────────

function applyGoalText(text: string, _goalText?: string): string {
 return applyKmsStyle(text);
}

export function getItemInterpretation(
 item: GradeItem,
 goal: GoalCategory,
 transits: PlanetaryTransit[],
 goalText?: string
): string {
 if (item.section === 'Address') return applyGoalText(getAddressInterpretation(item, goal), goalText);
 if (item.section === 'Life Cycle') return applyGoalText(getLifeCycleInterpretation(item), goalText);

 const { planet, house, grade, pillar } = item;
 if (!planet || !house) return item.reason;

 const endYear = pillar === 2 ? getTransitEndYear(planet, transits) : null;
 const durStr = endYear ? formatDuration(endYear) : '';

 // C grade from Pillar 2 pressure houses
 if (pillar === 2 && grade === 'C') {
 const fn = TRANSIT_C_INTERP[planet]?.[house];
 const text = fn && endYear ? fn(endYear) : fallbackC(planet, house, goal, durStr);
 return applyGoalText(text, goalText);
 }

 // C grade from Pillar 3 relocation pressure houses
 if (pillar === 3 && grade === 'C') {
 const fn = RELOCATION_C_INTERP[planet]?.[house];
 const text = fn ? fn(goal) : fallbackC(planet, house, goal, '');
 return applyGoalText(text, goalText);
 }

 // F grade (natal, relocation, or transit-angular)
 if (grade === 'F') {
 const interp = F_INTERP[planet]?.[house];
 const baseText = interp ? (goal === 'love' ? interp.love : interp.career) : fallbackF(planet, house, goal);
 const text = endYear ? `${baseText} This transit runs ${durStr}.` : baseText;
 return applyGoalText(text, goalText);
 }

 return applyGoalText(item.reason, goalText);
}
