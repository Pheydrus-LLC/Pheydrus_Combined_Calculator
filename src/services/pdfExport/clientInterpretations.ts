/**
 * Client Report Interpretations
 * Goal-aware text copy for the 3-pillar client PDF report.
 *
 * F grade  = shadow/unconscious — how this placement actively blocks the goal
 * C grade  = can go either way — conscious vs. unconscious path described
 * Transit items include the remaining duration of the transit
 */

import type { GradeItem } from '../../models/diagnostic';
import type { PlanetaryTransit } from '../../models/calculators';

// ── Goal detection ──────────────────────────────────────────────────────────

export type GoalCategory = 'career' | 'love' | 'general';

const CAREER_KEYWORDS = [
  'money', 'career', 'business', 'income', 'revenue', 'client', 'sale', 'job',
  'wealth', 'financial', 'work', 'launch', 'company', 'startup', 'invest',
  'profit', 'scale', 'brand', 'grow', 'promotion', 'success', 'entrepreneur',
];
const LOVE_KEYWORDS = [
  'love', 'relationship', 'partner', 'marriage', 'date', 'romantic', 'soulmate',
  'boyfriend', 'girlfriend', 'husband', 'wife', 'connection', 'intimacy', 'heart',
  'meet someone', 'find love',
];

export function detectGoalCategory(text: string): GoalCategory {
  const t = text.toLowerCase();
  const c = CAREER_KEYWORDS.filter((k) => t.includes(k)).length;
  const l = LOVE_KEYWORDS.filter((k) => t.includes(k)).length;
  return l > c ? 'love' : 'career';
}

// ── Transit duration helpers ─────────────────────────────────────────────────

function parseEndYear(s: string): number {
  const nums = s
    .replace(/[^\d/]/g, '')
    .split('/')
    .map(Number)
    .filter((n) => n > 2000);
  return nums.length ? Math.max(...nums) : 2030;
}

export function getTransitEndYear(planet: string, transits: PlanetaryTransit[]): number | null {
  const t = transits.find((x) => x.planet === planet);
  return t ? parseEndYear(t.current.end) : null;
}

export function formatDuration(endYear: number): string {
  const rem = endYear - new Date().getFullYear();
  if (rem <= 0) return `through ${endYear}`;
  return `through ${endYear} (~${rem} more year${rem === 1 ? '' : 's'})`;
}

export function getLongestMaleficTransit(
  items: GradeItem[],
  transits: PlanetaryTransit[]
): { planet: string; house: number; endYear: number } | null {
  const fItems = items.filter(
    (i) =>
      i.pillar === 2 &&
      i.section === 'Transit Angular' &&
      i.grade === 'F' &&
      i.planet &&
      i.house
  );
  const cItems = items.filter(
    (i) =>
      i.pillar === 2 &&
      i.section === 'Transit Angular' &&
      i.grade === 'C' &&
      i.planet &&
      i.house
  );
  const pool = fItems.length > 0 ? fItems : cItems;
  let best: { planet: string; house: number; endYear: number } | null = null;
  for (const item of pool) {
    if (!item.planet || !item.house) continue;
    const y = getTransitEndYear(item.planet, transits);
    if (y && (!best || y > best.endYear))
      best = { planet: item.planet, house: item.house, endYear: y };
  }
  return best;
}

// ── F grade interpretation copy (natal, relocation, angular transit) ─────────

