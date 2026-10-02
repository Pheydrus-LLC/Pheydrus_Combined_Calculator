/**
 * InvisibleForcesResultsPage - Light Edition
 * White background with dark text, golden accents.
 */

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { renderHouseWheel } from '../../utils/houseWheel';
import {
 detectGoalCategory,
 getLongestMaleficTransit,
 formatDuration,
 getTransitEndYear,
 type GoalCategory,
} from '../../services/pdfExport/clientInterpretations';
import { applyKmsStyle } from '../../services/pdfExport/kmsStyle';
import {
 GOAL_LABEL,
 GOAL_SHORT,
 getPillarLetterGrade,
 PILLAR_CALLOUT,
 PILLAR_TITLES,
 getCoverCopy,
 COVER_QUOTE,
 COVER_CLOSING_LINES,
 PATTERN_COPY,
 LEGEND_CARDS,
} from '../../data/reportCopy';
import { PILLAR_VOICE_NOTES } from '../../data/pillarVoiceNotes';
import { VoiceNotePlayer } from '../../components/results/VoiceNotePlayer';
import { getReportItems } from '../../services/diagnostic/reportItems';
import { getFindingContent } from '../../services/diagnostic/findingContent';
import { ResourceCardBox } from '../../components/results/ResourceCardBox';
import { VennDiagram } from '../../components/results/VennDiagram';
import { applyLightPrintTheme } from '../../services/pdfExport/lightPrint';
import { PRESS_URL, PRESS_LOGOS_LIGHT, PRESS_LOGOS_DARK, PRESS_LOGOS_ALT } from '../../data/press';
import { ROADMAP_TITLE, ROADMAP_STEPS, ROADMAP_PILLARS, ROADMAP_CLOSER } from '../../data/roadmap';
import { COST_OF_INACTION_TITLE, getCostOfInactionCopy } from '../../data/costOfInaction';
import { CalendlyEmbed } from '../../components/results/CalendlyEmbed';
import {
 COACHING_CTA_TITLE,
 COACHING_CTA_PARAGRAPHS,
 COACHING_CALL_URL,
} from '../../data/coachingCta';
import {
 PILLAR_RESOURCE_CARDS,
 PILLAR_RESOURCES,
} from '../../data/freeResources';
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

const GRADE_COLOR: Record<string, { border: string; bg: string; text: string }> = {
 A: { border: '#4ADE80', bg: 'rgba(74,222,128,0.1)', text: '#4ADE80' },
 B: { border: '#60A5FA', bg: 'rgba(96,165,250,0.1)', text: '#60A5FA' },
 C: { border: '#D4A843', bg: 'rgba(212,168,67,0.1)', text: '#D4A843' },
 F: { border: '#F87171', bg: 'rgba(248,113,113,0.1)', text: '#F87171' },
};

function gradeColor(g: string) {
 return GRADE_COLOR[g] ?? GRADE_COLOR['F'];
}

// ── SVG wrapper ───────────────────────────────────────────────────────────────

