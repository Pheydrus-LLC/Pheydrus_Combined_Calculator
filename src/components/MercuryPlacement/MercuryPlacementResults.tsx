/**
 * Results display for the Mercury Placement Tool.
 * Visual language matches the "Activate Your Mercury" landing page: void background,
 * cyan/magenta/gold accents, Bree Serif headlines, Orbitron eyebrow mark.
 */

import type { MercuryPlacementResult } from '../../calculators/mercuryPlacementCalculator';

interface MercuryPlacementResultsProps {
  result: MercuryPlacementResult;
  onReset?: () => void;
}

const FONT_HEADLINE = { fontFamily: "'Bree Serif', Georgia, serif" };
const FONT_MONO = { fontFamily: "'Courier New', 'Lucida Console', monospace" };

function ordinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function MercuryPlacementResults({ result, onReset }: MercuryPlacementResultsProps) {
  const { sign, house, isRetrograde, aspects, openingLine, retrogradeLine } = result;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#4ad9ff]/20 bg-gradient-to-b from-[#0b0f1e] to-[#05060f] p-6 sm:p-9 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, #4ad9ff, #ff4fa3, #ffd166)' }}
        aria-hidden="true"
      />

      <div
        className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#ff4fa3]"
        style={FONT_MONO}
      >
        ✦ Your Mercury Placement
      </div>

      {/* Sign + House badges */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-[#4ad9ff]/30 bg-[#4ad9ff]/10 px-4 py-1.5 text-sm font-semibold text-[#4ad9ff]">
          Mercury in {sign}
        </div>
        <div className="rounded-full border border-[#ffd166]/30 bg-[#ffd166]/10 px-4 py-1.5 text-sm font-semibold text-[#ffd166]">
          {house}
          {ordinalSuffix(house)} House
        </div>
        {isRetrograde && (
          <div className="rounded-full border border-[#ff4fa3]/30 bg-[#ff4fa3]/10 px-4 py-1.5 text-sm font-semibold text-[#ff4fa3]">
            Retrograde
          </div>
        )}
      </div>

      <h2
        className="mb-4 text-2xl sm:text-3xl font-normal leading-tight text-[#eef1ff]"
        style={{ ...FONT_HEADLINE, textShadow: '0 0 30px rgba(74,217,255,0.25)' }}
      >
        Your Mercury is in {sign} in your {house}
        {ordinalSuffix(house)} house.
      </h2>

      <p className="mb-5 max-w-[62ch] text-[1.03rem] leading-[1.8] text-[#eef1ff]">
        {openingLine}
      </p>

      {retrogradeLine && (
        <p className="mb-5 max-w-[62ch] rounded-lg border border-[#ff4fa3]/20 bg-[#ff4fa3]/5 px-4 py-3 text-[0.98rem] italic leading-[1.7] text-[#eef1ff]/90">
          {retrogradeLine}
        </p>
      )}

      {aspects.length > 0 && (
        <div className="mt-7">
          <div
            className="mb-3 text-[0.68rem] uppercase tracking-[0.28em] text-[#4ad9ff]"
            style={FONT_MONO}
          >
            ✦ Aspects to Mercury
          </div>
          <div className="grid gap-3">
            {aspects.map((hit) => (
              <div
                key={`${hit.planet}-${hit.aspect}`}
                className={`rounded-lg border-l-[3px] p-4 ${
                  hit.nature === 'difficult'
                    ? 'border-l-[#ff4fa3] bg-[#ff4fa3]/[0.04]'
                    : 'border-l-[#4ad9ff] bg-[#4ad9ff]/[0.04]'
                } border border-[#4ad9ff]/10`}
              >
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                  <span className={hit.nature === 'difficult' ? 'text-[#ff4fa3]' : 'text-[#4ad9ff]'}>
                    {hit.aspect} · {hit.planet}
                  </span>
                  <span className="text-[#9aa4cc]">({hit.orb}° orb)</span>
                </div>
                <p className="text-sm leading-relaxed text-[#eef1ff]/90">{hit.line}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {onReset && (
        <div className="mt-9 border-t border-dashed border-[#4ad9ff]/20 pt-6 text-center">
          <button
            type="button"
            onClick={onReset}
            className="text-xs uppercase tracking-widest text-[#9aa4cc] underline decoration-dotted underline-offset-4 hover:text-[#4ad9ff]"
          >
            Run another chart
          </button>
        </div>
      )}
    </div>
  );
}
