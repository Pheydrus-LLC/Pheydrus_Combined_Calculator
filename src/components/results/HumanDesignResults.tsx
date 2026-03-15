/**
 * Human Design Results component for the Business Energy Blueprint calculator.
 * Renders type, authority, profile, centers, channels, and gate positions
 * with business-oriented interpretations.
 */

import type { HumanDesignResult } from '../../models/calculators';
import {
  TYPE_INFO,
  AUTHORITY_INFO,
  PROFILE_INFO,
  CENTER_INFO,
  type HumanDesignType,
  type HumanDesignAuthority,
  type CenterName,
} from '../../utils/humanDesign/constants';

interface Props {
  result: HumanDesignResult;
}

// ── Shared style tokens ────────────────────────────────────────────────────────
const SECTION =
  'mb-8 p-6 bg-[#faf8f5] rounded-2xl border border-[#e8e0d0]';
const SECTION_TITLE =
  'text-lg font-bold text-[#2d2a3e] mb-4 flex items-center gap-2';
const LABEL = 'text-xs font-semibold text-[#9a7d4e] uppercase tracking-wider mb-1';
const VALUE = 'text-base font-semibold text-[#2d2a3e]';
const BODY = 'text-sm text-[#5a5270] leading-relaxed';

// ── Type badge colours ─────────────────────────────────────────────────────────
const TYPE_BADGE: Record<string, string> = {
  Generator:             'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Manifesting Generator': 'bg-teal-100 text-teal-800 border-teal-200',
  Manifestor:            'bg-violet-100 text-violet-800 border-violet-200',
  Projector:             'bg-sky-100 text-sky-800 border-sky-200',
  Reflector:             'bg-amber-100 text-amber-800 border-amber-200',
};

// ── Center badge colours ───────────────────────────────────────────────────────
const DEFINED_CENTER_COLOR: Record<CenterName, string> = {
  Head:           'bg-indigo-100 text-indigo-800',
  Ajna:           'bg-purple-100 text-purple-800',
  Throat:         'bg-sky-100 text-sky-800',
  'G-Center':     'bg-rose-100 text-rose-800',
  Ego:            'bg-orange-100 text-orange-800',
  Sacral:         'bg-red-100 text-red-800',
  'Solar Plexus': 'bg-yellow-100 text-yellow-800',
  Spleen:         'bg-lime-100 text-lime-800',
  Root:           'bg-stone-200 text-stone-800',
};

const PLANET_LABELS: Record<string, string> = {
  Sun:        '☀ Sun',
  Moon:       '☽ Moon',
  Mercury:    '☿ Mercury',
  Venus:      '♀ Venus',
  Mars:       '♂ Mars',
  Jupiter:    '♃ Jupiter',
  Saturn:     '♄ Saturn',
  Uranus:     '⛢ Uranus',
  Neptune:    '♆ Neptune',
  Pluto:      '♇ Pluto',
  'True Node':'☊ North Node',
  'S.Node':   '☋ South Node',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
}

