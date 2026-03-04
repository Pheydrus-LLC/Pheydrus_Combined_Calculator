/**
 * ClientResultsPage
 * Client-facing results page — shows the Angular Diagnostic report card
 * along with a summary of the intake responses.
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AngularDiagnosticResults } from '../../components/results/AngularDiagnosticResults';
import { exportClientReportToPDF } from '../../services/pdfExport';
import type { ConsolidatedResults } from '../../models';
import type { ClientIntakeData } from '../../models/clientIntake';
import {
  PREFERRED_SOLUTION_LABELS,
  CURRENT_SITUATION_LABELS,
  PRIOR_HELP_LABELS,
} from '../../models/clientIntake';

export function ClientResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as
    | { results: ConsolidatedResults; intake: ClientIntakeData }
    | null;

  if (!state?.results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] py-12 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-[#2d2a3e] mb-3">No results found</h2>
          <p className="text-[#6b6188] mb-6">Please complete the assessment first.</p>
          <button
            onClick={() => navigate('/client')}
            className="px-6 py-3 bg-[#9a7d4e] hover:bg-[#b8944a] text-white font-bold rounded-xl transition-colors"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const { results, intake } = state;
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportPDF() {
    setIsExporting(true);
    try {
      await exportClientReportToPDF(results, intake);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f0ebe0] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brand header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-[#2d2a3e]">Your Pheydrus Report</h1>
          <p className="text-[#6b6188] text-sm mt-1">
            Personalized 3-Pillar Analysis for {results.userInfo.name}
          </p>
        </div>

        {/* Intake summary card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#9a7d4e] mb-4">Your Assessment Summary</h2>
          <div className="space-y-3 text-sm">
            {intake.desiredOutcome && (
              <IntakRow label="Desired outcome (90 days)" value={intake.desiredOutcome} />
            )}
            {intake.obstacle && (
              <IntakRow label="Main obstacle" value={intake.obstacle} />
            )}
            {intake.patternYear && (
              <IntakRow label="Pattern noticed since" value={intake.patternYear} />
            )}
            {intake.priorHelp.length > 0 && (
              <IntakRow
                label="Prior support sought"
                value={intake.priorHelp.map((o) => PRIOR_HELP_LABELS[o]).join(', ')}
              />
            )}
            {intake.preferredSolution && (
              <IntakRow
                label="Preferred solution"
                value={PREFERRED_SOLUTION_LABELS[intake.preferredSolution]}
              />
            )}
            {intake.currentSituation && (
              <IntakRow
                label="Current situation"
                value={CURRENT_SITUATION_LABELS[intake.currentSituation]}
              />
            )}
            {intake.addressMoveDate && (
              <IntakRow label="Moved to address" value={intake.addressMoveDate} />
            )}
            {intake.additionalNotes && (
              <IntakRow label="Additional notes" value={intake.additionalNotes} />
            )}
          </div>
        </div>

        {/* 3-Pillar diagnostic report */}
        <AngularDiagnosticResults result={results.diagnostic} />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-6 py-3 bg-[#9a7d4e] hover:bg-[#b8944a] disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
          >
            {isExporting ? 'Generating PDF…' : 'Download Your Report (PDF)'}
          </button>
          <button
            onClick={() => navigate('/client')}
            className="px-6 py-3 border border-gray-200 text-[#6b6188] font-semibold rounded-xl hover:border-[#9a7d4e] hover:text-[#9a7d4e] transition-colors"
          >
            Start New Assessment
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          Report generated {new Date(results.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function IntakRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <p className="text-[#6b6188] font-medium mb-0.5">{label}</p>
      <p className="text-[#2d2a3e]">{value}</p>
    </div>
  );
}

export default ClientResultsPage;
