/**
 * Desktop book: two-page spreads with a CSS 3D page turn. Each "sheet" is one
 * leaf of paper with a page on each side (front = right-hand page, back = the
 * next left-hand page); turning flips the sheet over the spine. Only sheets
 * near the open spread render their pages, so long reports stay light.
 */

import { useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { BookPage } from './bookPages';
import type { ViewerProps } from './StoryViewer';
import { BOOK } from './bookTheme';
import { useArrowKeys, useSwipe } from './bookControls';

function Face({ page, number, side }: { page?: BookPage; number: number; side: 'front' | 'back' }) {
  const isFront = side === 'front';
  return (
    <div
      className="ifb-face"
      style={{
        position: 'absolute',
        inset: 0,
        transform: isFront ? undefined : 'rotateY(180deg)',
        background: BOOK.page,
        borderRadius: isFront ? '0 6px 6px 0' : '6px 0 0 6px',
        boxShadow: '0 20px 50px -20px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}
    >
      {/* Shadow along the spine */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: isFront
            ? 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 7%)'
            : 'linear-gradient(270deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 7%)',
          zIndex: 2,
        }}
      />
      {/* Gold page frame */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: '14px', border: '1px solid rgba(201,168,76,0.22)', borderRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
      {page && (
        <>
          <div className="ifb-scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '40px 44px 48px' }}>
            <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>{page.content}</div>
          </div>
          <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', fontFamily: BOOK.sans, fontSize: '0.65rem', letterSpacing: '0.3em', color: BOOK.muted, zIndex: 2, pointerEvents: 'none' }}>
            · {number} ·
          </div>
        </>
      )}
    </div>
  );
}

const roundButton: CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  border: `1px solid rgba(201,168,76,0.45)`,
  background: 'transparent',
  color: BOOK.goldText,
  fontSize: '1.2rem',
  cursor: 'pointer',
};

export function SpreadViewer({ pages, index, onIndex, onOpenContents }: ViewerProps) {
  const sheetCount = Math.ceil(pages.length / 2);
  // Sheets turned so far: page 0 is the cover alone, then pages 1–2, 3–4, …
  const turned = Math.floor((index + 1) / 2);
  const turnTo = useCallback(
    (sheets: number) => onIndex(sheets === 0 ? 0 : Math.min(2 * sheets - 1, pages.length - 1)),
    [onIndex, pages.length],
  );
  const next = useCallback(() => {
    if (turned < sheetCount) turnTo(turned + 1);
  }, [turned, sheetCount, turnTo]);
  const prev = useCallback(() => {
    if (turned > 0) turnTo(turned - 1);
  }, [turned, turnTo]);
  useArrowKeys(next, prev);
  const swipe = useSwipe(next, prev);

  // Closed book (cover or back cover) sits centred on its one visible page
  const shift = turned === 0 ? '-25%' : turned === sheetCount ? '25%' : '0%';
  const left = 2 * turned - 1;
  const right = 2 * turned;
  const visible = [left, right].filter((i) => i >= 0 && i < pages.length);
  const label = visible.length === 2 ? `Pages ${left + 1}–${right + 1} of ${pages.length}` : `Page ${visible[0] + 1} of ${pages.length}`;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '22px', padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: BOOK.sans, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: BOOK.goldText }}>
        {pages[visible[visible.length - 1]].chapter}
      </div>

      <div {...swipe} style={{ perspective: '2600px', width: 'min(94vw, 1180px, calc((100dvh - 170px) * 1.45))', aspectRatio: '1.45 / 1', touchAction: 'pan-y' }}>
        <div className="ifb-book" style={{ position: 'relative', width: '100%', height: '100%', transform: `translateX(${shift})` }}>
          {Array.from({ length: sheetCount }, (_, k) => {
            const isTurned = k < turned;
            const near = k >= turned - 2 && k <= turned + 1;
            return (
              <div
                key={k}
                className="ifb-sheet"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  width: '50%',
                  height: '100%',
                  transformOrigin: 'left center',
                  transform: isTurned ? 'rotateY(-180deg)' : 'none',
                  zIndex: isTurned ? k + 1 : sheetCount - k,
                }}
              >
                <Face side="front" page={near ? pages[2 * k] : undefined} number={2 * k + 1} />
                <Face side="back" page={near ? pages[2 * k + 1] : undefined} number={2 * k + 2} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <button type="button" onClick={prev} disabled={turned === 0} aria-label="Previous page" style={{ ...roundButton, opacity: turned === 0 ? 0.3 : 1 }}>
          ‹
        </button>
        <div style={{ minWidth: '170px', textAlign: 'center', fontFamily: BOOK.sans, fontSize: '0.75rem', letterSpacing: '0.1em', color: BOOK.muted }}>{label}</div>
        <button type="button" onClick={next} disabled={turned === sheetCount} aria-label="Next page" style={{ ...roundButton, opacity: turned === sheetCount ? 0.3 : 1 }}>
          ›
        </button>
        <button
          type="button"
          onClick={onOpenContents}
          style={{ marginLeft: '8px', background: 'transparent', border: `1px solid ${BOOK.line}`, color: BOOK.ink, borderRadius: '4px', padding: '10px 14px', fontFamily: BOOK.sans, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Contents
        </button>
      </div>
      <div style={{ fontFamily: BOOK.sans, fontSize: '0.66rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(160,152,192,0.6)' }}>
        Drag a page · use the arrows · or press ← →
      </div>
    </div>
  );
}
