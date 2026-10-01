/** Controls shared by both book viewers: screen-size check, swipes and arrow keys. */

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

/** Screens this size or bigger get the two-page book; smaller ones get one page at a time. */
const WIDE_QUERY = '(min-width: 1024px) and (min-height: 620px)';

export function useWideScreen(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(WIDE_QUERY);
    const onChange = () => setWide(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return wide;
}

/** Taps and drags on these belong to the control, not to page turning. */
function isControl(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('a, button, input, textarea, select, audio');
}

/** A horizontal swipe or drag turns the page; vertical movement is left for scrolling. */
export function useSwipe(onNext: () => void, onPrev: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: PointerEvent) => {
      start.current = isControl(e.target) ? null : { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: PointerEvent) => {
      const from = start.current;
      start.current = null;
      if (!from) return;
      const dx = e.clientX - from.x;
      const dy = e.clientY - from.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onNext : onPrev)();
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

/** ← / → (and Page Up / Down) turn the page, except while typing or using a slider. */
export function useArrowKeys(onNext: () => void, onPrev: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') onNext();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onPrev]);
}
