/** Colours and fonts of the book view, matched to the report's navy-and-gold look. */

const GRADE: Record<string, { border: string; bg: string; text: string }> = {
  A: { border: '#4ADE80', bg: 'rgba(74,222,128,0.1)', text: '#4ADE80' },
  B: { border: '#60A5FA', bg: 'rgba(96,165,250,0.1)', text: '#60A5FA' },
  C: { border: '#D4A843', bg: 'rgba(212,168,67,0.1)', text: '#D4A843' },
  F: { border: '#F87171', bg: 'rgba(248,113,113,0.1)', text: '#F87171' },
};

export const BOOK = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', Arial, sans-serif",
  /** Night sky behind the book */
  backdrop:
    'radial-gradient(ellipse 80% 55% at 12% 0%, rgba(110,50,200,0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 88% 4%, rgba(35,85,220,0.15) 0%, transparent 50%), #050A18',
  page: '#0C1128',
  ink: '#E8DEFF',
  text: '#DDD8F8',
  muted: '#A098C0',
  gold: '#C9A84C',
  goldText: '#D4A843',
  line: 'rgba(255,255,255,0.1)',
  grade: (g: string) => GRADE[g] ?? GRADE.F,
};
