/**
 * InvisibleForcesBookPage - the client report as an interactive book.
 *
 * /client/book       where clients land after the assessment (results + intake come in the route state)
 * /client/book?id=…  the same, from a saved report; reloads it from storage if the route state is gone
 * /client/book/demo  the sample client, for previewing
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ConsolidatedResults } from '../../models';
import type { ClientIntakeData } from '../../models/clientIntake';
import { DEMO_INTAKE, DEMO_RESULTS } from '../../data/demoClientReport';
import { buildBookPages } from './book/bookPages';
import { BookViewer } from './book/BookViewer';
import { BOOK } from './book/bookTheme';

type ReportState = { results: ConsolidatedResults; intake: ClientIntakeData; bookPage?: number };

function Notice({ title, text, onStart }: { title: string; text?: string; onStart?: () => void }) {
  return (
    <div style={{ minHeight: '100dvh', background: BOOK.backdrop, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '420px', textAlign: 'center', background: BOOK.page, border: `1px solid ${BOOK.line}`, borderRadius: '6px', padding: '32px 24px' }}>
        <h2 style={{ fontFamily: BOOK.serif, color: BOOK.ink, fontSize: '1.5rem', margin: text ? '0 0 10px' : 0 }}>{title}</h2>
        {text && <p style={{ fontFamily: BOOK.sans, color: BOOK.muted, fontSize: '0.9rem', margin: '0 0 20px' }}>{text}</p>}
        {onStart && (
          <button
            type="button"
            onClick={onStart}
            style={{ padding: '12px 24px', background: BOOK.gold, color: '#0C1128', fontWeight: 700, border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: BOOK.sans }}
          >
            Start Assessment
          </button>
        )}
      </div>
    </div>
  );
}

export function InvisibleForcesBookPage({ demo = false }: { demo?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as ReportState | null;
  const reportId = demo ? null : new URLSearchParams(location.search).get('id');

  // A saved report opened without route state (a reload, or the link opened again) is fetched by its id
  const [fetched, setFetched] = useState<ReportState | null>(null);
  const [isFetching, setIsFetching] = useState(() => !!reportId && !routeState);
  const [fetchError, setFetchError] = useState(false);
  useEffect(() => {
    if (!reportId || routeState) return;
    fetch(`/api/get-results?id=${encodeURIComponent(reportId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: ReportState) => setFetched({ results: data.results, intake: data.intake }))
      .catch(() => setFetchError(true))
      .finally(() => setIsFetching(false));
  }, [reportId, routeState]);

  const book = useMemo(() => {
    const state: ReportState | null = demo ? { results: DEMO_RESULTS, intake: DEMO_INTAKE } : (routeState ?? fetched);
    if (!state?.results?.diagnostic) return null;
    // "Scroll mode": the same report as one long page; its Book mode button brings you back to this page
    const scrollPath = reportId ? `/client/results?id=${encodeURIComponent(reportId)}` : '/client/results';
    const onOpenReport = (page = 0) =>
      navigate(scrollPath, { state: { results: state.results, intake: state.intake, bookPage: page, bookDemo: demo } });
    return { pages: buildBookPages(state.results, state.intake, { onOpenReport: () => onOpenReport() }), onOpenReport };
  }, [demo, routeState, fetched, reportId, navigate]);

  if (isFetching) return <Notice title="Opening your report…" />;
  if (!book) {
    return fetchError ? (
      <Notice title="Report not found" text="This report link has expired or doesn't exist." onStart={() => navigate('/client')} />
    ) : (
      <Notice title="No report to show" text="Please complete the assessment first." onStart={() => navigate('/client')} />
    );
  }

  return <BookViewer pages={book.pages} onOpenReport={book.onOpenReport} initialPage={routeState?.bookPage ?? 0} />;
}

export default InvisibleForcesBookPage;
