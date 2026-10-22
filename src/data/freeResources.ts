/**
 * The Pillar Repair Kit: free resources offered at the end of the Invisible
 * Forces report, one card per pillar.
 */

export interface FreeResource {
  title: string;
  description: string;
  link: string;
  cta: string;
  /** Checkout code that makes the resource free */
  code?: string;
}

export interface ResourceCard {
  /** Pillar the card addresses (drives its colour) */
  pillar: 1 | 2 | 3;
  /** Small caps line above the resources */
  label: string;
  resources: FreeResource[];
}

export const PILLAR_RESOURCE_CARDS: ResourceCard[] = [
  {
    pillar: 1,
    label: 'To address Pillar 1: Structure',
    resources: [
      {
        title: '4 Steps to Re-Writing Your Past',
        description:
          "A free interactive workbook built on the Hero's Journey Structure. Turn the old emotional loops in your story into a self-led narrative, moving from dream, through nightmare and obstacle, into an identity you author yourself.",
        link: 'https://www.pheydrus.com/4steps',
        cta: 'Open the Workbook →',
      },
    ],
  },
  {
    pillar: 2,
    label: 'To address Pillar 2: Timing',
    resources: [
      {
        title: 'Outer Planets: Your 20-Year Roadmap',
        description:
          'A live training (with replay) plus the Pheydrus Transit Calculator. See exactly when Pluto, Neptune and Uranus land, peak and leave your chart over the next 20 years, and the moves to make right now.',
        link: 'https://pheydrusmetaverse.com/products/outer-planets',
        cta: 'Get Free Access →',
        code: 'IF100',
      },
      {
        title: 'Astrological Calendar',
        description:
          'An interactive calendar of every major transit from July to December 2026. Pick your rising sign to see which events hit hardest, and where in your life they land.',
        link: 'https://www.pheydrus.com/astro-calendar-2026h2',
        cta: 'Get the Calendar →',
      },
    ],
  },
  {
    pillar: 3,
    label: 'To address Pillar 3: Environment',
    resources: [
      {
        title: 'Real Estate Numerology Cheatsheet',
        description:
          "A free quick-reference cheatsheet. Calculate your home's hidden number and see what it's amplifying in your life.",
        link: 'https://pheydrus.myflodesk.com/wxjuunt5s3',
        cta: 'Get the Cheatsheet →',
      },
      {
        title: 'Astrocartography Wheel Guide',
        description:
          'An interactive astrocartography wheel. Tap any house to see how each planet expresses in your environment there, with malefics and benefics decoded.',
        link: 'https://pheydrus-combined-calculator-sigma.vercel.app/calculators/Pillar%203%20Environment.html',
        cta: 'Open the Wheel Guide →',
      },
    ],
  },
];

/** Every free resource across the pillar cards (the "5" in "5 free resources") */
export const PILLAR_RESOURCES: FreeResource[] = PILLAR_RESOURCE_CARDS.flatMap((c) => c.resources);
