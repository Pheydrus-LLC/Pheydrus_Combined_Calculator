/**
 * Desktop book: two-page spreads with a CSS 3D page turn. Each "sheet" is one
 * leaf of paper with a page on each side (front = right-hand page, back = the
 * next left-hand page); turning flips the sheet over the spine. Only sheets
 * near the open spread render their pages, so long reports stay light.
 */

import { useCallback, useLayoutEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { BookPage } from './bookPages';
import type { ViewerProps } from './StoryViewer';
import { BOOK } from './bookTheme';
import { useArrowKeys, useSwipe } from './bookControls';
import { ChevronLeftIcon, ChevronRightIcon, MenuIcon } from './bookIcons';

/** Page padding (top, bottom) in px; the page number sits in the bottom padding */
const PAGE_PAD_TOP = 38;
const PAGE_PAD_BOTTOM = 46;
/** Pages longer than the page shrink their type down to this, then scroll */
const MIN_FIT = 0.78;

/**
 * Lays out a page, centred top to bottom when it's short, and shrinks it to
 * fit when it's long (like fitting copy to a printed page). Findings vary in
 * length from client to client, so this is measured rather than fixed.
 */
function FittedPage({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      const b = box.current;
      const c = content.current;
      if (!b || !c) return;
      c.style.zoom = '1';
      const available = b.clientHeight - PAGE_PAD_TOP - PAGE_PAD_BOTTOM;
      const needed = c.scrollHeight;
      c.style.zoom = needed > available ? String(Math.max(MIN_FIT, available / needed)) : '1';
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (box.current) observer.observe(box.current);
    document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={box} className="ifb-scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: `${PAGE_PAD_TOP}px 44px ${PAGE_PAD_BOTTOM}px` }}>
      <div ref={content} style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

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
        overflow: 'hidden',
        // A hairline where the pages meet at the spine
        [isFront ? 'borderLeft' : 'borderRight']: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {page?.fullBleed && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>{page.content}</div>
      )}
      {page && !page.fullBleed && (
        <>
          <div aria-hidden="true" style={{ position: 'absolute', inset: '14px', border: '1px solid rgba(201,168,76,0.22)', pointerEvents: 'none', zIndex: 2 }} />
          <FittedPage key={page.id}>{page.content}</FittedPage>
          <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', fontFamily: BOOK.sans, fontSize: '0.65rem', letterSpacing: '0.3em', color: BOOK.muted, zIndex: 2, pointerEvents: 'none' }}>
            · {number} ·
          </div>
        </>
      )}
    </div>
  );
}

const iconButton: CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: `1px solid rgba(201,168,76,0.45)`,
  background: 'transparent',
  color: BOOK.goldText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  cursor: 'pointer',
};

export function SpreadViewer({ pages, index, onIndex, onOpenContents, onOpenReport }: ViewerProps) {
  const sheetCount = Math.ceil(pages.length / 2);
  // With an odd page count the last page is a right-hand page, so the last sheet never turns
  const maxTurned = pages.length % 2 === 0 ? sheetCount : sheetCount - 1;
  // Sheets turned so far: page 0 is the cover alone, then pages 1–2, 3–4, …
  const turned = Math.floor((index + 1) / 2);
  const turnTo = useCallback(
    (sheets: number) => onIndex(sheets === 0 ? 0 : Math.min(2 * sheets - 1, pages.length - 1)),
    [onIndex, pages.length],
  );
  const next = useCallback(() => {
    if (turned < maxTurned) turnTo(turned + 1);
  }, [turned, maxTurned, turnTo]);
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
  const lastVisible = visible[visible.length - 1] ?? pages.length - 1;
  const label = visible.length === 2 ? `Pages ${left + 1}–${right + 1} of ${pages.length}` : `Page ${lastVisible + 1} of ${pages.length}`;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 24px 16px', boxSizing: 'border-box', gap: '14px' }}>
      {/* Header: contents menu, chapter, page count and progress, as on phones */}
      <header style={{ width: 'min(94vw, 1240px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <button
            type="button"
            onClick={onOpenContents}
            aria-label="Contents"
            title="Contents"
            style={{ ...iconButton, width: '36px', height: '36px', borderRadius: '4px', border: `1px solid ${BOOK.line}`, color: BOOK.ink }}
          >
            <MenuIcon />
          </button>
          <div style={{ flex: 1, minWidth: 0, fontFamily: BOOK.sans, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: BOOK.goldText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {pages[lastVisible].chapter}
          </div>
          <div style={{ fontFamily: BOOK.sans, fontSize: '0.75rem', color: BOOK.muted, fontVariantNumeric: 'tabular-nums' }}>
            {lastVisible + 1} / {pages.length}
          </div>
        </div>
        <div role="progressbar" aria-valuemin={1} aria-valuemax={pages.length} aria-valuenow={lastVisible + 1} style={{ height: '3px', background: BOOK.line, borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${((lastVisible + 1) / pages.length) * 100}%`, height: '100%', background: BOOK.gold, transition: 'width 0.4s ease' }} />
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div {...swipe} style={{ perspective: '2600px', width: 'min(94vw, 1240px, calc((100dvh - 150px) * 1.45))', aspectRatio: '1.45 / 1', touchAction: 'pan-y' }}>
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
      </div>

      {/* Page turning, with Scroll mode off to the side */}
      <div style={{ width: 'min(94vw, 1240px)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}>
        <div />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button type="button" onClick={prev} disabled={turned === 0} aria-label="Previous page" title="Previous (←)" style={{ ...iconButton, opacity: turned === 0 ? 0.3 : 1 }}>
            <ChevronLeftIcon />
          </button>
          <div style={{ minWidth: '150px', textAlign: 'center', fontFamily: BOOK.sans, fontSize: '0.72rem', letterSpacing: '0.1em', color: BOOK.muted }}>{label}</div>
          <button type="button" onClick={next} disabled={turned === maxTurned} aria-label="Next page" title="Next (→)" style={{ ...iconButton, opacity: turned === maxTurned ? 0.3 : 1 }}>
            <ChevronRightIcon />
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              title="The full report on one long page"
              style={{ background: 'transparent', border: `1px solid ${BOOK.line}`, color: BOOK.ink, borderRadius: '4px', padding: '9px 13px', fontFamily: BOOK.sans, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              ↕ Scroll mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