const F_INTERP: Record<string, Partial<Record<number, { career: string; love: string }>>> = {
  Pluto: {
    1: {
      career:
        'Pluto in your first house projects raw intensity that reads as volatility before trust is established. In career contexts, you unconsciously trigger power dynamics in work environments — colleagues and partners sense the force, but without mastery, it manifests as instability rather than leadership. Until you consciously step into the full gravity of your power, you oscillate between dominating and withdrawing, making sustained professional momentum difficult.',
      love:
        'Pluto in your first house radiates a magnetic but overwhelming energy in love. Potential partners sense the depth of your transformative power and often pull back before genuine intimacy can form. The unconscious pattern: using intensity as a substitute for vulnerability, which keeps love cycling through attraction and withdrawal rather than landing in real connection.',
    },
    5: {
      career:
        'Pluto in your fifth house creates obsessive, all-or-nothing energy across both creativity and romance. The shadow pattern in your work: you pour everything into a project, then destroy it just as it peaks — preventing the consistent creative output that builds a professional reputation. In romance, the same all-or-nothing intensity creates consuming connections that burn out before real depth can form.',
      love:
        'Pluto in your romance house drives consuming, obsessive connections that feel electric but rarely sustain. The shadow pattern: you chase the feeling of transformation rather than genuine compatibility — and once a relationship no longer transforms you, you move on. The result is a trail of intense short-term connections that leave both parties burned.',
    },
    7: {
      career:
        'Pluto in your partnership house creates power struggles in business relationships and collaborations. The unconscious need to control or be controlled in partnerships can destroy the professional alliances that are essential for scaling career momentum. Every collaboration becomes a test of dominance rather than a vehicle for mutual growth.',
      love:
        'Pluto in your partnership house draws you into deeply transformative but often painful relationship dynamics — power battles, control struggles, and the unconscious need to transform or be transformed by your partner. Connections feel fated but often consume more than they give. The pattern continues until love is chosen over power.',
    },
    10: {
      career:
        'Pluto in your career house creates a battlefield around professional power. The unconscious pattern: you either obsessively chase authority or destroy your own career just as it peaks — through reputation crises, public conflict, or radical pivots that rebuild from zero. Sustained success requires mastering the internal destroyer before it dismantles what you build.',
      love:
        'Pluto in your career house creates a career obsession that crowds out space for genuine love. The relentless drive for professional transformation leaves relationships perpetually deprioritized — and partners who feel they\'ll never come first eventually stop waiting.',
    },
  },
  Saturn: {
    1: {
      career:
        'Saturn in your first house builds an armored exterior that professionally reads as cold, difficult, or simply too serious to collaborate with easily. Despite often being the most reliable person in the room, the emotional distance you project keeps career relationships from deepening into the opportunities that actually scale a career.',
      love:
        'Saturn in your first house builds walls that read as self-sufficiency but function as romantic isolation. You project "I don\'t need love" — which creates the very loneliness you\'re trying to avoid. Partners sense they can\'t truly reach you and, after enough attempts, stop trying.',
    },
    5: {
      career:
        'Saturn in your fifth house suppresses creative spontaneity, playful risk-taking, and romantic openness — all at once. Professionally, the fear of failure keeps your creative contributions in permanent draft form rather than the marketplace. In romance, the same fear of rejection makes you hold back exactly when vulnerability would create something real, keeping love at arm\'s length just as it could land.',
      love:
        'Saturn in your romance house puts a heavy hand on spontaneity, vulnerability, and the playfulness that attracts connection. The deep fear of rejection makes you hold back exactly when opening up would create something real — keeping love at arm\'s length just as it could land.',
    },
    7: {
      career:
        'Saturn in your partnership house creates chronic friction in business collaborations and contractual relationships. You attract overly controlling partners or become the restrictive one yourself — building professional alliances on obligation rather than genuine alignment, which limits their growth ceiling.',
      love:
        'Saturn in your partnership house is the signature of persistent relationship delays — attracting emotionally unavailable partners, creating standards that no one can meet, or keeping yourself behind walls that love cannot penetrate. The relationship you want will come, but only when you stop demanding it arrive on your terms.',
    },
    10: {
      career:
        'Saturn in your career house is the classic indicator of chronic professional delays — positions that feel perpetually just out of reach, underrecognition despite sustained effort, and authority figures who seem to test you relentlessly. The unconscious pattern: waiting for external permission to claim your authority. The shift comes when you stop seeking validation and step into your power unconditionally.',
      love:
        'Saturn in your career house creates a workaholic pattern where career becomes the primary relationship, leaving genuine partnership starved of time and presence. The drive to prove professional worthiness becomes a sophisticated way to avoid the vulnerability that love actually requires.',
    },
  },
  Uranus: {
    1: {
      career:
        'Uranus in your first house creates an erratic professional presence — the version of you who shows up today may be markedly different from tomorrow\'s. Career advancement requires sustained trust-building, and inconsistency in how you present undermines that foundation at every stage.',
      love:
        'Uranus in your first house creates unpredictable availability in love — brilliantly present one moment, completely detached the next. Partners can\'t build a foundation because they never know which version of you will appear. The inconsistency that feels like freedom to you registers as abandonment to those who want to love you.',
    },
    5: {
      career:
        'Uranus in your fifth house drives explosive starts — creatively and romantically — followed by sudden loss of interest before anything matures. Professionally, brilliant beginnings and abandoned follow-through create a reputation for inconsistency that undermines client trust and career advancement. In romance, the same pattern means love never receives the sustained attention needed to deepen into something real.',
      love:
        'Uranus in your romance house creates a cycle of thrilling starts followed by sudden departures — either you lose interest when novelty fades, or your energy signals "I\'ll leave" before you do, and partners pull back first. Love never gets the sustained attention needed to deepen.',
    },
    7: {
      career:
        'Uranus in your partnership house creates volatile business relationships — sudden breakdowns, unexpected betrayals, and an unconscious pattern of sabotaging collaborations just as they begin producing results. The instability limits the compounding growth that sustained alliances create.',
      love:
        'Uranus in your partnership house creates a freedom-vs-intimacy war that plays out in relationship after relationship. The unconscious pattern: you get close, feel trapped, and pull back — or partners sense your detachment and leave first. Sustainable love requires an architecture of closeness that doesn\'t feel like confinement.',
    },
    10: {
      career:
        'Uranus in your career house means your professional life will be marked by sudden upheavals, unexpected role changes, and a path that refuses conventional trajectory. When unconscious, this reads as unreliability to the people who could advance your career. The pivot from chaos to genius requires embracing the unconventional rather than fighting it.',
      love:
        'Uranus in your career house creates constant professional disruption that makes the stability love requires nearly impossible to maintain. The sudden pivots and reinventions that define your career make it difficult to create the consistent, present foundation that lasting romantic partnership needs.',
    },
  },
  Mars: {
    1: {
      career:
        'Mars in your first house projects combative energy that others often experience as aggression before you\'ve said anything contentious. In career contexts, this creates friction before trust is established — potential partners, employers, and collaborators sense the raw Mars energy and approach cautiously or simply avoid the potential conflict.',
      love:
        'Mars in your first house signals "compete with me" rather than "connect with me" in romantic contexts. You attract partners who can match your intensity, but the continuous competition means the relationship spends more energy fighting than building anything lasting.',
    },
    5: {
      career:
        'Mars in your fifth house drives impatient, impulsive energy across both creative work and romance. Professionally, the inability to develop ideas patiently leads to premature launches and poor-quality outputs that damage your track record. In love, the same combustible energy creates cycles of explosive passion and dramatic exits — intensity without the patience to build depth.',
      love:
        'Mars in your romance house makes your love life a cycle of explosive passion and dramatic exits. The intensity is real, but so is the damage. Relationships cycle through combustion and conflict rather than building the depth and safety genuine partnership requires.',
    },
    7: {
      career:
        'Mars in your partnership house brings open conflict into business relationships — power battles over direction, dominance struggles with collaborators, and the need to "win" negotiations at the expense of long-term alliance. The combative energy makes lasting professional partnerships difficult to maintain.',
      love:
        'Mars in your partnership house makes conflict and competition a permanent fixture in your most committed relationships. The impulse to win arguments, control outcomes, and discharge frustration through combat wears down even the strongest connections. Love cannot thrive in a perpetual war zone.',
    },
    10: {
      career:
        'Mars in your career house drives aggressive career tactics that build enemies in high places faster than allies. The warrior energy that could propel your career forward instead generates reputation damage when you force outcomes before they\'re ready — creating a cycle of advancement followed by setback.',
      love:
        'Mars in your career house creates a competitive, achievement-driven energy that bleeds into your love life — turning romance into another arena to conquer rather than a place to surrender and be known. Partners eventually tire of feeling like a goal to achieve rather than a companion to be with.',
    },
  },
  Neptune: {
    1: {
      career:
        'Neptune in your first house makes your professional self difficult to read — you project one persona while experiencing something entirely different internally. This authenticity gap erodes the consistent, trustworthy presence that career advancement and professional relationships require. Others sense the disconnect even when they can\'t articulate it.',
      love:
        'Neptune in your first house makes your true self nearly invisible in romantic contexts — you naturally mirror what partners want to see rather than revealing who you actually are. Connections built on a version of you that doesn\'t exist inevitably collapse when reality surfaces, leaving both parties confused about what happened.',
    },
    5: {
      career:
        'Neptune in your fifth house wraps both creative work and romance in a fog of idealism. Professionally, you see the vision clearly but struggle to execute it in concrete, marketable form — the gap between inspiration and what actually ships creates unrealized potential. In romance, the same fog has you falling in love with the idea of a person rather than the actual person, creating intense starts and confused endings.',
      love:
        'Neptune in your romance house creates a pattern of falling in love with the idea of a person rather than the actual person. The inevitable crash when reality intrudes on the fantasy creates a love life marked by intense starts and confused endings.',
    },
    7: {
      career:
        'Neptune in your partnership house creates fog around business relationships and contractual commitments. Whether being deceived by partners or deceiving yourself about what a collaboration actually is, the illusion-based approach to professional relationships leads to agreements that don\'t hold and partnerships that dissolve without warning.',
      love:
        'Neptune in your partnership house is the classic indicator of love built on projection. You don\'t fall in love with who your partner is — you fall in love with who you need them to be. When the fog lifts, you\'re left with a stranger rather than a partner, and the cycle of idealized beginnings and disillusioned endings continues.',
    },
    10: {
      career:
        'Neptune in your career house creates a blurry professional identity — your public face and private self don\'t align, generating an inconsistency that erodes credibility over time. The confusion about what you actually want professionally keeps you drifting between paths, never committing long enough for momentum to build.',
      love:
        'Neptune in your career house creates a pattern of pouring all creative and spiritual energy into professional dreams while real love waits indefinitely. The career becomes the idealized partnership — and actual romantic relationships can never compete with an imagined professional destiny.',
    },
  },
  Sun: {
    8: {
      career:
        'The Sun — your core vitality and identity — sits in the house of hidden power and shared resources. This creates a persistent pattern of giving your power away in partnerships and financial agreements, or keeping your authentic capabilities hidden just as they\'d be most rewarded. The solar force that drives career success is trapped behind a veil of self-doubt around your fundamental worth.',
      love:
        'The Sun in your house of transformation creates deep self-worth struggles that play out through intimate relationships. You may unconsciously choose partners who diminish your light, or withdraw your authentic self just as love deepens — creating relationships where you\'re never truly seen.',
    },
    12: {
      career:
        'The Sun — your core identity and life force — is placed in the house of hidden things and self-undoing. The pattern: you sabotage career momentum just as it builds, retreat from visibility at the exact moment it matters most, or keep your most powerful capabilities in the shadows where they cannot be leveraged.',
      love:
        'The Sun in your twelfth house creates a tendency to hide your authentic self in love — projecting a persona that protects rather than reveals. Genuine connection requires being seen, and the 12th house Sun systematically undermines your willingness to be truly known by a partner.',
    },
  },
  Venus: {
    8: {
      career:
        'Venus in the house of shared resources and transformation creates complex power dynamics around your financial and creative worth. This placement attracts financial entanglements, under-compensation, and situations where your value is negotiated away — directly limiting career advancement and financial growth.',
      love:
        'Venus in the house of deep transformation and shared intimacy creates all-or-nothing emotional dynamics in love. Connection becomes a site of profound transformation — which can be deeply healing or deeply destabilizing depending on the level of consciousness brought to it.',
    },
    12: {
      career:
        'Venus in your house of hidden things places your financial magnetism, creative talent, and professional appeal in the shadows. The gifts and skills that would most advance your career stay hidden — from self-doubt, unconscious self-sabotage, or simply not yet claiming what you\'re actually worth.',
      love:
        'Venus in your twelfth house creates a hidden love life — longing for connection that you\'re never quite willing to fully pursue, love that remains unrequited, or keeping your most attractive qualities in reserve for a moment of safety that never quite arrives.',
    },
  },
};

