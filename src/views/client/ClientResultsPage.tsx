/**
 * ClientResultsPage
 * Client-facing results page — mirrors the 3-page PDF report on-screen.
 * Includes speedometer grade reveal, donut chart, pattern timeline,
 * house wheel per pillar, and timeline per pillar.
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AngularDiagnosticResults } from '../../components/results/AngularDiagnosticResults';
import { exportClientReportToPDF } from '../../services/pdfExport';
import {
  renderSpeedometer,
  renderDonutChart,
  renderHouseWheel,
} from '../../services/pdfExport/clientReportTemplate';
import {
  detectGoalCategory,
  getItemInterpretation,
  getLongestMaleficTransit,
  formatDuration,
  getTransitEndYear,
  type GoalCategory,
} from '../../services/pdfExport/clientInterpretations';
import type { GradeItem, PillarSummary } from '../../models/diagnostic';
import type { PlanetaryTransit } from '../../models/calculators';
import type { ConsolidatedResults } from '../../models';
import type { ClientIntakeData } from '../../models/clientIntake';
import {
  PREFERRED_SOLUTION_LABELS,
  CURRENT_SITUATION_LABELS,
  PRIOR_HELP_LABELS,
} from '../../models/clientIntake';

const CORMORANT = "'Cormorant Garamond', Georgia, serif";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pillarScore(p: PillarSummary): number {
  return p.fCount + p.cCount * 0.5;
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

const GRADE_BORDER: Record<string, string> = {
  F: 'border-l-red-500',
  C: 'border-l-amber-500',
  A: 'border-l-emerald-500',
};
const GRADE_BG: Record<string, string> = {
  F: 'bg-red-50',
  C: 'bg-amber-50',
  A: 'bg-emerald-50',
};
const GRADE_BADGE: Record<string, string> = {
  F: 'bg-red-100 text-red-800 border border-red-300',
  C: 'bg-amber-100 text-amber-800 border border-amber-300',
  A: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
};

/** Returns the "Does this sound familiar?" mirror line for known planet+house combos. */
function getMirrorLine(item: GradeItem, goalShort: string): string | null {
  const prefix = item.section === 'Address' ? 'Env' : '';
  const key = `${prefix}${item.planet ?? ''}-${item.house ?? 0}`;
  const lines: Record<string, string> = {
    'Sun-7': `You naturally draw people in — but converting that energy into paying clients for ${goalShort} feels like a different skill entirely.`,
    'Saturn-5': `Does this sound familiar? You build the offer, get excited, draft the content — and then pull back right before you publish. Every time.`,
    'Uranus-5': `You've probably started building toward ${goalShort} more than once — with real momentum — and then watched yourself abandon it before it could pay off.`,
    'Neptune-5': `You can see the ${goalShort} version of your life clearly. The gap is in the concrete, step-by-step execution of getting there.`,
    'Pluto-6': `Are you stuck in performative busyness — doing work that feels productive but isn't actually moving the needle toward ${goalShort}?`,
    'Neptune-8': `Have you felt confused about your pricing or what you're actually worth charging — making ${goalShort} feel like a moving target?`,
    'Uranus-10': `Does your professional path feel chaotic — like you can't commit to one lane long enough to build real momentum toward ${goalShort}?`,
    'Saturn-8': `Has accessing the financial partnerships or investment needed to scale toward ${goalShort} felt blocked or fear-inducing?`,
    'EnvSaturn-2': `Since living at your current address, has there been an invisible ceiling on how much you allow yourself to charge or earn?`,
    'EnvUranus-2': `Does your income feel erratic — breakthrough months followed by drought — while ${goalShort} stays just out of reach?`,
    'EnvNeptune-2': `Are you chronically undercharging for your work — or genuinely unclear about what to charge?`,
  };
  return lines[key] ?? null;
}

// ── Inline SVG wrapper ────────────────────────────────────────────────────────

