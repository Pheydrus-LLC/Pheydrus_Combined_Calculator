/**
 * The page designs of the book: one component per kind of page. The page
 * list itself (which pages, in what order) is built in bookPages.tsx.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ReportContext } from '../../../services/diagnostic/reportContext';
import type { FindingContent } from '../../../services/diagnostic/findingContent';
import type { GradeItem } from '../../../models/diagnostic';
import {
  getCoverCopy,
  getPillarLetterGrade,
  COVER_QUOTE,
  COVER_CLOSING_LINES,
  PATTERN_COPY,
  LEGEND_CARDS,
  PILLAR_TITLES,
  PILLAR_CALLOUT,
} from '../../../data/reportCopy';
import { PILLAR_VOICE_NOTES } from '../../../data/pillarVoiceNotes';
import { COST_OF_INACTION_TITLE, getCostOfInactionCopy } from '../../../data/costOfInaction';
import { ROADMAP_TITLE, ROADMAP_STEPS, ROADMAP_PILLARS, ROADMAP_CLOSER } from '../../../data/roadmap';
import { PILLAR_RESOURCE_CARDS, PILLAR_RESOURCES } from '../../../data/freeResources';
import { COACHING_CTA_TITLE, COACHING_CTA_PARAGRAPHS, COACHING_CALL_URL } from '../../../data/coachingCta';
import { PRESS_URL, PRESS_LOGOS_LIGHT, PRESS_LOGOS_ALT } from '../../../data/press';
import { renderHouseWheel } from '../../../utils/houseWheel';
import { VoiceNotePlayer } from '../../../components/results/VoiceNotePlayer';
import { ResourceCardBox } from '../../../components/results/ResourceCardBox';
import { VennDiagram } from '../../../components/results/VennDiagram';
import { BOOK } from './bookTheme';

// ── Building blocks ──────────────────────────────────────────────────────────

const Eyebrow = ({ children, color = BOOK.muted }: { children: ReactNode; color?: string }) => (
  <div
    style={{
      fontFamily: BOOK.sans,
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      marginBottom: '10px',
    }}
  >
    {children}
  </div>
);

const Title = ({ children, size = '1.9rem' }: { children: ReactNode; size?: string }) => (
  <h2 style={{ fontFamily: BOOK.serif, fontSize: size, fontWeight: 700, color: BOOK.ink, lineHeight: 1.2, margin: '0 0 16px' }}>
    {children}
  </h2>
);

const Body = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <p style={{ fontFamily: BOOK.sans, fontSize: '0.95rem', lineHeight: 1.7, color: BOOK.text, margin: '0 0 14px', ...style }}>
    {children}
  </p>
);

const Quote = ({ children }: { children: ReactNode }) => (
  <div style={{ borderLeft: `3px solid ${BOOK.gold}`, padding: '10px 16px', margin: '0 0 18px', background: 'rgba(201,168,76,0.07)' }}>
    <p style={{ margin: 0, fontFamily: BOOK.serif, fontStyle: 'italic', color: BOOK.goldText, fontSize: '1.08rem', lineHeight: 1.6 }}>
      {children}
    </p>
  </div>
);

const Chip = ({ children, color, bg, border }: { children: ReactNode; color: string; bg: string; border: string }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '3px 9px',
      borderRadius: '2px',
      fontSize: '0.7rem',
      fontWeight: 700,
      fontFamily: BOOK.sans,
      color,
      background: bg,
      border: `1px solid ${border}`,
    }}
  >
    {children}
  </span>
);

const GradeCircle = ({ grade, size = 104 }: { grade: string; size?: number }) => {
  const g = BOOK.grade(grade);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2.5px solid ${g.border}`,
        background: g.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      <span style={{ fontFamily: BOOK.serif, fontSize: size * 0.52, fontWeight: 700, color: g.text, lineHeight: 1 }}>{grade}</span>
    </div>
  );
};

const HouseWheel = ({ items, size, highlight }: { items: GradeItem[]; size: number; highlight?: number }) => (
  <div style={{ display: 'flex', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: renderHouseWheel(items, size, highlight) }} />
);

/** Starfield and glow behind the front and back covers */
const COSMIC_BACKGROUND = [
  'radial-gradient(ellipse 70% 45% at 50% 38%, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0) 70%)',
  'radial-gradient(ellipse 90% 60% at 10% 0%, rgba(110,50,200,0.30) 0%, transparent 60%)',
  'radial-gradient(ellipse 70% 50% at 95% 100%, rgba(35,85,220,0.22) 0%, transparent 60%)',
  ...[
    [8, 9], [22, 18], [37, 6], [64, 12], [81, 7], [92, 22], [14, 33], [88, 41], [6, 58], [95, 63],
    [18, 74], [79, 79], [30, 88], [58, 93], [72, 86], [47, 4], [5, 90], [97, 92], [26, 52], [70, 30],
  ].map(([x, y], i) => `radial-gradient(circle 1px at ${x}% ${y}%, rgba(255,255,255,${0.45 + (i % 4) * 0.12}) 0%, rgba(255,255,255,0) 2px)`),
  '#070C1F',
].join(', ');

