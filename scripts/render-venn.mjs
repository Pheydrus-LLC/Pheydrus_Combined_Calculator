/**
 * Renders the three-pillar Venn diagram to PNGs in public/images:
 * venn-dark.png for the navy web report and book, venn-light.png for the
 * cream PDF pages. As images, the labels can't reflow or spill out of their
 * circles when a page zooms or a font loads late.
 *
 * Needs the app's preview server for its fonts:
 *   npm run build && npx vite preview --port 4173
 *   node scripts/render-venn.mjs
 *
 * Fails, without writing, if any label's box isn't wholly inside its circle
 * (and, for the three pillar labels, clear of the other two circles).
 */

import puppeteer from 'puppeteer';

const SERVER = process.env.PREVIEW_URL ?? 'http://localhost:4173/';
const SCALE = 3;
const W = 240;
const H = 228;
const R = 70;
const CIRCLES = {
  top: { cx: 120, cy: 78 },
  left: { cx: 80, cy: 142 },
  right: { cx: 160, cy: 142 },
};

const THEMES = {
  dark: {
    fill: { top: '#C9A84C', left: '#7B5EA7', right: '#2E8B7A' },
    stroke: { top: '#D4A843', left: '#B8A8E0', right: '#7ECFC4' },
    label: { top: '#E8C46A', left: '#C0B0F0', right: '#7ECFC4' },
    pillar: '#C0B4E0',
    centre: '#E8DEFF',
  },
  light: {
    fill: { top: '#C9A84C', left: '#7B5EA7', right: '#2E8B7A' },
    stroke: { top: '#A8862E', left: '#7B66B8', right: '#3A9C8C' },
    label: { top: '#8B6914', left: '#5B4A9A', right: '#1F7A6C' },
    pillar: '#6A6290',
    centre: '#2A2238',
  },
};

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter', Arial, sans-serif";

/** Labels: text, position, style, and the circle(s) it must sit in */
const LABELS = [
  { text: 'Identity /', x: 120, y: 34, size: 13, color: 'top', in: ['top'], out: ['left', 'right'] },
  { text: 'Personality', x: 120, y: 48, size: 13, color: 'top', in: ['top'], out: ['left', 'right'] },
  { text: 'Pillar 1', x: 120, y: 61, size: 8.5, sans: true, color: 'pillar', in: ['top'], out: ['left', 'right'] },
  { text: 'Timing', x: 56, y: 172, size: 13, color: 'left', in: ['left'], out: ['top', 'right'] },
  { text: 'Pillar 2', x: 56, y: 184, size: 8.5, sans: true, color: 'pillar', in: ['left'], out: ['top', 'right'] },
  { text: 'Environment', x: 184, y: 172, size: 12, color: 'right', in: ['right'], out: ['top', 'left'] },
  { text: 'Pillar 3', x: 184, y: 184, size: 8.5, sans: true, color: 'pillar', in: ['right'], out: ['top', 'left'] },
  { text: 'Full', x: 120, y: 117, size: 10.5, italic: true, color: 'centre', in: ['top', 'left', 'right'], out: [] },
  { text: 'Alignment', x: 120, y: 129, size: 10.5, italic: true, color: 'centre', in: ['top', 'left', 'right'], out: [] },
];

function svg(theme) {
  const t = THEMES[theme];
  const circles = Object.entries(CIRCLES)
    .map(([k, c]) => `<circle cx="${c.cx}" cy="${c.cy}" r="${R}" fill="${t.fill[k]}" fill-opacity="0.18" stroke="${t.stroke[k]}" stroke-width="1.5"/>`)
    .join('');
  const labels = LABELS.map((l, i) => {
    const color = l.color === 'pillar' ? t.pillar : l.color === 'centre' ? t.centre : t.label[l.color];
    return `<text data-i="${i}" x="${l.x}" y="${l.y}" text-anchor="middle" font-size="${l.size}" fill="${color}" font-family="${l.sans ? SANS : SERIF}" font-weight="${l.sans ? 500 : l.italic ? 400 : 600}" ${l.italic ? 'font-style="italic"' : ''}>${l.text}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${circles}${labels}</svg>`;
}

const inside = (p, c) => Math.hypot(p.x - c.cx, p.y - c.cy) <= R - 2;
const outside = (p, c) => Math.hypot(p.x - c.cx, p.y - c.cy) >= R + 2;

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
await page.goto(SERVER, { waitUntil: 'networkidle0' });

const problems = [];
const shots = {};
for (const theme of Object.keys(THEMES)) {
  await page.evaluate((markup) => {
    document.head.insertAdjacentHTML('beforeend', '<style>html,body{margin:0;background:transparent!important}</style>');
    document.body.innerHTML = markup;
  }, svg(theme));
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load("600 13px 'Cormorant Garamond'"),
      document.fonts.load("italic 400 12px 'Cormorant Garamond'"),
      document.fonts.load("500 9px 'Inter'"),
    ]);
    await document.fonts.ready;
  });
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll('text')].map((el) => {
      const b = el.getBBox();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    }),
  );
  boxes.forEach((b, i) => {
    const l = LABELS[i];
    // Glyph boxes include line spacing; trim it so the check is on the letters themselves
    const top = b.y + b.h * 0.2;
    const bottom = b.y + b.h * 0.85;
    const corners = [
      { x: b.x, y: top },
      { x: b.x + b.w, y: top },
      { x: b.x, y: bottom },
      { x: b.x + b.w, y: bottom },
    ];
    for (const k of l.in) if (!corners.every((p) => inside(p, CIRCLES[k]))) problems.push(`${theme}: "${l.text}" pokes out of the ${k} circle`);
    for (const k of l.out) if (!corners.every((p) => outside(p, CIRCLES[k]))) problems.push(`${theme}: "${l.text}" runs into the ${k} circle`);
  });
  shots[theme] = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
}
await browser.close();

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
const { writeFileSync } = await import('node:fs');
for (const [theme, png] of Object.entries(shots)) writeFileSync(`public/images/venn-${theme}.png`, png);
console.log(`Wrote public/images/venn-dark.png and venn-light.png (${W * SCALE}×${H * SCALE}); every label sits inside its circle.`);
