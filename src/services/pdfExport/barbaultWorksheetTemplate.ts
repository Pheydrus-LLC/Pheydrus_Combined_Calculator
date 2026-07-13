/**
 * PDF template for the Once-In-A-Century Wealth & Identity Upgrade worksheet.
 * Builds one HTML string covering all 5 transits for the selected rising sign,
 * including whatever the user typed into the reflection/commitment fields.
 */

import {
  BARBAULT_TRANSITS_2026,
  BARBAULT_CONTENT_2026,
  getHouseForSign,
  renderTransitHouseWheel,
  type TransitId,
  type RisingSign,
} from '../../data/barbault2026';

const PLAYFAIR = "'Playfair Display', Georgia, serif";
const INTER = "'Inter', Arial, sans-serif";
const ACCENT = '#2F6FED';
const DARK_BG = '#03060D';
const CARD_BG = '#0A0F1C';
const HEADING_TEXT = '#FFFFFF';
const BODY_TEXT = '#E7EAF2';
const MUTED_TEXT = '#8B93A7';
const HEADER_IMAGE = '/images/once-in-a-century-header.jpg';

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c] ?? c
  );
}

interface TransitAnswers {
  q1: string;
  q2: string;
  commitment: string;
}

function answerBlock(label: string, value: string): string {
  return `
    <div style="margin-bottom:14px;">
      <p style="font-family:${INTER};font-size:11px;color:${MUTED_TEXT};margin:0 0 4px;">${esc(label)}</p>
      <p style="font-family:${INTER};font-size:12px;color:${HEADING_TEXT};margin:0;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:6px;min-height:16px;">${esc(value || '')}</p>
    </div>`;
}

function contentBlock(heading: string, text: string): string {
  return `
    <div style="margin-bottom:16px;">
      <p style="font-family:${PLAYFAIR};font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${ACCENT};margin:0 0 5px;">${esc(heading)}</p>
      <p style="font-family:${INTER};font-size:12px;line-height:1.6;color:${BODY_TEXT};margin:0;">${esc(text)}</p>
    </div>`;
}

export function generateBarbaultWorksheetTemplate(
  risingSign: RisingSign,
  answers: Record<TransitId, TransitAnswers>
): string {
  const transitSections = BARBAULT_TRANSITS_2026.map((transit) => {
    const content = BARBAULT_CONTENT_2026[transit.id][risingSign];
    const a = answers[transit.id] ?? { q1: '', q2: '', commitment: '' };
    const activations = transit.placements.map((p) => ({
      house: getHouseForSign(p.sign, risingSign),
      planet: p.planet,
    }));
    const placementsLine = transit.placements
      .map((p) => `${p.planet} in ${p.sign} → House ${getHouseForSign(p.sign, risingSign)}`)
      .join('  •  ');
    const wheelSvg = renderTransitHouseWheel(activations, 130);

    return `
      <div style="background:${CARD_BG};border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:20px;page-break-inside:avoid;">
        <h2 style="font-family:${PLAYFAIR};font-size:20px;font-weight:700;color:${HEADING_TEXT};margin:0 0 4px;">${esc(transit.title)}</h2>
        <p style="font-family:${INTER};font-size:11px;color:${ACCENT};margin:0 0 3px;">${esc(transit.aspectSummary)}</p>
        <p style="font-family:${INTER};font-size:11px;color:${MUTED_TEXT};margin:0 0 18px;">${esc(placementsLine)}</p>

        <div style="display:flex;gap:20px;">
          <div style="flex:0 0 auto;">${wheelSvg}</div>
          <div style="flex:1 1 auto;min-width:0;">
            ${contentBlock('The Shift + Your Houses 🌌', content.shiftAndHouses)}
            ${contentBlock('Identity Shift 🪞', content.identityShift)}
            ${contentBlock('Wealth Channel 💰', content.wealthChannel)}
            ${contentBlock('Bottomline 🔥', content.transformation)}
          </div>
        </div>

        <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:16px;padding-top:16px;">
          <p style="font-family:${PLAYFAIR};font-size:20px;font-weight:700;color:${HEADING_TEXT};margin:0 0 10px;">Reflection ✏️</p>
          ${answerBlock(transit.reflectionQuestions[0], a.q1)}
          ${answerBlock(transit.reflectionQuestions[1], a.q2)}
          ${answerBlock(transit.actionPrompt, a.commitment)}
        </div>
      </div>`;
  }).join('\n');

  return `
    <div style="background:${DARK_BG};padding:32px;font-family:${INTER};">
      <div style="border-radius:14px;overflow:hidden;margin-bottom:24px;">
        <img src="${HEADER_IMAGE}" alt="Outer Planets 2.0" style="display:block;width:100%;height:auto;max-height:280px;object-fit:cover;" />
      </div>
      <div style="text-align:center;margin-bottom:32px;">
        <p style="font-family:${PLAYFAIR};font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:${ACCENT};margin:0 0 10px;">Pheydrus</p>
        <h1 style="font-family:${PLAYFAIR};font-size:28px;font-weight:700;color:${HEADING_TEXT};margin:0 0 6px;">Once-In-A-Century Wealth &amp; Identity Upgrade</h1>
        <p style="font-family:${INTER};font-size:12px;color:${MUTED_TEXT};margin:0;">${esc(risingSign)} Rising</p>
      </div>
      ${transitSections}
    </div>`;
}

export function generateBarbaultWorksheetFilename(risingSign: RisingSign): string {
  return `Barbault-Configurations-2026-${risingSign}-Worksheet.pdf`;
}