const Orbits = () => (
  <svg aria-hidden="true" viewBox="0 0 400 400" style={{ position: 'absolute', top: '6%', left: '50%', width: '120%', maxWidth: '520px', transform: 'translateX(-50%)', opacity: 0.55, pointerEvents: 'none' }}>
    <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(201,168,76,0.25)" strokeWidth="0.8" />
    <circle cx="200" cy="200" r="136" fill="none" stroke="rgba(201,168,76,0.18)" strokeWidth="0.8" strokeDasharray="2 6" />
    <circle cx="200" cy="200" r="92" fill="none" stroke="rgba(192,176,240,0.18)" strokeWidth="0.8" />
    <circle cx="200" cy="20" r="3" fill="#E8C46A" />
    <circle cx="336" cy="200" r="2.2" fill="#C0B0F0" />
    <circle cx="135" cy="281" r="2" fill="#7ECFC4" />
  </svg>
);

const IMPACT_CHIP = {
  hurts: { text: '⚡ Hurts Goal', bg: 'rgba(248,113,113,0.12)', color: '#F87171', border: 'rgba(248,113,113,0.4)' },
  caution: { text: '⚠️ Caution', bg: 'rgba(212,168,67,0.1)', color: '#E8A838', border: '#C9A84C' },
  helps: { text: '✓ Helps Goal', bg: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '#2ecc71' },
};

const PILLAR_ACCENT: Record<1 | 2 | 3, string> = { 1: '#E8C46A', 2: '#C0B0F0', 3: '#7ECFC4' };
/** Bar colours of the report's score breakdown */
const PILLAR_BAR: Record<1 | 2 | 3, string> = { 1: '#F87171', 2: '#C9A84C', 3: '#9a7d4e' };

// ── Covers ───────────────────────────────────────────────────────────────────

