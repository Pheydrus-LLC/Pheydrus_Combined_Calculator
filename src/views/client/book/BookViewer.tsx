/**
 * The report as a book. Wide screens get two-page spreads that turn
 * (SpreadViewer); phones and narrow windows get one page at a time
 * (StoryViewer). Both show the same pages and share the current position, so
 * rotating a tablet or resizing a window keeps your place.
 */

import { useCallback, useMemo, useState } from 'react';
import type { BookPage } from './bookPages';
import { BOOK } from './bookTheme';
import { useWideScreen } from './bookControls';
import { SpreadViewer } from './SpreadViewer';
import { StoryViewer } from './StoryViewer';

function ContentsMenu({
  chapters,
  current,
  onPick,
  onClose,
}: {
  chapters: Array<{ name: string; start: number }>;
  current: string;
  onPick: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Contents"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(5,10,24,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '420px', background: BOOK.page, border: `1px solid rgba(201,168,76,0.35)`, borderRadius: '6px', padding: '22px 20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontFamily: BOOK.serif, fontSize: '1.5rem', fontWeight: 700, color: BOOK.goldText }}>Contents</span>
          <button type="button" onClick={onClose} aria-label="Close contents" style={{ background: 'transparent', border: 'none', color: BOOK.muted, fontSize: '1.3rem', cursor: 'pointer' }}>
            ×
          </button>
        </div>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {chapters.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => onPick(c.start)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  padding: '11px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${BOOK.line}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: BOOK.sans,
                  fontSize: '0.92rem',
                  color: c.name === current ? BOOK.goldText : BOOK.ink,
                  fontWeight: c.name === current ? 700 : 500,
                }}
              >
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ color: BOOK.muted, fontSize: '0.78rem' }}>{c.start + 1}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function BookViewer({ pages }: { pages: BookPage[] }) {
  const wide = useWideScreen();
  const [index, setIndex] = useState(0);
  const [contentsOpen, setContentsOpen] = useState(false);

  const chapters = useMemo(
    () =>
      pages.reduce<Array<{ name: string; start: number }>>((list, page, i) => {
        if (!list.some((c) => c.name === page.chapter)) list.push({ name: page.chapter, start: i });
        return list;
      }, []),
    [pages],
  );
  const goTo = useCallback((i: number) => setIndex(Math.max(0, Math.min(pages.length - 1, i))), [pages.length]);
  const viewerProps = { pages, index, onIndex: goTo, onOpenContents: () => setContentsOpen(true) };

  return (
    <div style={{ minHeight: '100dvh', background: BOOK.backdrop, color: BOOK.ink }}>
      {wide ? <SpreadViewer {...viewerProps} /> : <StoryViewer {...viewerProps} />}
      {contentsOpen && (
        <ContentsMenu
          chapters={chapters}
          current={pages[index].chapter}
          onPick={(i) => {
            goTo(i);
            setContentsOpen(false);
          }}
          onClose={() => setContentsOpen(false)}
        />
      )}
    </div>
  );
}
