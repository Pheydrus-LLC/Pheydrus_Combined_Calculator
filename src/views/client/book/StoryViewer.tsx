/**
 * Phone / small-screen book: one page at a time, full screen. Swipe or use the
 * Back / Next buttons; long pages scroll on their own.
 */

import { useCallback, useState } from 'react';
import type { BookPage } from './bookPages';
import { BOOK } from './bookTheme';
import { useArrowKeys, useSwipe } from './bookControls';

export interface ViewerProps {
  pages: BookPage[];
  index: number;
  onIndex: (index: number) => void;
  onOpenContents: () => void;
}

const navButton = {
  height: '48px',
  borderRadius: '4px',
  fontFamily: BOOK.sans,
  fontSize: '0.82rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
};

export function StoryViewer({ pages, index, onIndex, onOpenContents }: ViewerProps) {
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const last = pages.length - 1;
  const next = useCallback(() => {
    if (index >= last) return;
    setDirection('next');
    onIndex(index + 1);
  }, [index, last, onIndex]);
  const prev = useCallback(() => {
    if (index <= 0) return;
    setDirection('prev');
    onIndex(index - 1);
  }, [index, onIndex]);
  useArrowKeys(next, prev);
  const swipe = useSwipe(next, prev);
  const page = pages[index];

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <button
            type="button"
            onClick={onOpenContents}
            aria-label="Contents"
            style={{ background: 'transparent', border: `1px solid ${BOOK.line}`, color: BOOK.ink, borderRadius: '4px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem' }}
          >
            ☰
          </button>
          <div style={{ flex: 1, minWidth: 0, fontFamily: BOOK.sans, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: BOOK.goldText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {page.chapter}
          </div>
          <div style={{ fontFamily: BOOK.sans, fontSize: '0.75rem', color: BOOK.muted, fontVariantNumeric: 'tabular-nums' }}>
            {index + 1} / {pages.length}
          </div>
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={pages.length}
          aria-valuenow={index + 1}
          style={{ height: '3px', background: BOOK.line, borderRadius: '999px', overflow: 'hidden' }}
        >
          <div style={{ width: `${((index + 1) / pages.length) * 100}%`, height: '100%', background: BOOK.gold, transition: 'width 0.25s ease' }} />
        </div>
      </header>

      <main {...swipe} style={{ flex: 1, position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}>
        <div
          key={page.id}
          className={`ifb-scroll ifb-enter-${direction}`}
          style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '18px 22px 28px' }}
        >
          <div
            style={{
              maxWidth: '560px',
              minHeight: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              background: BOOK.page,
              border: `1px solid ${BOOK.line}`,
              borderRadius: '6px',
              padding: '24px 20px',
              boxSizing: 'border-box',
            }}
          >
            {page.content}
          </div>
        </div>
      </main>

      <footer style={{ display: 'flex', gap: '10px', padding: '10px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)' }}>
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          style={{ ...navButton, width: '34%', background: 'transparent', border: `1px solid ${BOOK.line}`, color: BOOK.ink, opacity: index === 0 ? 0.35 : 1 }}
        >
          ‹ Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={index === last}
          style={{ ...navButton, flex: 1, background: BOOK.gold, border: 'none', color: '#0C1128', opacity: index === last ? 0.35 : 1 }}
        >
          {index === 0 ? 'Begin ›' : 'Next ›'}
        </button>
      </footer>
    </div>
  );
}
