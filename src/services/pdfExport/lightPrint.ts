/**
 * Light theme for printing the client report.
 *
 * Just before the browser prints, every element's colours are rewritten with
 * the rules in lightTheme.ts; right after, the original styles come back, so
 * the page on screen stays dark. Markers in the report:
 *   data-print="hide"        not printed (left alone)
 *   data-print-keep-colors   already drawn for a light background (house wheel)
 *   data-print-only / data-screen-only  swapped by the print styles in index.css
 *   data-wave-bar            voice note waveform bars, printed gold
 */

import {
  DARK_SURFACE_LIGHTNESS,
  lightBorder,
  lightShape,
  lightSurface,
  lightText,
  lightness,
  mapColors,
  parseColor,
  toCss,
} from './lightTheme';

const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const;

/** Whether text in this element sits on a navy surface (and so should flip dark). */
function onDarkSurface(el: Element, cache: Map<Element, boolean>): boolean {
  const cached = cache.get(el);
  if (cached !== undefined) return cached;
  const bg = parseColor(getComputedStyle(el).backgroundColor);
  const result =
    bg && bg.a >= 0.9
      ? lightness(bg) < DARK_SURFACE_LIGHTNESS
      : el.parentElement
        ? onDarkSurface(el.parentElement, cache)
        : true;
  cache.set(el, result);
  return result;
}

/** The light-theme colours for one element, worked out from its current (dark) styles. */
function lightStyles(el: Element, cache: Map<Element, boolean>): Array<[string, string]> {
  const cs = getComputedStyle(el);
  const out: Array<[string, string]> = [];

  const color = parseColor(cs.color);
  if (color) out.push(['color', toCss(onDarkSurface(el, cache) ? lightText(color) : color)]);

  const bg = parseColor(cs.backgroundColor);
  if (bg && bg.a > 0) out.push(['background-color', toCss(lightSurface(bg))]);
  if (cs.backgroundImage !== 'none') out.push(['background-image', mapColors(cs.backgroundImage, lightSurface)]);

  for (const side of BORDER_SIDES) {
    if (parseFloat(cs.getPropertyValue(`border-${side}-width`)) > 0) {
      const b = parseColor(cs.getPropertyValue(`border-${side}-color`));
      if (b) out.push([`border-${side}-color`, toCss(lightBorder(b))]);
    }
  }
  if (cs.boxShadow !== 'none') out.push(['box-shadow', mapColors(cs.boxShadow, lightBorder)]);

  if (el instanceof SVGElement) {
    const isText = el.tagName === 'text' || el.tagName === 'tspan';
    const fill = parseColor(cs.fill);
    if (fill && cs.fill !== 'none') out.push(['fill', toCss(isText ? lightText(fill) : lightShape(fill))]);
    const stroke = parseColor(cs.stroke);
    if (stroke && cs.stroke !== 'none') out.push(['stroke', toCss(lightBorder(stroke))]);
  }
  return out;
}

/** Switches the report to light colours for printing. Returns a function that switches it back. */
export function applyLightPrintTheme(root: HTMLElement): () => void {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement | SVGElement>('*'))].filter(
    (el) => !el.closest('[data-print="hide"], [data-print-keep-colors]'),
  );

  // Work out every new colour first: changing a parent would change what its children read
  const cache = new Map<Element, boolean>();
  const plan = elements.map((el) => [el, lightStyles(el, cache)] as const);

  const originalStyles = new Map<Element, string | null>();
  for (const [el, styles] of plan) {
    originalStyles.set(el, el.getAttribute('style'));
    for (const [prop, value] of styles) el.style.setProperty(prop, value);
  }

  root.querySelectorAll<HTMLElement>('[data-wave-bar]').forEach((bar) => {
    bar.style.setProperty('background-color', '#C9A84C');
    bar.style.setProperty('opacity', '0.75');
  });

  return () => {
    originalStyles.forEach((style, el) => {
      if (style === null) el.removeAttribute('style');
      else el.setAttribute('style', style);
    });
  };
}