// ── C grade interpretation copy (Pillar 2 pressure-house transits) ────────────

const TRANSIT_C_INTERP: Record<string, Partial<Record<number, (year: number) => string>>> = {
  Pluto: {
    2: (y) =>
      `Pluto is transiting your financial house through ${y} — either a period of wealth destruction or profound financial transformation. Shadow path: obsessive, all-or-nothing financial behavior that creates as much scarcity as it resolves. Conscious path: using Pluto's transformative power to permanently upgrade your relationship with money, eliminating financial patterns that have been limiting you long before this transit.`,
    6: (y) =>
      `Pluto is transiting your work house through ${y}. Shadow: obsessive work patterns, power struggles with employees or clients, burning systems before they can produce results. Conscious path: fundamentally transforming how you work — eliminating the performative busyness and rebuilding your daily structure around your highest-power activities exclusively.`,
    8: (y) =>
      `Pluto is transiting your shared resources house through ${y}. Shadow: financial power struggles with partners, destructive cycles in joint ventures, all-or-nothing energy around other people's money. Conscious path: transforming your relationship with shared capital — becoming someone who can attract, manage, and multiply resources at a new level of mastery.`,
    11: (y) =>
      `Pluto is transiting your networks and goals house through ${y}. Shadow: power struggles in professional communities, destroying networks before they bear fruit. Conscious path: permanently upgrading your professional circle — releasing relationships that no longer serve your evolution and cultivating the deep, powerful alliances that can actually move your career forward.`,
  },
  Saturn: {
    2: (y) =>
      `Saturn is transiting your financial house through ${y} — a period that creates either a financial ceiling of your own making, or the most durable wealth foundation you've ever built. Shadow: scarcity mindset, self-worth blocks that cap income, restriction without reward. Conscious path: disciplined financial systems, charging your actual worth, and playing the long game. Saturn rewards the committed — the gate between paths is discipline without self-punishment.`,
    6: (y) =>
      `Saturn is transiting your work house through ${y}. Shadow: burnout from overwork, chronic underrecognition despite output, perfectionism that stalls more than it improves. Conscious path: building the most efficient, disciplined daily work structure you've ever had — identifying the 20% of effort that produces 80% of results and ruthlessly focusing there.`,
    8: (y) =>
      `Saturn is in your shared resources house through ${y}. Shadow: blocked access to capital and financial partnerships, fear of financial dependency keeping you isolated from investment that could scale your work. Conscious path: building structured, trustworthy financial partnerships with clear agreements — the kind that attract serious investors because the rigor you bring signals reliability.`,
    11: (y) =>
      `Saturn is in your networks house through ${y}. Shadow: social isolation, feeling locked out of the communities that matter for your goals. Conscious path: building fewer but far more solid professional relationships — depth over breadth, quality over surface networking. Saturn rewards the ones who invest in real alliance.`,
  },
  Uranus: {
    2: (y) =>
      `Uranus is disrupting your financial house through ${y}. Shadow: erratic income cycles, impulsive financial decisions, chronic inability to accumulate wealth as money patterns destabilize just as they form. Conscious path: becoming Uranian in your income approach — innovating revenue streams, monetizing your unconventional thinking, and accepting that your financial life will never look traditional — nor should it. Uranus in the 2nd doesn't reward conventional income strategies; it rewards innovation.`,
    6: (y) =>
      `Uranus is disrupting your daily work routines through ${y}. Shadow: inconsistent output, rebellion against structure that reads as unreliability. Conscious path: innovating how you work — rejecting standard procedures that waste your time and building work systems around your unique intelligence that would look chaotic to others but produce exceptional results for you.`,
    8: (y) =>
      `Uranus is disrupting your shared resources house through ${y}. Shadow: volatile business partnerships, sudden losses from joint ventures. Conscious path: pioneering unconventional approaches to financial partnerships — attracting Uranian investors and collaborators who match your visionary energy and co-creating innovative financial structures that conventional partnerships cannot access.`,
    11: (y) =>
      `Uranus is disrupting your networks and goals house through ${y}. Shadow: unstable communities, sudden loss of allies, chaotic group dynamics. Conscious path: leading the disruption — becoming the visionary within your field whose unconventional ideas attract other innovators and reshape the communities you're part of toward something genuinely new.`,
  },
  Neptune: {
    2: (y) =>
      `Neptune is transiting your financial house through ${y}. Shadow: chronic confusion around money — unclear rates, boundary violations in financial agreements, self-deception about the true state of your finances. Conscious path: aligning your income with your deepest values and creative vision, charging what your work is genuinely worth from a place of spiritual clarity about what you offer and what it's actually worth in the world.`,
    6: (y) =>
      `Neptune is in your work house through ${y}. Shadow: unclear work responsibilities, fuzzy boundaries with collaborators, escapism from practical demands. Conscious path: infusing your daily work with creative vision and genuine meaning — letting Neptune lift your output from transaction to mission, making the quality of your work a direct expression of your highest self.`,
    8: (y) =>
      `Neptune is in your shared resources house through ${y}. Shadow: financial confusion and potential deception in partnerships. Conscious path: building partnerships based on genuine alignment of values, with eyes-open clarity about what each party is actually contributing and receiving.`,
    11: (y) =>
      `Neptune is in your networks and dreams house through ${y}. Shadow: idealizing what your community could be, followed by disillusionment when reality falls short. Conscious path: building community around genuine shared purpose — using Neptune's transcendent energy to inspire others toward a vision they couldn't see without you.`,
  },
};

