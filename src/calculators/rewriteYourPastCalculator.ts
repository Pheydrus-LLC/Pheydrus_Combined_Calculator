/**
 * Rewrite Your Past | Hero Identity Journey Calculator
 * Extracts logic from pheydrus-workbook-hj-rewrite-your-past.html
 */

export interface RewriteYourPastFormData {
  // Nervous System Baseline
  knownZone: string;
  safetyResponse: 'Freeze' | 'Fight' | 'Flight' | 'Fawn' | 'Regulate';
  selfLedShift: string;

  // Dream (Step 1)
  dream: string;
  dreamWhy: string;
  dreamSignal: string;
  movieOpening: string;
  dreamClarity: number;
  dreamCommit: number;

  // Nightmare (Step 2)
  nightmare: string;
  nightmareStory: string;
  nightmareBody: string;
  fearIntensity: number;
  nightmarePattern: 'Avoidance' | 'Perfectionism' | 'People-pleasing' | 'Doubt spiral' | 'Control';
  soulWound:
    | 'Rejection'
    | 'Abandonment'
    | 'Betrayal'
    | 'Humiliation'
    | 'Injustice'
    | 'Mental illness or depression'
    | 'Poverty'
    | 'Violence'
    | 'Addiction'
    | 'Physical handicap';
  woundStory: string;

  // Obstacle (Step 3)
  obstacle: string;
  obstacleTrigger: string;
  obstacleResponse: string;
  movieMidpoint: string;
  obstaclePressure: number;
  ownership: number;

  // New Dream (Step 4)
  newDream: string;
  newDreamAction: string;
  movieFinale: string;
  meaning: string;
  belief: number;

  // Neptune Blindspots
  neptuneHouse:
    | '1st'
    | '2nd'
    | '3rd'
    | '4th'
    | '5th'
    | '6th'
    | '7th'
    | '8th'
    | '9th'
    | '10th'
    | '11th'
    | '12th';
  neptuneTheme: string;
  neptuneQuestion: string;
}

export interface RewriteYourPastResult {
  score: number;
  band: string;
  completionPercent: number;
  summary: string;
  missingFields: string[];
}

const responseSamples = {
  Freeze:
    'When I notice myself freezing, I will choose one small visible action within 10 minutes so my body learns that movement is safer than shutdown.',
  Fight: 'When I feel activated and combative, I will pause, regulate, and redirect that fire into one courageous action instead of burning the bridge.',
  Flight: 'When I want to run, distract, or disappear, I will stay with the task for 15 more minutes and complete the next concrete step.',
  Fawn: 'When I want to shape-shift for approval, I will tell the truth clearly and make one choice that honors my own needs first.',
  Regulate:
    'When I feel grounded, I will use that stability to lead, make the decision, and follow through before doubt rewrites the moment.',
};

export function calculateScore(data: Partial<RewriteYourPastFormData>): number {
  const dreamClarity = Number(data.dreamClarity) || 0;
  const dreamCommit = Number(data.dreamCommit) || 0;
  const fearIntensity = Number(data.fearIntensity) || 0;
  const ownership = Number(data.ownership) || 0;
  const obstacleResponse = (data.obstacleResponse || '').trim();
  const obstaclePressure = Number(data.obstaclePressure) || 0;
  const belief = Number(data.belief) || 0;
  const newDreamAction = (data.newDreamAction || '').trim();

  const clarity = (dreamClarity + dreamCommit) / 2;
  const resilience = (10 - fearIntensity + ownership + (obstacleResponse ? 2 : 0)) / 2;
  const momentum = (10 - obstaclePressure + belief + (newDreamAction ? 2 : 0)) / 2;

  const narrativeDepth =
    (data.dreamWhy?.trim() ? 1 : 0) +
    (data.nightmareStory?.trim() ? 1 : 0) +
    (data.meaning?.trim() ? 1 : 0) +
    (data.woundStory?.trim() ? 1 : 0) +
    (data.neptuneQuestion?.trim() ? 1 : 0);

  const total = Math.round((clarity * 0.3 + resilience * 0.3 + momentum * 0.3 + narrativeDepth * 0.1) * 10);
  return Math.max(0, Math.min(100, total));
}

export function scoreBand(score: number): string {
  if (score < 40)
    return 'Reorientation phase: your story is still threat-coded. Focus on naming your dream and choosing one meaning statement.';
  if (score < 70)
    return 'Activation phase: your narrative is shifting from fear to ownership. Keep building consistency.';
  return 'Author phase: strong coherence and self-leadership. You are operating from identity-level commitment.';
}