function SvgChart({ svg }: { svg: string }) {
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ── Upgrade 1: Reframe Block ──────────────────────────────────────────────────

function ReframeBlock() {
  return (
    <div
      style={{
        borderLeft: '4px solid #C9A84C',
        background: '#1a1828',
        borderRadius: '12px',
        padding: '24px 28px',
      }}
    >
      <p
        style={{
          fontFamily: CORMORANT,
          fontStyle: 'italic',
          color: '#E8D5A3',
          fontSize: '1.15rem',
          margin: '0 0 12px',
          lineHeight: 1.6,
        }}
      >
        If you've tried everything — the mindset work, the strategies, the coaches — and things are
        going well enough but that one specific thing you want keeps slipping just out of reach...
        this is your answer.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: '#c9c4d8', margin: '0 0 10px' }}>
        That unseen force is real. It's measurable. And it's encoded directly in your chart.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: '#c9c4d8', margin: '0 0 10px' }}>
        You're not broken. You're not undisciplined. You've been 10x-capable this entire time — just
        running against an invisible current.
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: '#E8D5A3', fontWeight: 600, margin: 0 }}
      >
        This report shows you exactly what that current is.
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
    const y = getTransitEndYear(item.planet, transits);
    if (y !== null && (max === null || y > max)) max = y;
  }
  return max;
}

function getPillar3MaxEndYear(
  pillar3Items: GradeItem[],
  transits: PlanetaryTransit[]
): number | null {
  let max: number | null = null;
  for (const item of pillar3Items) {
    if (!item.planet) continue;
    const y = getTransitEndYear(item.planet, transits);
    if (y !== null && (max === null || y > max)) max = y;
  }
  return max;
}

function PillarTimeline({
  pillarNum,
  pillar2Items,
  pillar3Items,
  transits,
  addressMoveDate,
}: {
  pillarNum: 1 | 2 | 3;
  pillar2Items: GradeItem[];
  pillar3Items: GradeItem[];
  transits: PlanetaryTransit[];
  addressMoveDate: string;
}) {
  const base = 'mt-3 pl-3 border-l-2 border-[#9a7d4e] text-xs text-gray-500 leading-relaxed';

  if (pillarNum === 1) {
    return (
      <p className={base}>
        <strong className="text-[#9a7d4e]">⏱ Timeline:</strong> Life-long — this is your permanent
        structural layer. It does not expire, but it can be consciously mastered.
      </p>
    );
  }

  const endYear =
    pillarNum === 2
      ? getPillar2MaxEndYear(pillar2Items, transits)
      : getPillar3MaxEndYear(pillar3Items, transits);

  if (pillarNum === 2) {
    return (
      <p className={base}>
        <strong className="text-[#9a7d4e]">⏱ Timeline:</strong>{' '}
        {endYear ? (
          <>
            Active <strong className="text-amber-600">{formatDuration(endYear)}</strong>. This
            window will lift — knowing when is half the advantage.
          </>
        ) : (
          'The active timing pressures are relatively short-cycle.'
        )}
      </p>
    );
  }

  // Pillar 3
  const addressNote = addressMoveDate
    ? ` Reflection question: did this pattern intensify around ${addressMoveDate} when you moved to your current address?`
    : '';

  return (
    <p className={base}>
      <strong className="text-[#9a7d4e]">⏱ Timeline:</strong> Amplifies your active transits for{' '}
      {endYear ? (
        <>
          approximately <strong className="text-amber-600">{formatDuration(endYear)}</strong>,
          mirroring your active transit window.
        </>
      ) : (
        'the duration of your active transit window.'
      )}
      {addressNote && <em> {addressNote}</em>}
    </p>
  );
}

// ── Upgrade 4: Interpretation bullet with mirror line ─────────────────────────

