/**
 * Client intake questionnaire data model
 * Captures additional context questions for the client-facing assessment
 */

export type PreferredSolution = 'coaching' | 'workshops' | 'self-study' | 'all';
export type CurrentSituation = 'employed' | 'founder' | 'freelancer' | 'student' | 'monetizing';
export type PriorHelpOption = 'therapy' | 'coaches' | 'family' | 'media';

// Stored and synced (GHL, Google Sheet) as the label itself, so the answer reads as the client chose it.
export const YEARLY_INCOME_OPTIONS = [
  'Under $25K',
  '$25K–$65K',
  '$65K–$95K',
  '$95K–$150K',
  '$150K+',
  'No set income, but I have savings or access to cash',
] as const;
export type YearlyIncome = (typeof YEARLY_INCOME_OPTIONS)[number];

export interface ClientIntakeData {
  email: string;
  phone: string;
  marketingConsent: boolean;
  tosConsent: boolean;
  addressMoveDate: string; // free text, e.g. "March 2023" or a date
  desiredOutcome: string; // free text — next 90 days goal
  obstacle: string; // free text — what's blocking them
  patternYear: string; // year they first noticed the recurring pattern
  priorHelp: PriorHelpOption[]; // multi-select — support already tried
  preferredSolution: PreferredSolution | '';
  currentSituation: CurrentSituation | '';
  yearlyIncome: YearlyIncome | '';
  additionalNotes: string; // free text — anything else
}

export const EMPTY_CLIENT_INTAKE: ClientIntakeData = {
  email: '',
  phone: '',
  marketingConsent: false,
  tosConsent: false,
  addressMoveDate: '',
  desiredOutcome: '',
  obstacle: '',
  patternYear: '',
  priorHelp: [],
  preferredSolution: '',
  currentSituation: '',
  yearlyIncome: '',
  additionalNotes: '',
};

export const PREFERRED_SOLUTION_LABELS: Record<PreferredSolution, string> = {
  coaching: '1:1 Done For You Calls',
  workshops: 'Group Workshops',
  'self-study': 'Self-Study',
  all: 'All of the above',
};

export const CURRENT_SITUATION_LABELS: Record<CurrentSituation, string> = {
  employed: 'Full-time Employed',
  founder: 'Founder / Executive with profitable company',
  freelancer: 'Freelancer',
  student: 'Student',
  monetizing: 'Looking to monetize my work',
};

export const PRIOR_HELP_LABELS: Record<PriorHelpOption, string> = {
  therapy: 'Therapy',
  coaches: 'Coaches or Consultants',
  family: 'Family or Friends',
  media: 'YouTube or Books',
};
