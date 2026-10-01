/**
 * Colour rules that turn the dark web report into the light printout.
 *
 * The report is styled for a navy background. For print, dark surfaces become
 * near-white, light text becomes dark, and accent colours (gold, red, green,
 * pillar colours) keep their hue — deepened only where they're used as text,
 * so they stay readable on white.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

const COLOR_RE = /rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b/g;

/** The report's navy surfaces sit below this lightness; accent fills (green tags, gold buttons) sit above it */
export const DARK_SURFACE_LIGHTNESS = 0.2;

export function parseColor(input: string): RGBA | null {
  const s = input.trim();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const rgb = s.match(/^rgba?\(([^)]*)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  const hex = s.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  return null;
}

export function toCss({ r, g, b, a }: RGBA): string {
  const round = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  return a >= 1
    ? `rgb(${round(r)}, ${round(g)}, ${round(b)})`
    : `rgba(${round(r)}, ${round(g)}, ${round(b)}, ${Math.round(a * 1000) / 1000})`;
}

function toHsl({ r, g, b }: RGBA): HSL {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R ? ((G - B) / d + (G < B ? 6 : 0)) / 6 : max === G ? ((B - R) / d + 2) / 6 : ((R - G) / d + 4) / 6;
  return { h, s, l };
}

function fromHsl({ h, s, l }: HSL, a: number): RGBA {
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255, a };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return { r: hue(h + 1 / 3) * 255, g: hue(h) * 255, b: hue(h - 1 / 3) * 255, a };
}

/** HSL lightness 0–1 */
export function lightness(c: RGBA): number {
  return toHsl(c).l;
}

const invert = (c: RGBA): RGBA => {
  const hsl = toHsl(c);
  return fromHsl({ ...hsl, l: 1 - hsl.l }, c.a);
};

/**
 * Text and SVG text: light colours flip dark. Mid-tone accents (gold, which
 * reads well on navy) are deepened so they stay readable on white.
 */
export function lightText(c: RGBA): RGBA {
  const hsl = toHsl(c);
  if (hsl.l > 0.55) return invert(c);
  if (hsl.s > 0.3 && hsl.l > 0.4) return fromHsl({ ...hsl, l: 0.34 }, c.a);
  return c;
}

/**
 * Backgrounds. Opaque navy surfaces become near-white, keeping their order
 * (a card that sat lighter than the page stays lighter). Translucent neutral
 * washes (white at 10%, say) flip to dark washes; coloured tints and accent
 * fills (gold buttons, green tags) are kept as they are.
 */
export function lightSurface(c: RGBA): RGBA {
  if (c.a === 0) return c;
  const hsl = toHsl(c);
  if (c.a >= 0.9 && hsl.l < DARK_SURFACE_LIGHTNESS) {
    return fromHsl({ h: hsl.h, s: hsl.s * 0.25, l: 0.985 - (DARK_SURFACE_LIGHTNESS - hsl.l) * 0.1 }, 1);
  }
  if (c.a < 0.9 && hsl.s < 0.2) return invert(c);
  return c;
}

/** Borders and dividers: neutral lines (white at 10%, say) flip dark; coloured lines stay. */
export function lightBorder(c: RGBA): RGBA {
  return toHsl(c).s < 0.25 ? invert(c) : c;
}

/** SVG shapes (chart segments, circles): dark fills act as surfaces; everything else stays. */
export function lightShape(c: RGBA): RGBA {
  return lightness(c) < DARK_SURFACE_LIGHTNESS && c.a >= 0.9 ? lightSurface(c) : c;
}

/** Applies a colour rule to every colour inside a CSS value (gradients, shadows). */
export function mapColors(value: string, rule: (c: RGBA) => RGBA): string {
  return value.replace(COLOR_RE, (match) => {
    const c = parseColor(match);
    return c ? toCss(rule(c)) : match;
  });
}
