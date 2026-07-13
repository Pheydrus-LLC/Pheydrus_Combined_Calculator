import {
  INTRO_LETTER_TITLE,
  INTRO_LETTER_PARAGRAPHS,
  INTRO_LETTER_LEARN_LIST,
  INTRO_LETTER_CLOSING_PARAGRAPHS,
} from '../../../data/barbault2026';
import { ACCENT, ACCENT_BRIGHT, PLAYFAIR } from '../../../styles/darkPheydrusTheme';

const PARCHMENT_BG = '#F3ECDA';
const PARCHMENT_TEXT = '#2B2620';
const PARCHMENT_MUTED = '#5A5142';
const PARCHMENT_RULE = 'rgba(43,38,32,0.18)';

export function IntroLetter({ onContinue }: { onContinue: () => void }) {
  return (
    <div>
      <div
        style={{
          background: PARCHMENT_BG,
          color: PARCHMENT_TEXT,
          borderRadius: '4px',
          padding: 'clamp(28px, 6vw, 56px)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.06)',
          transform: 'rotate(-0.3deg)',
          fontFamily: PLAYFAIR,
        }}
      >
        <p
          style={{
            fontSize: 'clamp(22px, 3.4vw, 30px)',
            fontStyle: 'italic',
            fontWeight: 700,
            lineHeight: 1.35,
            marginBottom: '22px',
          }}
        >
          {INTRO_LETTER_TITLE}
        </p>

        {INTRO_LETTER_PARAGRAPHS.map((p, i) => (
          <p key={i} style={{ fontSize: '17px', lineHeight: 1.75, marginBottom: '18px' }}>
            {p}
          </p>
        ))}

        <ol style={{ margin: '0 0 22px', paddingLeft: '22px' }}>
          {INTRO_LETTER_LEARN_LIST.map((item, i) => (
            <li key={i} style={{ fontSize: '16px', lineHeight: 1.7, marginBottom: '12px' }}>
              {item}
            </li>
          ))}
        </ol>

        <div style={{ borderTop: `1px solid ${PARCHMENT_RULE}`, margin: '26px 0', paddingTop: '2px' }} />

        {INTRO_LETTER_CLOSING_PARAGRAPHS.map((p, i) => (
          <p
            key={i}
            style={{
              fontSize: i === INTRO_LETTER_CLOSING_PARAGRAPHS.length - 1 ? '17px' : '18px',
              fontStyle: i === INTRO_LETTER_CLOSING_PARAGRAPHS.length - 1 ? 'italic' : 'normal',
              fontWeight: i === INTRO_LETTER_CLOSING_PARAGRAPHS.length - 1 ? 400 : 700,
              color: i === INTRO_LETTER_CLOSING_PARAGRAPHS.length - 1 ? PARCHMENT_MUTED : PARCHMENT_TEXT,
              lineHeight: 1.7,
              margin: 0,
              marginBottom: i === INTRO_LETTER_CLOSING_PARAGRAPHS.length - 1 ? 0 : '10px',
            }}
          >
            {p}
          </p>
        ))}

        <p style={{ fontSize: '15px', fontStyle: 'italic', color: PARCHMENT_MUTED, marginTop: '28px' }}>
          — Pheydrus
        </p>
      </div>

      <button
        onClick={onContinue}
        style={{
          width: '100%',
          marginTop: '24px',
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
        Continue to the Timeline →
      </button>
    </div>
  );
}
