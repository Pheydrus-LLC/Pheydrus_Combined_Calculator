/**
 * InvisibleForcesDemoPage
 * Injects hardcoded sample data and redirects to /client/results
 * so the full report UI can be previewed without filling out the form.
 *
 * The sample data lives in src/data/demoClientReport.ts.
 *
 * Access at: /client/demo
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_INTAKE, DEMO_RESULTS } from '../../data/demoClientReport';

// ── Page ──────────────────────────────────────────────────────────────────────

export function InvisibleForcesDemoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/client/results', {
      state: { results: DEMO_RESULTS, intake: DEMO_INTAKE },
      replace: true,
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] flex items-center justify-center">
      <p className="text-[#6b6188] text-sm">Loading demo…</p>
    </div>
  );
}

export default InvisibleForcesDemoPage;
