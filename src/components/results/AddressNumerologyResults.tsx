import type { AddressNumerologyResult, ZodiacMeaning } from '../../models';
import { ResultSection } from './ResultSection';

interface AddressNumerologyResultsProps {
  result: AddressNumerologyResult | null;
}

function ZodiacMeaningCard({ meaning, label }: { meaning: ZodiacMeaning; label: string }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-[#2d2a3e] mb-3">{meaning.name}</p>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium text-[#4a4560]">Themes:</span>{' '}
          <span className="text-[#6b6188]">{meaning.themes}</span>
        </p>
        <p>
          <span className="font-medium text-[#4a4560]">Challenges:</span>{' '}
          <span className="text-[#6b6188]">{meaning.challenges}</span>
        </p>
        <p>
          <span className="font-medium text-[#4a4560]">Gifts:</span>{' '}
          <span className="text-[#6b6188]">{meaning.gifts}</span>
        </p>
        <p className="italic text-gray-400 pt-1">{meaning.reflection}</p>
      </div>
    </div>
  );
}

export function AddressNumerologyResults({ result }: AddressNumerologyResultsProps) {
  if (!result) {
    return (
      <ResultSection title="Address Numerology" defaultOpen={true}>
        <p className="text-gray-400">No address numerology data available</p>
      </ResultSection>
    );
  }

  return (
    <ResultSection title="Address Numerology" defaultOpen={true}>
      <div className="space-y-6">
        {/* Numerology Levels */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-[#2d2a3e]">Address Numerology Levels</h3>
          {result.levels.map((level, idx) => (
            <div
              key={idx}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-[#4a4560]">
                    {level.level} <span className="text-xs text-gray-400">{level.name}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{level.value}</p>
                  <p className="text-2xl font-bold text-[#2d2a3e] mt-1">{level.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-[#9a7d4e]">{level.meaning}</p>
                </div>
              </div>
              <p className="text-sm text-[#4a4560] leading-relaxed mb-3">{level.description}</p>

              {/* Extended meanings */}
              {level.themes && (
                <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                  <p>
                    <span className="font-medium text-[#4a4560]">Themes:</span>{' '}
                    <span className="text-[#6b6188]">{level.themes}</span>
                  </p>
                  <p>
                    <span className="font-medium text-[#4a4560]">Challenges:</span>{' '}
                    <span className="text-[#6b6188]">{level.challenges}</span>
                  </p>
                  <p>
                    <span className="font-medium text-[#4a4560]">Gifts:</span>{' '}
                    <span className="text-[#6b6188]">{level.gifts}</span>
                  </p>
                  <p className="italic text-gray-400 pt-1">{level.reflection}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-[#e6dcc5] bg-[#fffaf2] space-y-3">
          <h3 className="text-base font-semibold text-[#2d2a3e]">What about L4?</h3>
          <p className="text-sm text-[#5e5138] leading-relaxed">
            If you feel like your repeating patterns have persisted for 5+ years in your city (or
            you don&apos;t feel at &quot;ease&quot; in general in that city) that means the issue is beyond the
            house or building. It may have to do with your <strong>compatibility with your city,
            state, or country.</strong>
          </p>
          <p className="text-sm text-[#5e5138] leading-relaxed">
            This is L4. This is where you go into <strong>Astrocartography</strong> territory
            (zipcode &amp; beyond).
          </p>
          <p className="text-sm text-[#5e5138] leading-relaxed">
            If you&apos;re in <strong>Artist&apos;s Way</strong> — refer to your Pheydrus Astrocartography
            calculator, and bring your results to your Pillar 3 expert.
          </p>
          <p className="text-sm text-[#5e5138] leading-relaxed">
            If you&apos;re in{' '}
            <a
              href="https://pheydrusmetaverse.com/alchemize-your-address/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              Alchemize Your Address
            </a>{' '}
            — you&apos;ve already optimized where you are. The next step is finding out if &quot;where
            you are&quot; was ever the right place for you to begin with. <strong>That&apos;s Quantum
            Chess.</strong>
          </p>
          <p className="text-sm text-[#5e5138] leading-relaxed">
            {'👉 '}
            <a
              href="https://pheydrusmetaverse.com/quantum-chess-methodology/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              Get Quantum Chess Now
            </a>{' '}
            — find the exact cities &amp; countries that will feel like &quot;home&quot; and tip things in
            your favor.
          </p>
        </div>

        {/* Zodiac Compatibility */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-base font-semibold text-[#2d2a3e] mb-3">
            Chinese Zodiac Compatibility
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                Home Zodiac
              </p>
              <p className="text-2xl font-bold text-orange-800 mt-2">{result.homeZodiac}</p>
            </div>

            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <p className="text-xs font-medium text-cyan-600 uppercase tracking-wide">
                Birth Zodiac
              </p>
              <p className="text-2xl font-bold text-cyan-800 mt-2">{result.birthZodiac}</p>
            </div>

            <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <p className="text-xs font-medium text-pink-600 uppercase tracking-wide">
                Compatibility
              </p>
              <p className="text-2xl font-bold text-pink-800 mt-2">{result.compatibility}</p>
            </div>
          </div>

          {/* Zodiac Meanings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.homeZodiacMeaning && (
              <ZodiacMeaningCard meaning={result.homeZodiacMeaning} label="Home Year Zodiac" />
            )}
            {result.birthZodiacMeaning && (
              <ZodiacMeaningCard meaning={result.birthZodiacMeaning} label="Birth Year Zodiac" />
            )}
          </div>
        </div>

        {/* Compatibility Guide */}
        <details className="cursor-pointer p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <summary className="font-medium text-[#2d2a3e] hover:text-[#9a7d4e]">
            Compatibility Guide
          </summary>
          <div className="mt-3 space-y-2 text-sm text-[#4a4560]">
            <p>
              <span className="font-medium">perfect match:</span> Excellent alignment between home
              and birth energies
            </p>
            <p>
              <span className="font-medium">good match:</span> Generally positive alignment
            </p>
            <p>
              <span className="font-medium">above average:</span> Supportive dynamics with minor
              adjustments
            </p>
            <p>
              <span className="font-medium">average:</span> Neither particularly supportive nor
              challenging
            </p>
            <p>
              <span className="font-medium">good match OR enemy:</span> Polarizing - can go either
              way
            </p>
            <p>
              <span className="font-medium">worst:</span> Challenging dynamics that require
              conscious work
            </p>
          </div>
        </details>
      </div>
    </ResultSection>
  );
}

export default AddressNumerologyResults;
