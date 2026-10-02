/** The three-pillar Venn diagram (Identity / Timing / Environment). Used by the report and the book. */

export function VennDiagram({ width = 200 }: { width?: number }) {
 return (
 <svg width={width} height={Math.round((width * 188) / 200)} viewBox="0 0 200 188" xmlns="http://www.w3.org/2000/svg">
 <circle
 cx="100"
 cy="68"
 r="58"
 fill="#C9A84C"
 fillOpacity="0.18"
 stroke="#D4A843"
 strokeWidth="1.5"
 />
 <circle
 cx="67"
 cy="127"
 r="58"
 fill="#7B5EA7"
 fillOpacity="0.18"
 stroke="#B8A8E0"
 strokeWidth="1.5"
 />
 <circle
 cx="133"
 cy="127"
 r="58"
 fill="#2E8B7A"
 fillOpacity="0.18"
 stroke="#7ECFC4"
 strokeWidth="1.5"
 />
 <text x="100" y="23" textAnchor="middle" fontSize="12" fill="#E8C46A" fontFamily="'Cormorant Garamond',Georgia,serif" fontWeight="600">Identity /</text>
 <text x="100" y="36" textAnchor="middle" fontSize="12" fill="#E8C46A" fontFamily="'Cormorant Garamond',Georgia,serif" fontWeight="600">Personality</text>
 <text x="100" y="49" textAnchor="middle" fontSize="9" fill="#C0B4E0" fontFamily="Arial,sans-serif">Pillar 1</text>
 <text x="43" y="162" textAnchor="middle" fontSize="12" fill="#C0B0F0" fontFamily="'Cormorant Garamond',Georgia,serif" fontWeight="600">Timing</text>
 <text x="43" y="174" textAnchor="middle" fontSize="9" fill="#C0B4E0" fontFamily="Arial,sans-serif">Pillar 2</text>
 <text x="148" y="162" textAnchor="middle" fontSize="10" fill="#7ECFC4" fontFamily="'Cormorant Garamond',Georgia,serif" fontWeight="600">Environment</text>
 <text x="148" y="174" textAnchor="middle" fontSize="9" fill="#C0B4E0" fontFamily="Arial,sans-serif">Pillar 3</text>
 <text x="100" y="110" textAnchor="middle" fontSize="11" fill="#E8DEFF" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic">Full</text>
 <text x="100" y="123" textAnchor="middle" fontSize="11" fill="#E8DEFF" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic">Alignment</text>
 </svg>
 );
}