export function getCompletionPercent(data: Partial<RewriteYourPastFormData>): number {
  const textFields = [
    'knownZone',
    'selfLedShift',
    'dream',
    'dreamWhy',
    'dreamSignal',
    'movieOpening',
    'nightmare',
    'nightmareStory',
    'woundStory',
    'obstacle',
    'obstacleResponse',
    'movieMidpoint',
    'newDream',
    'newDreamAction',
    'movieFinale',
    'meaning',
    'neptuneTheme',
    'neptuneQuestion',
  ];
  const completed = textFields.filter((key) => {
    const value = (data as Record<string, unknown>)[key];
    return String(value || '').trim().length > 0;
  }).length;
  return Math.round((completed / textFields.length) * 100);
}

export function getRequiredFields(): string[] {
  return [
    'knownZone',
    'selfLedShift',
    'dream',
    'dreamWhy',
    'nightmare',
    'woundStory',
    'obstacle',
    'newDream',
    'newDreamAction',
    'neptuneQuestion',
  ];
}

export function validateRewriteYourPastInput(data: Partial<RewriteYourPastFormData>): { valid: boolean; missing: string[] } {
  const required = getRequiredFields();
  const missing = required.filter((key) => !String((data as Record<string, unknown>)[key] || '').trim());
  return {
    valid: missing.length === 0,
    missing,
  };
}

export function buildSummary(data: Partial<RewriteYourPastFormData>, score: number): string {
  const commitLine = 'I will pursue this whole-heartedly without attaching to outcome.';
  const skillLine = 'I am going to acquire all the skills necessary to achieve this.';
  const emotionLine = 'I did not come this far to stop now.';
  const meaning = (data.meaning || '').trim() || 'This had to happen so that I can unlock a new paradigm.';

  return [
    'Rewrite Your Past | Identity Shift Summary',
    '',
    '0) Nervous System Baseline',
    'Known zone: ' + ((data.knownZone || '').trim() || '[Add known zone]'),
    'Safety response: ' + (data.safetyResponse || '[Add safety response]'),
    'Self-led shift: ' + ((data.selfLedShift || '').trim() || '[Add self-led shift]'),
    '',
    '1) Dream',
    (data.dream || '').trim() || '[Add your dream]',
    'Identity why: ' + ((data.dreamWhy || '').trim() || '[Add identity why]'),
    'Weekly signal: ' + ((data.dreamSignal || '').trim() || '[Add weekly signal]'),
    'Movie opening: ' + ((data.movieOpening || '').trim() || '[Add opening scene]'),
    'Commitment statement: ' + commitLine,
    '',
    '2) Nightmare',
    (data.nightmare || '').trim() || '[Add your nightmare]',
    'Old story: ' + ((data.nightmareStory || '').trim() || '[Add old story sentence]'),
    'Body location: ' + ((data.nightmareBody || '').trim() || '[Add body location]'),
    'Pattern: ' + (data.nightmarePattern || '[Add pattern]'),
    'Soul wound theme: ' + (data.soulWound || '[Add soul wound]'),
    'Wound pattern: ' + ((data.woundStory || '').trim() || '[Add wound pattern]'),
    'Growth statement: ' + skillLine,
    '',
    '3) Obstacle',
    (data.obstacle || '').trim() || '[Add your obstacle]',
    'Trigger: ' + ((data.obstacleTrigger || '').trim() || '[Add trigger]'),
    'New response: ' + ((data.obstacleResponse || '').trim() || '[Add response sentence]'),
    'Movie midpoint: ' + ((data.movieMidpoint || '').trim() || '[Add midpoint scene]'),
    'Transmute statement: ' + emotionLine,
    '',
    '4) New Dream',
    (data.newDream || '').trim() || '[Add your new dream]',
    '72-hour move: ' + ((data.newDreamAction || '').trim() || '[Add 72-hour move]'),
    'Movie finale: ' + ((data.movieFinale || '').trim() || '[Add ending scene]'),
    'Meaning statement: ' + meaning,
    '',
    'Neptune Blindspot Lens',
    'Natal Neptune house: ' + (data.neptuneHouse || '[Add Neptune house]'),
    'Blindspot theme: ' + ((data.neptuneTheme || '').trim() || '[Add blindspot theme]'),
    'Reality check: ' + ((data.neptuneQuestion || '').trim() || '[Add reality check]'),
    '',
    'Hero Coherence Score: ' + score + '/100',
    'Status: ' + scoreBand(score),
    '',
    'Next micro-action (24 hours):',
    'Write one paragraph that links your nightmare and obstacle to the new dream using causal language: because, this led to, now I choose.',
  ].join('\n');
}

export function calculateRewriteYourPast(data: Partial<RewriteYourPastFormData>): RewriteYourPastResult {
  const validation = validateRewriteYourPastInput(data);
  const score = calculateScore(data);
  const completionPercent = getCompletionPercent(data);
  const summary = buildSummary(data, score);

  return {
    score,
    band: scoreBand(score),
    completionPercent,
    summary,
    missingFields: validation.missing,
  };
}

export function getSelfLedShiftSample(response: string): string {
  return responseSamples[response as keyof typeof responseSamples] || '';
}
