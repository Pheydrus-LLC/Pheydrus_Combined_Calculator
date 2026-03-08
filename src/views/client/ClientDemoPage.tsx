/**
 * ClientDemoPage
 * Injects hardcoded sample data and redirects to /client/results
 * so the full report UI can be previewed without filling out the form.
 *
 * The diagnostic is computed live via gradeThreePillars() so it always
 * reflects the current grading logic — no manual sync needed.
 *
 * Access at: /client/demo
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConsolidatedResults } from '../../models';
import type { ClientIntakeData } from '../../models/clientIntake';
import type { NatalChartResult } from '../../models/calculators';
import type { PlanetHouseResult } from '../../models/diagnostic';
import { gradeThreePillars } from '../../services/diagnostic/threePillarsGrader';

// ── Sample intake ─────────────────────────────────────────────────────────────

const DEMO_INTAKE: ClientIntakeData = {
  email: 'alex@example.com',
  phone: '(555) 234-5678',
  addressMoveDate: 'March 2022',
  desiredOutcome:
    'Build my coaching business to $10k/month revenue in the next 90 days and land 5 high-ticket clients',
  obstacle: 'Self-sabotage and inconsistent client outreach — I know what to do but keep stopping myself',
  patternYear: '2019',
  priorHelp: ['therapy', 'coaches'],
  preferredSolution: 'coaching',
  currentSituation: 'freelancer',
  additionalNotes: '',
};

// ── Mock natal chart (Pillar 1 input) ────────────────────────────────────────

const DEMO_NATAL_CHART: NatalChartResult = {
  risingSign: 'Aquarius',
  aspects: [],
  angleAspects: { asc: [], dsc: [], mc: [], ic: [] },
  planets: [
    { planet: { en: 'Sun' },     house: 7,  fullDegree: 295, normDegree: 25, isRetro: 'False', zodiac_sign: { number: 12, name: { en: 'Pisces' } } },
    { planet: { en: 'Moon' },    house: 3,  fullDegree: 215, normDegree: 5,  isRetro: 'False', zodiac_sign: { number: 8,  name: { en: 'Scorpio' } } },
    { planet: { en: 'Mars' },    house: 6,  fullDegree: 320, normDegree: 20, isRetro: 'False', zodiac_sign: { number: 11, name: { en: 'Aquarius' } } },
    { planet: { en: 'Jupiter' }, house: 11, fullDegree: 95,  normDegree: 5,  isRetro: 'False', zodiac_sign: { number: 4,  name: { en: 'Cancer' } } },
    { planet: { en: 'Venus' },   house: 6,  fullDegree: 320, normDegree: 20, isRetro: 'False', zodiac_sign: { number: 11, name: { en: 'Aquarius' } } },
    { planet: { en: 'Saturn' },  house: 5,  fullDegree: 290, normDegree: 20, isRetro: 'False', zodiac_sign: { number: 10, name: { en: 'Capricorn' } } },
    { planet: { en: 'Uranus' },  house: 5,  fullDegree: 285, normDegree: 15, isRetro: 'False', zodiac_sign: { number: 10, name: { en: 'Capricorn' } } },
    { planet: { en: 'Neptune' }, house: 5,  fullDegree: 282, normDegree: 12, isRetro: 'False', zodiac_sign: { number: 10, name: { en: 'Capricorn' } } },
    { planet: { en: 'Pluto' },   house: 3,  fullDegree: 218, normDegree: 8,  isRetro: 'False', zodiac_sign: { number: 8,  name: { en: 'Scorpio' } } },
  ],
};

// ── Mock destination planet houses (Pillar 3 input) ──────────────────────────

const DEMO_DESTINATION_PLANET_HOUSES: PlanetHouseResult[] = [
  { planet: 'Sun',     house: 4  },
  { planet: 'Moon',    house: 12 },
  { planet: 'Venus',   house: 3  },
  { planet: 'Mars',    house: 3  },
  { planet: 'Jupiter', house: 8  },
  { planet: 'Saturn',  house: 2  },
  { planet: 'Uranus',  house: 2  },
  { planet: 'Neptune', house: 2  },
  { planet: 'Pluto',   house: 12 },
];

// ── Sample calculators ────────────────────────────────────────────────────────

const DEMO_CALCULATORS: ConsolidatedResults['calculators'] = {
  transits: {
    risingSign: 'Aquarius',
    transits: [
      {
        planet: 'Pluto',
        planetTheme: 'Transformation & Power',
        houseNumber: 6,
        houseTheme: 'Work & Health',
        pastHouseNumber: 5,
        pastHouseTheme: 'Creativity & Romance',
        current: { sign: 'Aquarius', start: '2023', end: '2043', high: 'Transformation', low: 'Destruction' },
        past: { sign: 'Capricorn', start: '2008', end: '2023', high: 'Mastery', low: 'Control' },
      },
      {
        planet: 'Neptune',
        planetTheme: 'Illusion & Spirituality',
        houseNumber: 8,
        houseTheme: 'Shared Resources & Transformation',
        pastHouseNumber: 7,
        pastHouseTheme: 'Partnership',
        current: { sign: 'Aries', start: '2025', end: '2039', high: 'Inspiration', low: 'Confusion' },
        past: { sign: 'Pisces', start: '2011', end: '2025', high: 'Compassion', low: 'Illusion' },
      },
      {
        planet: 'Uranus',
        planetTheme: 'Disruption & Innovation',
        houseNumber: 10,
        houseTheme: 'Career & Public Reputation',
        pastHouseNumber: 9,
        pastHouseTheme: 'Higher Learning',
        current: { sign: 'Gemini', start: '2025', end: '2033', high: 'Innovation', low: 'Chaos' },
        past: { sign: 'Taurus', start: '2018', end: '2025', high: 'Liberation', low: 'Disruption' },
      },
      {
        planet: 'Saturn',
        planetTheme: 'Discipline & Limitation',
        houseNumber: 8,
        houseTheme: 'Shared Resources & Transformation',
        pastHouseNumber: 7,
        pastHouseTheme: 'Partnership',
        current: { sign: 'Aries', start: '2025', end: '2028', high: 'Discipline', low: 'Restriction' },
        past: { sign: 'Pisces', start: '2023', end: '2025', high: 'Structure', low: 'Limitation' },
      },
    ],
  },
  natalChart: DEMO_NATAL_CHART,
  lifePath: {
    lifePathNumber: 7,
    dayPathNumber: 6,
    personalYear: 2,
    chineseZodiac: 'Goat',
    meanings: {
      lifePathMeaning: 'The Seeker',
      lifePathDescription: 'Deep thinker, analytical, spiritual',
      personalYearMeaning: 'Cooperation & Patience',
      personalYearDescription: 'A year of partnerships and reflection',
    },
  },
  relocation: null,
  addressNumerology: {
    levels: [
      { level: 'L1', value: '1234', name: 'Unit',          number: 1,  meaning: 'Independence',  description: '', themes: '', challenges: '', gifts: '', reflection: '' },
      { level: 'L2', value: '4',    name: 'Street Number', number: 4,  meaning: 'Structure',      description: '', themes: '', challenges: '', gifts: '', reflection: '' },
      { level: 'L3', value: '11',   name: 'Address Total', number: 11, meaning: 'Master Number',  description: '', themes: '', challenges: '', gifts: '', reflection: '' },
    ],
    homeZodiac: 'Scorpio',
    birthZodiac: 'Capricorn',
    homeZodiacMeaning: null,
    birthZodiacMeaning: null,
    compatibility: 'Moderate',
  },
};

// ── Compute diagnostic live via the real grader ───────────────────────────────

const DEMO_DIAGNOSTIC = gradeThreePillars({
  natalChart: DEMO_NATAL_CHART,
  transits: DEMO_CALCULATORS.transits,
  lifePath: DEMO_CALCULATORS.lifePath,
  destinationPlanetHouses: DEMO_DESTINATION_PLANET_HOUSES,
  addressNumerology: DEMO_CALCULATORS.addressNumerology,
});

// ── Sample results ────────────────────────────────────────────────────────────

const DEMO_RESULTS: ConsolidatedResults = {
  success: true,
  timestamp: new Date().toISOString(),
  userInfo: {
    name: 'Alex Rivera',
    dateOfBirth: '1991-01-15',
    timeOfBirth: '08:30',
    birthLocation: 'New York, NY',
    currentLocation: 'Los Angeles, CA',
    address: '1234 Sunset Blvd, Los Angeles, CA 90028',
  },
  calculators: DEMO_CALCULATORS,
  diagnostic: DEMO_DIAGNOSTIC,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function ClientDemoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/client/results', {
      state: { results: DEMO_RESULTS, intake: DEMO_INTAKE },
      replace: true,
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] flex items-center justify-center">
      <p className="text-[#6b6188] text-sm">Loading demo…</p>
    </div>
  );
}

export default ClientDemoPage;
