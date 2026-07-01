/**
 * InvisibleForcesResultsPage - Light Edition
 * White background with dark text, golden accents.
 */

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { exportClientReportToPDF } from '../../services/pdfExport';
import { renderHouseWheel } from '../../services/pdfExport/clientReportTemplate';
import {
 detectGoalCategory,
 getItemInterpretation,
 getLongestMaleficTransit,
 formatDuration,
 getTransitEndYear,
 type GoalCategory,
} from '../../services/pdfExport/clientInterpretations';
import { applyKmsStyle } from '../../services/pdfExport/kmsStyle';
import { getLibraryEntry, getDefaultSteps2, BENEFIC_PLANETS } from '../../data/planetHouseLibrary';
import type { GradeItem, PillarSummary } from '../../models/diagnostic';
import type { PlanetaryTransit } from '../../models/calculators';
import type { ConsolidatedResults } from '../../models';
import type { ClientIntakeData } from '../../models/clientIntake';

// ── Design tokens ─────────────────────────────────────────────────────────────

const CORMORANT = "'Cormorant Garamond', Georgia, serif";
const INTER = "'Inter', Arial, sans-serif";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pillarScore(p: PillarSummary): number {
 return p.fCount + p.cCount * 0.5;
}

function normalizedAlignmentScore(totalFs: number, totalCs: number, totalAs: number): number {
 const maxPressurePoints = 12;
 const netPressurePoints = Math.min(
 maxPressurePoints,
 Math.max(0, totalFs + totalCs * 0.5 - totalAs * 0.5)
 );
 return Math.round(((maxPressurePoints - netPressurePoints) / maxPressurePoints) * 100);
}

function getPillarLetterGrade(pillar: PillarSummary): string {
 const grades = pillar.items.map((item) => item.grade);
 if (grades.includes('F') || pillar.fCount > 0) return 'F';
 if (grades.includes('C') || pillar.cCount > 0) return 'C';
 return 'A';
}

function isCOrBelow(grade: string): boolean {
 return grade === 'C' || grade === 'F';
}

type ProgramRoute = 'hero' | 'artists-way' | 'business';

type ProgramRecommendation = {
 route: ProgramRoute;
 title: string;
 description: string;
 link: string;
 buttonLabel: string;
};

const PROGRAM_DETAILS: Record<ProgramRoute, ProgramRecommendation> = {
 hero: {
 route: 'hero',
 title: `Hero's Journey`,
 description:
 "Have you spent years being told you're too much, too difficult, too intense - no matter how much you work on yourself? That's not a personality flaw. That's a Pillar 1 pattern running unchecked. We use a proprietary sequential deconditioning method to decode your exact angular house placements - and turn what's been misread as your weakness into your most powerful asset.",
 link: 'https://pheydrusmetaverse.com/heros-journey/',
 buttonLabel: "Watch Hero's Journey →",
 },
 'artists-way': {
 route: 'artists-way',
 title: 'Checkout These Viral Mini Courses ✍️ at 50%+ Off',
 description:
 "For people who REALLY need to fix Pillar 3 FAST. If you've done all the inner work and now looking for the PERFECT environment, Portal Activation is for you. It's our proprietary Feng Shui × Astrocartography × Real Estate Numerology method that helps you realign your external reality to match who you've already become.",
 link: 'https://pheydrusmetaverse.com/portal-activation/#',
 buttonLabel: 'Watch Portal Activation →',
 },
 business: {
 route: 'business',
 title: 'Business Energy Blueprint Bundle 💵',
 description:
 "Good for people looking to discover their voice, quit their first content/course, go viral, and quit their job. If you're feeling the urge to launch, pivot, or make money in a completely new way, that's your business houses activating and telling you it's YOUR TIME to SHINE. Fully step into your purpose with our two viral business/purpose courses!",
 link: 'https://pheydrusmetaverse.com/career-bundle/',
 buttonLabel: 'Activate Your Business Energy Blueprint! →',
 },
};

function getTwoProgramRecommendations(
 p1: PillarSummary,
 p2: PillarSummary,
 p3: PillarSummary,
 allItems: GradeItem[]
): ProgramRecommendation[] {
 const s1 = pillarScore(p1);
 const s2 = pillarScore(p2);
 const s3 = pillarScore(p3);
 const p2Grade = getPillarLetterGrade(p2);
 const p3Grade = getPillarLetterGrade(p3);

 const businessHouses = [2, 6, 8, 10];
 const hasBusinessHouseActivation = allItems.some((item) =>
 businessHouses.includes(item.house ?? 0)
 );
 const isP1Worst = s1 >= s2 && s1 >= s3;
 const isP3Worst = s3 >= s1 && s3 >= s2;
 const primaryRoute: ProgramRoute = isP1Worst
 ? 'hero'
 : isP3Worst
 ? 'artists-way'
 : hasBusinessHouseActivation
 ? 'business'
 : s1 >= s3
 ? 'hero'
 : 'artists-way';

 let secondaryRoute: ProgramRoute;

 if (primaryRoute === 'business') {
 secondaryRoute = isCOrBelow(p2Grade) || isCOrBelow(p3Grade) ? 'artists-way' : 'hero';
 } else if (primaryRoute === 'artists-way') {
 secondaryRoute = hasBusinessHouseActivation ? 'business' : 'hero';
 } else {
 secondaryRoute = hasBusinessHouseActivation ? 'business' : 'artists-way';
 }

 return [PROGRAM_DETAILS[primaryRoute], PROGRAM_DETAILS[secondaryRoute]];
}

const GOAL_LABEL: Record<GoalCategory, string> = {
 career: 'Career & Financial Growth',
 love: 'Love & Relationships',
 general: 'Your Goals',
};

const GOAL_SHORT: Record<GoalCategory, string> = {
 career: 'career & financial growth',
 love: 'love & relationships',
 general: 'your goals',
};

const GRADE_COLOR: Record<string, { border: string; bg: string; text: string }> = {
 A: { border: '#4ADE80', bg: 'rgba(74,222,128,0.1)', text: '#4ADE80' },
 B: { border: '#60A5FA', bg: 'rgba(96,165,250,0.1)', text: '#60A5FA' },
 C: { border: '#D4A843', bg: 'rgba(212,168,67,0.1)', text: '#D4A843' },
 F: { border: '#F87171', bg: 'rgba(248,113,113,0.1)', text: '#F87171' },
};

function gradeColor(g: string) {
 return GRADE_COLOR[g] ?? GRADE_COLOR['F'];
}