export function CoverPage({ name }: { name: string }) {
  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '44px 34px 30px', background: COSMIC_BACKGROUND, overflow: 'hidden' }}>
      <Orbits />
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
        <span style={{ color: BOOK.gold, fontSize: '1.1rem', letterSpacing: '0.4em' }}>✦</span>
        <div style={{ fontFamily: BOOK.serif, fontSize: '2.7rem', fontWeight: 700, lineHeight: 1.05, color: BOOK.goldText, letterSpacing: '0.04em' }}>
          The Invisible
          <br />
          Forces
        </div>
        <div style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.7rem', color: BOOK.ink, lineHeight: 1 }}>Report</div>
        <div style={{ width: '64px', height: '1px', background: 'rgba(201,168,76,0.6)', margin: '10px 0 4px' }} />
        <div style={{ fontFamily: BOOK.sans, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: BOOK.muted }}>
          Authored by Pheydrus
        </div>
        {name && <div style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.2rem', color: BOOK.ink }}>for {name}</div>}
      </div>
      <a href={PRESS_URL} target="_blank" rel="noopener noreferrer" style={{ position: 'relative', display: 'block', width: '100%', textDecoration: 'none' }}>
        <div style={{ fontFamily: BOOK.sans, fontSize: '0.56rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: BOOK.muted, marginBottom: '8px' }}>
          As Seen On
        </div>
        <img src={PRESS_LOGOS_LIGHT} alt={PRESS_LOGOS_ALT} style={{ display: 'block', width: '100%', height: 'auto', opacity: 0.7 }} />
      </a>
    </div>
  );
}

export function BackCoverPage({ onOpenReport }: { onOpenReport?: () => void }) {
  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '44px 34px', background: COSMIC_BACKGROUND, overflow: 'hidden' }}>
      <Orbits />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: BOOK.gold, fontSize: '1.2rem' }}>✦</span>
        <p style={{ fontFamily: BOOK.serif, fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, color: BOOK.goldText, margin: 0 }}>
          This is not the end of your story.
        </p>
        <p style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.25rem', lineHeight: 1.4, color: BOOK.ink, margin: 0 }}>
          It's yours, and it's only just beginning.
        </p>
        <div style={{ width: '64px', height: '1px', background: 'rgba(201,168,76,0.6)', margin: '6px 0' }} />
        <div style={{ fontFamily: BOOK.sans, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: BOOK.muted }}>Pheydrus</div>
        {onOpenReport && (
          <button
            type="button"
            onClick={onOpenReport}
            style={{ marginTop: '8px', background: 'transparent', border: `1px solid ${BOOK.gold}`, color: BOOK.goldText, fontFamily: BOOK.sans, fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '11px 18px', borderRadius: '2px', cursor: 'pointer' }}
          >
            Open the full report
          </button>
        )}
      </div>
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────

