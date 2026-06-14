import { useState } from 'react';

interface FormSectionProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function FormSection({ title, eyebrow, children, defaultOpen = true }: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 rounded-lg border border-gray-700 bg-gradient-to-b from-gray-800/40 to-gray-900/40 p-6 animation-reveal">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="flex-1">
          {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-500">{eyebrow}</div>}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className={`mt-1 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>

      {isOpen && <div className="mt-5 space-y-4">{children}</div>}
    </div>
  );
}