// ── C grade interpretation copy (Pillar 3 relocation pressure-house) ─────────

const RELOCATION_C_INTERP: Record<string, Partial<Record<number, (goal: GoalCategory) => string>>> = {
  Saturn: {
    2: (goal) =>
      `Saturn in your financial house at this location creates a persistent ceiling on your ${goal === 'love' ? 'emotional and relationship resources' : 'income and financial momentum'}. Shadow: chronic scarcity consciousness, under-charging, financial avoidance that limits what you allow yourself to build. Conscious path: using Saturn's discipline to construct the most durable financial foundation of your life — this location rewards the committed builder who shows up consistently.`,
    6: (_goal) =>
      `Saturn in your work house at this location adds a heavy, grinding quality to your daily effort and productivity. Shadow: burnout, overwork without commensurate reward, perfectionism that stalls more than it sharpens. Conscious path: building an exceptionally disciplined daily structure here — Saturn at this address rewards those who systematize their work down to what actually produces results and release the rest.`,
    8: (goal) =>
      `Saturn in your shared resources house at this location creates friction around financial partnerships, investment, and access to outside capital. Shadow: isolation from the collaborative financial opportunities that could scale your ${goal === 'love' ? 'life' : 'work'}. Conscious path: building structured, trustworthy financial agreements from this address — the rigor and seriousness you bring to partnerships here signals reliability that attracts serious collaborators.`,
    11: (goal) =>
      `Saturn in your networks house at this location creates social contraction — the professional and community connections that advance your ${goal === 'love' ? 'love life' : 'career'} feel harder to build and maintain here. Shadow: isolation and missed opportunity through over-selectivity. Conscious path: investing in depth over breadth — this location rewards the alliances you cultivate with real discipline and long-term consistency.`,
  },
  Uranus: {
    2: (_goal) =>
      `Uranus in your financial house at this location amplifies erratic income patterns — financial breakthroughs followed by sudden losses, inconsistent cash flow, and an environment that resists conventional wealth-building approaches. Shadow: impulsive financial decisions made in the volatility this address generates. Conscious path: innovating your income architecture from here — this location rewards unconventional revenue strategies and penalizes traditional ones.`,
    6: (_goal) =>
      `Uranus in your work house at this location creates a disruptive, unpredictable daily work environment. Shadow: inconsistent output and resistance to routine that reads as unreliability to the people you work with. Conscious path: building nonconventional work systems around your unique intelligence — this location amplifies creative disruption in your process that can produce breakthrough results when channeled rather than resisted.`,
    8: (_goal) =>
      `Uranus in your shared resources house at this location creates volatile energy around financial partnerships and joint ventures. Shadow: sudden breakdowns in collaborative agreements, unpredictable access to outside capital. Conscious path: pioneering unconventional financial structures from this address — Uranus here rewards the innovator willing to reshape what partnership and shared capital can look like.`,
    11: (goal) =>
      `Uranus in your networks house at this location creates unstable professional and social communities around you. Shadow: sudden loss of key alliances and chaotic group dynamics that undermine your ${goal === 'love' ? 'social foundation' : 'professional goals'}. Conscious path: leading the disruption in your field from this address — Uranus here amplifies your ability to build visionary communities that don't yet exist elsewhere.`,
  },
  Neptune: {
    2: (goal) =>
      `Neptune in your financial house at this location creates a foggy relationship with money and ${goal === 'love' ? 'emotional resources' : 'income clarity'}. Shadow: unclear financial boundaries, self-deception about your true financial state, chronic undercharging for your work. Conscious path: aligning your income with genuine creative and spiritual purpose from this address — Neptune here rewards work that carries real meaning and is priced with clarity about its actual worth.`,
    6: (_goal) =>
      `Neptune in your work house at this location blurs your work responsibilities and daily structure. Shadow: unclear boundaries with collaborators, escapism from practical demands, difficulty bringing inspired ideas into executable form. Conscious path: infusing your daily work with genuine vision and creative depth — this location amplifies inspired output when you bring spiritual clarity and practical discipline to your process simultaneously.`,
    8: (_goal) =>
      `Neptune in your shared resources house at this location creates foggy energy around financial partnerships and joint capital. Shadow: potential deception or self-deception in financial agreements, confusion about what each party is actually contributing and receiving. Conscious path: building partnerships grounded in deep alignment of values and fully transparent agreements from this address.`,
    11: (_goal) =>
      `Neptune in your networks house at this location blurs your professional communities and goal clarity. Shadow: idealizing communities that eventually disappoint, diffuse goals that never fully crystallize into action. Conscious path: building community around transcendent shared purpose from here — Neptune amplifies your ability to inspire others toward a vision they couldn't articulate on their own.`,
  },
  Pluto: {
    2: (goal) =>
      `Pluto in your financial house at this location amplifies all-or-nothing energy around money and ${goal === 'love' ? 'emotional security' : 'income'}. Shadow: obsessive financial patterns, power struggles around resources, destroying financial stability as it forms. Conscious path: using Pluto's transformative force at this address to permanently upgrade your relationship with money — not just increase it, but fundamentally change the pattern underneath.`,
    6: (_goal) =>
      `Pluto in your work house at this location intensifies power dynamics and obsessive patterns in your daily work environment. Shadow: burnout from relentless drive, power struggles with collaborators that destroy productive relationships. Conscious path: using this location's intensity to fundamentally transform how you work — eliminating what burns you out and rebuilding around your true highest-power contributions exclusively.`,
    8: (_goal) =>
      `Pluto in your shared resources house at this location creates intense power dynamics around financial partnerships and joint capital. Shadow: controlling or being controlled in financial agreements, all-or-nothing energy that collapses partnerships. Conscious path: transforming your relationship with shared resources from here — using Pluto's depth to build financial structures based on genuine power alignment rather than domination.`,
    11: (_goal) =>
      `Pluto in your networks house at this location creates power dynamics within your professional communities and goal structures. Shadow: power struggles that destroy valuable alliances before they bear fruit. Conscious path: using Pluto's transformative force to permanently upgrade your professional circle from this address — releasing what's limiting you and pulling in the powerful alliances that can actually move you forward.`,
  },
};

