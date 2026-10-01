/**
 * The page designs of the book: one component per kind of page. The page
 * list itself (which pages, in what order) is built in bookPages.tsx.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ReportContext } from '../../../services/diagnostic/reportContext';
import type { FindingContent } from '../../../services/diagnostic/findingContent';
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
import { BOOK } from './bookTheme';

// ── Building blocks ──────────────────────────────────────────────────────────

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontFamily: BOOK.sans,
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: BOOK.muted,
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

const IMPACT_CHIP = {
  hurts: { text: '⚡ Hurts Goal', bg: 'rgba(248,113,113,0.12)', color: '#F87171', border: 'rgba(248,113,113,0.4)' },
  caution: { text: '⚠️ Caution', bg: 'rgba(212,168,67,0.1)', color: '#E8A838', border: '#C9A84C' },
  helps: { text: '✓ Helps Goal', bg: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '#2ecc71' },
};

const PILLAR_ACCENT: Record<1 | 2 | 3, string> = { 1: '#E8C46A', 2: '#C0B0F0', 3: '#7ECFC4' };

// ── Pages ────────────────────────────────────────────────────────────────────

export function CoverPage({ ctx, name, date }: { ctx: ReportContext; name: string; date: string }) {
  const cover = getCoverCopy(ctx);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: '18px' }}>
      <Eyebrow>Pheydrus · Proprietary 3-Pillar Analysis</Eyebrow>
      <h1 style={{ fontFamily: BOOK.serif, fontSize: '2.5rem', fontWeight: 700, color: BOOK.goldText, lineHeight: 1.1, margin: 0 }}>
        The Invisible Forces Report
      </h1>
      <div style={{ fontFamily: BOOK.sans, fontSize: '0.9rem', color: BOOK.muted }}>
        Prepared for <strong style={{ color: BOOK.ink }}>{name || 'you'}</strong> · {date}
      </div>
      <GradeCircle grade={ctx.finalGrade} />
      <div style={{ fontFamily: BOOK.sans, fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: BOOK.muted }}>
        Alignment Score
      </div>
      <p style={{ fontFamily: BOOK.serif, fontSize: '1.2rem', lineHeight: 1.45, color: BOOK.ink, margin: 0 }}>
        {cover.headline} <em style={{ color: BOOK.goldText }}>{cover.emphasis}</em>
      </p>
    </div>
  );
}

export function ScorePage({ ctx }: { ctx: ReportContext }) {
  const cover = getCoverCopy(ctx);
  return (
    <>
      <Eyebrow>Your score breaks down as</Eyebrow>
      <Title>Your Alignment Score</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 20px' }}>
        {([1, 2, 3] as const).map((n) => {
          const grade = getPillarLetterGrade(ctx.pillars[n - 1]);
          const g = BOOK.grade(grade);
          return (
            <div
              key={n}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: `1px solid ${BOOK.line}`, borderRadius: '4px' }}
            >
              <span style={{ fontFamily: BOOK.sans, fontSize: '0.9rem', color: BOOK.ink, fontWeight: 600 }}>
                Pillar {n} · {PILLAR_TITLES[n].title}
              </span>
              <Chip color={g.text} bg={g.bg} border={g.border}>{grade}</Chip>
            </div>
          );
        })}
      </div>
      <Body>{cover.description}</Body>
      <Body>{cover.secondLine}</Body>
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
    </>
  );
}

export function ForcesPage() {
  return (
    <>
      <Eyebrow>The Pattern</Eyebrow>
      <Title>The Three Invisible Forces</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {LEGEND_CARDS.map((c) => (
          <div key={c.label} style={{ border: `1px solid ${BOOK.line}`, borderRadius: '4px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
              <span style={{ fontFamily: BOOK.sans, fontSize: '0.66rem', letterSpacing: '0.1em', color: BOOK.muted }}>{c.label}</span>
            </div>
            <p style={{ margin: '0 0 6px', fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.5, color: BOOK.goldText }}>
              {c.question}
            </p>
            <p style={{ margin: 0, fontFamily: BOOK.sans, fontSize: '0.84rem', lineHeight: 1.6, color: BOOK.text }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function WindowPage({ ctx }: { ctx: ReportContext }) {
  return (
    <>
      <Eyebrow>⚠ Active Pattern Window</Eyebrow>
      <Title>The Window You're In</Title>
      <Body>
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
        , defining the exact window you are in right now. Knowing the window is half the advantage.
      </Body>
      <div style={{ marginTop: '28px', textAlign: 'center' }}>
        <Eyebrow>As Seen On</Eyebrow>
        <a href={PRESS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
          <img src={PRESS_LOGOS_LIGHT} alt={PRESS_LOGOS_ALT} style={{ display: 'block', width: '100%', height: 'auto', opacity: 0.85 }} />
        </a>
      </div>
    </>
  );
}

export function PillarOpenerPage({ ctx, n }: { ctx: ReportContext; n: 1 | 2 | 3 }) {
  const pillar = ctx.pillars[n - 1];
  const grade = getPillarLetterGrade(pillar);
  const note = PILLAR_VOICE_NOTES[n];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Chip color={PILLAR_ACCENT[n]} bg="rgba(255,255,255,0.04)" border={PILLAR_ACCENT[n]}>PILLAR {n}</Chip>
        <span style={{ fontFamily: BOOK.sans, fontSize: '1.4rem', fontWeight: 900, color: BOOK.grade(grade).text }}>{grade}</span>
      </div>
      <Title size="2.1rem">{PILLAR_TITLES[n].title}</Title>
      <div style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.15rem', color: PILLAR_ACCENT[n], margin: '-8px 0 18px' }}>
        {PILLAR_TITLES[n].subtitle}
      </div>
      {note && <VoiceNotePlayer src={note.src} label={note.label} variant={n - 1} />}
      <Body style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.05rem', color: BOOK.goldText }}>
        {PILLAR_CALLOUT[n](ctx.goalShort, ctx.location)}
      </Body>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }} dangerouslySetInnerHTML={{ __html: renderHouseWheel(pillar.items, 150) }} />
    </>
  );
}

export function FindingPage({ content, n, position, total }: { content: FindingContent; n: 1 | 2 | 3; position: number; total: number }) {
  const g = BOOK.grade(content.grade);
  const impact = content.impact ? IMPACT_CHIP[content.impact] : null;
  return (
    <>
      <Eyebrow>
        Pillar {n} · {PILLAR_TITLES[n].title} · {position} of {total}
      </Eyebrow>
      {content.fallback?.mirror && <Quote>"{content.fallback.mirror}"</Quote>}
      <h3 style={{ fontFamily: BOOK.sans, fontSize: '1.1rem', fontWeight: 700, color: BOOK.ink, margin: '0 0 10px', lineHeight: 1.35 }}>
        {content.label}
      </h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <Chip color={g.text} bg={g.bg} border={g.border}>
          {content.grade}
          {content.endYear ? ` · thru ${content.endYear}` : ''}
        </Chip>
        {impact && <Chip color={impact.color} bg={impact.bg} border={impact.border}>{impact.text}</Chip>}
      </div>
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

export function RoadmapStepsPage() {
  return (
    <>
      <Eyebrow>Your Solution</Eyebrow>
      <Title size="1.6rem">{ROADMAP_TITLE} 🏆</Title>
      {ROADMAP_STEPS.map((step) => (
        <Body key={step.bold}>
          {step.before}
          <strong style={{ color: BOOK.goldText }}>{step.bold}</strong>
          {step.after}
        </Body>
      ))}
    </>
  );
}

export function RoadmapPillarsPage() {
  return (
    <>
      <Eyebrow>Your Solution · The Roadmap</Eyebrow>
      {ROADMAP_PILLARS.map((item) => (
        <Body key={item.pillar}>
          <span style={{ color: '#38a169', fontWeight: 800, marginRight: '6px' }}>➜</span>
          For <strong style={{ color: BOOK.ink }}>{item.pillar}</strong>
          {item.text}
        </Body>
      ))}
      <p style={{ fontFamily: BOOK.serif, fontStyle: 'italic', fontSize: '1.15rem', lineHeight: 1.5, color: BOOK.ink, borderTop: `1px solid ${BOOK.line}`, paddingTop: '14px' }}>
        {ROADMAP_CLOSER}
      </p>
    </>
  );
}

export function RepairKitPage({ index }: { index: number }) {
  return (
    <>
      <Eyebrow>Your Pillar Repair Kit{index > 0 ? ` · ${index + 1} of ${PILLAR_RESOURCE_CARDS.length}` : ''}</Eyebrow>
      {index === 0 && (
        <>
          <Title>Your Pillar Repair Kit</Title>
          <Body>
            You don't have to repair each pillar alone. Below you'll find our state-of-the-art starter resources, designed to
            target each invisible force. <strong style={{ color: BOOK.ink }}>{PILLAR_RESOURCES.length} free resources</strong>,
            the full repair kit, at your fingertips. Start with the pillar that scored lowest.
          </Body>
        </>
      )}
      <ResourceCardBox card={PILLAR_RESOURCE_CARDS[index]} />
    </>
  );
}

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
        style={{ display: 'block', width: '62%', maxWidth: '260px', margin: '6px auto 20px', borderRadius: '4px', border: '1px solid #E8E0C8' }}
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

export function BackCoverPage({ onOpenReport }: { onOpenReport?: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '18px' }}>
      <span style={{ color: BOOK.gold, fontSize: '1.4rem' }}>✦</span>
      <p style={{ fontFamily: BOOK.serif, fontSize: '1.7rem', lineHeight: 1.3, color: BOOK.ink, margin: 0 }}>
        The pattern ends when you say it does.
      </p>
      <Eyebrow>Pheydrus</Eyebrow>
      {onOpenReport && (
        <button
          type="button"
          onClick={onOpenReport}
          style={{
            background: 'transparent',
            border: `1px solid ${BOOK.gold}`,
            color: BOOK.goldText,
            fontFamily: BOOK.sans,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '11px 18px',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          Open the full report
        </button>
      )}
    </div>
  );
}
