/**
 * CalendlyEmbed - inline Calendly booking calendar.
 * Uses Calendly's iframe directly (no external script) and grows to fit the
 * calendar using the height Calendly posts back, so there's no inner scrollbar.
 */

import { useEffect, useState } from 'react';

const FALLBACK_HEIGHT = 700;

export function CalendlyEmbed({
  url,
  name,
  email,
}: {
  url: string;
  /** Prefills the booking form */
  name?: string;
  email?: string;
}) {
  const [height, setHeight] = useState(FALLBACK_HEIGHT);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://calendly.com') return;
      const data = e.data as { event?: string; payload?: { height?: string } } | null;
      if (data?.event !== 'calendly.page_height') return;
      const px = parseInt(data.payload?.height ?? '', 10);
      if (px > 0) setHeight(px);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const src = new URL(url);
  src.searchParams.set('embed_domain', window.location.host);
  src.searchParams.set('embed_type', 'Inline');
  src.searchParams.set('hide_gdpr_banner', '1');
  if (name) src.searchParams.set('name', name);
  if (email) src.searchParams.set('email', email);

  return (
    <iframe
      src={src.toString()}
      title="Book your call"
      data-print="hide"
      loading="lazy"
      style={{
        width: '100%',
        height: `${height}px`,
        border: 'none',
        borderRadius: '4px',
        background: '#fff',
        display: 'block',
      }}
    />
  );
}