// ── Address interpretation ────────────────────────────────────────────────────

const ADDRESS_THEMES: Partial<Record<number, string>> = {
  1: 'independence, initiation, and self-leadership',
  2: 'cooperation, partnership, and emotional harmony',
  3: 'creative expression, social energy, and scattered focus',
  4: 'structure, discipline, and foundational stability',
  5: 'freedom, change, and restless expansion',
  6: 'responsibility, care, and family obligation',
  7: 'reflection, analysis, and inner mastery',
  8: 'material power, ambition, and financial intensity',
  9: 'completion, release, and universal service',
  11: 'spiritual illumination, heightened intuition, and inspired vision',
};

export function getAddressInterpretation(item: GradeItem, goal: GoalCategory): string {
  const numMatch = item.source.match(/:\s*(\d+)/);
  const num = numMatch ? parseInt(numMatch[1]) : null;
  const theme = num !== null ? (ADDRESS_THEMES[num] ?? 'neutral energy') : 'neutral energy';
  const gw = goal === 'love' ? 'relationship goals' : 'career and financial goals';

  if (item.grade === 'F') {
    if (num === 3) return `Your address vibrates at 3 — scattered creative energy that dissipates the focused momentum your ${gw} require. This environment tends to amplify social distraction and creative overwhelm rather than producing the goal-oriented action you need right now.`;
    if (num === 6) return `Your address vibrates at 6 — a heavy responsibility and family-service energy that persistently pulls your attention toward others' needs. This environment actively works against the self-focused drive that advancing your ${gw} requires.`;
    if (num === 8) return `Your address vibrates at 8 — intense material pressure and power dynamics that create a constant undercurrent of financial stress and striving. The 8 environment demands you prove your worthiness for abundance at every turn, creating an exhausting context for pursuing your ${gw}.`;
    if (num === 9) return `Your address vibrates at 9 — a completion and dissolution energy that subtly works against building and sustaining. For someone working toward ${gw}, a 9 address creates an environment that encourages release over accumulation, endings over new beginnings.`;
    return `Your address number ${num ?? '—'} (${theme}) is creating environmental friction that directly affects your ${gw}. The numerological pressure here works against the stable, forward-moving energy you need.`;
  }

  if (item.grade === 'C') {
    if (num === 1) return `Your address vibrates at 1 — the number of independence and self-initiation. For ${gw}, this environment can either reinforce isolation (going it alone when collaboration would accelerate your path) or serve as the perfect launchpad for bold new moves. The 1 amplifies individual will — the question is whether that will is directed consciously.`;
    if (num === 4) return `Your address vibrates at 4 — structure, limitation, and foundational work. This creates a disciplined environment that either locks you into rigid, limiting patterns or provides the stable foundation from which to build something lasting. The 4 rewards those who show up consistently and do the unsexy work.`;
    if (num === 5) return `Your address vibrates at 5 — freedom, change, and restless movement. The 5 address either scatters your focus through constant change and stimulation, or provides the dynamic environment that keeps your creative energy alive for your ${gw}. The 5 amplifies whatever frequency you bring to it.`;
    return `Your address number ${num ?? '—'} (${theme}) creates a neutral-to-challenging environment for your ${gw}. Whether it supports or hinders depends on how consciously you engage with the themes it carries.`;
  }

  if (item.grade === 'A') {
    if (num === 2) return `Your address vibrates at 2 — a cooperative, harmonious frequency that creates natural ease in your environment. This is one of the most favorable address energies for your ${gw}, facilitating the collaboration, emotional balance, and sustained effort that long-term success requires.`;
    if (num === 7) return `Your address vibrates at 7 — a reflective, analytical frequency that supports deep inner work, strategic clarity, and genuine mastery. The 7 environment is excellent for the focused thinking and inner refinement that advancing your ${gw} requires.`;
    if (num === 11) return `Your address vibrates at 11 — the master number of spiritual illumination and heightened intuition. This is an exceptionally supportive address frequency for your ${gw}, providing the inspired clarity and intuitive guidance needed to navigate toward your highest outcomes.`;
    return `Your address number ${num ?? '—'} (${theme}) creates a genuinely supportive environment for your ${gw}. The energy here works in your favor.`;
  }

  return `Your address (${theme}) has a neutral environmental impact relative to your ${gw}.`;
}

