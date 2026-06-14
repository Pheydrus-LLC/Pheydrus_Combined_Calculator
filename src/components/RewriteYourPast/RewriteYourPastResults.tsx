interface RewriteYourPastResultsProps {
  score: number;
  band: string;
  summary: string;
  onSave: () => void;
  onDownload: () => void;
}

export function RewriteYourPastResults({
  score,
  band,
  summary,
  onSave,
  onDownload,
}: RewriteYourPastResultsProps) {
  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="rounded-lg border border-gray-700 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Hero Coherence Score</div>
        <div className="mb-2 font-mono text-6xl font-bold text-white">{score}</div>
        <div className="text-sm text-gray-400">{band}</div>
      </div>

      {/* Summary Output */}
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Your Summary</div>
        <div className="rounded-lg border border-dashed border-gray-600 bg-gray-950/50 p-6 font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
          {summary}
        </div>
      </div>

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={onSave}
          className="rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-gray-200 transition-all hover:border-gray-500 hover:bg-gray-700/50"
        >
          Save Progress
        </button>
        <button
          onClick={onDownload}
          className="rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-gray-100 transition-all hover:border-gray-500 hover:bg-gray-600/50"
        >
          Download Summary
        </button>
      </div>
    </div>
  );
}