/** Mirror line for known planet+house combos */
function getMirrorLine(item: GradeItem, goalShort: string): string | null {
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
function getTransmuteLine(item: GradeItem): string | null {
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

// ── SVG wrapper ───────────────────────────────────────────────────────────────

function SvgChart({ svg }: { svg: string }) {
 return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ── Venn diagram ──────────────────────────────────────────────────────────────

function VennDiagram() {
 return (
 <svg width="200" height="188" viewBox="0 0 200 188" xmlns="http://www.w3.org/2000/svg">
 <circle
 cx="100"
 cy="68"
 r="58"
 fill="#C9A84C"
 fillOpacity="0.18"
 stroke="#D4A843"
 strokeWidth="1.5"
 />
 <circle
 cx="67"
 cy="127"
 r="58"
 fill="#7B5EA7"
 fillOpacity="0.18"
 stroke="#B8A8E0"
 strokeWidth="1.5"
 />
 <circle
 cx="133"
 cy="127"
 r="58"
 fill="#2E8B7A"
 fillOpacity="0.18"
 stroke="#7ECFC4"
 strokeWidth="1.5"
 />
 <text x="100" y="30" textAnchor="middle" fontSize="12" fill="#E8C46A" fontFamily="'Cormorant Garamond',Georgia,serif" fontWeight="600">Soul / Karma</text>
 <text x="100" y="43" textAnchor="middle" fontSize="9" fill="#C0B4E0" fontFamily="Arial,sans-serif">Pillar 1</text>
 <text x="43" y="162" textAnchor="middle" fontSize="12" fill="#C0B0F0" fontFamily="'Cormorant Garamond',Georgia,serif" fontWeight="600">Timing</text>
 <text x="43" y="174" textAnchor="middle" fontSize="9" fill="#C0B4E0" fontFamily="Arial,sans-serif">Pillar 2</text>
 <text x="148" y="162" textAnchor="middle" fontSize="10" fill="#7ECFC4" fontFamily="'Cormorant Garamond',Georgia,serif" fontWeight="600">Environment</text>
 <text x="148" y="174" textAnchor="middle" fontSize="9" fill="#C0B4E0" fontFamily="Arial,sans-serif">Pillar 3</text>
 <text x="100" y="110" textAnchor="middle" fontSize="11" fill="#E8DEFF" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic">Full</text>
 <text x="100" y="123" textAnchor="middle" fontSize="11" fill="#E8DEFF" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic">Alignment</text>
 </svg>
 );
}

// ── Testimonial card ──────────────────────────────────────────────────────────

function TestimonialCard({ quote, attribution }: { quote: string; attribution: string }) {
 return (
 // REPLACE WITH REAL TESTIMONIAL
 <div
 style={{
 background: '#0C1128',
 borderLeft: '3px solid #C9A84C',
 borderRadius: '4px',
 padding: '20px 24px',
 position: 'relative',
 overflow: 'hidden',
 border: '1px solid rgba(255,255,255,0.1)',
 }}
 >
 <span
 aria-hidden="true"
 style={{
 position: 'absolute',
 top: '-16px',
 left: '10px',
 fontSize: '90px',
 color: '#C9A84C',
 opacity: 0.12,
 fontFamily: CORMORANT,
 lineHeight: 1,
 userSelect: 'none',
 }}
 >
 "
 </span>
 <p
 style={{
 fontFamily: CORMORANT,
 fontStyle: 'italic',
 color: '#D4A843',
 fontSize: '1.05rem',
 lineHeight: 1.65,
 margin: '0 0 10px',
 position: 'relative',
 }}
 >
 {quote}
 </p>
 <p style={{ fontFamily: INTER, color: '#C8C0E8', fontSize: '0.8rem', margin: 0 }}>
 - {attribution}
 </p>
 </div>
 );
}

// ── Pillar timeline ───────────────────────────────────────────────────────────

function getPillar2MaxEndYear(
 pillar2Items: GradeItem[],
 transits: PlanetaryTransit[]
): number | null {
 let max: number | null = null;
 for (const item of pillar2Items) {
 if (!item.planet) continue;
 if (item.grade !== 'F' && item.grade !== 'C') continue;
 const y = getTransitEndYear(item.planet, transits);
 if (y !== null && (max === null || y > max)) max = y;
 }
 return max;
}

function PillarTimeline({
 pillarNum,
 pillar2Items,
 pillar3Items: _pillar3Items,
 transits,
 addressMoveDate,
}: {
 pillarNum: 1 | 2 | 3;
 pillar2Items: GradeItem[];
 pillar3Items: GradeItem[];
 transits: PlanetaryTransit[];
 addressMoveDate: string;
}) {
 const base: CSSProperties = {
 marginTop: '12px',
 paddingLeft: '12px',
 borderLeft: '2px solid #C9A84C',
 fontSize: '0.75rem',
 color: '#8880A8',
 lineHeight: 1.6,
 fontFamily: INTER,
 };

 if (pillarNum === 1) {
 return (
 <p style={base}>
 <strong style={{ color: '#C9A84C' }}>⏱ Timeline:</strong> Life-long - this is your permanent
 structural layer. It does not expire, but it can be consciously mastered.
 </p>
 );
 }

 const endYear = getPillar2MaxEndYear(pillar2Items, transits);

 if (pillarNum === 2) {
 return (
 <p style={base}>
 <strong style={{ color: '#C9A84C' }}>⏱ Timeline:</strong>{' '}
 {endYear ? (
 <>
 Active <strong style={{ color: '#D4A843' }}>{formatDuration(endYear)}</strong>. This
 window will lift - knowing when is half the advantage.
 </>
 ) : (
 'The active timing pressures are relatively short-cycle.'
 )}
 </p>
 );
 }

 const addressNote = addressMoveDate
 ? ` Did this pattern intensify around ${addressMoveDate} when you moved?`
 : '';
 return (
 <p style={base}>
 <strong style={{ color: '#C9A84C' }}>⏱ Timeline:</strong> Amplifies your active transits for{' '}
 {endYear ? (
 <>
 approximately <strong style={{ color: '#D4A843' }}>{formatDuration(endYear)}</strong>,
 mirroring your active transit window.
 </>
 ) : (
 'the duration of your active transit window.'
 )}
 {addressNote && <em> {addressNote}</em>}
 </p>
 );
}

// ── Aspect card ───────────────────────────────────────────────────────────────

function AspectCard({
 item,
 goal,
 goalShort,
 goalText,
 transits,
}: {
 item: GradeItem;
 goal: GoalCategory;
 goalShort: string;
 goalText: string;
 transits: PlanetaryTransit[];
}) {
 const gc = gradeColor(item.grade);
 const libraryEntry = getLibraryEntry(item.planet, item.house, item.pillar);
 const addressLevel = item.section === 'Address' && item.source ? ` (${item.source.split(':')[0]})` : '';
 const label = item.section === 'Address' ? `🏠 Address Energy${addressLevel}` : item.source;
 const endYear =
 item.section === 'Transit Angular' || item.section === 'Life Cycle'
 ? getTransitEndYear(item.planet ?? '', transits)
 : null;

 if (libraryEntry) {
 const hurtHelpLabel =
 item.grade === 'F'
 ? { text: '⚡ Hurts Goal', bg: 'rgba(248,113,113,0.12)', color: '#F87171', border: 'rgba(248,113,113,0.4)' }
 : item.grade === 'C'
 ? { text: '⚠️ Caution', bg: 'rgba(212,168,67,0.1)', color: '#E8A838', border: '#C9A84C' }
 : item.grade === 'A'
 ? { text: '✓ Helps Goal', bg: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '#2ecc71' }
 : null;

 return (
 <div
 style={{
 background: '#0C1128',
 borderLeft: `3px solid ${gc.border}`,
 borderRadius: '4px',
 padding: '14px 16px',
 marginBottom: '10px',
 border: `1px solid rgba(255,255,255,0.1)`,
 }}
 >
 <div
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: '8px',
 marginBottom: '8px',
 flexWrap: 'wrap' as const,
 }}
 >
 <span style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 700, color: '#E8DEFF' }}>
 {label}
 </span>
 <span
 style={{
 display: 'inline-block',
 padding: '2px 8px',
 borderRadius: '2px',
 fontSize: '10px',
 fontWeight: 700,
 background: gc.bg,
 color: gc.text,
 border: `1px solid ${gc.border}`,
 fontFamily: INTER,
 }}
 >
 {item.grade}
 {endYear ? ` · thru ${endYear}` : ''}
 </span>
 {hurtHelpLabel && (
 <span
 style={{
 display: 'inline-block',
 padding: '2px 8px',
 borderRadius: '2px',
 fontSize: '10px',
 fontWeight: 700,
 background: hurtHelpLabel.bg,
 color: hurtHelpLabel.color,
 border: `1px solid ${hurtHelpLabel.border}`,
 fontFamily: INTER,
 }}
 >
 {hurtHelpLabel.text}
 </span>
 )}
 </div>
 <p
 style={{
 fontFamily: INTER,
 fontSize: '0.72rem',
 color: '#FFFFFF',
 lineHeight: 1.7,
 margin: '0 0 6px',
 }}
 >
 {applyKmsStyle(libraryEntry.hurt_or_help)}
 </p>
 {libraryEntry.note && (
 <p
 style={{
 fontFamily: INTER,
 fontSize: '0.72rem',
 fontStyle: 'italic',
 color: '#C9A84C',
 lineHeight: 1.6,
 margin: '0 0 6px',
 paddingLeft: '10px',
 borderLeft: '2px solid #C9A84C',
 }}
 >
 {applyKmsStyle(libraryEntry.note)}
 </p>
 )}
 <p
 style={{
 fontFamily: INTER,
 fontSize: '0.72rem',
 color: '#DDD8F8',
 lineHeight: 1.7,
 margin: 0,
 }}
 >
 <strong style={{ color: '#16a34a' }}>✅ Do This:</strong> {applyKmsStyle(libraryEntry.steps)}
 </p>
 <p
 style={{
 fontFamily: INTER,
 fontSize: '0.72rem',
 color: '#DDD8F8',
 lineHeight: 1.7,
 margin: 0,
 }}
 >
 <strong style={{ color: '#16a34a' }}>✅ Do This:</strong>{' '}
 {applyKmsStyle(libraryEntry.steps2 ?? getDefaultSteps2(item.planet ?? '', item.pillar))}
 </p>
 </div>
 );
 }

 // Fallback: original mirror/interp/transmute layout for entries not in the library
 const interp = getItemInterpretation(item, goal, transits, goalText);
 const mirror = getMirrorLine(item, goalShort);
 const transmute = getTransmuteLine(item);

 return (
 <div
 style={{
 background: '#0C1128',
 borderLeft: `3px solid ${gc.border}`,
 borderRadius: '4px',
 padding: '14px 16px',
 marginBottom: '10px',
 border: `1px solid rgba(255,255,255,0.1)`,
 }}
 >
 {mirror && (
 <p
 style={{
 fontFamily: CORMORANT,
 fontStyle: 'italic',
 color: '#E8DEFF',
 fontSize: '0.9rem',
 margin: '0 0 8px',
 lineHeight: 1.55,
 }}
 >
 "{mirror}"
 </p>
 )}
 <div
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: '8px',
 marginBottom: '6px',
 flexWrap: 'wrap' as const,
 }}
 >
 <span style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 700, color: '#E8DEFF' }}>
 {label}
 </span>
 <span
 style={{
 display: 'inline-block',
 padding: '2px 8px',
 borderRadius: '2px',
 fontSize: '10px',
 fontWeight: 700,
 background: gc.bg,
 color: gc.text,
 border: `1px solid ${gc.border}`,
 fontFamily: INTER,
 }}
 >
 {item.grade}
 {endYear ? ` · thru ${endYear}` : ''}
 </span>
 </div>
 <p
 style={{
 fontFamily: INTER,
 fontSize: '0.72rem',
 color: '#8880A8',
 lineHeight: 1.7,
 margin: transmute ? '0 0 8px' : '0',
 }}
 >
 {applyKmsStyle(interp)}
 </p>
 {transmute && (
 <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '7px' }}>
 <p
 style={{
 fontFamily: INTER,
 fontSize: '0.72rem',
 fontStyle: 'italic',
 color: '#C9A84C',
 margin: 0,
 lineHeight: 1.6,
 }}
 >
 <strong>Higher octave:</strong> {applyKmsStyle(transmute)}
 </p>
 </div>
 )}
 </div>
 );
}

// ── Pillar deep-dive card ─────────────────────────────────────────────────────

