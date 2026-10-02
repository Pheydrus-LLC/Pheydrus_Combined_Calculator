/**
 * InvisibleForcesBookPage - the client report as an interactive book.
 *
 * /client/book       opened from a report (results + intake come in the route state)
 * /client/book/demo  the sample client, for previewing
 */

import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ConsolidatedResults } from '../../models';
import type { ClientIntakeData } from '../../models/clientIntake';
import { DEMO_INTAKE, DEMO_RESULTS } from '../../data/demoClientReport';
import { buildBookPages } from './book/bookPages';
import { BookViewer } from './book/BookViewer';
import { BOOK } from './book/bookTheme';

type ReportState = { results: ConsolidatedResults; intake: ClientIntakeData; bookPage?: number };

export function InvisibleForcesBookPage({ demo = false }: { demo?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as ReportState | null;

  const book = useMemo(() => {
    const state: ReportState | null = demo ? { results: DEMO_RESULTS, intake: DEMO_INTAKE } : routeState;
    if (!state?.results?.diagnostic) return null;
    // "Scroll mode": the same report as one long page; its Book mode button brings you back to this page
    const onOpenReport = (page = 0) =>
      navigate('/client/results', { state: { results: state.results, intake: state.intake, bookPage: page, bookDemo: demo } });
    return { pages: buildBookPages(state.results, state.intake, { onOpenReport: () => onOpenReport() }), onOpenReport };
  }, [demo, routeState, navigate]);

  if (!book) {
    return (
      <div style={{ minHeight: '100dvh', background: BOOK.backdrop, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '420px', textAlign: 'center', background: BOOK.page, border: `1px solid ${BOOK.line}`, borderRadius: '6px', padding: '32px 24px' }}>
          <h2 style={{ fontFamily: BOOK.serif, color: BOOK.ink, fontSize: '1.5rem', margin: '0 0 10px' }}>No report to show</h2>
          <p style={{ fontFamily: BOOK.sans, color: BOOK.muted, fontSize: '0.9rem', margin: '0 0 20px' }}>Please complete the assessment first.</p>
          <button
            type="button"
            onClick={() => navigate('/client')}
            style={{ padding: '12px 24px', background: BOOK.gold, color: '#0C1128', fontWeight: 700, border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: BOOK.sans }}
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return <BookViewer pages={book.pages} onOpenReport={book.onOpenReport} initialPage={routeState?.bookPage ?? 0} />;
}

export default InvisibleForcesBookPage;
