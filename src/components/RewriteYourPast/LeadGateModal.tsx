import { useState } from 'react';

interface LeadGateModalProps {
  onUnlock: (name: string, email: string) => void;
}

export function LeadGateModal({ onUnlock }: LeadGateModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setError('Please enter both your name and email.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/flodesk-past', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          source: 'rewrite-your-past-workbook',
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.error || 'Unable to save your access details right now. Please try again.'
        );
      }

      onUnlock(trimmedName, trimmedEmail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-950 p-7 shadow-2xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Pheydrus Workbook Access
        </div>
        <h1 className="mb-4 text-3xl font-bold text-white">Before We Begin</h1>
        <p className="mb-5 text-sm text-gray-400">
          Please enter your name and email to unlock the Rewrite Your Past workbook.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="leadName" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-300">
              Name
            </label>
            <input
              id="leadName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="leadEmail" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-300">
              Email
            </label>
            <input
              id="leadEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-lg border border-red-600 bg-gradient-to-b from-red-600 to-red-700 px-4 py-3 font-semibold uppercase tracking-wider text-white transition-all hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Unlock Workbook'}
          </button>

          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </form>
      </div>
    </div>
  );
}