export function ScorePage({ ctx, date }: { ctx: ReportContext; date: string }) {
  const cover = getCoverCopy(ctx);
  return (
    <>
      <Eyebrow>Your Alignment Score · {date}</Eyebrow>
      <div style={{ margin: '8px 0 14px' }}>
        <GradeCircle grade={ctx.finalGrade} size={120} />
        <div style={{ textAlign: 'center', fontFamily: BOOK.sans, fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: BOOK.muted, marginTop: '8px' }}>
          Overall Grade
        </div>
      </div>
      <p style={{ fontFamily: BOOK.serif, fontSize: '1.12rem', lineHeight: 1.45, color: BOOK.ink, textAlign: 'center', margin: '0 0 22px' }}>
        {cover.headline} <em style={{ color: BOOK.goldText }}>{cover.emphasis}</em>
      </p>
      <Eyebrow>Your score breaks down as</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {([1, 2, 3] as const).map((n) => {
          const grade = getPillarLetterGrade(ctx.pillars[n - 1]);
          const g = BOOK.grade(grade);
          const share = ctx.pillarShares[n - 1];
          return (
            <div key={n}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: BOOK.sans, fontSize: '0.9rem', fontWeight: 700, color: BOOK.ink }}>
                  {PILLAR_TITLES[n].title} <span style={{ fontWeight: 500, fontSize: '0.75rem', color: BOOK.muted }}>Pillar {n}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: BOOK.sans, fontSize: '0.88rem', fontWeight: 700, color: PILLAR_BAR[n] }}>{share}%</span>
                  <Chip color={g.text} bg={g.bg} border={g.border}>{grade}</Chip>
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${share}%`, height: '100%', borderRadius: '999px', background: PILLAR_BAR[n] }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function ScoreMeaningPage({ ctx }: { ctx: ReportContext }) {
  const cover = getCoverCopy(ctx);
  return (
    <>
      <Eyebrow>What your score means</Eyebrow>
      <Title>Reading Your Score</Title>
      <Body>{cover.description}</Body>
      <Body>{cover.secondLine}</Body>
      <div style={{ border: `1px solid rgba(201,168,76,0.45)`, background: 'rgba(201,168,76,0.07)', borderRadius: '4px', padding: '14px 16px', marginTop: '4px' }}>
        <Eyebrow color={BOOK.goldText}>⚠ The window you're in</Eyebrow>
        <p style={{ margin: 0, fontFamily: BOOK.sans, fontSize: '0.88rem', lineHeight: 1.65, color: BOOK.text }}>
          Without intervention, your current configuration is projected to persist{' '}
          <strong style={{ color: BOOK.goldText }}>
            {ctx.endYear
              ? `through ${ctx.endYear}${ctx.yearsRemaining ? ` - approximately ${ctx.yearsRemaining} more years` : ''}`
              : 'for several more years'}
          </strong>
          . The primary driver is{' '}
          <strong style={{ color: BOOK.ink }}>
            {ctx.longest ? `${ctx.longest.planet} transiting House ${ctx.longest.house}` : 'the dominant outer planet transit'}
          </strong>
          . Knowing the window is half the advantage.
        </p>
      </div>
    </>
  );
}

export function BeforeYouBeginPage() {
  return (
    <>
      <Eyebrow>Before you begin</Eyebrow>
      <Quote>{COVER_QUOTE}</Quote>
      {COVER_CLOSING_LINES.map((line) => (
        <Body key={line}>{line}</Body>
      ))}
    </>
  );
}

// ── Why this happens ─────────────────────────────────────────────────────────

export function PatternPage() {
  return (
    <>
      <Eyebrow>The Pattern</Eyebrow>
      <Title>Why This Keeps Happening</Title>
      <Quote>{PATTERN_COPY.quote}</Quote>
      <Body style={{ fontWeight: 700, color: BOOK.ink }}>{PATTERN_COPY.lead}</Body>
      <Body>{PATTERN_COPY.body}</Body>
      <Body style={{ fontWeight: 700, color: BOOK.goldText }}>{PATTERN_COPY.highlight}</Body>
      <Body>{PATTERN_COPY.closing}</Body>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: '6px' }}>
        <VennDiagram width={150} />
      </div>
    </>
  );
}

export function ForcesPage() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <Eyebrow>The Pattern</Eyebrow>
          <h2 style={{ fontFamily: BOOK.serif, fontSize: '1.75rem', fontWeight: 700, color: BOOK.ink, lineHeight: 1.15, margin: 0 }}>
            The Three Invisible Forces
          </h2>
        </div>
        <VennDiagram width={112} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {LEGEND_CARDS.map((c) => (
          <div key={c.label} style={{ border: `1px solid ${BOOK.line}`, borderRadius: '4px', padding: '9px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
              <span style={{ fontFamily: BOOK.sans, fontSize: '0.64rem', letterSpacing: '0.1em', color: BOOK.muted }}>{c.label}</span>
            </div>
            <p style={{ margin: '0 0 3px', fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.4, color: BOOK.goldText }}>
              {c.question}
            </p>
            <p style={{ margin: 0, fontFamily: BOOK.sans, fontSize: '0.78rem', lineHeight: 1.5, color: BOOK.text }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Pillar chapters ──────────────────────────────────────────────────────────

export function ChapterOpenerPage({ ctx, n }: { ctx: ReportContext; n: 1 | 2 | 3 }) {
  const pillar = ctx.pillars[n - 1];
  const grade = getPillarLetterGrade(pillar);
  const note = PILLAR_VOICE_NOTES[n];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <Eyebrow color={PILLAR_ACCENT[n]}>Chapter {n} · Pillar {n}</Eyebrow>
        <span style={{ fontFamily: BOOK.sans, fontSize: '1.4rem', fontWeight: 900, color: BOOK.grade(grade).text }}>{grade}</span>
      </div>
      <Title size="2.2rem">{PILLAR_TITLES[n].title}</Title>
      <div style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.15rem', color: PILLAR_ACCENT[n], margin: '-8px 0 18px' }}>
        {PILLAR_TITLES[n].subtitle}
      </div>
      {note && <VoiceNotePlayer src={note.src} label={note.label} variant={n - 1} />}
      <Body style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.05rem', color: BOOK.goldText }}>
        {PILLAR_CALLOUT[n](ctx.goalShort, ctx.location)}
      </Body>
      <HouseWheel items={pillar.items} size={150} />
    </>
  );
}

export function FindingPage({
  content,
  item,
  pillarItems,
  n,
  position,
  total,
}: {
  content: FindingContent;
  item: GradeItem;
  pillarItems: GradeItem[];
  n: 1 | 2 | 3;
  position: number;
  total: number;
}) {
  const g = BOOK.grade(content.grade);
  const impact = content.impact ? IMPACT_CHIP[content.impact] : null;
  return (
    <>
      <Eyebrow color={PILLAR_ACCENT[n]}>
        Chapter {n} · {PILLAR_TITLES[n].title} · {position} of {total}
      </Eyebrow>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: BOOK.sans, fontSize: '1.1rem', fontWeight: 700, color: BOOK.ink, margin: '0 0 10px', lineHeight: 1.35 }}>
            {content.label}
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Chip color={g.text} bg={g.bg} border={g.border}>
              {content.grade}
              {content.endYear ? ` · thru ${content.endYear}` : ''}
            </Chip>
            {impact && <Chip color={impact.color} bg={impact.bg} border={impact.border}>{impact.text}</Chip>}
          </div>
        </div>
        {/* The pillar's chart, with this placement outlined */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <HouseWheel items={pillarItems} size={92} highlight={item.house} />
          {item.house && <div style={{ fontFamily: BOOK.sans, fontSize: '0.62rem', color: BOOK.muted, marginTop: '2px' }}>House {item.house}</div>}
        </div>
      </div>
      {content.fallback?.mirror && <Quote>"{content.fallback.mirror}"</Quote>}
      {content.library && (
        <>
          <Body style={{ color: BOOK.ink }}>{content.library.hurtOrHelp}</Body>
          {content.library.note && (
            <Body style={{ fontStyle: 'italic', color: BOOK.goldText, borderLeft: `2px solid ${BOOK.gold}`, paddingLeft: '12px' }}>
              {content.library.note}
            </Body>
          )}
          {content.library.steps.map((step) => (
            <Body key={step}>
              <strong style={{ color: '#4ADE80' }}>✅ Do This:</strong> {step}
            </Body>
          ))}
        </>
      )}
      {content.fallback && (
        <>
          <Body>{content.fallback.interpretation}</Body>
          {content.fallback.transmute && (
            <Body style={{ fontStyle: 'italic', color: BOOK.goldText }}>
              <strong>Higher octave:</strong> {content.fallback.transmute}
            </Body>
          )}
        </>
      )}
    </>
  );
}

// ── Your solution ────────────────────────────────────────────────────────────

export function CostPage({ ctx }: { ctx: ReportContext }) {
  const copy = getCostOfInactionCopy(ctx.goal, ctx.endYear);
  return (
    <>
      <Eyebrow>Your Solution</Eyebrow>
      <Title size="1.6rem">{COST_OF_INACTION_TITLE}</Title>
      <Body>{copy.intro}</Body>
      <Body style={{ color: '#F87171', fontWeight: 700 }}>{copy.yearLine}</Body>
      <Body>
        {copy.goodNews.before}
        <strong style={{ color: BOOK.ink }}>{copy.goodNews.years}</strong>
        {copy.goodNews.middle}
        <strong style={{ color: BOOK.ink }}>{copy.goodNews.fraction}</strong>
      </Body>
      {copy.noMore.map((line) => (
        <Body key={line} style={{ borderLeft: `2px solid ${BOOK.gold}`, paddingLeft: '12px', margin: '0 0 8px' }}>
          {line}
        </Body>
      ))}
      <Body style={{ fontWeight: 700, color: BOOK.goldText, marginTop: '14px', fontSize: '1.05rem' }}>{copy.closer}</Body>
    </>
  );
}

const RoadmapPillar = ({ item }: { item: (typeof ROADMAP_PILLARS)[number] }) => (
  <Body style={{ fontSize: '0.9rem' }}>
    <span style={{ color: '#38a169', fontWeight: 800, marginRight: '6px' }}>➜</span>
    For <strong style={{ color: BOOK.ink }}>{item.pillar}</strong>
    {item.text}
  </Body>
);

/** Roadmap, first page: the two steps and as many pillar methods as fit */
export function RoadmapStepsPage({ pillarCount }: { pillarCount: number }) {
  return (
    <>
      <Eyebrow>Your Solution</Eyebrow>
      <Title size="1.5rem">{ROADMAP_TITLE} 🏆</Title>
      {ROADMAP_STEPS.map((step) => (
        <Body key={step.bold} style={{ fontSize: '0.9rem' }}>
          {step.before}
          <strong style={{ color: BOOK.goldText }}>{step.bold}</strong>
          {step.after}
        </Body>
      ))}
      {ROADMAP_PILLARS.slice(0, pillarCount).map((item) => (
        <RoadmapPillar key={item.pillar} item={item} />
      ))}
    </>
  );
}

/** Roadmap, second page: the remaining pillar methods and the closing line */
export function RoadmapPillarsPage({ fromPillar }: { fromPillar: number }) {
  return (
    <>
      <Eyebrow>Your Solution · The Roadmap</Eyebrow>
      {ROADMAP_PILLARS.slice(fromPillar).map((item) => (
        <RoadmapPillar key={item.pillar} item={item} />
      ))}
      <p style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.2rem', lineHeight: 1.5, color: BOOK.ink, borderTop: `1px solid ${BOOK.line}`, paddingTop: '16px', marginTop: '8px' }}>
        {ROADMAP_CLOSER}
      </p>
    </>
  );
}

// ── Pillar Repair Kit ────────────────────────────────────────────────────────

export function RepairKitIntroPage() {
  return (
    <>
      <Eyebrow>Your Pillar Repair Kit</Eyebrow>
      <Title size="2.1rem">Your Pillar Repair Kit</Title>
      <Body>
        You don't have to repair each pillar alone. Below you'll find our state-of-the-art starter resources, designed to target
        each invisible force. <strong style={{ color: BOOK.ink }}>{PILLAR_RESOURCES.length} free resources</strong>, the full
        repair kit, at your fingertips. Start with the pillar that scored lowest.
      </Body>
      <Eyebrow>Inside your kit</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PILLAR_RESOURCE_CARDS.map((card) => (
          <div key={card.label} style={{ borderLeft: `3px solid ${PILLAR_ACCENT[card.pillar]}`, paddingLeft: '12px' }}>
            <div style={{ fontFamily: BOOK.sans, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PILLAR_ACCENT[card.pillar] }}>
              {card.label}
            </div>
            {card.resources.map((r) => (
              <div key={r.link} style={{ fontFamily: BOOK.serif, fontSize: '1.05rem', color: BOOK.ink, lineHeight: 1.4 }}>
                {r.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function RepairKitPage({ index }: { index: number }) {
  const card = PILLAR_RESOURCE_CARDS[index];
  return (
    <>
      <Eyebrow color={PILLAR_ACCENT[card.pillar]}>
        Your Pillar Repair Kit · Pillar {card.pillar} · {PILLAR_TITLES[card.pillar].title}
      </Eyebrow>
      <ResourceCardBox card={card} />
    </>
  );
}

// ── Next step ────────────────────────────────────────────────────────────────

export function CoachingPage() {
  return (
    <>
      <Eyebrow>Your Next Step</Eyebrow>
      <Title>{COACHING_CTA_TITLE}</Title>
      {COACHING_CTA_PARAGRAPHS.map((p) => (
        <Body key={p}>{p}</Body>
      ))}
      <img
        src="/hj-finals-2-of-20-1.jpg"
        alt="HeyJune Jeon - Pheydrus"
        style={{ display: 'block', width: '46%', maxWidth: '200px', margin: '4px auto 18px', borderRadius: '4px', border: '1px solid #E8E0C8' }}
      />
      <a
        href={COACHING_CALL_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '14px 18px',
          background: BOOK.gold,
          color: '#0C1128',
          fontFamily: BOOK.sans,
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          borderRadius: '2px',
        }}
      >
        Book Your 15-Minute Call →
      </a>
    </>
  );
}