const PILLAR_BADGE_STYLE: Record<1 | 2 | 3, CSSProperties> = {
 1: { background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.4)' },
 2: { background: 'rgba(212,168,67,0.12)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.5)' },
 3: { background: 'rgba(212,168,67,0.08)', color: '#D4A843', border: '1px solid rgba(150,120,80,0.5)' },
};

const PILLAR_CALLOUT: Record<1 | 2 | 3, (goal: string, loc: string) => string> = {
 1: (goal) => `Here is how Pillar 1 is specifically blocking your goal of ${goal}:`,
 2: (goal) =>
 `Here is how your current timing window is directly affecting your ability to reach ${goal}:`,
 3: (goal, loc) =>
 `Here is how your current address${loc ? ` in ${loc}` : ''} is interacting with your goal of ${goal}:`,
};

const REPORT_SECTIONS: Array<{ id: string; label: string }> = [
 { id: 'cover', label: 'Overview' },
 { id: 'pattern', label: 'Why This Happens' },
 { id: 'pillars', label: '3-Pillar Breakdown' },
 { id: 'solution', label: 'Your Solution' },
 { id: 'next-steps', label: 'Next Steps' },
 { id: 'actions', label: 'Export & Reset' },
];

function PillarDeepDiveCard({
 pillar,
 index,
 title,
 subtitle,
 goal,
 goalShort,
 goalText,
 location,
 transits,
 pillar2Items,
 pillar3Items,
 addressMoveDate,
}: {
 pillar: PillarSummary;
 index: 1 | 2 | 3;
 title: string;
 subtitle: string;
 goal: GoalCategory;
 goalShort: string;
 goalText: string;
 location: string;
 transits: PlanetaryTransit[];
 pillar2Items: GradeItem[];
 pillar3Items: GradeItem[];
 addressMoveDate: string;
}) {
 const rawScoringItems = pillar.items.filter(
 (i) => i.grade === 'F' || i.grade === 'C' || i.grade === 'A'
 );

 // Skip: grade A + benefic planet (library shows no pressure)
 // Skip: duplicate planet within the same pillar (show once)
 const seenPlanets = new Set<string>();
 const dedupedItems = rawScoringItems.filter((i) => {
 if (i.planet && i.grade === 'A' && BENEFIC_PLANETS.has(i.planet)) return false;
 if (i.planet) {
 if (seenPlanets.has(i.planet)) return false;
 seenPlanets.add(i.planet);
 }
 return true;
 });

 // Sort: F first, C second, A last; Life Cycle and Address always last regardless of grade
 const GRADE_ORDER: Record<string, number> = { F: 0, C: 1, A: 2, Neutral: 3 };
 const isFooterSection = (i: GradeItem) => i.section === 'Life Cycle' || i.section === 'Address';
 const scoringItems = [...dedupedItems].sort((a, b) => {
 const aFooter = isFooterSection(a) ? 1 : 0;
 const bFooter = isFooterSection(b) ? 1 : 0;
 if (aFooter !== bFooter) return aFooter - bFooter;
 return (GRADE_ORDER[a.grade] ?? 3) - (GRADE_ORDER[b.grade] ?? 3);
 });

 const callout = PILLAR_CALLOUT[index](goalShort, location);
 const accentColor = index === 1 ? '#F87171' : index === 2 ? '#C9A84C' : '#9a7d4e';
 const pillarGrade = getPillarLetterGrade(pillar);

 return (
 <div
 style={{
 background: '#0C1128',
 border: '1px solid rgba(255,255,255,0.1)',
 borderRadius: '4px',
 padding: '20px 24px',
 }}
 >
 {/* Header */}
 <div
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: '10px',
 marginBottom: '10px',
 flexWrap: 'wrap' as const,
 }}
 >
 <span
 style={{
 ...PILLAR_BADGE_STYLE[index],
 fontSize: '10px',
 fontWeight: 700,
 padding: '2px 8px',
 borderRadius: '2px',
 fontFamily: INTER,
 }}
 >
 PILLAR {index}
 </span>
 <span
 style={{ fontFamily: CORMORANT, fontSize: '1.1rem', fontWeight: 700, color: '#E8DEFF' }}
 >
 {title} - {subtitle}
 </span>
 <span
 style={{
 marginLeft: 'auto',
 fontSize: '1.2rem',
 fontWeight: 900,
 color: accentColor,
 fontFamily: INTER,
 }}
 >
 {pillarGrade}
 </span>
 </div>

 {/* Goal callout */}
 <p
 style={{
 fontFamily: CORMORANT,
 fontStyle: 'italic',
 color: '#D4A843',
 fontSize: '0.9rem',
 lineHeight: 1.5,
 padding: '7px 12px',
 background: 'rgba(201,168,76,0.06)',
 borderBottom: '1px solid rgba(201,168,76,0.18)',
 borderRadius: '4px 4px 0 0',
 margin: '0 0 14px',
 }}
 >
 {callout}
 </p>

 {/* Content: house wheel + aspect cards */}
 <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
 <div style={{ flexShrink: 0, textAlign: 'center', width: '108px' }}>
 <SvgChart svg={renderHouseWheel(pillar.items, 108)} />
 <p style={{ fontSize: '9px', color: '#7068A0', margin: '4px 0 3px', fontFamily: INTER }}>
 {index === 3 ? 'Env Chart' : index === 2 ? 'Transit Chart' : 'House Chart'}
 </p>
 <div style={{ fontSize: '8px', fontFamily: INTER }}>
 <span
 style={{
 display: 'inline-block',
 width: '7px',
 height: '7px',
 background: '#C0392B',
 borderRadius: '1px',
 verticalAlign: 'middle',
 }}
 />{' '}
 <span style={{ color: '#A098C0' }}>F</span>&nbsp;
 <span
 style={{
 display: 'inline-block',
 width: '7px',
 height: '7px',
 background: '#C9A84C',
 borderRadius: '1px',
 verticalAlign: 'middle',
 }}
 />{' '}
 <span style={{ color: '#A098C0' }}>C</span>&nbsp;
 <span
 style={{
 display: 'inline-block',
 width: '7px',
 height: '7px',
 background: '#2ecc71',
 borderRadius: '1px',
 verticalAlign: 'middle',
 }}
 />{' '}
 <span style={{ color: '#A098C0' }}>A</span>
 </div>
 </div>
 <div style={{ flex: 1 }}>
 {scoringItems.length === 0 ? (
 <p
 style={{
 fontSize: '0.8rem',
 color: '#16a34a',
 fontStyle: 'italic',
 fontFamily: INTER,
 }}
 >
 No significant pressure in this pillar - this dimension is working in your favor.
 </p>
 ) : (
 scoringItems.map((item, i) => (
 <AspectCard
 key={i}
 item={item}
 goal={goal}
 goalShort={goalShort}
 goalText={goalText}
 transits={transits}
 />
 ))
 )}
 </div>
 </div>

 <PillarTimeline
 pillarNum={index}
 pillar2Items={pillar2Items}
 pillar3Items={pillar3Items}
 transits={transits}
 addressMoveDate={addressMoveDate}
 />
 </div>
 );
}

// ── Cost of Inaction ──────────────────────────────────────────────────────────

