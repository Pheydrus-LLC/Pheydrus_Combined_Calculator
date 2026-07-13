/**
 * House wheel SVG for the Barbault 2026 worksheet — highlights the 1-2 houses
 * a transit activates for the selected rising sign, with the planet glyph
 * placed in each activated segment. Pure string generator, reused by both the
 * live React page (via dangerouslySetInnerHTML) and the PDF template.
 */

const PLANET_GLYPH: Record<string, string> = {
  Neptune: '♆',
  Pluto: '♇',
  Jupiter: '♃',
  Uranus: '♅',
  'North Node': '☊',
  'South Node': '☋',
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function apt(cx: number, cy: number, r: number, deg: number): [number, number] {
  return [cx + r * Math.cos(toRad(deg)), cy + r * Math.sin(toRad(deg))];
}

export interface HouseActivation {
  house: number;
  planet: string;
}

export function renderTransitHouseWheel(activations: HouseActivation[], size = 150): string {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.24;
  const numberR = size * 0.34;
  const glyphR = size * 0.4;

  const ACCENT = '#2F6FED';
  const ACCENT_FILL = 'rgba(47,111,237,0.28)';
  const NEUTRAL_FILL = '#0A0F1C';
  const NEUTRAL_STROKE = 'rgba(255,255,255,0.12)';
  const TEXT_WHITE = '#FFFFFF';
  const TEXT_MUTED = '#6E7690';

  const houseMap = new Map<number, string[]>();
  for (const { house, planet } of activations) {
    const arr = houseMap.get(house) ?? [];
    arr.push(planet);
    houseMap.set(house, arr);
  }

  const segments: string[] = [];
  for (let i = 0; i < 12; i++) {
    const h = i + 1;
    const startDeg = 180 - i * 30;
    const endDeg = startDeg - 30;
    const isActive = houseMap.has(h);
    const fill = isActive ? ACCENT_FILL : NEUTRAL_FILL;
    const stroke = isActive ? ACCENT : NEUTRAL_STROKE;

    const [x1, y1] = apt(cx, cy, outerR, startDeg);
    const [x2, y2] = apt(cx, cy, outerR, endDeg);
    const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 0 0 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    const midDeg = startDeg - 15;
    const [nx, ny] = apt(cx, cy, numberR, midDeg);
    const numberColor = isActive ? TEXT_WHITE : TEXT_MUTED;
    const numberWeight = isActive ? '700' : '400';

    segments.push(
      `<path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>` +
        `<text x="${nx.toFixed(1)}" y="${(ny + 3).toFixed(1)}" text-anchor="middle" font-size="${(
          size * 0.07
        ).toFixed(1)}" fill="${numberColor}" font-weight="${numberWeight}" font-family="Arial,sans-serif">${h}</text>`
    );

    if (isActive) {
      const planets = houseMap.get(h)!;
      const glyphs = planets.map((p) => PLANET_GLYPH[p] ?? p[0]).join(' ');
      const [gx, gy] = apt(cx, cy, glyphR, midDeg);
      segments.push(
        `<text x="${gx.toFixed(1)}" y="${(gy + 4).toFixed(1)}" text-anchor="middle" font-size="${(
          size * 0.11
        ).toFixed(1)}" fill="${ACCENT}" font-weight="700" font-family="Arial,sans-serif">${glyphs}</text>`
      );
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    ${segments.join('\n    ')}
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${innerR.toFixed(2)}" fill="${NEUTRAL_FILL}" stroke="${NEUTRAL_STROKE}" stroke-width="1"/>
  </svg>`;
}