function InterpBullet({
  item,
  goal,
  goalShort,
  transits,
}: {
  item: GradeItem;
  goal: GoalCategory;
  goalShort: string;
  transits: PlanetaryTransit[];
}) {
  const text = getItemInterpretation(item, goal, transits);
  const borderCls = GRADE_BORDER[item.grade] ?? 'border-l-gray-300';
  const bgCls = GRADE_BG[item.grade] ?? 'bg-gray-50';
  const badgeCls = GRADE_BADGE[item.grade] ?? 'bg-gray-100 text-gray-600 border border-gray-200';
  const label = item.section === 'Address' ? '🏠 Address Energy' : item.source;
  const mirror = getMirrorLine(item, goalShort);

  return (
    <div className={`border-l-4 ${borderCls} ${bgCls} rounded-r-lg p-3`}>
      {mirror && (
        <p
          className="mb-2 text-[0.85rem] leading-snug"
          style={{ fontStyle: 'italic', color: '#C9A84C' }}
        >
          💭 {mirror}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="text-sm font-semibold text-[#2d2a3e]">{label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeCls}`}>{item.grade}</span>
      </div>
      <p className="text-sm text-[#4a4560] leading-relaxed">{text}</p>
    </div>
  );
}

// ── Upgrade 7: Testimonial placeholder card ───────────────────────────────────

function TestimonialCard({ quote, attribution }: { quote: string; attribution: string }) {
  return (
    // REPLACE WITH REAL TESTIMONIAL
    <div
      style={{
        background: '#1A1A1A',
        borderLeft: '3px solid #C9A84C',
        borderRadius: '8px',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
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
          color: '#E8D5A3',
          fontSize: '1.05rem',
          lineHeight: 1.65,
          margin: '0 0 10px',
          position: 'relative',
        }}
      >
        {quote}
      </p>
      <p
        style={{ fontFamily: 'Inter, sans-serif', color: '#888888', fontSize: '0.8rem', margin: 0 }}
      >
        — {attribution}
      </p>
    </div>
  );
}

// ── Pillar deep-dive card ─────────────────────────────────────────────────────

const PILLAR_BADGE_CLS: Record<1 | 2 | 3, string> = {
  1: 'bg-red-100 text-red-800 border border-red-300',
  2: 'bg-amber-100 text-amber-800 border border-amber-300',
  3: 'bg-[#f0ebe0] text-[#78643a] border border-[#c4a96b]',
};

// Upgrade 3: goal tie-in callout copy per pillar
const PILLAR_CALLOUT: Record<1 | 2 | 3, (goal: string, loc: string) => string> = {
  1: (goal) => `Here is how Pillar 1 is specifically blocking your goal of ${goal}:`,
  2: (goal) =>
    `Here is how your current timing window is directly affecting your ability to reach ${goal}:`,
  3: (goal, loc) =>
    `Here is how your current address${loc ? ` in ${loc}` : ''} is interacting with your goal of ${goal}:`,
};

function PillarDeepDiveCard({
  pillar,
  index,
  title,
  subtitle,
  intro,
  goal,
  goalShort,
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
  intro: string;
  goal: GoalCategory;
  goalShort: string;
  location: string;
  transits: PlanetaryTransit[];
  pillar2Items: GradeItem[];
  pillar3Items: GradeItem[];
  addressMoveDate: string;
}) {
  const scoringItems = pillar.items.filter(
    (i) => i.grade === 'F' || i.grade === 'C' || i.grade === 'A'
  );
  const calloutText = PILLAR_CALLOUT[index](goalShort, location);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${PILLAR_BADGE_CLS[index]}`}>
          PILLAR {index}
        </span>
        <span className="text-base font-bold text-[#2d2a3e]">{title}</span>
        <span className="text-xs text-gray-400">— {subtitle}</span>
        {pillar.fCount > 0 && (
          <span className="text-xs font-semibold text-red-600 ml-1">
            {pillar.fCount} F{pillar.fCount !== 1 ? "'s" : ''}
          </span>
        )}
        {pillar.cCount > 0 && (
          <span className="text-xs font-semibold text-amber-600 ml-1">
            {pillar.cCount} C{pillar.cCount !== 1 ? "'s" : ''}
          </span>
        )}
      </div>

      {/* Upgrade 3: Goal tie-in callout */}
      <p
        className="mb-3 pb-3 text-sm leading-relaxed"
        style={{
          fontFamily: CORMORANT,
          fontStyle: 'italic',
          color: '#E8D5A3',
          borderBottom: '1px solid rgba(201,168,76,0.25)',
          background: 'rgba(201,168,76,0.05)',
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '0 0 12px',
        }}
      >
        {calloutText}
      </p>

      <p className="text-sm text-gray-500 italic leading-relaxed mb-4">{intro}</p>

      {/* Bullets left, house wheel right */}
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          {scoringItems.length === 0 ? (
            <p className="text-sm text-emerald-600 italic">
              No significant pressure identified in this pillar — this dimension is working in your
              favor.
            </p>
          ) : (
            <div className="space-y-3">
              {scoringItems.map((item, i) => (
                <InterpBullet
                  key={i}
                  item={item}
                  goal={goal}
                  goalShort={goalShort}
                  transits={transits}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-center hidden sm:block">
          <SvgChart svg={renderHouseWheel(pillar.items)} />
          <p className="text-[10px] text-gray-400 mt-1">House Chart</p>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-[9px] text-gray-400">
            <span className="inline-block w-2 h-2 bg-red-300 rounded-sm" /> F
            <span className="inline-block w-2 h-2 bg-amber-300 rounded-sm ml-1" /> C
            <span className="inline-block w-2 h-2 bg-emerald-300 rounded-sm ml-1" /> A
          </div>
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

// ── Upgrade 5: Cost of Inaction section ──────────────────────────────────────

function CostOfInaction({ goalShort, endYear }: { goalShort: string; endYear: number | null }) {
  const yearLine = endYear
    ? `The pattern in this report has been active for years. Without targeted deconditioning of the specific layers identified above, the data points to ${endYear}.`
    : `The pattern in this report has been active for years. Without targeted deconditioning of the specific layers identified above, it does not self-resolve.`;
  const yearsRemaining = endYear ? endYear - new Date().getFullYear() : null;

  return (
    <div
      style={{
        background: '#1A0A0A',
        borderLeft: '4px solid #C0392B',
        borderRadius: '12px',
        padding: '28px 32px',
      }}
    >
      <h3
        style={{
          fontFamily: CORMORANT,
          color: '#ffffff',
          fontSize: '1.6rem',
          fontWeight: 700,
          margin: '0 0 20px',
          lineHeight: 1.3,
        }}
      >
        What Another Year of This Pattern Costs You
      </h3>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#c9b8b8' }}>
        <p>Another 12 months of knowing exactly what to do — and watching yourself not do it.</p>
        <p>
          Another year of income that almost hits {goalShort}, but resets every time you get close.
        </p>
        <p>
          Another year of brilliant ideas living in your drafts folder instead of the marketplace.
        </p>
        <p>Another year of telling yourself next month will be different.</p>
        <p>{yearLine}</p>
        {yearsRemaining !== null && yearsRemaining > 0 && (
          <p>
            That's{' '}
            <strong style={{ color: '#ef4444' }}>
              {yearsRemaining} more year{yearsRemaining !== 1 ? 's' : ''}
            </strong>
            .
          </p>
        )}
        <p
          style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: '#C9A84C',
            marginTop: '8px',
          }}
        >
          Or — you begin the decondition now.
        </p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ClientResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const state = location.state as { results: ConsolidatedResults; intake: ClientIntakeData } | null;

  if (!state?.results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] py-12 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-[#2d2a3e] mb-3">No results found</h2>
          <p className="text-[#6b6188] mb-6">Please complete the assessment first.</p>
          <button
            onClick={() => navigate('/client')}
            className="px-6 py-3 bg-[#9a7d4e] hover:bg-[#b8944a] text-white font-bold rounded-xl transition-colors"
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

  const longest = getLongestMaleficTransit(results.diagnostic!.allItems, transits);
  const prefLabel = intake.preferredSolution
    ? (PREFERRED_SOLUTION_LABELS[intake.preferredSolution] ?? intake.preferredSolution)
    : null;

  // ── Calendly CTA eligibility ────────────────────────────────────────────────
  const { finalGrade } = results.diagnostic!;
  const desiredOutcomeWordCount = intake.desiredOutcome.trim().split(/\s+/).filter(Boolean).length;
  const soughtTherapyOrCoaches =
    intake.priorHelp.includes('therapy') || intake.priorHelp.includes('coaches');
  const notMonetizing = intake.currentSituation !== 'monetizing';
  const scoredCOrWorse = finalGrade === 'C' || finalGrade === 'F';
  const showCalendlyCTA =
    desiredOutcomeWordCount > 1 && soughtTherapyOrCoaches && notMonetizing && scoredCOrWorse;

  const pillarIntros: Record<1 | 2 | 3, string> = {
    1: `These are the energetic signatures encoded in your birth chart — the structural blueprint you came in with. They don't expire, but they can be mastered. What follows are the specific placements creating the most friction for your goal of ${GOAL_LABEL[goal].toLowerCase()}.`,
    2: `These are the slow-moving planetary forces currently transiting your chart — the timing window you are in right now. Each one includes how long it runs, giving you an honest timeline rather than an open-ended question mark.`,
    3: `Your current location and home address are either amplifying or dampening every other pressure in your chart. What follows is how your environmental energy is specifically interacting with your goal.`,
  };

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
    intro: pillarIntros[index],
    goal,
    goalShort,
    location: clientLocation,
    transits,
    pillar2Items: p2.items,
    pillar3Items: p3.items,
    addressMoveDate: intake.addressMoveDate,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2d2a3e]">Your Pheydrus Report</h1>
          <p className="text-[#6b6188] text-sm mt-1">
            Personalized 3-Pillar Analysis for {results.userInfo.name}
          </p>
        </div>

        {/* Intake summary card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#9a7d4e] mb-4">Your Assessment Summary</h2>
          <div className="space-y-3 text-sm">
            {intake.desiredOutcome && (
              <IntakRow label="Desired outcome (90 days)" value={intake.desiredOutcome} />
            )}
            {intake.obstacle && <IntakRow label="Main obstacle" value={intake.obstacle} />}
            {intake.patternYear && (
              <IntakRow label="Pattern noticed since" value={intake.patternYear} />
            )}
            {intake.priorHelp.length > 0 && (
              <IntakRow
                label="Prior support sought"
                value={intake.priorHelp.map((o) => PRIOR_HELP_LABELS[o]).join(', ')}
              />
            )}
            {intake.preferredSolution && (
              <IntakRow
                label="Preferred solution"
                value={PREFERRED_SOLUTION_LABELS[intake.preferredSolution]}
              />
            )}
            {intake.currentSituation && (
              <IntakRow
                label="Current situation"
                value={CURRENT_SITUATION_LABELS[intake.currentSituation]}
              />
            )}
            {intake.addressMoveDate && (
              <IntakRow label="Moved to address" value={intake.addressMoveDate} />
            )}
            {intake.additionalNotes && (
              <IntakRow label="Additional notes" value={intake.additionalNotes} />
            )}
          </div>
        </div>

        {/* Upgrade 1: Reframe block */}
        <ReframeBlock />

        {/* Upgrade 2: "Why This Keeps Happening" (replaces Big Reveal heading/copy) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start justify-between mb-5">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#2d2a3e] mb-4">Why This Keeps Happening</h2>
              <p className="text-sm text-[#4a4560] leading-relaxed mb-3">
                You already know what you need to do to reach {goalShort}. You've probably known for
                months.
              </p>
              <p className="text-sm text-[#4a4560] leading-relaxed mb-3">
                So why does it keep not happening?
              </p>
              <p className="text-sm font-bold leading-relaxed mb-3" style={{ color: '#C9A84C' }}>
                It's not discipline. It's not strategy. It's not even mindset.
              </p>
              <p className="text-sm text-[#4a4560] leading-relaxed mb-3">
                It's something encoded — in your chart, your timing, and your environment — that
                most coaches will never show you. Because they can't see it.
              </p>
              <p className="text-sm text-gray-400 italic leading-relaxed">
                Below is your full diagnosis.
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <p className="text-[10px] text-[#6b6188] uppercase tracking-widest mb-1">
                Overall Grade
              </p>
              <SvgChart
                svg={renderSpeedometer(results.diagnostic!.finalGrade, results.diagnostic!.score)}
              />
            </div>
          </div>
        </div>

        {/* Pattern timeline */}
        {longest && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-red-800 mb-1.5">⏰ Pattern Timeline</h3>
            <p className="text-sm text-red-700 leading-relaxed">
              Your active planetary data points to this pattern persisting{' '}
              <strong>{formatDuration(longest.endYear)}</strong> if the current approach continues.
              The primary driver is <strong>{longest.planet}</strong> transiting House{' '}
              {longest.house} — a slow-moving outer planet that defines the window you are working
              within.
            </p>
          </div>
        )}

        {/* Donut chart + pillar definitions */}
        {total > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#2d2a3e] mb-4">Pattern Breakdown by Pillar</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Chart */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <SvgChart svg={renderDonutChart(p1pct, p2pct, p3pct)} />
                <div className="flex flex-col gap-1 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-sm" /> Pillar 1 —{' '}
                    {p1pct}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-sm" /> Pillar 2 —{' '}
                    {p2pct}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 bg-[#9a7d4e] rounded-sm" /> Pillar 3 —{' '}
                    {p3pct}%
                  </span>
                </div>
              </div>

              {/* Definitions */}
              <div className="flex-1 space-y-3">
                {[
                  {
                    num: 1,
                    pct: p1pct,
                    color: 'border-l-red-500',
                    badge: 'bg-red-100 text-red-800',
                    title: 'Structure',
                    text: "Your birth chart's permanent energetic architecture. This layer does not expire — malefic placements here are lifelong structural pressures that can be mastered but not removed.",
                    pathText:
                      'A combination of 1:1 calls and self-study are well-suited for deconditioning patterns in this pillar.',
                  },
                  {
                    num: 2,
                    pct: p2pct,
                    color: 'border-l-amber-400',
                    badge: 'bg-amber-100 text-amber-800',
                    title: 'Timing',
                    text: 'Slow-moving outer planets currently transiting specific areas of your chart. This layer is temporary but powerful while active — knowing when it lifts gives you an honest timeline.',
                    pathText:
                      'A combination of 1:1 calls and self-study are well-suited for deconditioning patterns in this pillar.',
                  },
                  {
                    num: 3,
                    pct: p3pct,
                    color: 'border-l-[#9a7d4e]',
                    badge: 'bg-[#f0ebe0] text-[#78643a]',
                    title: 'Environment',
                    text: 'This is Pheydrus\' "secret sauce" — your current location and home address carry an energetic signature that can neutralize or offset the negative effects of both Pillar 1 and Pillar 2 when properly aligned. Of the three layers, Pillar 3 is the most immediately actionable.',
                    pathText:
                      'A combination of Done-For-You, 1:1 calls, and self-study are suited for reorganizing internal energies and curing external energies.',
                  },
                ].map((d) => (
                  <div key={d.num} className={`border-l-4 ${d.color} bg-gray-50 rounded-r-lg p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.badge}`}>
                          P{d.num}
                        </span>
                        <span className="text-sm font-bold text-[#2d2a3e]">{d.title}</span>
                      </div>
                      <span className="text-lg font-black text-gray-700">{d.pct}%</span>
                    </div>
                    <p className="text-xs text-[#4a4560] leading-relaxed mb-1.5">{d.text}</p>
                    {prefLabel && (
                      <p className="text-xs text-[#9a7d4e] italic">
                        Recommended path: {d.pathText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Raw diagnostic report */}
        <AngularDiagnosticResults result={results.diagnostic!} />

        {/* Pillar deep-dive interpretations with testimonials after P1 and P3 */}
        <div>
          <h2 className="text-xl font-bold text-[#2d2a3e] mb-1">
            What's Holding Back Your {GOAL_LABEL[goal]}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            A pillar-by-pillar breakdown mapped directly to your stated outcome.
          </p>
          <div className="space-y-4">
            {/* Pillar 1 */}
            <PillarDeepDiveCard
              {...pillarCardProps(p1, 1, 'Structure', 'Your Energetic Blueprint')}
            />
            {/* Upgrade 7: Testimonial after Pillar 1 */}
            <TestimonialCard
              quote="[TESTIMONIAL] e.g. — 'I had the exact same Saturn/House 5 configuration. I'd been building the same offer in my head for two years. Within 60 days of working with the Pheydrus team, I launched, signed 3 clients, and finally felt like my energy matched my output.'"
              attribution="Jordan M., Los Angeles"
            />
            {/* Pillar 2 */}
            <PillarDeepDiveCard {...pillarCardProps(p2, 2, 'Timing', 'The Window You Are In')} />
            {/* Pillar 3 */}
            <PillarDeepDiveCard {...pillarCardProps(p3, 3, 'Environment', 'Location & Address')} />
            {/* Upgrade 7: Testimonial after Pillar 3 */}
            <TestimonialCard
              quote="[TESTIMONIAL] e.g. — 'The environment piece was the one I almost skipped. After my Pillar 3 session I raised my rates by 40% and signed my highest-paying client that same week. The address work is real.'"
              attribution="Priya K., New York"
            />
          </div>
        </div>

        {/* Upgrade 5: Cost of Inaction */}
        <CostOfInaction goalShort={goalShort} endYear={longest?.endYear ?? null} />

        {/* Upgrade 7: Testimonial after Cost of Inaction */}
        <TestimonialCard
          quote="[TESTIMONIAL] e.g. — 'I came in skeptical. Three years of coaches and nothing had actually shifted. I left my first session with a sequenced 90-day plan that made more sense than anything I'd tried before.'"
          attribution="Marcus T., Chicago"
        />

        {/* Upgrade 6: Precision Deconditioning Session CTA */}
        {showCalendlyCTA && (
          <div
            style={{
              background: 'linear-gradient(135deg, #2d2a3e, #1a1828)',
              borderRadius: '16px',
              padding: '36px 40px',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontFamily: CORMORANT,
                color: '#C9A84C',
                fontSize: '1.8rem',
                fontWeight: 700,
                margin: '0 0 20px',
                lineHeight: 1.3,
              }}
            >
              Your Next Step: The Precision Deconditioning Session
            </h2>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: '#d1d5db', maxWidth: '520px', margin: '0 auto 16px' }}
            >
              This is a 45-minute 1:1 session with the Pheydrus team where we:
            </p>
            <ul
              className="text-sm leading-relaxed text-left mb-6 space-y-2"
              style={{
                color: '#d1d5db',
                maxWidth: '460px',
                margin: '0 auto 24px',
                listStyle: 'none',
                padding: 0,
              }}
            >
              <li>→ Map which pillar to activate first for your specific goal of {goalShort}</li>
              <li>→ Decode exactly what your Uranus/House 10 window means for the next 90 days</li>
              <li>→ Determine whether Artist's Way is your aligned next chapter</li>
            </ul>
            <p
              style={{
                fontFamily: CORMORANT,
                fontStyle: 'italic',
                color: '#E8D5A3',
                fontSize: '1.05rem',
                margin: '0 0 24px',
                lineHeight: 1.6,
              }}
            >
              This is not a sales call.
              <br />
              It is the beginning of your decondition.
            </p>
            <p className="text-xs mb-6" style={{ color: '#9ca3af' }}>
              Limited sessions available this cycle.
            </p>
            <div>
              <a
                href="https://calendly.com/pheydrus_strategy/1-1-alignment-strategy-call-clone-1"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)',
                  color: '#0D0D0D',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.08em',
                  padding: '18px 40px',
                  borderRadius: '2px',
                  textDecoration: 'none',
                  textTransform: 'uppercase' as const,
                  transition: 'opacity 0.2s',
                }}
              >
                Book Your Precision Deconditioning Session →
              </a>
            </div>
            <p className="text-xs mt-4" style={{ color: '#6b7280' }}>
              Complimentary · No obligation · Limited availability this cycle
            </p>
          </div>
        )}

        {/* Also show a softer version for non-eligible visitors */}
        {!showCalendlyCTA && (
          <div className="bg-gradient-to-br from-[#2d2a3e] to-[#1a1828] rounded-2xl shadow-lg p-7 text-white text-center">
            <h2
              style={{
                fontFamily: CORMORANT,
                color: '#C9A84C',
                fontSize: '1.6rem',
                fontWeight: 700,
                margin: '0 0 12px',
              }}
            >
              Your Next Step: The Precision Deconditioning Session
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-5 max-w-lg mx-auto">
              A focused 45-minute 1:1 with the Pheydrus team to map your exact decondition sequence
              — pillar by pillar, in the right order for your chart.
            </p>
            <a
              href="https://calendly.com/pheydrus_strategy/1-1-alignment-strategy-call-clone-1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)',
                color: '#0D0D0D',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.08em',
                padding: '18px 40px',
                borderRadius: '2px',
                textDecoration: 'none',
                textTransform: 'uppercase' as const,
              }}
            >
              Book Your Precision Deconditioning Session →
            </a>
            <p className="text-xs mt-4" style={{ color: '#6b7280' }}>
              Complimentary · No obligation · Limited availability this cycle
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-6 py-3 bg-[#9a7d4e] hover:bg-[#b8944a] disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
          >
            {isExporting ? 'Generating PDF…' : 'Download Your Report (PDF)'}
          </button>
          <button
            onClick={() => navigate('/client')}
            className="px-6 py-3 border border-gray-200 text-[#6b6188] font-semibold rounded-xl hover:border-[#9a7d4e] hover:text-[#9a7d4e] transition-colors"
          >
            Start New Assessment
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          Report generated {new Date(results.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function IntakRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <p className="text-[#6b6188] font-medium mb-0.5">{label}</p>
      <p className="text-[#2d2a3e]">{value}</p>
    </div>
  );
}

export default ClientResultsPage;
