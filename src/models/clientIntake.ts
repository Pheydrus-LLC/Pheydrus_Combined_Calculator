/**
 * Client intake questionnaire data model
 * Captures additional context questions for the client-facing assessment
 */

export type PreferredSolution = 'coaching' | 'workshops' | 'self-study' | 'all';
export type CurrentSituation = 'employed' | 'founder' | 'freelancer' | 'student' | 'monetizing';
export type PriorHelpOption = 'therapy' | 'coaches' | 'family' | 'media';

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
