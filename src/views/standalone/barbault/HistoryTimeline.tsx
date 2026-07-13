import { useState } from 'react';
import {
  BARBAULT_TRANSITS_2026,
  TIMELINE_INTRO_PARAGRAPHS,
  PATTERN_RECOGNITION_EVENTS,
  MASTER_TIMELINE,
  CIVILIZATION_ARC_PARAGRAPHS,
  TRANSIT_HISTORIES,
  WHAT_THIS_MEANS_PARAGRAPHS,
} from '../../../data/barbault2026';
import { TimelineStrip } from './TimelineStrip';
import {
  CARD_BG,
  CARD_BORDER,
  ACCENT,
  ACCENT_BRIGHT,
  HEADING_TEXT,
  MUTED_TEXT,
  BODY_TEXT,
  PLAYFAIR,
  INTER,
} from '../../../styles/darkPheydrusTheme';

const cardStyle = {
  background: CARD_BG,
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '24px',
};

const sectionHeading = {
  fontFamily: PLAYFAIR,
  fontSize: '24px',
  fontWeight: 700,
  color: HEADING_TEXT,
  marginBottom: '12px',
};

const bodyText = {
  fontFamily: INTER,
  fontSize: '15px',
  lineHeight: 1.7,
  color: BODY_TEXT,
  marginBottom: '14px',
};

export function HistoryTimeline({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const [expandedArc, setExpandedArc] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: MUTED_TEXT,
            fontFamily: INTER,
            fontSize: '13px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ← Back
        </button>
      </div>
      <h1
        style={{
          fontFamily: PLAYFAIR,
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 700,
          color: HEADING_TEXT,
          textAlign: 'center',
          marginBottom: '6px',
        }}
      >
        Barbault&apos;s Basket
      </h1>
      <p style={{ textAlign: 'center', color: MUTED_TEXT, fontSize: '15px', marginBottom: '32px', fontFamily: INTER }}>
        What are outer planets?
      </p>

      <section style={cardStyle}>
        {TIMELINE_INTRO_PARAGRAPHS.map((p, i) => (
          <p key={i} style={{ ...bodyText, marginBottom: i === TIMELINE_INTRO_PARAGRAPHS.length - 1 ? 0 : 14 }}>
            {p}
          </p>
        ))}
      </section>

      <section style={cardStyle}>
        <p style={{ ...sectionHeading, fontSize: '18px', marginBottom: '16px' }}>Patterns most people miss until after the fact</p>
        <TimelineStrip events={PATTERN_RECOGNITION_EVENTS} compact />
      </section>

      <section style={cardStyle}>
        <p style={sectionHeading}>The 130-Year Arc</p>
        <TimelineStrip events={MASTER_TIMELINE} />

        <button
          onClick={() => setExpandedArc((v) => !v)}
          style={{
            marginTop: '20px',
            background: 'transparent',
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: '999px',
            padding: '8px 16px',
            color: ACCENT_BRIGHT,
            fontFamily: INTER,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {expandedArc ? 'Hide the full story ↑' : 'Read the full story of how this era was built ↓'}
        </button>

        {expandedArc && (
          <div style={{ marginTop: '20px', borderTop: `1px solid ${CARD_BORDER}`, paddingTop: '20px' }}>
            {CIVILIZATION_ARC_PARAGRAPHS.map((p, i) => (
              <p key={i} style={bodyText}>
                {p}
              </p>
            ))}
          </div>
        )}
      </section>

      <p
        style={{
          fontFamily: PLAYFAIR,
          fontSize: '22px',
          fontWeight: 700,
          color: HEADING_TEXT,
          textAlign: 'center',
          margin: '40px 0 24px',
        }}
      >
        The 5 Transits Giving Color to This New Era
      </p>

      {BARBAULT_TRANSITS_2026.map((transit) => {
        const history = TRANSIT_HISTORIES[transit.id];
        return (
          <section key={transit.id} style={cardStyle}>
            <p style={{ ...sectionHeading, marginBottom: '4px' }}>{transit.title}</p>
            <p
              style={{
                fontFamily: INTER,
                fontSize: '14px',
                fontStyle: 'italic',
                color: ACCENT,
                marginBottom: '20px',
              }}
            >
              {history.subtitle}
            </p>
            <TimelineStrip events={history.timeline} compact />
          </section>
        );
      })}

      <section style={cardStyle}>
        <p style={sectionHeading}>What This Means for You</p>
        {WHAT_THIS_MEANS_PARAGRAPHS.map((p, i) => (
          <p key={i} style={{ ...bodyText, marginBottom: i === WHAT_THIS_MEANS_PARAGRAPHS.length - 1 ? 0 : 14 }}>
            {p}
          </p>
        ))}
      </section>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            flex: '0 0 auto',
            padding: '16px 20px',
            borderRadius: '12px',
            border: `1px solid ${CARD_BORDER}`,
            background: 'transparent',
            color: MUTED_TEXT,
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <button
          onClick={onContinue}
          style={{
            flex: '1 1 auto',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_BRIGHT})`,
            color: '#FFFFFF',
            fontFamily: PLAYFAIR,
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Select Your Rising Sign →
        </button>
      </div>
    </div>
  );
}