// ── Life Cycle interpretation ─────────────────────────────────────────────────

export function getLifeCycleInterpretation(item: GradeItem): string {
  if (item.grade === 'F') {
    return `Your current personal year carries a heavy numerological charge — a cycle associated with pressure, intensity, and karmic reckoning. This is a year where the universe tends to surface what needs to be faced rather than supporting what you're trying to build. Pushing hard against this cycle tends to amplify resistance; moving through what it's forcing you to confront is how you generate real forward motion.`;
  }
  if (item.grade === 'A') {
    return `Your current personal year is a highly supportive numerological cycle — associated with positive movement, change, and the manifestation of long-held intentions. The energetic conditions this year actively work in your favor.`;
  }
  return `Your current personal year carries a neutral numerological charge — neither actively supportive nor creating significant resistance. The direction is yours to set.`;
}

// ── Fallback copy (for combos not in the lookup) ─────────────────────────────

const PLANET_BRIEF: Record<string, string> = {
  Pluto: 'power and transformation',
  Saturn: 'restriction and delay',
  Uranus: 'disruption and instability',
  Mars: 'aggression and impulsivity',
  Neptune: 'confusion and illusion',
};
const HOUSE_BRIEF: Partial<Record<number, string>> = {
  1: 'identity and self-presentation',
  2: 'income and financial security',
  5: 'romance and creative expression',
  6: 'work, daily productivity, and money',
  7: 'committed relationships and marriage',
  8: 'shared resources, money, and transformation',
  10: 'career, money, reputation, and public standing',
  11: 'networks, goals, and community',
};

