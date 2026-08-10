/**
 * Standalone Mercury Placement Tool at /mercury.
 * Visual language matches the "Activate Your Mercury" landing page (void background,
 * cyan/magenta/gold accents, Bree Serif headlines). Lead-gated, then computes
 * Mercury's sign/house/retrograde/aspects via calculateMercuryPlacement.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateMercuryPlacement } from '../../calculators/mercuryPlacementCalculator';
import type { MercuryPlacementResult } from '../../calculators/mercuryPlacementCalculator';
import { MercuryPlacementResults, LeadGateModal } from '../../components/MercuryPlacement';
import { CityAutocomplete } from '../../components/form/CityAutocomplete';
import type { CityData } from '../../models/form';

const LEAD_STORAGE_KEY = 'mercuryPlacementLeadV1';

const FONT_HEADLINE = { fontFamily: "'Bree Serif', Georgia, serif" };
const FONT_MONO = { fontFamily: "'Courier New', 'Lucida Console', monospace" };

const inputClass =
  'w-full rounded-xl border border-[#4ad9ff]/25 bg-[#0b0f1e] px-4 py-3 text-[#eef1ff] placeholder-[#6b7394] transition-colors focus:border-[#4ad9ff] focus:outline-none focus:ring-2 focus:ring-[#4ad9ff]/20';
const labelClass = 'mb-2 block text-sm font-semibold text-[#9aa4cc]';

export function MercuryPlacementPage() {
  const [isLeadGateUnlocked, setIsLeadGateUnlocked] = useState(false);
  const [isGateChecked, setIsGateChecked] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [birthCity, setBirthCity] = useState<CityData | null>(null);

  const [result, setResult] = useState<MercuryPlacementResult | null>(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LEAD_STORAGE_KEY);
    if (stored) setIsLeadGateUnlocked(true);
    setIsGateChecked(true);
  }, []);

  const handleLeadGateUnlock = (name: string, email: string) => {
    localStorage.setItem(
      LEAD_STORAGE_KEY,
      JSON.stringify({ name, email, unlockedAt: new Date().toISOString() })
    );
    setIsLeadGateUnlocked(true);
  };

  const handleCalculate = async () => {
    if (!dateOfBirth || !timeOfBirth || !birthCity) return;

    setError('');
    setIsCalculating(true);
    setResult(null);

    try {
      const [year, month, day] = dateOfBirth.split('-').map(Number);
      const [hour, minute] = timeOfBirth.split(':').map(Number);

      const res = await calculateMercuryPlacement({
        year,
        month,
        day,
        hour,
        minute,
        latitude: birthCity.latitude,
        longitude: birthCity.longitude,
        timeZone: birthCity.timeZone,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  const isReady = Boolean(dateOfBirth && timeOfBirth && birthCity);

  if (!isGateChecked) {
    return <div className="min-h-screen bg-[#05060f]" />;
  }

  if (!isLeadGateUnlocked) {
    return <LeadGateModal onUnlock={handleLeadGateUnlock} />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05060f] text-[#eef1ff]">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 18%, rgba(74,217,255,0.22) 0%, rgba(255,79,163,0.13) 25%, rgba(120,20,90,0.08) 48%, rgba(20,10,30,0.03) 70%, transparent 85%)',
        }}
        aria-hidden="true"
      />

      <header className="relative z-10 border-b border-[#4ad9ff]/15 py-6 text-center">
        <Link
          to="/"
          className="text-sm font-bold uppercase tracking-[0.2em] text-[#9aa4cc] no-underline hover:text-[#4ad9ff]"
        >
          Pheydrus
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <p
            className="mb-3 text-[0.72rem] uppercase tracking-[0.25em] text-[#ffd166]"
            style={FONT_MONO}
          >
            ✦ Mercury Placement Tool
          </p>
          <h1
            className="mx-auto max-w-[24ch] text-3xl sm:text-4xl font-normal leading-[1.15]"
            style={{
              ...FONT_HEADLINE,
              background:
                'linear-gradient(175deg, #ffffff 0%, #d9f5ff 20%, #7fe0ff 42%, #4ad9ff 60%, #ff4fa3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 22px rgba(74,217,255,0.35))',
            }}
          >
            Decode the Voice You Were Born to Use
          </h1>
          <p className="mx-auto mt-4 max-w-[50ch] text-[#9aa4cc]">
            Enter your birth details to reveal your Mercury sign, house, and every aspect
            shaping how you communicate.
          </p>
        </div>

        {!result && (
          <div className="rounded-2xl border border-[#4ad9ff]/20 bg-gradient-to-b from-[#0b0f1e] to-[#05060f] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Time of Birth (24h)</label>
                <input
                  type="time"
                  value={timeOfBirth}
                  onChange={(e) => setTimeOfBirth(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={labelClass}>Place of Birth</label>
              {/* CityAutocomplete renders a light-themed input by design (shared across every
                  calculator) — inset it in a light card here rather than fighting its styling. */}
              <div className="rounded-xl bg-[#eef1ff] p-3 shadow-[0_0_18px_rgba(74,217,255,0.12)]">
                <CityAutocomplete
                  value={birthCity}
                  onChange={setBirthCity}
                  label=""
                  placeholder="Search for your birth city..."
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!isReady || isCalculating}
              className="mt-6 w-full rounded-lg px-6 py-3 font-normal uppercase tracking-[0.1em] text-[#05060f] transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                ...FONT_HEADLINE,
                background: '#ffd166',
                boxShadow: '0 0 22px rgba(255,209,102,0.35)',
              }}
            >
              {isCalculating ? 'Reading the Chart...' : 'Reveal My Mercury'}
            </button>

            {error && <p className="mt-4 text-sm text-[#ff4fa3]">{error}</p>}
          </div>
        )}

        {result && <MercuryPlacementResults result={result} onReset={handleReset} />}
      </main>

      <footer className="relative z-10 py-8 text-center text-xs uppercase tracking-widest text-[#9aa4cc]/60">
        &copy; Pheydrus Metaverse. All rights reserved.
      </footer>
    </div>
  );
}
