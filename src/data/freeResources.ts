/**
 * The Pillar Repair Kit: free resources offered at the end of the Invisible
 * Forces report, one card per pillar, plus a bonus.
 *
 * Shared by the web report and the PDF export so both always list the same
 * resources, links and codes.
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
  /** Pillar the card addresses (drives its colour), or null for the bonus */
  pillar: 1 | 2 | 3 | null;
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
        title: 'Activate Your Power Law',
        description:
          'A free 60-minute live webinar. Learn the sequence that makes your chart finally move: the one identity trait that pays, the timing that changes everything, and the environment keeping your pattern in place.',
        link: 'https://event.webinarjam.com/v12wp/register/8zx3ycn9',
        cta: 'Save My Free Seat →',
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

export const BONUS_RESOURCE_CARD: ResourceCard = {
  pillar: null,
  label: 'The Sky, By Rising Sign',
  resources: [
    {
      title: 'Astrological Calendar',
      description:
        'An interactive calendar of every major transit from July to December 2026. Pick your rising sign to see which events hit hardest, and where in your life they land.',
      link: 'https://www.pheydrus.com/astro-calendar-2026h2',
      cta: 'Get the Calendar →',
    },
  ],
};

/** Every free resource across the pillar cards (the "4" in "4 free resources") */
export const PILLAR_RESOURCES: FreeResource[] = PILLAR_RESOURCE_CARDS.flatMap((c) => c.resources);
