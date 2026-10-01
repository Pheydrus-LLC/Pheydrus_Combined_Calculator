/**
 * "Here's Your Roadmap to Success" section of the Invisible Forces report.
 * Shared by the web report and the PDF export. Each piece is split so the
 * key words ("closure", "preparation", "Pillar N") can be bolded.
 */

/** The web report appends a 🏆; the PDF leaves emoji out */
export const ROADMAP_TITLE = "Here's Your Roadmap to Success and Breaking Your 5+ Year Patterns";

export const ROADMAP_STEPS: Array<{ before: string; bold: string; after: string }> = [
  {
    before: 'The first step is ',
    bold: 'closure',
    after:
      ". You may have been told that struggle means growth. It doesn't. More often, it means you've been operating in an energetic grid that wasn't working in your favor, and that can change.",
  },
  {
    before: 'The second, and more important, is ',
    bold: 'preparation',
    after:
      ". That grid is already shifting. And to move with it, you'll work on all three pillars at once, because they don't work in isolation. Your blueprint, your timing, and your environment are always talking to each other. Fix one and ignore the others - and you'll keep hitting the same ceiling in a different room.",
  },
];

export const ROADMAP_PILLARS: Array<{ pillar: string; text: string }> = [
  {
    pillar: 'Pillar 1',
    text: ", we use a sequential deconditioning method that goes directly into your energetic blind spots (desires, addictions, dreams, etc). This isn't talk therapy or journaling. It's a specific, structured process that helps you identify the unconscious karmic patterns running your decisions, and consciously transmute them into your greatest assets.",
  },
  {
    pillar: 'Pillar 2',
    text: ", we map your current and upcoming planetary transits so you're always one step ahead. We show you exactly which seasons to push, which to rest, and how to prepare for the windows that, if you move correctly, will be the most expansive periods of your life.",
  },
  {
    pillar: 'Pillar 3',
    text: ", we use our proprietary Feng Shui × Astrocartography × Real Estate Numerology to find the best addresses and places in the world to accelerate your goals. This is different for everyone. And it works even if you can't move yet. There are ways to shift the energetic frequency of your space and protect yourself from the unseen environmental forces that have been holding you back.",
  },
];

export const ROADMAP_CLOSER =
  "When all three are aligned, that's when people stop reacting to their lives and start owning them.";
