import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ZODIAC_SIGNS } from '../../utils/data/constants';
import {
  BARBAULT_TRANSITS_2026,
  BARBAULT_CONTENT_2026,
  getHouseForSign,
  renderTransitHouseWheel,
  type TransitId,
  type RisingSign,
} from '../../data/barbault2026';
import { exportBarbaultWorksheetToPDF } from '../../services/pdfExport';
import { IntroLetter } from './barbault/IntroLetter';
import { HistoryTimeline } from './barbault/HistoryTimeline';
import {
  DARK_BG,
  CARD_BG,
  CARD_BORDER,
  ACCENT,
  ACCENT_BRIGHT,
  HEADING_TEXT,
  MUTED_TEXT,
  BODY_TEXT,
  PLAYFAIR,
  INTER,
} from '../../styles/darkPheydrusTheme';

const HEADER_IMAGE = '/images/once-in-a-century-header.jpg';

type Step = 'intro' | 'timeline' | 'calculator';

const STEP_ORDER: Step[] = ['intro', 'timeline', 'calculator'];
const STEP_LABELS: Record<Step, string> = {
  intro: 'Menu',
  timeline: 'Timeline',
  calculator: 'Your Report',
};

function StepNav({ step, onSelect }: { step: Step; onSelect: (s: Step) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '0 16px 16px' }}>
      {STEP_ORDER.map((s) => {
        const isActive = s === step;
        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: `1px solid ${isActive ? ACCENT : CARD_BORDER}`,
              background: isActive ? 'rgba(47,111,237,0.15)' : 'transparent',
              color: isActive ? ACCENT_BRIGHT : MUTED_TEXT,
              fontFamily: INTER,
              fontWeight: isActive ? 700 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {STEP_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
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
      {label}
    </button>
  );
}

export interface TransitAnswers {
  q1: string;
  q2: string;
  commitment: string;
}

const RISING_SIGNS = ZODIAC_SIGNS as readonly RisingSign[];

function emptyAnswers(): Record<TransitId, TransitAnswers> {
  return Object.fromEntries(
    BARBAULT_TRANSITS_2026.map((t) => [t.id, { q1: '', q2: '', commitment: '' }])
  ) as Record<TransitId, TransitAnswers>;
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: `1px solid ${CARD_BORDER}`,
  background: 'rgba(255,255,255,0.03)',
  color: BODY_TEXT,
  fontFamily: INTER,
  fontSize: '14px',
  outline: 'none',
};

export function BarbaultWorksheetPage() {
  const [step, setStep] = useState<Step>('intro');
  const [risingSign, setRisingSign] = useState<RisingSign>('Aries');
  const [activeTransitId, setActiveTransitId] = useState<TransitId>(BARBAULT_TRANSITS_2026[0].id);
  const [answers, setAnswers] = useState<Record<TransitId, TransitAnswers>>(emptyAnswers);
  const [isExporting, setIsExporting] = useState(false);

  const activeTransit = BARBAULT_TRANSITS_2026.find((t) => t.id === activeTransitId)!;
  const activeContent = BARBAULT_CONTENT_2026[activeTransitId][risingSign];
  const activeAnswers = answers[activeTransitId];
  const activations = activeTransit.placements.map((p) => ({
    house: getHouseForSign(p.sign, risingSign),
    planet: p.planet,
  }));
  const houseWheelSvg = renderTransitHouseWheel(activations, 150);

  const updateAnswer = (field: keyof TransitAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [activeTransitId]: { ...prev[activeTransitId], [field]: value } }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportBarbaultWorksheetToPDF(risingSign, answers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: DARK_BG, color: BODY_TEXT, fontFamily: INTER }}>
      <header style={{ textAlign: 'center', padding: '32px 16px 8px' }}>
        <Link
          to="/"
          style={{
            fontFamily: PLAYFAIR,
            fontSize: '14px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: ACCENT_BRIGHT,
            textDecoration: 'none',
          }}
        >
          Pheydrus
        </Link>
      </header>

      <StepNav step={step} onSelect={setStep} />

      {step === 'intro' && (
        <div
          style={{
            position: 'relative',
            maxWidth: '860px',
            margin: '16px auto 0',
            padding: '0 20px',
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: '18px',
              overflow: 'hidden',
              border: `1px solid ${CARD_BORDER}`,
            }}
          >
            <img
              src={HEADER_IMAGE}
              alt="Outer Planets 2.0"
              style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '360px', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, rgba(3,6,13,0) 55%, ${DARK_BG} 100%)`,
              }}
            />
          </div>
        </div>
      )}

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '16px 20px 80px' }}>
        {step === 'intro' && <IntroLetter onContinue={() => setStep('timeline')} />}

        {step === 'timeline' && (
          <HistoryTimeline onContinue={() => setStep('calculator')} onBack={() => setStep('intro')} />
        )}

        {step === 'calculator' && (
          <>
        <div style={{ marginBottom: '16px' }}>
          <BackButton label="← Back to the Timeline" onClick={() => setStep('timeline')} />
        </div>
        <h1
          style={{
            fontFamily: PLAYFAIR,
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 700,
            color: HEADING_TEXT,
            textAlign: 'center',
            marginBottom: '8px',
            lineHeight: 1.15,
          }}
        >
          Once-In-A-Century Wealth &amp; Identity Upgrade
        </h1>
        <p style={{ textAlign: 'center', color: MUTED_TEXT, fontSize: '15px', marginBottom: '32px' }}>
          Your personal worksheet for the five defining planetary alignments of 2026 — tailored to your rising sign.
        </p>

        <div style={{ marginBottom: '28px' }}>
          <label
            style={{
              display: 'block',
              fontFamily: PLAYFAIR,
              fontSize: '13px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: ACCENT,
              marginBottom: '8px',
            }}
          >
            Your Rising Sign
          </label>
          <select
            value={risingSign}
            onChange={(e) => setRisingSign(e.target.value as RisingSign)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {RISING_SIGNS.map((sign) => (
              <option key={sign} value={sign} style={{ background: CARD_BG }}>
                {sign} Rising
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '28px',
            borderBottom: `1px solid ${CARD_BORDER}`,
            paddingBottom: '16px',
          }}
        >
          {BARBAULT_TRANSITS_2026.map((t) => {
            const isActive = t.id === activeTransitId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTransitId(t.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '999px',
                  border: `1px solid ${isActive ? ACCENT : CARD_BORDER}`,
                  background: isActive ? 'rgba(47,111,237,0.15)' : 'transparent',
                  color: isActive ? ACCENT_BRIGHT : MUTED_TEXT,
                  fontFamily: INTER,
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.tabLabel}
              </button>
            );
          })}
        </div>

        <section
          style={{
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontFamily: PLAYFAIR,
              fontSize: '24px',
              fontWeight: 700,
              color: HEADING_TEXT,
              marginBottom: '4px',
            }}
          >
            {activeTransit.title}
          </h2>
          <p style={{ color: ACCENT, fontSize: '13px', marginBottom: '4px' }}>{activeTransit.aspectSummary}</p>
          <p style={{ color: MUTED_TEXT, fontSize: '13px', marginBottom: '24px' }}>
            {activeTransit.placements
              .map((p) => `${p.planet} in ${p.sign} → your house ${getHouseForSign(p.sign, risingSign)}`)
              .join('  •  ')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ flex: '0 0 auto' }}>
              <SvgChart svg={houseWheelSvg} />
            </div>
            <div style={{ flex: '1 1 260px', minWidth: '260px' }}>
              <ContentBlock heading="The Shift + Your Houses 🌌" text={activeContent.shiftAndHouses} />
              <ContentBlock heading="Identity Shift 🪞" text={activeContent.identityShift} />
              <ContentBlock heading="Wealth Channel 💰" text={activeContent.wealthChannel} />
              <ContentBlock heading="Bottomline 🔥" text={activeContent.transformation} last />
            </div>
          </div>
        </section>

        <section
          style={{
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '24px',
          }}
        >
          <h3
            style={{
              fontFamily: PLAYFAIR,
              fontSize: '24px',
              fontWeight: 700,
              color: HEADING_TEXT,
              marginBottom: '16px',
            }}
          >
            Reflection ✏️
          </h3>

          <FieldLabel>{activeTransit.reflectionQuestions[0]}</FieldLabel>
          <textarea
            value={activeAnswers.q1}
            onChange={(e) => updateAnswer('q1', e.target.value)}
            rows={3}
            style={{ ...inputStyle, marginBottom: '18px', resize: 'vertical' }}
          />

          <FieldLabel>{activeTransit.reflectionQuestions[1]}</FieldLabel>
          <textarea
            value={activeAnswers.q2}
            onChange={(e) => updateAnswer('q2', e.target.value)}
            rows={3}
            style={{ ...inputStyle, marginBottom: '18px', resize: 'vertical' }}
          />

          <FieldLabel>{activeTransit.actionPrompt}</FieldLabel>
          <textarea
            value={activeAnswers.commitment}
            onChange={(e) => updateAnswer('commitment', e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </section>

        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_BRIGHT})`,
            color: '#FFFFFF',
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: '15px',
            cursor: isExporting ? 'default' : 'pointer',
            opacity: isExporting ? 0.6 : 1,
          }}
        >
          {isExporting ? 'Generating PDF…' : 'Save as PDF'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <BackButton label="← Back to the Timeline" onClick={() => setStep('timeline')} />
        </div>
          </>
        )}
      </main>
    </div>
  );
}

function SvgChart({ svg }: { svg: string }) {
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

function ContentBlock({ heading, text, last }: { heading: string; text: string; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : '20px' }}>
      <p
        style={{
          fontFamily: PLAYFAIR,
          fontSize: '13px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: ACCENT,
          marginBottom: '6px',
        }}
      >
        {heading}
      </p>
      <p style={{ fontSize: '15px', lineHeight: 1.6, color: BODY_TEXT, margin: 0 }}>{text}</p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '14px', color: BODY_TEXT, marginBottom: '8px' }}>{children}</p>;
}