function CostOfInaction({ goalShort, endYear }: { goalShort: string; endYear: number | null }) {
 const yearsRemaining = endYear ? endYear - new Date().getFullYear() : null;
 const yearLine = endYear
 ? `Without targeted deconditioning of the specific layers identified above, the data points to ${endYear}.`
 : `Without targeted deconditioning of the specific layers identified above, this pattern does not self-resolve.`;

 return (
 <div
 style={{
 background: 'rgba(248,113,113,0.07)',
 border: '1px solid #FAEAEA',
 borderRadius: '4px',
 padding: '28px 32px',
 }}
 >
 <h3
 style={{
 fontFamily: CORMORANT,
 color: '#E8DEFF',
 fontSize: '1.6rem',
 fontWeight: 700,
 margin: '0 0 20px',
 lineHeight: 1.3,
 }}
 >
 What Another Year of This Pattern Costs You
 </h3>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 {[
 `Another 12 months of knowing exactly what to do - and watching yourself not do it.`,
 `Another year of income that almost hits ${goalShort}, but resets every time you get close.`,
 `Another year of brilliant ideas living in your drafts folder instead of the marketplace.`,
 `Another year of telling yourself next month will be different.`,
 yearLine,
 ].map((line, i) => (
 <p
 key={i}
 style={{
 margin: 0,
 fontSize: '0.85rem',
 color: '#DDD8F8',
 lineHeight: 1.7,
 fontFamily: INTER,
 borderLeft: '2px solid #C0392B',
 paddingLeft: '12px',
 }}
 >
 {line}
 </p>
 ))}
 {yearsRemaining !== null && yearsRemaining > 0 && (
 <p
 style={{
 margin: 0,
 fontSize: '0.9rem',
 fontWeight: 700,
 color: '#F87171',
 fontFamily: INTER,
 }}
 >
 That's {yearsRemaining} more year{yearsRemaining !== 1 ? 's' : ''}.
 </p>
 )}
 <p
 style={{
 margin: 0,
 fontSize: '1rem',
 fontWeight: 700,
 color: '#C9A84C',
 fontFamily: INTER,
 }}
 >
 Or - you begin the decondition now.
 </p>
 </div>
 </div>
 );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function InvisibleForcesResultsPage() {
 const location = useLocation();
 const navigate = useNavigate();
 const [isExporting, setIsExporting] = useState(false);
 const [scrollProgress, setScrollProgress] = useState(0);
 const [activeSection, setActiveSection] = useState<string>(REPORT_SECTIONS[0].id);

 // Accept any truthy ?demo value (e.g., demo=1, demo=true, demo=yes)
 const demoParam = new URLSearchParams(location.search).get('demo');
 const isDemo = demoParam && demoParam !== '0' && demoParam.toLowerCase() !== 'false';

 const DEMO_STATE: { results: ConsolidatedResults; intake: ClientIntakeData } = {
 results: {
 success: true,
 timestamp: new Date().toISOString(),
 userInfo: {
 name: 'Sophia Reyes',
 dateOfBirth: '1990-06-15',
 timeOfBirth: '14:30',
 birthLocation: 'Los Angeles, CA',
 currentLocation: 'Austin, TX',
 address: '123 Demo St, Austin, TX',
 },
 calculators: {
 transits: {
 risingSign: 'Libra',
 transits: [
 {
 planet: 'Uranus',
 planetTheme: 'Disruption & Liberation',
 houseNumber: 10,
 houseTheme: 'Career & Public Image',
 pastHouseNumber: 9,
 pastHouseTheme: 'Beliefs & Travel',
 current: {
 sign: 'Taurus',
 start: '2019-01-01',
 end: '2033-12-31',
 high: '',
 low: '',
 },
 past: { sign: 'Aries', start: '2011-01-01', end: '2019-01-01', high: '', low: '' },
 },
 {
 planet: 'Neptune',
 planetTheme: 'Dissolution & Spirituality',
 houseNumber: 8,
 houseTheme: 'Money & Transformation',
 pastHouseNumber: 7,
 pastHouseTheme: 'Partnerships',
 current: {
 sign: 'Pisces',
 start: '2011-01-01',
 end: '2039-12-31',
 high: '',
 low: '',
 },
 past: { sign: 'Aquarius', start: '1998-01-01', end: '2011-01-01', high: '', low: '' },
 },
 {
 planet: 'Saturn',
 planetTheme: 'Structure & Limitation',
 houseNumber: 8,
 houseTheme: 'Money & Transformation',
 pastHouseNumber: 7,
 pastHouseTheme: 'Partnerships',
 current: {
 sign: 'Pisces',
 start: '2023-01-01',
 end: '2028-12-31',
 high: '',
 low: '',
 },
 past: { sign: 'Aquarius', start: '2020-01-01', end: '2023-01-01', high: '', low: '' },
 },
 ],
 },
 natalChart: null,
 lifePath: null,
 relocation: null,
 addressNumerology: null,
 },
 diagnostic: {
 pillars: [
 {
 pillar: 1,
 name: 'Structure',
 description: 'Natal chart angular placements',
 fCount: 5,
 cCount: 3,
 aCount: 0,
 items: [
 {
 source: 'Natal Angular',
 pillar: 1,
 section: 'Natal Angular',
 planet: 'Saturn',
 house: 5,
 grade: 'F',
 reason: 'Saturn in angular house 5',
 },
 {
 source: 'Natal Angular',
 pillar: 1,
 section: 'Natal Angular',
 planet: 'Uranus',
 house: 5,
 grade: 'F',
 reason: 'Uranus in angular house 5',
 },
 {
 source: 'Natal Angular',
 pillar: 1,
 section: 'Natal Angular',
 planet: 'Neptune',
 house: 5,
 grade: 'F',
 reason: 'Neptune in house 5',
 },
 {
 source: 'Natal Angular',
 pillar: 1,
 section: 'Natal Angular',
 planet: 'Pluto',
 house: 8,
 grade: 'F',
 reason: 'Pluto in angular house 8',
 },
 {
 source: 'Natal Angular',
 pillar: 1,
 section: 'Natal Angular',
 planet: 'Chiron',
 house: 1,
 grade: 'F',
 reason: 'Chiron in angular house 1',
 },
 {
 source: 'Natal Angular',
 pillar: 1,
 section: 'Natal Angular',
 planet: 'Mercury',
 house: 6,
 grade: 'C',
 reason: 'Mercury in house 6',
 },
 {
 source: 'Natal Angular',
 pillar: 1,
 section: 'Natal Angular',
 planet: 'Venus',
 house: 8,
 grade: 'C',
 reason: 'Venus in house 8',
 },
 {
 source: 'Natal Angular',
 pillar: 1,
 section: 'Natal Angular',
 planet: 'Mars',
 house: 12,
 grade: 'C',
 reason: 'Mars in house 12',
 },
 ],
 },
 {
 pillar: 2,
 name: 'Timing',
 description: 'Current planetary transits',
 fCount: 0,
 cCount: 1,
 aCount: 2,
 items: [
 {
 source: 'Transit Angular',
 pillar: 2,
 section: 'Transit Angular',
 planet: 'Jupiter',
 house: 11,
 grade: 'A',
 reason: 'Transit Jupiter in angular house 11',
 },
 {
 source: 'Transit Angular',
 pillar: 2,
 section: 'Transit Angular',
 planet: 'Venus',
 house: 9,
 grade: 'A',
 reason: 'Transit Venus in house 9',
 },
 {
 source: 'Transit Angular',
 pillar: 2,
 section: 'Transit Angular',
 planet: 'Mercury',
 house: 3,
 grade: 'C',
 reason: 'Transit Mercury in house 3',
 },
 ],
 },
 {
 pillar: 3,
 name: 'Environment',
 description: 'Relocation chart for current address',
 fCount: 0,
 cCount: 2,
 aCount: 1,
 items: [
 {
 source: 'Relocation Angular',
 pillar: 3,
 section: 'Relocation Angular',
 planet: 'Sun',
 house: 10,
 grade: 'A',
 reason: 'Relocated Sun in house 10',
 },
 {
 source: 'Relocation Angular',
 pillar: 3,
 section: 'Relocation Angular',
 planet: 'Saturn',
 house: 2,
 grade: 'C',
 reason: 'Relocated Saturn in house 2',
 },
 {
 source: 'Relocation Angular',
 pillar: 3,
 section: 'Relocation Angular',
 planet: 'Uranus',
 house: 2,
 grade: 'C',
 reason: 'Relocated Uranus in house 2',
 },
 ],
 },
 ] as [
 import('../../models/diagnostic').PillarSummary,
 import('../../models/diagnostic').PillarSummary,
 import('../../models/diagnostic').PillarSummary,
 ],
 totalFs: 5,
 totalCs: 6,
 totalAs: 3,
 score: 35,
 finalGrade: 'F',
 allItems: [],
 },
 },
 intake: {
 email: 'sophia@example.com',
 phone: '',
 marketingConsent: true,
 tosConsent: true,
 addressMoveDate: '2024',
 desiredOutcome: 'Grow my income and financial freedom',
 obstacle: 'Bandwidth and self-doubt',
 patternYear: '2024',
 priorHelp: ['coaches'],
 preferredSolution: 'coaching',
 currentSituation: 'employed',
 additionalNotes: '',
 },
 };

 const searchParams = new URLSearchParams(location.search);
 const reportId = searchParams.get('id');
 const rawState = location.state as {
 results: ConsolidatedResults;
 intake: ClientIntakeData;
 } | null;

 const [fetchedState, setFetchedState] = useState<{
 results: ConsolidatedResults;
 intake: ClientIntakeData;
 } | null>(null);
 const [isFetching, setIsFetching] = useState(false);
 const [fetchError, setFetchError] = useState<string | null>(null);

 useEffect(() => {
 if (!reportId || rawState) return;
 setIsFetching(true);
 fetch(`/api/get-results?id=${encodeURIComponent(reportId)}`)
 .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
 .then((data: { results: ConsolidatedResults; intake: ClientIntakeData }) =>
 setFetchedState(data)
 )
 .catch(() => setFetchError('Report not found or expired.'))
 .finally(() => setIsFetching(false));
 }, [reportId, rawState]);

 useEffect(() => {
 const onScroll = () => {
 const scrollTop = window.scrollY || document.documentElement.scrollTop;
 const docHeight = document.documentElement.scrollHeight - window.innerHeight;
 const progress =
 docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
 setScrollProgress(progress);

 // When scrolled within 40px of the bottom, force-activate the last section
 const atBottom = docHeight > 0 && scrollTop >= docHeight - 40;
 const sections = document.querySelectorAll<HTMLElement>('[data-report-section]');
 let current = REPORT_SECTIONS[0].id;
 sections.forEach((section) => {
 if (scrollTop >= section.offsetTop - 140) current = section.id;
 });
 if (atBottom) current = REPORT_SECTIONS[REPORT_SECTIONS.length - 1].id;
 setActiveSection(current);
 };

 onScroll();
 window.addEventListener('scroll', onScroll, { passive: true });
 return () => window.removeEventListener('scroll', onScroll);
 }, []);

 const state = isDemo ? DEMO_STATE : (rawState ?? fetchedState);

 if (isFetching) {
 return (
 <div
 style={{
 minHeight: '100vh',
 background: '#050A18',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 }}
 >
 <p style={{ fontFamily: INTER, color: '#B0A4D8' }}>Loading your report…</p>
 </div>
 );
 }

 if (!state?.results) {
 return (
 <div
 style={{
 minHeight: '100vh',
 background: '#050A18',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '48px 16px',
 }}
 >
 <div
 style={{
 maxWidth: '480px',
 background: '#0C1128',
 border: '1px solid rgba(255,255,255,0.08)',
 borderRadius: '4px',
 padding: '40px',
 textAlign: 'center',
 }}
 >
 <h2
 style={{
 fontFamily: CORMORANT,
 color: '#E8DEFF',
 fontSize: '1.5rem',
 fontWeight: 700,
 marginBottom: '12px',
 }}
 >
 No results found
 </h2>
 <p style={{ color: '#8880A8', fontSize: '0.9rem', marginBottom: '24px', fontFamily: INTER }}>
 {fetchError ?? 'Please complete the assessment first.'}
 </p>
 <button
 onClick={() => navigate('/client')}
 style={{
 padding: '12px 28px',
 background: '#C9A84C',
 color: '#E8DEFF',
 fontWeight: 700,
 borderRadius: '2px',
 border: 'none',
 cursor: 'pointer',
 fontFamily: INTER,
 }}
 >
 Start Assessment
 </button>
 </div>
 </div>
 );
 }

 const { results, intake } = state;
 const goal = detectGoalCategory(intake.desiredOutcome);
 const goalShort = GOAL_SHORT[goal];
 const clientLocation = results.userInfo.currentLocation || '';
 const transits = results.calculators.transits?.transits ?? [];
 const [p1, p2, p3] = results.diagnostic!.pillars;

 const s1 = pillarScore(p1),
 s2 = pillarScore(p2),
 s3 = pillarScore(p3);
 const total = s1 + s2 + s3;
 const p1pct = total === 0 ? 0 : Math.round((s1 / total) * 100);
 const p2pct = total === 0 ? 0 : Math.round((s2 / total) * 100);
 const p3pct = total === 0 ? 0 : Math.round((s3 / total) * 100);
 const diagnosticItems =
 results.diagnostic!.allItems.length > 0
 ? results.diagnostic!.allItems
 : [...p1.items, ...p2.items, ...p3.items];

 const longest = getLongestMaleficTransit(diagnosticItems, transits);
 const { finalGrade } = results.diagnostic!;
 const score = normalizedAlignmentScore(
 results.diagnostic!.totalFs,
 results.diagnostic!.totalCs,
 results.diagnostic!.totalAs
 );
 const gc = gradeColor(finalGrade);
 // CTA eligibility (unused - kept for future re-activation)
 // const wordCount = intake.desiredOutcome.trim().split(/\s+/).filter(Boolean).length;
 // const soughtTherapyOrCoaches =
 // intake.priorHelp.includes('therapy') || intake.priorHelp.includes('coaches');
 // const notMonetizing = intake.currentSituation !== 'monetizing';
 // const scoredCOrWorse = finalGrade === 'C' || finalGrade === 'F';
 // const showCTA = wordCount > 1 && soughtTherapyOrCoaches && notMonetizing && scoredCOrWorse;

 async function handleExportPDF() {
 setIsExporting(true);
 try {
 await exportClientReportToPDF(results, intake);
 } catch (err) {
 console.error(err);
 } finally {
 setIsExporting(false);
 }
 }

 const pillarCardProps = (
 pillar: PillarSummary,
 index: 1 | 2 | 3,
 title: string,
 subtitle: string
 ) => ({
 pillar,
 index,
 title,
 subtitle,
 goal,
 goalShort,
 goalText: intake.desiredOutcome,
 location: clientLocation,
 transits,
 pillar2Items: p2.items,
 pillar3Items: p3.items,
 addressMoveDate: intake.addressMoveDate,
 });

 const legendCards = [
 {
 dot: '#C9A84C',
 label: 'SOUL / KARMA - PILLAR 1',
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

 const endYear = longest?.endYear ?? null;
 const yearsRemaining = endYear ? endYear - new Date().getFullYear() : null;

 return (
 <div
 style={{
 minHeight: '100vh',
 background: "radial-gradient(ellipse 80% 55% at 12% 0%, rgba(110,50,200,0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 88% 4%, rgba(35,85,220,0.15) 0%, transparent 50%), radial-gradient(circle 1px at 8% 6%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 2px), radial-gradient(circle 1px at 32% 14%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 2px), radial-gradient(circle 1px at 61% 4%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 2px), radial-gradient(circle 1px at 83% 17%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 2px), radial-gradient(circle 1px at 46% 27%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 2px), radial-gradient(circle 1px at 74% 11%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 2px), radial-gradient(circle 1px at 19% 37%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 2px), radial-gradient(circle 1px at 92% 43%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 2px), #050A18",
 backgroundAttachment: 'fixed',
 color: '#E8DEFF',
 padding: '40px 16px',
 fontFamily: INTER,
 }}
 >
 <div
 style={{
 maxWidth: '760px',
 margin: '0 auto',
 display: 'flex',
 flexDirection: 'column',
 gap: '24px',
 }}
 >
 {/* Sticky table of contents + page progress */}
 <div
 style={{
 position: 'sticky',
 top: '12px',
 zIndex: 50,
 background: 'rgba(5,10,24,0.92)',
 backdropFilter: 'blur(10px)',
 WebkitBackdropFilter: 'blur(10px)',
 border: '1px solid rgba(201,168,76,0.2)',
 borderRadius: '4px',
 padding: '12px 14px',
 }}
 >
 <div
 style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 gap: '12px',
 marginBottom: '8px',
 }}
 >
 <div
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 color: '#7068A0',
 fontWeight: 700,
 }}
 >
 On this page
 </div>
 <div style={{ fontSize: '11px', color: '#D4A843', fontWeight: 700 }}>
 {Math.round(scrollProgress)}%
 </div>
 </div>
 <div
 style={{
 height: '6px',
 borderRadius: '999px',
 background: 'rgba(255,255,255,0.1)',
 overflow: 'hidden',
 marginBottom: '10px',
 }}
 >
 <div
 style={{
 height: '100%',
 width: `${scrollProgress}%`,
 background: 'linear-gradient(90deg, #C9A84C, #9a7d4e)',
 transition: 'width 120ms linear',
 }}
 />
 </div>
 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
 {REPORT_SECTIONS.map((section) => {
 const isActive = activeSection === section.id;
 return (
 <button
 key={section.id}
 onClick={() => {
 document
 .getElementById(section.id)
 ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
 }}
 aria-current={isActive ? 'location' : undefined}
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.08em',
 cursor: 'pointer',
 padding: '6px 9px',
 borderRadius: '2px',
 border: isActive ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.08)',
 color: isActive ? '#D4A843' : '#666',
 background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
 fontWeight: isActive ? 700 : 600,
 fontFamily: INTER,
 }}
 >
 {section.label}
 </button>
 );
 })}
 </div>
 </div>

 {/* ── SECTION 1: COVER ── */}
 <section
 id="cover"
 data-report-section
 style={{
 scrollMarginTop: '120px',
 display: 'flex',
 flexDirection: 'column',
 gap: '24px',
 }}
 >
 {/* Header */}
 <div
 style={{
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'flex-start',
 borderBottom: '1px solid rgba(255,255,255,0.1)',
 paddingBottom: '16px',
 }}
 >
 <div>
 <div
 style={{
 fontFamily: CORMORANT,
 fontSize: '1.5rem',
 fontWeight: 700,
 color: '#C9A84C',
 }}
 >
 Pheydrus
 </div>
 <div
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 color: '#7068A0',
 marginTop: '2px',
 }}
 >
 Proprietary 3-Pillar Analysis
 </div>
 </div>
 <div style={{ textAlign: 'right' }}>
 <div style={{ fontSize: '0.85rem', color: '#D4A843', fontWeight: 600 }}>
 {results.userInfo.name}
 </div>
 <div style={{ fontSize: '10px', color: '#7068A0', marginTop: '2px' }}>
 {new Date(results.timestamp).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 })}
 </div>
 </div>
 </div>

 {/* Goal bar - sits above the grade */}
 <div
 style={{
 borderLeft: '4px solid #C9A84C',
 background: 'rgba(201,168,76,0.07)',
 padding: '10px 16px',
 borderRadius: '0 4px 4px 0',
 }}
 >
 <div
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.1em',
 color: '#C9A84C',
 marginBottom: '4px',
 }}
 >
 90-Day Goal · {GOAL_LABEL[goal]}
 </div>
 <p
 style={{
 margin: 0,
 fontFamily: CORMORANT,
 fontStyle: 'italic',
 color: '#D4A843',
 fontSize: '0.95rem',
 lineHeight: 1.6,
 }}
 >
 {intake.desiredOutcome}
 </p>
 {(results.userInfo.name || results.userInfo.dateOfBirth || intake.obstacle) && (
 <div
  style={{
  marginTop: '10px',
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '12px',
  borderTop: '1px solid rgba(201,168,76,0.25)',
  paddingTop: '8px',
  }}
 >
  {results.userInfo.name && (
  <span style={{ fontSize: '0.75rem', fontFamily: INTER, color: '#C9A84C' }}>
   <strong>Client:</strong> {results.userInfo.name}
  </span>
  )}
  {results.userInfo.dateOfBirth && (
  <span style={{ fontSize: '0.75rem', fontFamily: INTER, color: '#C9A84C' }}>
   <strong>DOB:</strong> {results.userInfo.dateOfBirth}
  </span>
  )}
  {intake.obstacle && (
  <span style={{ fontSize: '0.75rem', fontFamily: INTER, color: '#C9A84C' }}>
   <strong>Obstacle:</strong> {intake.obstacle}
  </span>
  )}
 </div>
 )}
 </div>

 {/* Hero card - grade + headline + dynamic description */}
 {(() => {
 const hl: Record<string, [string, string]> = {
 A: ['A means alignment is close.', 'One right move, and you can 10x your life.'],
 B: [
 "You're doing well - ",
 "'doing well' and 'living fully' are two different things.",
 ],
 C: ['A passing grade - ', 'but who wants a passing-grade life?'],
 D: [
 "D means you're one step away from failing - ",
 "and you're probably feeling the pressure.",
 ],
 F: ['This is your turning point.', 'You now have the map.'],
 };
 const [h1, h2] = hl[finalGrade] ?? ['Overall Deconditioning Score', ''];
 const forceCount =
 (results.diagnostic!.totalFs ?? 0) + (results.diagnostic!.totalCs ?? 0);
 const descLine =
 endYear && yearsRemaining
 ? `Your ${finalGrade} score traces back to ${forceCount} specific force${forceCount !== 1 ? 's' : ''} - all identified below. Left unaddressed, this configuration persists through ${endYear} - ${yearsRemaining} more year${yearsRemaining !== 1 ? 's' : ''} of a reality that passes, but doesn't 10x.`
 : `Your ${finalGrade} score traces back to ${forceCount} specific force${forceCount !== 1 ? 's' : ''} - all identified below. This configuration does not self-resolve without targeted intervention.`;
 return (
 <div
 style={{
 background: '#0C1128',
 border: '1px solid rgba(255,255,255,0.08)',
 borderRadius: '4px',
 padding: '20px 24px',
 display: 'flex',
 gap: '20px',
 alignItems: 'flex-start',
 }}
 >
 <div style={{ flexShrink: 0, textAlign: 'center' }}>
 <div
 style={{
 width: '90px',
 height: '90px',
 borderRadius: '50%',
 border: `2.5px solid ${gc.border}`,
 background: gc.bg,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 }}
 >
 <span
 style={{
 fontFamily: CORMORANT,
 fontSize: '3rem',
 fontWeight: 700,
 color: gc.text,
 lineHeight: 1,
 }}
 >
 {finalGrade}
 </span>
 </div>
 <div
 style={{
 fontSize: '9px',
 textTransform: 'uppercase',
 letterSpacing: '0.08em',
 color: '#7068A0',
 marginTop: '6px',
 }}
 >
 Alignment Score
 </div>
 <div
 style={{ fontSize: '12px', fontWeight: 700, color: gc.text, fontFamily: INTER }}
 >
 {score % 1 === 0 ? score : score.toFixed(1)} / 100
 </div>
 <div
 style={{
 fontSize: '9px',
 letterSpacing: '0.02em',
 color: '#7068A0',
 marginTop: '2px',
 fontFamily: INTER,
 }}
 >
 normalized from 12 categories
 </div>
 </div>
 <div style={{ flex: 1 }}>
 <div
 style={{
 fontFamily: CORMORANT,
 fontSize: '1.35rem',
 fontWeight: 700,
 color: '#E8DEFF',
 marginBottom: '10px',
 lineHeight: 1.3,
 }}
 >
 {h1} <em style={{ color: '#D4A843' }}>{h2}</em>
 </div>
 <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 {descLine}
 </p>
 <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 This report shows exactly where momentum is leaking and what to change first. Every pressure point has a usable upside once you work it directly.
 </p>
 <div style={{ borderLeft: '3px solid #C9A84C', paddingLeft: '12px', marginBottom: '12px' }}>
 <p style={{ margin: 0, fontFamily: CORMORANT, fontStyle: 'italic', color: '#D4A843', fontSize: '0.9rem', lineHeight: 1.7 }}>
 "Pluto transiting your 1st house? Stop playing nice. Stop softening your edges. Step fully into your power - that is the higher octave." - Pheydrus team
 </p>
 </div>
 <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 You did the mindset work, the strategy work, and the coaching. Results still stall at the same point.
 </p>
 <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 The missing variable is energetic structure. Thinking harder does not solve this layer.
 </p>
 <p style={{ margin: 0, fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 You already have the capacity. This report shows the sequence to unlock it.
 </p>
 </div>
 </div>
 );
 })()}

 {/* Score breakdown - horizontal bars + Venn */}
 {total > 0 &&
 (() => {
 const rows = [
 {
 label: 'Structure',
 sub: 'Pillar 1',
 pct: p1pct,
 color: '#F87171',
 grade: getPillarLetterGrade(p1),
 },
 {
 label: 'Timing',
 sub: 'Pillar 2',
 pct: p2pct,
 color: '#C9A84C',
 grade: getPillarLetterGrade(p2),
 },
 {
 label: 'Environment',
 sub: 'Pillar 3',
 pct: p3pct,
 color: '#9a7d4e',
 grade: getPillarLetterGrade(p3),
 },
 ];
 return (
 <div
 style={{
 background: '#0C1128',
 border: '1px solid rgba(255,255,255,0.1)',
 borderRadius: '4px',
 padding: '18px 22px',
 }}
 >
 <div
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 color: '#7068A0',
 marginBottom: '14px',
 }}
 >
 Your Score Breaks Down As:
 </div>
 <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
 {rows.map((r) => {
 const gc2 = gradeColor(r.grade);
 return (
 <div
 key={r.label}
 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
 >
 <div style={{ width: '90px', flexShrink: 0 }}>
 <div
 style={{
 fontSize: '0.82rem',
 fontWeight: 700,
 color: '#E8DEFF',
 fontFamily: INTER,
 }}
 >
 {r.label}
 </div>
 <div style={{ fontSize: '9px', color: '#7068A0' }}>{r.sub}</div>
 </div>
 <div
 style={{
 flex: 1,
 height: '6px',
 background: 'rgba(255,255,255,0.1)',
 borderRadius: '3px',
 }}
 >
 <div
 style={{
 height: '6px',
 width: `${r.pct}%`,
 background: r.color,
 borderRadius: '3px',
 }}
 />
 </div>
 <div
 style={{
 width: '32px',
 textAlign: 'right',
 fontSize: '0.8rem',
 fontWeight: 700,
 color: r.color,
 fontFamily: INTER,
 }}
 >
 {r.pct}%
 </div>
 {r.grade && (
 <span
 style={{
 display: 'inline-block',
 padding: '1px 7px',
 borderRadius: '2px',
 fontSize: '10px',
 fontWeight: 700,
 background: gc2.bg,
 color: gc2.text,
 border: `1px solid ${gc2.border}`,
 fontFamily: INTER,
 }}
 >
 {r.grade}
 </span>
 )}
 </div>
 );
 })}
 </div>
 <div style={{ flexShrink: 0, textAlign: 'center' }}>
 <VennDiagram />
 <div style={{ fontSize: '9px', color: '#7068A0', marginTop: '4px' }}>
 3 forces · 1 score
 </div>
 </div>
 </div>
 </div>
 );
 })()}

 </section>

 {/* ── SECTION 2: WHY THIS KEEPS HAPPENING ── */}

 <section id="pattern" data-report-section style={{ scrollMarginTop: '120px' }}>
 <div
 style={{
 background: '#0C1128',
 border: '1px solid rgba(255,255,255,0.1)',
 borderRadius: '4px',
 padding: '28px 32px',
 }}
 >
 <div
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.14em',
 color: '#7068A0',
 marginBottom: '8px',
 }}
 >
 The Pattern
 </div>
 <h2
 style={{
 fontFamily: CORMORANT,
 fontSize: '2rem',
 fontWeight: 700,
 color: '#E8DEFF',
 margin: '0 0 20px',
 lineHeight: 1.2,
 }}
 >
 Why This Keeps Happening
 </h2>

 {/* Pull quote */}
 <div
 style={{
 borderLeft: '4px solid #C9A84C',
 padding: '12px 20px',
 marginBottom: '20px',
 background: 'rgba(201,168,76,0.07)',
 }}
 >
 <p
 style={{
 margin: 0,
 fontFamily: CORMORANT,
 fontStyle: 'italic',
 color: '#D4A843',
 fontSize: '1rem',
 lineHeight: 1.7,
 }}
 >
								"You did the degree, the career, and the inner work. Results still stall at the same point. This pressure pattern is the pre-upgrade signal this report maps."
 </p>
 </div>

 <p
 style={{
 margin: '0 0 12px',
 fontSize: '0.85rem',
 color: '#DDD8F8',
 lineHeight: 1.8,
 fontWeight: 700,
 }}
 >
						You are in an identity shift.
 </p>
 <p
 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
						These patterns are the exact conditions that precede a major identity upgrade.
						Three invisible forces are pulling against each other, and that friction marks the
						edge where your previous identity loses control and your next identity takes over.
 </p>
 <p
 style={{
 margin: '0 0 12px',
 fontSize: '0.9rem',
 fontWeight: 700,
 color: '#C9A84C',
 lineHeight: 1.6,
 }}
 >
						Your identity upgrade is around the corner, and the first signals are active now.
 </p>
 <p
 style={{ margin: '0 0 24px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
						You now choose how you enter this window: with a map and deliberate action, or by
						repeating the same loop.
 </p>

 {/* Venn + legend */}
 <div
 style={{
 display: 'flex',
 gap: '20px',
 alignItems: 'flex-start',
 marginBottom: '24px',
 flexWrap: 'wrap' as const,
 }}
 >
 <div style={{ flexShrink: 0 }}>
 <VennDiagram />
 </div>
 <div
 style={{
 flex: 1,
 minWidth: '200px',
 display: 'flex',
 flexDirection: 'column',
 gap: '10px',
 }}
 >
 {legendCards.map((c) => (
 <div
 key={c.label}
 style={{
 background: '#0C1128',
 border: '1px solid rgba(255,255,255,0.1)',
 borderRadius: '4px',
 padding: '12px 14px',
 }}
 >
 <div
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: '6px',
 marginBottom: '6px',
 }}
 >
 <span
 style={{
 width: '8px',
 height: '8px',
 borderRadius: '50%',
 background: c.dot,
 flexShrink: 0,
 display: 'inline-block',
 }}
 />
 <span
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.1em',
 color: '#7068A0',
 }}
 >
 {c.label}
 </span>
 </div>
 <p
 style={{
 margin: '0 0 5px',
 fontFamily: CORMORANT,
 fontStyle: 'italic',
 color: '#C9A84C',
 fontSize: '0.9rem',
 lineHeight: 1.55,
 }}
 >
 {c.question}
 </p>
 <p style={{ margin: 0, fontSize: '0.75rem', color: '#8880A8', lineHeight: 1.6 }}>
 {c.desc}
 </p>
 </div>
 ))}
 </div>
 </div>

 {/* Timeline warning */}
 {longest && (
 <div
 style={{
 background: '#0C1128',
 border: '1px solid rgba(255,255,255,0.1)',
 borderRadius: '4px',
 padding: '14px 18px',
 marginBottom: '16px',
 }}
 >
 <div
 style={{
 fontSize: '10px',
 fontWeight: 700,
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 color: '#C9A84C',
 marginBottom: '8px',
 }}
 >
 ⚠ Active Pattern Window
 </div>
 <p style={{ margin: 0, fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.7 }}>
 Without intervention, your current configuration is projected to persist{' '}
 <strong style={{ color: '#C9A84C' }}>
 through {endYear}
 {yearsRemaining ? ` - approximately ${yearsRemaining} more years` : ''}
 </strong>
 . The primary driver is{' '}
 <strong style={{ color: '#E8DEFF' }}>
 {longest.planet} transiting House {longest.house}
 </strong>
 , defining the exact window you are in right now. Knowing the window is half the
 advantage.
 </p>
 </div>
 )}
 </div>
 </section>

 {/* ── SECTION 3: PILLAR BREAKDOWN ── */}

 <section id="pillars" data-report-section style={{ scrollMarginTop: '120px' }}>
 <div>
 <h2
 style={{
 fontFamily: CORMORANT,
 fontSize: '2rem',
 fontWeight: 700,
 color: '#E8DEFF',
 margin: '0 0 20px',
 lineHeight: 1.2,
 }}
 >
 What is Holding Back Your {GOAL_LABEL[goal]}
 </h2>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 <PillarDeepDiveCard
 {...pillarCardProps(p1, 1, 'Structure', 'Your Energetic Blueprint')}
 />
 <TestimonialCard
 quote="e.g. - 'I had the exact same Saturn/House 5 configuration. I'd been building the same offer in my head for two years. Within 60 days of working with the Pheydrus team, I launched, signed 3 clients, and finally felt like my energy matched my output.'"
 attribution="Jordan M., Los Angeles"
 />
 <PillarDeepDiveCard {...pillarCardProps(p2, 2, 'Timing', 'The Window You Are In')} />
 <PillarDeepDiveCard
 {...pillarCardProps(p3, 3, 'Environment', 'Location & Address')}
 />
 <TestimonialCard
 quote="e.g. - 'The environment piece was the one I almost skipped. After my Pillar 3 session I raised my rates by 40% and signed my highest-paying client that same week. The address work is real.'"
 attribution="Priya K., New York"
 />
 </div>
 </div>
 </section>

 {/* ── SECTION 4: COST OF INACTION + CTA ── */}
 <section id="solution" data-report-section style={{ scrollMarginTop: '120px' }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
 <CostOfInaction goalShort={goalShort} endYear={longest?.endYear ?? null} />

 <TestimonialCard
 quote="e.g. - 'I came in skeptical. Three years of coaches and nothing had shifted. I left my first session with a sequenced 90-day plan that made more sense than anything I'd tried before.'"
 attribution="Marcus T., Chicago"
 />

 {/* Destiny block */}
 <div
 style={{
 background: 'rgba(74,222,128,0.07)',
 border: '1px solid #C8E6C8',
 borderRadius: '4px',
 padding: '20px 24px',
 }}
 >
 <h3
 style={{
 fontFamily: CORMORANT,
 color: '#60A5FA',
 fontSize: '1.6rem',
 fontWeight: 700,
 margin: '0 0 20px',
 lineHeight: 1.3,
 }}
 >
 How to Improve Your Scores, and Stop Living in Pain 🏆
 </h3>
 <p
 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
 The first is <strong style={{ color: '#D4A843' }}>closure</strong>. You were handed a lie: that struggle means growth. It doesn't. It means you've been placed in an energetic grid working against you.
 </p>
 <p
 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
 The second - and more important - is <strong style={{ color: '#D4A843' }}>preparation</strong>. That grid is already shifting. And to move with it, you need to attack all three pillars at once - because they don't work in isolation. Your blueprint, your timing, and your environment are always talking to each other. Fix one and ignore the others - and you'll keep hitting the same ceiling in a different room.
 </p>
 <p
 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
 <span style={{ color: '#38a169', fontWeight: 800, marginRight: '6px' }}>➜</span>
 For <strong>Pillar 1</strong> - we use a sequential deconditioning method that goes directly into your energetic blindspots (desires, addictions, dreams, etc). This isn’t talk therapy or journaling. A specific, structured process that helps you identify the unconscious karmic patterns running your decisions - and consciously transmute them into your greatest assets.
 </p>
 <p
 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
 <span style={{ color: '#38a169', fontWeight: 800, marginRight: '6px' }}>➜</span>
 For <strong>Pillar 2</strong> - we map your current and upcoming planetary transits so you're never caught off guard again. We show you exactly which seasons to push, which to rest, and how to prepare for the windows that - if you move correctly - will be the most expansive periods of your life.
 </p>
 <p
 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
 <span style={{ color: '#38a169', fontWeight: 800, marginRight: '6px' }}>➜</span>
 For <strong>Pillar 3</strong> - we use our proprietary Feng Shui × Astrocartography x Real Estate Numerology to find the best addresses+places in the world that accelerate your goals. This is different for everything. And it works even if you can't move yet. There are ways to shift the energetic frequency of your space, and protect yourself against unseel environmental forces that have been holding you back for years.
 </p>
 <div style={{ borderTop: '1px solid #C8E6C8', paddingTop: '14px', marginTop: '4px' }}>
 <p
 style={{
 margin: 0,
 fontFamily: CORMORANT,
 fontStyle: 'italic',
 color: '#E8DEFF',
 fontSize: '1.1rem',
 lineHeight: 1.5,
 }}
 >
 When all three are addressed together - that's when people stop reacting to their lives and start getting ahead of them.
 </p>
 </div>
 </div>
 </div>
 </section>

 {/* ── NEXT STEPS ANCHOR - "What's next is simple" ── */}
 <section
 id="next-steps"
 data-report-section
 style={{
 scrollMarginTop: '120px',
 display: 'flex',
 flexDirection: 'column',
 gap: '24px',
 }}
 >
 {/* PROGRAM RECOMMENDATION + BOOK A CALL OPTIONS */}
 {(() => {
 const recommendations = getTwoProgramRecommendations(p1, p2, p3, diagnosticItems);

 const optionCardStyle: CSSProperties = {
 background: 'rgba(201,168,76,0.07)',
 border: '1px solid #C9A84C',
 borderRadius: '4px',
 padding: '32px',
 };

 return (
 <>
 <div style={optionCardStyle}>
 <div
 style={{
 fontSize: '11px',
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 fontWeight: 700,
 color: '#16a34a',
 marginBottom: '10px',
 fontFamily: INTER,
 }}
 >
 #1 Option
 </div>
 <h2
 style={{
 fontFamily: CORMORANT,
 color: '#16a34a',
 fontSize: '1.7rem',
 fontWeight: 700,
 margin: '0 0 6px',
 }}
 >
 Start With Our 101 Trainings at 50% Off 💸
 </h2>
 <p
 style={{
 color: '#DDD8F8',
 fontSize: '0.82rem',
 margin: '0 0 20px',
 fontFamily: INTER,
 lineHeight: 1.6,
 }}
 >
 Recommend our 101 trainings at <strong>50% off</strong> - use code <strong style={{ color: '#16a34a' }}>"VIPTraining"</strong> at checkout.
 </p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 {[
 {
 pillar: 'Pillar 1: Structure',
 title: '4 Steps to Rewriting Your Past',
 desc: 'Want to finally release the "story" that your emotional body is still holding onto? Check out our most transformational training →',
 link: 'https://pheydrusacademy.mysamcart.com/checkout/rsvp-4-steps-to-letting-go',
 cta: 'Get Access →',
 },
 {
 pillar: 'Pillar 2: Timing',
 title: 'Outer Planets & Your Next 20 Years',
 desc: 'Want to know exactly what\'s coming in the next 20 years - and how to use it strategically? Check out our most popular timing training →',
 link: 'https://pheydrusmetaverse.com/checkout/outer-planets',
 cta: 'Get Access →',
 },
 {
 pillar: 'Pillar 3: Environment',
 title: 'Energetically Change Your Address',
 desc: 'Want to know if your home is amplifying your life - or quietly working against it? Check out our most viral training →',
 link: 'https://pheydrusmetaverse.com/checkout/energetically-change-your-address',
 cta: 'Get Access →',
 },
 ].map((item) => (
 <div
 key={item.pillar}
 style={{
 background: 'rgba(22,163,74,0.1)',
 border: '1px solid rgba(22,163,74,0.25)',
 borderRadius: '4px',
 padding: '16px 18px',
 display: 'flex',
 gap: '12px',
 alignItems: 'flex-start',
 }}
 >
 <span style={{ fontSize: '1.1rem', lineHeight: 1, marginTop: '2px' }}>✓</span>
 <div style={{ flex: 1 }}>
 <div
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.08em',
 color: '#16a34a',
 fontWeight: 700,
 fontFamily: INTER,
 marginBottom: '2px',
 }}
 >
 {item.pillar}
 </div>
 <div
 style={{
 fontFamily: CORMORANT,
 fontSize: '1.1rem',
 fontWeight: 700,
 color: '#E8DEFF',
 marginBottom: '4px',
 }}
 >
 {item.title}
 </div>
 <p
 style={{
 margin: '0 0 8px',
 fontSize: '0.8rem',
 color: '#DDD8F8',
 lineHeight: 1.6,
 fontFamily: INTER,
 }}
 >
 {item.desc}
 </p>
 <a
 href={item.link}
 target="_blank"
 rel="noopener noreferrer"
 style={{
 display: 'inline-block',
 padding: '8px 16px',
 background: '#16a34a',
 color: '#fff',
 fontWeight: 700,
 fontSize: '0.72rem',
 letterSpacing: '0.08em',
 textTransform: 'uppercase',
 textDecoration: 'none',
 borderRadius: '2px',
 fontFamily: INTER,
 }}
 >
 {item.cta}
 </a>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div style={optionCardStyle}>
 <div
 style={{
 fontSize: '11px',
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 fontWeight: 700,
 color: '#60A5FA',
 marginBottom: '10px',
 fontFamily: INTER,
 }}
 >
 #2 Option
 </div>
 <h2
 style={{
 fontFamily: CORMORANT,
 color: '#60A5FA',
 fontSize: '1.7rem',
 fontWeight: 700,
 margin: '0 0 16px',
 }}
 >
 Checkout These Viral Mini Courses - Up to 50% Off ✍️
 </h2>

 <p
 style={{
 margin: '0 0 18px',
 fontSize: '0.88rem',
 color: '#DDD8F8',
 lineHeight: 1.7,
 fontFamily: INTER,
 }}
 >
 Based on your pillar pattern, these are the two closest paths to start with
 next.
 </p>

 <div
 style={{
 display: 'flex',
 gap: '18px',
 alignItems: 'stretch',
 flexWrap: 'wrap' as const,
 }}
 >
 {recommendations.map((recommendation, index) => (
 <div
 key={recommendation.route}
 style={{
 flex: 1,
 minWidth: '250px',
 background: '#0C1128',
 border: '1px solid #D9C78E',
 borderRadius: '4px',
 padding: '22px 20px',
 display: 'flex',
 flexDirection: 'column',
 }}
 >
 <div
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.1em',
 color: '#9A8650',
 fontWeight: 700,
 marginBottom: '8px',
 fontFamily: INTER,
 }}
 >
 Recommendation {index + 1}
 </div>
 <h3
 style={{
 margin: '0 0 10px',
 fontFamily: CORMORANT,
 fontSize: '1.45rem',
 fontWeight: 700,
 color: '#E8DEFF',
 }}
 >
 {recommendation.title}
 </h3>
 <p
 style={{
 margin: '0 0 18px',
 fontSize: '0.9rem',
 color: '#DDD8F8',
 lineHeight: 1.75,
 fontFamily: INTER,
 flex: 1,
 }}
 >
 {recommendation.description}
 </p>
 <a
 href={recommendation.link}
 target="_blank"
 rel="noopener noreferrer"
 style={{
 display: 'inline-block',
 padding: '12px 20px',
 background: '#C9A84C',
 color: '#E8DEFF',
 fontWeight: 700,
 fontSize: '0.75rem',
 letterSpacing: '0.1em',
 textTransform: 'uppercase',
 textDecoration: 'none',
 borderRadius: '2px',
 fontFamily: INTER,
 alignSelf: 'flex-start',
 }}
 >
 {recommendation.buttonLabel}
 </a>
 </div>
 ))}
 </div>
 </div>

 <div style={optionCardStyle}>
 <div
 style={{
 fontSize: '11px',
 textTransform: 'uppercase',
 letterSpacing: '0.12em',
 fontWeight: 700,
 color: '#D4A843',
 marginBottom: '10px',
 fontFamily: INTER,
 }}
 >
 #3 Option
 </div>
 <h2
 style={{
 margin: '0 0 18px',
 fontFamily: CORMORANT,
 fontSize: '1.7rem',
 fontWeight: 700,
 color: '#E8DEFF',
 }}
 >
 Explore Pheydrus Coaching
 </h2>
 <div
 style={{
 display: 'flex',
 gap: '32px',
 alignItems: 'flex-start',
 flexWrap: 'wrap' as const,
 }}
 >
 <div style={{ flex: 1, minWidth: '260px' }}>
 <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#DDD8F8', fontFamily: INTER, lineHeight: 1.75 }}>
 This report gives you a score. That's it.
 </p>
 <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#DDD8F8', fontFamily: INTER, lineHeight: 1.75 }}>
 Nothing changes until you're willing to work with the unseen forces it surfaced, and you can't do that alone. You need someone who can reflect back what you can't see in yourself and hold you accountable when old patterns try to pull you back.
 </p>
 <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#DDD8F8', fontFamily: INTER, lineHeight: 1.75 }}>
 That's what Pheydrus coaching does.
 </p>
 <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#DDD8F8', fontFamily: INTER, lineHeight: 1.75 }}>
 Thousands of students came to us after trying everything: The right school. The right relationship. The right city. Therapy. Life coaching. And still things were "off." For most of them, this was the last door they hadn't opened. And it was the one that finally changed everything.
 </p>
 <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#DDD8F8', fontFamily: INTER, lineHeight: 1.75 }}>
 If something in this report stirred something in you, don't let it sit.
 </p>
 <p style={{ margin: '0 0 18px', fontSize: '0.88rem', color: '#DDD8F8', fontFamily: INTER, lineHeight: 1.75 }}>
 <a
 href="https://pheydrusmetaverse.com/thank-you-onboarding/"
 target="_blank"
 rel="noopener noreferrer"
 style={{ color: '#E8DEFF', fontWeight: 700, textDecoration: 'underline' }}
 >
 Explore if Pheydrus Coaching is Right For You
 </a>
 </p>
 <a
 href="https://pheydrusmetaverse.com/thank-you-onboarding/"
 target="_blank"
 rel="noopener noreferrer"
 style={{
 display: 'inline-block',
 padding: '12px 20px',
 background: '#C9A84C',
 color: '#E8DEFF',
 fontWeight: 700,
 fontSize: '0.75rem',
 letterSpacing: '0.08em',
 textTransform: 'uppercase',
 textDecoration: 'none',
 borderRadius: '2px',
 fontFamily: INTER,
 }}
 >
 Explore if Pheydrus Coaching is Right For You
 </a>
 </div>
 <div style={{ flexShrink: 0, width: '220px' }}>
 <img
 src="/hj-finals-2-of-20-1.jpg"
 alt="HeyJune Jeon - Pheydrus"
 style={{
 width: '100%',
 borderRadius: '4px',
 border: '1px solid #E8E0C8',
 objectFit: 'cover',
 }}
 />
 </div>
 </div>
 </div>
 </>
 );
 })()}
 </section>

 {/* Action buttons */}
 <section id="actions" data-report-section style={{ scrollMarginTop: '120px' }}>
 <div
 style={{
 display: 'flex',
 gap: '12px',
 justifyContent: 'center',
 flexWrap: 'wrap' as const,
 }}
 >
 <button
 onClick={handleExportPDF}
 disabled={isExporting}
 style={{
 padding: '12px 28px',
 background: '#C9A84C',
 color: '#E8DEFF',
 fontWeight: 700,
 borderRadius: '2px',
 border: 'none',
 cursor: 'pointer',
 fontFamily: INTER,
 opacity: isExporting ? 0.6 : 1,
 }}
 >
 {isExporting ? 'Generating PDF…' : 'Download Your Report (PDF)'}
 </button>
 <button
 onClick={() => navigate('/client')}
 style={{
 padding: '12px 28px',
 background: 'transparent',
 color: '#8880A8',
 fontWeight: 600,
 borderRadius: '2px',
 border: '1px solid rgba(255,255,255,0.08)',
 cursor: 'pointer',
 fontFamily: INTER,
 }}
 >
 Start New Assessment
 </button>
 </div>

 <p
 style={{
 textAlign: 'center',
 fontSize: '10px',
 color: '#BBBBBB',
 paddingTop: '16px',
 paddingBottom: '8px',
 fontFamily: INTER,
 lineHeight: 1.6,
 borderTop: '1px solid rgba(255,255,255,0.1)',
 maxWidth: '520px',
 margin: '0 auto',
 }}
 >
 This calculator is for Pheydrus customers only. Sharing, redistributing, or forwarding
 this link is a violation of Pheydrus' Terms of Use and will be pursued legally. All
 access is recorded for security purposes.
 </p>
 <p
 style={{
 textAlign: 'center',
 fontSize: '10px',
 color: '#BBBBBB',
 paddingBottom: '24px',
 fontFamily: INTER,
 }}
 >
 Report generated {new Date(results.timestamp).toLocaleString()}
 </p>
 </section>
 </div>
 </div>
 );
}

export default InvisibleForcesResultsPage;
