/**
 * Free resources offered at the end of the Invisible Forces report:
 * one set per pillar (Option #1) plus a bonus (Option #2).
 *
 * Shared by the web report and the PDF export so both always list the same
 * resources, links and codes.
 */

export interface FreeResource {
  pillar: 1 | 2 | 3 | null;
  title: string;
  description: string;
  link: string;
  cta: string;
  /** Checkout code, when the resource needs one to be free */
  code?: string;
}

export const PILLAR_RESOURCES: FreeResource[] = [
  {
    pillar: 1,
    title: 'Our Upcoming Live Webinar',
    description:
      'Save your free seat at our next live webinar and go deeper into the Pillar 1 patterns this report surfaced, with HeyJune walking you through them in real time.',
    link: 'https://event.webinarjam.com/v12wp/register/8zx3ycn9',
    cta: 'Save My Free Seat →',
  },
  {
    pillar: 2,
    title: 'Outer Planets LIVE Training',
    description:
      "Learn exactly what the outer planets are bringing into your next 20 years, and how to work with the timing window you're in instead of against it.",
    link: 'https://pheydrusmetaverse.com/products/outer-planets',
    cta: 'Get Free Access →',
    code: 'IF100',
  },
  {
    pillar: 3,
    title: 'Real Estate Cheatsheet',
    description:
      'A quick-reference guide to reading the energy of a home or address, so your next space supports your goals instead of quietly working against them.',
    link: 'https://pheydrus.myflodesk.com/wxjuunt5s3',
    cta: 'Get the Cheatsheet →',
  },
  {
    pillar: 3,
    title: 'Astrocartography Wheel Guide',
    description:
      'Map which directions and locations amplify you, using your own chart, so you know where your environment is working for you.',
    link: 'https://pheydrus-combined-calculator-sigma.vercel.app/calculators/Pillar%203%20Environment.html',
    cta: 'Open the Wheel Guide →',
  },
];

export const BONUS_RESOURCE: FreeResource = {
  pillar: null,
  title: 'Our Astrological Calendar',
  description:
    "Every key astrological date for the second half of 2026, so you know when to push forward, when to pause, and when the windows in your report open up.",
  link: 'https://www.pheydrus.com/astro-calendar-2026h2',
  cta: 'Get the Calendar →',
};

export const PILLAR_NAMES: Record<1 | 2 | 3, string> = {
  1: 'Structure',
  2: 'Timing',
  3: 'Environment',
};
