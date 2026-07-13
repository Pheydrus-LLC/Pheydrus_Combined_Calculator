import type { TimelineEvent } from '../../../data/barbault2026';
import {
  CARD_BORDER,
  ACCENT,
  ACCENT_BRIGHT,
  HEADING_TEXT,
  MUTED_TEXT,
  BODY_TEXT,
  PLAYFAIR,
  INTER,
} from '../../../styles/darkPheydrusTheme';

export function TimelineStrip({ events, compact }: { events: TimelineEvent[]; compact?: boolean }) {
  return (
    <div style={{ position: 'relative', paddingLeft: '28px' }}>
      <div
        style={{
          position: 'absolute',
          left: '7px',
          top: '6px',
          bottom: '6px',
          width: '2px',
          background: CARD_BORDER,
        }}
      />
      {events.map((event, i) => (
        <div key={i} style={{ position: 'relative', marginBottom: i === events.length - 1 ? 0 : compact ? '18px' : '24px' }}>
          <div
            style={{
              position: 'absolute',
              left: '-28px',
              top: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: event.highlight ? ACCENT : '#0A0F1C',
              border: `2px solid ${event.highlight ? ACCENT_BRIGHT : CARD_BORDER}`,
              boxShadow: event.highlight ? `0 0 12px ${ACCENT}` : 'none',
            }}
          />
          <p
            style={{
              fontFamily: PLAYFAIR,
              fontSize: compact ? '13px' : '15px',
              fontWeight: 700,
              color: event.highlight ? ACCENT_BRIGHT : ACCENT,
              margin: '0 0 2px',
              letterSpacing: '0.02em',
            }}
          >
            {event.year}
          </p>
          <p
            style={{
              fontFamily: PLAYFAIR,
              fontSize: compact ? '15px' : '18px',
              fontWeight: 700,
              color: HEADING_TEXT,
              margin: '0 0 4px',
            }}
          >
            {event.title}
          </p>
          <p
            style={{
              fontFamily: INTER,
              fontSize: compact ? '13px' : '14px',
              lineHeight: 1.6,
              color: event.highlight ? BODY_TEXT : MUTED_TEXT,
              margin: 0,
            }}
          >
            {event.description}
          </p>
        </div>
      ))}
    </div>
  );
}