function GateRow({ planet, gate, line, side }: {
  planet: string;
  gate: number;
  line: number;
  side: 'personality' | 'design';
}) {
  const color = side === 'personality'
    ? 'bg-[#1a1a2e] text-white'
    : 'bg-[#8b1a1a] text-white';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#f0ebe0] last:border-0">
      <span className="text-sm text-[#4a4560]">{PLANET_LABELS[planet] ?? planet}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${color}`}>
          Gate {gate}.{line}
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function HumanDesignResults({ result }: Props) {
  const {
    type,
    strategy,
    authority,
    profile,
    definedCenters,
    undefinedCenters,
    activeChannels,
    personalityGates,
    designGates,
    designDate,
  } = result;

  const typeInfo = TYPE_INFO[type as HumanDesignType];
  const authorityInfo = AUTHORITY_INFO[authority as HumanDesignAuthority];
  const profileInfo = PROFILE_INFO[profile];

  return (
    <div className="space-y-6 mt-6">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-[#2d2a3e] to-[#4a4560] rounded-2xl p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9b99a] mb-2">
          Your Human Design Chart
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h2 className="text-3xl font-bold">{type}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${TYPE_BADGE[type] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}>
            {type}
          </span>
        </div>
        <p className="text-[#c9b99a] text-sm mb-1">
          <span className="font-semibold text-white">Profile:</span> {profile}
          {profileInfo ? ` — ${profileInfo.name}` : ''}
        </p>
        <p className="text-[#c9b99a] text-sm">
          <span className="font-semibold text-white">Authority:</span> {authority}
        </p>
        <p className="text-[#a09080] text-xs mt-3">
          Design date (unconscious imprint): {designDate}
        </p>
      </div>

      {/* ── Energy Type ── */}
      {typeInfo && (
        <div className={SECTION}>
          <h3 className={SECTION_TITLE}>⚡ Energy Type</h3>
          <div className="space-y-3">
            <div>
              <p className={LABEL}>Type</p>
              <p className={VALUE}>{type}</p>
            </div>
            <div>
              <p className={LABEL}>Strategy</p>
              <p className={VALUE}>{strategy}</p>
            </div>
            <div>
              <p className={LABEL}>Not-Self Theme (resistance signal)</p>
              <p className={VALUE}>{typeInfo.notSelf}</p>
            </div>
            <div>
              <p className={LABEL}>Role</p>
              <p className={BODY}>{typeInfo.businessRole}</p>
            </div>
            <div className="bg-[#9a7d4e]/10 border border-[#9a7d4e]/20 rounded-xl p-4">
              <p className={LABEL}>Tip</p>
              <p className={BODY}>{typeInfo.businessTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Decision Authority ── */}
      {authorityInfo && (
        <div className={SECTION}>
          <h3 className={SECTION_TITLE}>🧭 Decision Authority</h3>
          <div className="space-y-3">
            <div>
              <p className={LABEL}>Authority</p>
              <p className={VALUE}>{authority}</p>
            </div>
            <div>
              <p className={LABEL}>How it works</p>
              <p className={BODY}>{authorityInfo.description}</p>
            </div>
            <div className="bg-[#9a7d4e]/10 border border-[#9a7d4e]/20 rounded-xl p-4">
              <p className={LABEL}>Decision Making</p>
              <p className={BODY}>{authorityInfo.businessDecision}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile ── */}
      {profileInfo && (
        <div className={SECTION}>
          <h3 className={SECTION_TITLE}>🎭 Profile</h3>
          <div className="space-y-3">
            <div>
              <p className={LABEL}>Profile</p>
              <p className={VALUE}>{profile} — {profileInfo.name}</p>
            </div>
            <div>
              <p className={LABEL}>Archetype</p>
              <p className={VALUE}>{profileInfo.businessArchetype}</p>
            </div>
            <div className="bg-[#9a7d4e]/10 border border-[#9a7d4e]/20 rounded-xl p-4">
              <p className={LABEL}>Tip</p>
              <p className={BODY}>{profileInfo.businessTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Defined Centers ── */}
      {definedCenters.length > 0 && (
        <div className={SECTION}>
          <h3 className={SECTION_TITLE}>
            🔴 Defined Centers
            <span className="text-sm font-normal text-[#6b6188]">
              — your consistent, reliable energies
            </span>
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {definedCenters.map((c) => (
              <Pill
                key={c}
                label={c}
                color={DEFINED_CENTER_COLOR[c as CenterName] ?? 'bg-gray-100 text-gray-800'}
              />
            ))}
          </div>
          <div className="space-y-3">
            {definedCenters.map((c) => {
              const info = CENTER_INFO[c as CenterName];
              if (!info) return null;
              return (
                <div key={c} className="bg-white rounded-xl border border-[#e8e0d0] p-4">
                  <p className={`${LABEL} mb-1`}>{c}</p>
                  <p className={BODY}>{info.defined}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Undefined Centers ── */}
      {undefinedCenters.length > 0 && (
        <div className={SECTION}>
          <h3 className={SECTION_TITLE}>
            ⚪ Undefined Centers
            <span className="text-sm font-normal text-[#6b6188]">
              — open, conditionable areas
            </span>
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {undefinedCenters.map((c) => (
              <span
                key={c}
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-500 border-gray-200"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="space-y-3">
            {undefinedCenters.map((c) => {
              const info = CENTER_INFO[c as CenterName];
              if (!info) return null;
              return (
                <div key={c} className="bg-white rounded-xl border border-[#e8e0d0] p-4 opacity-80">
                  <p className={`${LABEL} mb-1`}>{c}</p>
                  <p className={BODY}>{info.undefined}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Active Channels ── */}
      {activeChannels.length > 0 && (
        <div className={SECTION}>
          <h3 className={SECTION_TITLE}>
            🔗 Active Channels ({activeChannels.length})
            <span className="text-sm font-normal text-[#6b6188]">
              — fully defined circuitry
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeChannels.map(({ gates, centers, name }) => (
              <div
                key={`${gates[0]}-${gates[1]}`}
                className="bg-white rounded-xl border border-[#e8e0d0] p-3"
              >
                <p className="text-sm font-bold text-[#2d2a3e]">
                  Channel {gates[0]}–{gates[1]}
                </p>
                <p className="text-xs font-semibold text-[#9a7d4e]">{name}</p>
                <p className="text-xs text-[#9b95ad] mt-1">
                  {centers[0]} ↔ {centers[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gate Positions ── */}
      <div className={SECTION}>
        <h3 className={SECTION_TITLE}>🌟 Gate Positions</h3>
        <p className="text-xs text-[#9b95ad] mb-4">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#1a1a2e] mr-1 align-middle" />
          Black = Personality (conscious) &nbsp;
          <span className="inline-block w-3 h-3 rounded-sm bg-[#8b1a1a] mr-1 align-middle" />
          Red = Design (unconscious)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Personality column */}
          <div>
            <p className="text-sm font-bold text-[#1a1a2e] mb-2">Personality (Conscious)</p>
            <div className="bg-white rounded-xl border border-[#e8e0d0] p-3">
              {Object.entries(personalityGates).map(([planet, { gate, line }]) => (
                <GateRow key={planet} planet={planet} gate={gate} line={line} side="personality" />
              ))}
            </div>
          </div>

          {/* Design column */}
          <div>
            <p className="text-sm font-bold text-[#8b1a1a] mb-2">Design (Unconscious)</p>
            <div className="bg-white rounded-xl border border-[#e8e0d0] p-3">
              {Object.entries(designGates).map(([planet, { gate, line }]) => (
                <GateRow key={planet} planet={planet} gate={gate} line={line} side="design" />
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
