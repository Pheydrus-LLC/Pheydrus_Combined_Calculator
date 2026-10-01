/**
 * One card of the Pillar Repair Kit: a pillar's free resources, tinted in that
 * pillar's Venn-diagram colour. Used by the report and the book.
 */

import type { ResourceCard } from '../../data/freeResources';

const CORMORANT = "'Cormorant Garamond', Georgia, serif";
const INTER = "'Inter', Arial, sans-serif";

const FREE_GREEN = '#1E7B45';

// Pillar colours match the three circles of the Venn diagram.
const RESOURCE_CARD_THEME: Record<
 1 | 2 | 3,
 { background: string; border: string; accent: string; button: string; buttonText: string }
> = {
 1: { background: 'rgba(201,168,76,0.12)', border: 'rgba(212,168,67,0.45)', accent: '#E8C46A', button: '#C9A84C', buttonText: '#0C1128' },
 2: { background: 'rgba(123,94,167,0.18)', border: 'rgba(184,168,224,0.45)', accent: '#C0B0F0', button: '#7B5EA7', buttonText: '#fff' },
 3: { background: 'rgba(46,139,122,0.16)', border: 'rgba(126,207,196,0.45)', accent: '#7ECFC4', button: '#2E8B7A', buttonText: '#fff' },
};

export function ResourceCardBox({ card }: { card: ResourceCard }) {
 const t = RESOURCE_CARD_THEME[card.pillar];
 return (
 <div
 data-print-card
 style={{
 background: t.background,
 border: `1px solid ${t.border}`,
 borderRadius: '4px',
 padding: '16px 18px',
 }}
 >
 <div
 style={{
 fontSize: '10px',
 textTransform: 'uppercase',
 letterSpacing: '0.08em',
 color: t.accent,
 fontWeight: 700,
 fontFamily: INTER,
 marginBottom: '6px',
 }}
 >
 {card.label}
 </div>
 {card.resources.map((resource, i) => (
 <div
 key={resource.link}
 style={
 i > 0
 ? { marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${t.border}` }
 : undefined
 }
 >
 <div
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: '8px',
 flexWrap: 'wrap' as const,
 marginBottom: '4px',
 }}
 >
 <span
 style={{
 fontFamily: CORMORANT,
 fontSize: '1.2rem',
 fontWeight: 700,
 color: '#E8DEFF',
 }}
 >
 {resource.title}
 </span>
 <span
 style={{
 fontSize: '9px',
 fontWeight: 700,
 letterSpacing: '0.08em',
 color: '#fff',
 background: FREE_GREEN,
 padding: '1px 6px',
 borderRadius: '2px',
 fontFamily: INTER,
 }}
 >
 FREE
 </span>
 </div>
 <p
 style={{
 margin: '0 0 10px',
 fontSize: '0.8rem',
 color: '#DDD8F8',
 lineHeight: 1.6,
 fontFamily: INTER,
 }}
 >
 {resource.description}
 </p>
 {resource.code && (
 <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#DDD8F8', fontFamily: INTER }}>
 Use code{' '}
 <strong
 style={{
 color: t.accent,
 border: `1px dashed ${t.accent}`,
 padding: '1px 6px',
 borderRadius: '2px',
 letterSpacing: '0.05em',
 }}
 >
 {resource.code}
 </strong>{' '}
 at checkout for <strong>100% off</strong>.
 </p>
 )}
 <a
 href={resource.link}
 target="_blank"
 rel="noopener noreferrer"
 style={{
 display: 'inline-block',
 padding: '8px 16px',
 background: t.button,
 color: t.buttonText,
 fontWeight: 700,
 fontSize: '0.72rem',
 letterSpacing: '0.08em',
 textTransform: 'uppercase',
 textDecoration: 'none',
 borderRadius: '2px',
 fontFamily: INTER,
 }}
 >
 {resource.cta}
 </a>
 </div>
 ))}
 </div>
 );
}