function SvgChart({ svg }: { svg: string }) {
 // The house wheel is drawn for a light background already, so printing leaves its colours alone
 return <div data-print-keep-colors dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ── Testimonial card ──────────────────────────────────────────────────────────

function TestimonialCard({ quote, attribution }: { quote: string; attribution: string }) {
 return (
 // REPLACE WITH REAL TESTIMONIAL
 <div
 data-print-card
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

const IMPACT_LABEL = {
 hurts: { text: '⚡ Hurts Goal', bg: 'rgba(248,113,113,0.12)', color: '#F87171', border: 'rgba(248,113,113,0.4)' },
 caution: { text: '⚠️ Caution', bg: 'rgba(212,168,67,0.1)', color: '#E8A838', border: '#C9A84C' },
 helps: { text: '✓ Helps Goal', bg: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '#2ecc71' },
};

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
 const content = getFindingContent(item, { goal, goalShort, goalText, transits });
 const { label, endYear } = content;

 if (content.library) {
 const libraryEntry = content.library;
 const hurtHelpLabel = content.impact ? IMPACT_LABEL[content.impact] : null;

 return (
 <div
 data-print-card
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
 {libraryEntry.hurtOrHelp}
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
 {libraryEntry.note}
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
 <strong style={{ color: '#16a34a' }}>✅ Do This:</strong> {libraryEntry.steps[0]}
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
 {libraryEntry.steps[1]}
 </p>
 </div>
 );
 }

 // Fallback: original mirror/interp/transmute layout for entries not in the library
 const { mirror, interpretation: interp, transmute } = content.fallback!;

 return (
 <div
 data-print-card
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
 {interp}
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
 const scoringItems = getReportItems(pillar);

 const callout = PILLAR_CALLOUT[index](goalShort, location);
 const accentColor = index === 1 ? '#F87171' : index === 2 ? '#C9A84C' : '#9a7d4e';
 const pillarGrade = getPillarLetterGrade(pillar);
 const voiceNote = PILLAR_VOICE_NOTES[index];

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
 data-print-keep-with-next
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
 style={{ fontFamily: CORMORANT, fontSize: '2rem', fontWeight: 700, color: '#E8DEFF' }}
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

 {voiceNote && <VoiceNotePlayer src={voiceNote.src} label={voiceNote.label} variant={index - 1} />}

 {/* Goal callout */}
 <p
 data-print-keep-with-next
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

function CostOfInaction({ goal, endYear }: { goal: GoalCategory; endYear: number | null }) {
 const copy = getCostOfInactionCopy(goal, endYear);
 const body: CSSProperties = {
 margin: 0,
 fontSize: '0.88rem',
 color: '#DDD8F8',
 lineHeight: 1.7,
 fontFamily: INTER,
 };

 return (
 <div
 data-print-card
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
 {COST_OF_INACTION_TITLE}
 </h3>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 <p style={body}>{copy.intro}</p>
 <p style={{ ...body, color: '#F87171', fontWeight: 700 }}>{copy.yearLine}</p>
 <p style={body}>
 {copy.goodNews.before}
 <strong style={{ color: '#E8DEFF' }}>{copy.goodNews.years}</strong>
 {copy.goodNews.middle}
 <strong style={{ color: '#E8DEFF' }}>{copy.goodNews.fraction}</strong>
 </p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {copy.noMore.map((line) => (
 <p key={line} style={{ ...body, borderLeft: '2px solid #C9A84C', paddingLeft: '12px' }}>
 {line}
 </p>
 ))}
 </div>
 <p
 style={{
 margin: '4px 0 0',
 fontSize: '1.05rem',
 fontWeight: 700,
 color: '#C9A84C',
 fontFamily: INTER,
 }}
 >
 {copy.closer}
 </p>
 </div>
 </div>
 );
}

// ── Printing ──────────────────────────────────────────────────────────────────

// Boxes shorter than this (px) are kept whole when printing; taller ones may split
const PRINT_KEEP_MAX_HEIGHT = 850;

/**
 * Print setup for the report: sets the A4 page while the report is open, and
 * just before printing switches the report to its light theme (lightPrint.ts)
 * and marks every card and callout that fits on one page so it isn't cut
 * across a page break (index.css turns the mark into break-inside: avoid).
 * Everything is undone after printing. Covers the Download button and the
 * browser's own Print.
 */
function usePrintSetup() {
 useEffect(() => {
 // A4 page, only while the report is open (an @page rule can't target one page of the site)
 const pageStyle = document.createElement('style');
 pageStyle.textContent = '@media print { @page { size: A4; margin: 12mm; } }';
 document.head.appendChild(pageStyle);

 let restoreColors: (() => void) | null = null;
 const mark = () => {
 const root = document.querySelector<HTMLElement>('[data-report-root]');
 if (!root) return;
 root.querySelectorAll<HTMLElement>('*').forEach((el) => {
 const cs = getComputedStyle(el);
 const boxed =
 parseFloat(cs.borderTopWidth) > 0 ||
 parseFloat(cs.borderLeftWidth) > 0 ||
 cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
 cs.backgroundImage !== 'none';
 if (boxed && el.offsetHeight > 0 && el.offsetHeight < PRINT_KEEP_MAX_HEIGHT) {
 el.setAttribute('data-print-keep', '');
 }
 });
 restoreColors?.();
 restoreColors = applyLightPrintTheme(root);
 };
 const unmark = () => {
 document.querySelectorAll('[data-print-keep]').forEach((el) => el.removeAttribute('data-print-keep'));
 restoreColors?.();
 restoreColors = null;
 };
 window.addEventListener('beforeprint', mark);
 window.addEventListener('afterprint', unmark);
 return () => {
 pageStyle.remove();
 window.removeEventListener('beforeprint', mark);
 window.removeEventListener('afterprint', unmark);
 };
 }, []);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function InvisibleForcesResultsPage() {
 const location = useLocation();
 const navigate = useNavigate();
 const [scrollProgress, setScrollProgress] = useState(0);
 usePrintSetup();
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
 /** Set when arriving from the book's Scroll mode: the page to return to, and whether it was the demo */
 bookPage?: number;
 bookDemo?: boolean;
 } | null;

 const [fetchedState, setFetchedState] = useState<{
 results: ConsolidatedResults;
 intake: ClientIntakeData;
 } | null>(null);
 // Loading from the start when there's a saved report to fetch
 const [isFetching, setIsFetching] = useState(() => !!reportId && !rawState);
 const [fetchError, setFetchError] = useState<string | null>(null);

 useEffect(() => {
 if (!reportId || rawState) return;
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
 const gc = gradeColor(finalGrade);
 // CTA eligibility (unused - kept for future re-activation)
 // const wordCount = intake.desiredOutcome.trim().split(/\s+/).filter(Boolean).length;
 // const soughtTherapyOrCoaches =
 // intake.priorHelp.includes('therapy') || intake.priorHelp.includes('coaches');
 // const notMonetizing = intake.currentSituation !== 'monetizing';
 // const scoredCOrWorse = finalGrade === 'C' || finalGrade === 'F';
 // const showCTA = wordCount > 1 && soughtTherapyOrCoaches && notMonetizing && scoredCOrWorse;

 // Opens the browser's print dialog, where "Save as PDF" saves the report as it
 // looks on screen (print styles live in index.css). The page title becomes the
 // suggested file name.
 function handleExportPDF() {
 const originalTitle = document.title;
 document.title = `Pheydrus Report - ${results.userInfo.name || 'Client'}`;
 window.addEventListener('afterprint', () => (document.title = originalTitle), { once: true });
 window.print();
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
 data-report-root
 style={{
 maxWidth: '760px',
 margin: '0 auto',
 display: 'flex',
 flexDirection: 'column',
 gap: '24px',
 }}
 >
 {/* As seen on (press strip, above the page menu) */}
 <div style={{ textAlign: 'center', padding: '4px 0 2px' }}>
 <div
 style={{
 fontSize: '10px',
 fontWeight: 700,
 textTransform: 'uppercase',
 letterSpacing: '0.2em',
 color: '#A098C0',
 marginBottom: '12px',
 fontFamily: INTER,
 }}
 >
 As Seen On
 </div>
 <a href={PRESS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
 <img
 data-screen-only
 src={PRESS_LOGOS_LIGHT}
 alt={PRESS_LOGOS_ALT}
 style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '700px', height: 'auto', opacity: 0.85 }}
 />
 <img
 data-print-only
 src={PRESS_LOGOS_DARK}
 alt={PRESS_LOGOS_ALT}
 style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '700px', height: 'auto', opacity: 0.85 }}
 />
 </a>
 </div>

 {/* Sticky table of contents + page progress */}
 <div
 data-print="hide"
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
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <button
 type="button"
 onClick={() =>
 navigate(rawState?.bookDemo ? '/client/book/demo' : `/client/book${reportId ? `?id=${encodeURIComponent(reportId)}` : ''}`, {
 state: { results, intake, bookPage: rawState?.bookPage ?? 0 },
 })
 }
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.08em',
 fontWeight: 700,
 color: '#D4A843',
 background: 'transparent',
 border: '1px solid rgba(201,168,76,0.45)',
 borderRadius: '2px',
 padding: '4px 9px',
 cursor: 'pointer',
 fontFamily: INTER,
 }}
 >
 📖 Book mode
 </button>
 <div style={{ fontSize: '11px', color: '#D4A843', fontWeight: 700 }}>
 {Math.round(scrollProgress)}%
 </div>
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
 const forceCount =
 (results.diagnostic!.totalFs ?? 0) + (results.diagnostic!.totalCs ?? 0);
 const cover = getCoverCopy({ finalGrade, endYear, yearsRemaining, forceCount });
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
 {cover.headline} <em style={{ color: '#D4A843' }}>{cover.emphasis}</em>
 </div>
 <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 {cover.description}
 </p>
 <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 {cover.secondLine}
 </p>
 <div style={{ borderLeft: '3px solid #C9A84C', paddingLeft: '12px', marginBottom: '12px' }}>
 <p style={{ margin: 0, fontFamily: CORMORANT, fontStyle: 'italic', color: '#D4A843', fontSize: '0.9rem', lineHeight: 1.7 }}>
 {COVER_QUOTE}
 </p>
 </div>
 <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 {COVER_CLOSING_LINES[0]}
 </p>
 <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 {COVER_CLOSING_LINES[1]}
 </p>
 <p style={{ margin: 0, fontSize: '0.82rem', color: '#DDD8F8', lineHeight: 1.75 }}>
 {COVER_CLOSING_LINES[2]}
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
 {/* On phones the Venn drops below the bars instead of running off the edge */}
 <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
 <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
 <VennDiagram withPrintVersion />
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
								{PATTERN_COPY.quote}
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
						{PATTERN_COPY.lead}
 </p>
 <p
 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
						{PATTERN_COPY.body}
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
						{PATTERN_COPY.highlight}
 </p>
 <p
 style={{ margin: '0 0 24px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
						{PATTERN_COPY.closing}
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
 <VennDiagram withPrintVersion />
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
 {LEGEND_CARDS.map((c) => (
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
 {...pillarCardProps(p1, 1, PILLAR_TITLES[1].title, PILLAR_TITLES[1].subtitle)}
 />
 <TestimonialCard
 quote="e.g. - 'I had the exact same Saturn/House 5 configuration. I'd been building the same offer in my head for two years. Within 60 days of working with the Pheydrus team, I launched, signed 3 clients, and finally felt like my energy matched my output.'"
 attribution="Jordan M., Los Angeles"
 />
 <PillarDeepDiveCard {...pillarCardProps(p2, 2, PILLAR_TITLES[2].title, PILLAR_TITLES[2].subtitle)} />
 <PillarDeepDiveCard
 {...pillarCardProps(p3, 3, PILLAR_TITLES[3].title, PILLAR_TITLES[3].subtitle)}
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
 <CostOfInaction goal={goal} endYear={longest?.endYear ?? null} />

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
 {ROADMAP_TITLE} 🏆
 </h3>
 {ROADMAP_STEPS.map((step) => (
 <p
 key={step.bold}
 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
 {step.before}
 <strong style={{ color: '#D4A843' }}>{step.bold}</strong>
 {step.after}
 </p>
 ))}
 {ROADMAP_PILLARS.map((item) => (
 <p
 key={item.pillar}
 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#DDD8F8', lineHeight: 1.8 }}
 >
 <span style={{ color: '#38a169', fontWeight: 800, marginRight: '6px' }}>➜</span>
 For <strong>{item.pillar}</strong>
 {item.text}
 </p>
 ))}
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
 {ROADMAP_CLOSER}
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
 const optionCardStyle: CSSProperties = {
 background: 'rgba(201,168,76,0.07)',
 border: '1px solid #C9A84C',
 borderRadius: '4px',
 padding: '32px',
 };

 return (
 <>
 <div style={optionCardStyle}>
 <h2
 style={{
 fontFamily: CORMORANT,
 color: '#E8C46A',
 fontSize: '1.7rem',
 fontWeight: 700,
 margin: '0 0 6px',
 }}
 >
 Your Pillar Repair Kit
 </h2>
 <p
 style={{
 color: '#DDD8F8',
 fontSize: '0.88rem',
 margin: '0 0 20px',
 fontFamily: INTER,
 lineHeight: 1.6,
 }}
 >
 You don't have to repair each pillar alone. Below you'll find our state-of-the-art starter
 resources, designed to target each invisible force.{' '}
 <strong>{PILLAR_RESOURCES.length} free resources</strong>, the full repair kit, at your
 fingertips. Start with the pillar that scored lowest.
 </p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 {PILLAR_RESOURCE_CARDS.map((card) => (
 <ResourceCardBox key={card.label} card={card} />
 ))}
 </div>
 </div>

 <div style={optionCardStyle}>
 <h2
 style={{
 margin: '0 0 18px',
 fontFamily: CORMORANT,
 fontSize: '1.7rem',
 fontWeight: 700,
 color: '#E8DEFF',
 }}
 >
 {COACHING_CTA_TITLE}
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
 {COACHING_CTA_PARAGRAPHS.map((paragraph) => (
 <p
 key={paragraph}
 style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#DDD8F8', fontFamily: INTER, lineHeight: 1.75 }}
 >
 {paragraph}
 </p>
 ))}
 <div style={{ marginTop: '22px' }}>
 <h3
 style={{
 margin: '0 0 6px',
 fontFamily: CORMORANT,
 fontSize: '1.4rem',
 fontWeight: 700,
 color: '#E8C46A',
 }}
 >
 <a
 href={COACHING_CALL_URL}
 target="_blank"
 rel="noopener noreferrer"
 style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '4px' }}
 >
 Book Your 15-Minute Call →
 </a>
 </h3>
 <p data-print="hide" style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#A098C0', fontFamily: INTER }}>
 Pick a time that works for you below.
 </p>
 </div>
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

 <div id="book-call" style={{ marginTop: '20px', scrollMarginTop: '120px' }}>
 <CalendlyEmbed
 url={COACHING_CALL_URL}
 name={results.userInfo.name}
 email={intake.email}
 />
 </div>
 </div>
 </>
 );
 })()}
 </section>

 {/* Action buttons */}
 <section id="actions" data-report-section data-print="hide" style={{ scrollMarginTop: '120px' }}>
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
 Download Your Report (PDF)
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
