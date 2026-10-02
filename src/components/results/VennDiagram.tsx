/**
 * The three-pillar Venn diagram (Identity / Timing / Environment). Used by the report and the book.
 * It's a fixed image (made by scripts/render-venn.mjs) so the labels stay inside their circles
 * whatever the page's zoom or fonts.
 */

const VENN_DARK = '/images/venn-dark.png';
const VENN_LIGHT = '/images/venn-light.png';
const VENN_ALT =
  'Venn diagram of three overlapping circles: Identity / Personality (Pillar 1), Timing (Pillar 2) and Environment (Pillar 3), with Full Alignment where all three meet';

export function VennDiagram({ width = 200, withPrintVersion = false }: { width?: number; withPrintVersion?: boolean }) {
  const height = Math.round((width * 228) / 240);
  const img = (src: string, attrs: Record<string, true>) => (
    <img src={src} alt={VENN_ALT} width={width} height={height} style={{ display: 'block', width: `${width}px`, maxWidth: '100%', height: 'auto', margin: '0 auto' }} {...attrs} />
  );
  // The report's saved PDF is cream, so it swaps in the light version
  return withPrintVersion ? (
    <>
      {img(VENN_DARK, { 'data-screen-only': true })}
      {img(VENN_LIGHT, { 'data-print-only': true })}
    </>
  ) : (
    img(VENN_DARK, {})
  );
}
