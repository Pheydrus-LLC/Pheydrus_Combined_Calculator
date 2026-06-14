import { useState, useEffect } from 'react';
import { StandalonePageWrapper } from './StandalonePageWrapper';
import {
  LeadGateModal,
  CoverPage,
  RewriteYourPastForm,
  RewriteYourPastResults,
} from '../../components/RewriteYourPast';
import { useRewriteYourPastForm } from '../../hooks/useRewriteYourPastForm';
import {
  calculateRewriteYourPast,
  getCompletionPercent,
  type RewriteYourPastFormData,
} from '../../calculators/rewriteYourPastCalculator';

const LEAD_STORAGE_KEY = 'hjRewritePastLeadV1';

export function RewriteYourPastPage() {
  const { formData, updateField, updateFields, isLoading: formLoading } = useRewriteYourPastForm();
  const [isLeadGateUnlocked, setIsLeadGateUnlocked] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateRewriteYourPast> | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Load lead gate state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LEAD_STORAGE_KEY);
    if (stored) {
      setIsLeadGateUnlocked(true);
    }
  }, []);

  const handleLeadGateUnlock = (name: string, email: string) => {
    localStorage.setItem(
      LEAD_STORAGE_KEY,
      JSON.stringify({
        name,
        email,
        unlockedAt: new Date().toISOString(),
      })
    );
    setIsLeadGateUnlocked(true);
  };

  const handleGenerateSummary = () => {
    const calcResult = calculateRewriteYourPast(formData);
    if (calcResult.missingFields.length > 0) {
      setSaveMessage(`Please fill the core prompts before generating: ${calcResult.missingFields.join(', ')}`);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    setResult(calcResult);
    setShowResults(true);
  };

  const handleSaveProgress = () => {
    setSaveMessage('Progress saved locally in this browser.');
    setTimeout(() => setSaveMessage(''), 2200);
  };

  const handleDownloadSummary = () => {
    if (!result) return;
    const text = result.summary;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hj-rewrite-your-past-summary.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const completionPercent = getCompletionPercent(formData);
  const heroScore = result?.score || 0;

  if (formLoading) {
    return (
      <StandalonePageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-red-500 rounded-full" />
            </div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </StandalonePageWrapper>
    );
  }

  if (!isLeadGateUnlocked) {
    return <LeadGateModal onUnlock={handleLeadGateUnlock} />;
  }

  return (
    <StandalonePageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {/* Cover Page */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <CoverPage completionPercent={completionPercent} />
        </div>

        {/* Table of Contents */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-2xl border border-gray-700 bg-gradient-to-b from-gray-900/80 to-gray-950/80 p-8">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Table of Contents</div>
            <h2 className="mb-6 text-3xl font-bold text-white">What's Inside</h2>
            <ul className="space-y-3 border-t border-gray-700 pt-6">
              {[
                { num: '00', title: 'Core Framework', desc: 'Limbic → Nervous → Heart Signal baseline' },
                { num: '01', title: 'Dream', desc: 'Define your call and identity-level why' },
                { num: '02', title: 'Nightmare', desc: 'Name your wound/fear pattern' },
                { num: '03', title: 'Obstacle', desc: 'Identify trigger loops and response shifts' },
                { num: '04', title: 'New Dream', desc: 'Extract meaning and set your next move' },
                { num: '05', title: 'Neptune Reflection', desc: 'Locate fantasy, projection, and blindspots' },
                { num: '06', title: 'Summary', desc: 'Generate, save, and download your final report' },
              ].map((item) => (
                <li key={item.num} className="flex justify-between gap-4 pb-3 border-b border-gray-700/50 last:border-b-0">
                  <div>
                    <span className="font-mono text-sm text-gray-600">{item.num}</span>
                    <span className="ml-3 text-gray-200 font-medium">{item.title}</span>
                    <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                  </div>
                  <span className="text-gray-600">→</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {showResults ? (
            <RewriteYourPastResults
              score={result!.score}
              band={result!.band}
              summary={result!.summary}
              onSave={handleSaveProgress}
              onDownload={handleDownloadSummary}
            />
          ) : (
            <>
              <RewriteYourPastForm
                formData={formData}
                onUpdateField={updateField}
                heroScore={result?.score || 0}
                completionPercent={completionPercent}
              />

              {/* Generate Button */}
              <div className="mt-12 max-w-4xl">
                <button
                  onClick={handleGenerateSummary}
                  className="w-full rounded-lg border border-red-600 bg-gradient-to-b from-red-600 to-red-700 px-6 py-4 font-semibold uppercase tracking-wider text-white transition-all hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  Generate Summary
                </button>
                {saveMessage && <div className="mt-3 text-sm text-red-400 text-center">{saveMessage}</div>}
              </div>
            </>
          )}
        </div>

        {/* Footer Padding */}
        <div className="h-24" />
      </div>
    </StandalonePageWrapper>
  );
}
