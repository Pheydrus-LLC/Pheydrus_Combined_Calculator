/**
 * The 12-house wheel shown beside each pillar in the client report: houses
 * shaded by their worst grade (F red, C yellow, A green). Returns an SVG string.
 * Drawn for a light background, so it prints as is in the light PDF too.
 */

import type { GradeItem } from '../models/diagnostic';

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function apt(cx: number, cy: number, r: number, deg: number): [number, number] {
  return [cx + r * Math.cos(toRad(deg)), cy + r * Math.sin(toRad(deg))];
}

export function renderHouseWheel(items: GradeItem[], size = 120): string {
 const cx = size / 2, cy = size / 2;
 const outerR = size * 0.44;
 const innerR = size * 0.22;
 const labelR = size * 0.34;

 const houseGrade: Record<number, string> = {};
 const priority: Record<string, number> = { Neutral: 0, A: 1, C: 2, F: 3 };
 for (const item of items) {
 if (!item.house) continue;
 const current = houseGrade[item.house] ?? 'Neutral';
 if ((priority[item.grade] ?? 0) > (priority[current] ?? 0)) {
 houseGrade[item.house] = item.grade;
 }
 }

 const FILL: Record<string, string> = { F: '#ef4444', C: '#fcd34d', A: '#6ee7b7' };

 const segments: string[] = [];
 for (let i = 0; i < 12; i++) {
 const h = i + 1;
 const startDeg = 180 - i * 30;
 const endDeg = startDeg - 30;
 const grade = houseGrade[h];
 const fill = grade ? (FILL[grade] ?? '#f3f4f6') : '#f3f4f6';
 const stroke = grade ? 'white' : '#e5e7eb';
 const [x1, y1] = apt(cx, cy, outerR, startDeg);
 const [x2, y2] = apt(cx, cy, outerR, endDeg);
 const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 0 0 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
 const midDeg = startDeg - 15;
 const [tx, ty] = apt(cx, cy, labelR, midDeg);
 const fw = grade ? '700' : '400';
 const fc = grade ? '#1f2937' : '#9ca3af';
 segments.push(
 `<path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
 `<text x="${tx.toFixed(1)}" y="${(ty + 3).toFixed(1)}" text-anchor="middle" font-size="7" fill="${fc}" font-weight="${fw}" font-family="Arial,sans-serif">${h}</text>`,
 );
 }

 return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
 ${segments.join('\n ')}
 <circle cx="${cx}" cy="${cy}" r="${innerR.toFixed(2)}" fill="white" stroke="#d1d5db" stroke-width="1"/>
 <text x="${cx}" y="${(cy + 4).toFixed(1)}" text-anchor="middle" font-size="6.5" fill="#9ca3af" font-family="Arial,sans-serif">Chart</text>
</svg>`;
}
