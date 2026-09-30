/**
 * The Pillar Remedy Care Package: free resources offered at the end of the
 * Invisible Forces report, one set per pillar, plus a bonus.
 *
 * Shared by the web report and the PDF export so both always list the same
 * resources, links and codes.
 */

export interface FreeResource {
  /** Small caps line above the title, e.g. which pillar it addresses */
  label: string;
  title: string;
  description: string;
  link: string;
  cta: string;
  /** Checkout code that makes the resource free */
  code?: string;
}

export const PILLAR_RESOURCES: FreeResource[] = [
  {
    label: 'To address Pillar 1: Structure',
    title: 'Activate Your Power Law · Free Live Webinar',
    description:
      'You already know your chart — and nothing has moved. In 60 minutes, James walks you through the sequence that finally makes it compound: the ONE identity trait that pays, the timing that changes everything, and the environment keeping your pattern in place. Attendees get their Power Law move for 2026, mapped to their rising sign.',
    link: 'https://event.webinarjam.com/v12wp/register/8zx3ycn9',
    cta: 'Save My Free Seat →',
  },
  {
    label: 'To address Pillar 2: Timing',
    title: 'Outer Planets: Your 20-Year Roadmap · LIVE Training',
    description:
      "Pluto, Neptune and Uranus are writing your next chapter — and they're staying for DECADES. Get the Pheydrus Transit Calculator with the exact dates every outer-planet transit lands, peaks and leaves for the next 20 years, plus the 3 highest-leverage moves to make right now. Can't make it live? You get the replay.",
    link: 'https://pheydrusmetaverse.com/products/outer-planets',
    cta: 'Get Free Access →',
    code: 'IF100',
  },
  {
    label: 'To address Pillar 3: Environment',
    title: 'Real Estate Numerology Cheatsheet',
    description:
      "Your home has a hidden number — and it's shaping your life whether you know it or not. Our private cheatsheet shows you how to calculate it, and what it's amplifying.",
    link: 'https://pheydrus.myflodesk.com/wxjuunt5s3',
    cta: 'Get the Cheatsheet →',
  },
  {
    label: 'To address Pillar 3: Environment',
    title: 'Astrocartography Wheel Guide',
    description:
      'Tap any house on the wheel to see how each planet expresses in your environment there — malefics and benefics decoded, house by house.',
    link: 'https://pheydrus-combined-calculator-sigma.vercel.app/calculators/Pillar%203%20Environment.html',
    cta: 'Open the Wheel Guide →',
  },
];

export const BONUS_RESOURCE: FreeResource = {
  label: 'Bonus · Astrological Calendar',
  title: 'The Sky, By Rising Sign',
  description:
    'Every major transit from July → December 2026, translated into the exact house of your chart it activates. Pick your rising sign and see which events hit hardest — and where in your life they land.',
  link: 'https://www.pheydrus.com/astro-calendar-2026h2',
  cta: 'Get the Calendar →',
};