function fallbackF(planet: string, house: number, goal: GoalCategory): string {
  const pt = PLANET_BRIEF[planet] ?? 'challenging planetary energy';
  const ht = HOUSE_BRIEF[house] ?? `house ${house}`;
  const g = goal === 'love' ? 'love and relationship goals' : 'career and financial goals';
  return `${planet}'s energy of ${pt} in your ${ht} house creates persistent pressure on your ${g}. Until this energy is consciously mastered, it acts as a recurring drag on the progress you're working toward.`;
}

function fallbackC(planet: string, house: number, goal: GoalCategory, dur: string): string {
  const pt = PLANET_BRIEF[planet] ?? 'challenging planetary energy';
  const ht = HOUSE_BRIEF[house] ?? `house ${house}`;
  const g = goal === 'love' ? 'love and relationship goals' : 'career and financial goals';
  return `${planet}'s ${pt} energy is in your ${ht} house${dur ? ` ${dur}` : ''} — a pressure that can go either way for your ${g}. Shadow path: self-sabotage in this area that confirms the pattern. Conscious path: channeling ${planet}'s energy at its highest expression to break through the very limitation it represents.`;
}

// ── Main interpretation dispatcher ───────────────────────────────────────────

export function getItemInterpretation(
  item: GradeItem,
  goal: GoalCategory,
  transits: PlanetaryTransit[]
): string {
  if (item.section === 'Address') return getAddressInterpretation(item, goal);
  if (item.section === 'Life Cycle') return getLifeCycleInterpretation(item);

  const { planet, house, grade, pillar } = item;
  if (!planet || !house) return item.reason;

  const endYear = pillar === 2 ? getTransitEndYear(planet, transits) : null;
  const durStr = endYear ? formatDuration(endYear) : '';

  // C grade from Pillar 2 pressure houses
  if (pillar === 2 && grade === 'C') {
    const fn = TRANSIT_C_INTERP[planet]?.[house];
    if (fn && endYear) return fn(endYear);
    return fallbackC(planet, house, goal, durStr);
  }

  // C grade from Pillar 3 relocation pressure houses
  if (pillar === 3 && grade === 'C') {
    const fn = RELOCATION_C_INTERP[planet]?.[house];
    if (fn) return fn(goal);
    return fallbackC(planet, house, goal, '');
  }

  // F grade (natal, relocation, or transit-angular)
  if (grade === 'F') {
    const interp = F_INTERP[planet]?.[house];
    const text = interp ? (goal === 'love' ? interp.love : interp.career) : fallbackF(planet, house, goal);
    return endYear ? `${text} This transit runs ${durStr}.` : text;
  }

  return item.reason;
}
