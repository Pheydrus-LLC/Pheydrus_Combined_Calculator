/**
 * Lead-gate modal for the Mercury Placement Tool.
 * New component (does not touch the RewriteYourPast LeadGateModal) so the two
 * gates can evolve independently and post to their own Flodesk segments.
 */

import { useState } from 'react';

interface LeadGateModalProps {
  onUnlock: (name: string, email: string) => void;
}

const FONT_HEADLINE = { fontFamily: "'Bree Serif', Georgia, serif" };
const FONT_MONO = { fontFamily: "'Courier New', 'Lucida Console', monospace" };

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
      const response = await fetch('/api/flodesk-mercury', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          source: 'mercury-placement-tool',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#05060f] p-5">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 32%, rgba(74,217,255,0.30) 0%, rgba(255,79,163,0.18) 25%, rgba(120,20,90,0.10) 48%, rgba(20,10,30,0.04) 70%, transparent 85%)',
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-[#4ad9ff]/20 bg-gradient-to-b from-[#0b0f1e] to-[#05060f] p-7 shadow-[0_0_24px_rgba(74,217,255,0.25)]">
        <div
          className="mb-3 text-[0.65rem] uppercase tracking-[0.25em] text-[#ffd166]"
          style={FONT_MONO}
        >
          ✦ Activate Your Mercury
        </div>
        <h1 className="mb-4 text-3xl font-normal text-[#eef1ff]" style={FONT_HEADLINE}>
          Before We Begin
        </h1>
        <p className="mb-5 text-sm text-[#9aa4cc]">
          Enter your name and email to unlock your Mercury Placement — sign, house, and every
          aspect that shapes how you speak.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="mercuryLeadName"
              className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#9aa4cc]"
            >
              Name
            </label>
            <input
              id="mercuryLeadName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isLoading}
              className="w-full rounded-lg border border-[#4ad9ff]/25 bg-[#0b0f1e] px-4 py-3 text-sm text-[#eef1ff] placeholder-[#6b7394] transition-colors focus:border-[#4ad9ff] focus:outline-none focus:ring-2 focus:ring-[#4ad9ff]/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="mercuryLeadEmail"
              className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#9aa4cc]"
            >
              Email
            </label>
            <input
              id="mercuryLeadEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              className="w-full rounded-lg border border-[#4ad9ff]/25 bg-[#0b0f1e] px-4 py-3 text-sm text-[#eef1ff] placeholder-[#6b7394] transition-colors focus:border-[#4ad9ff] focus:outline-none focus:ring-2 focus:ring-[#4ad9ff]/20 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-md px-4 py-3 font-semibold uppercase tracking-wider text-[#05060f] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: '#ffd166',
              boxShadow: '0 0 20px rgba(255,209,102,0.4)',
              ...FONT_HEADLINE,
              fontWeight: 400,
            }}
          >
            {isLoading ? 'Saving...' : 'Unlock My Mercury'}
          </button>

          {error && <div className="mt-3 text-sm text-[#ff4fa3]">{error}</div>}
        </form>
      </div>
    </div>
  );
}
