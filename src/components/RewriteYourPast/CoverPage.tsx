import { useEffect, useRef } from 'react';

interface CoverPageProps {
  completionPercent: number;
}

export function CoverPage({ completionPercent }: CoverPageProps) {
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollHintRef.current) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        scrollHintRef.current?.classList.add('opacity-0', 'pointer-events-none');
      } else {
        scrollHintRef.current?.classList.remove('opacity-0', 'pointer-events-none');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Hero Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute right-1/4 top-10 h-64 w-64 rounded-full bg-gradient-to-b from-red-700/20 to-transparent blur-3xl opacity-40" />
        <div className="absolute left-1/6 top-1/3 h-80 w-80 rounded-full bg-gradient-to-b from-red-900/15 to-transparent blur-3xl opacity-30" />
      </div>

      {/* Cover Section */}
      <div className="relative grid min-h-screen grid-cols-1 gap-6 items-center px-6 py-16 sm:px-8 lg:grid-cols-2 lg:gap-8">
        {/* Left: Content Card */}
        <div className="rounded-2xl border border-gray-700 bg-gradient-to-b from-gray-900/80 to-gray-950/80 p-10 backdrop-blur-sm">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Pheydrus Workbook
          </div>
          <h1 className="mb-2 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Rewrite Your Past
            <br />
            <span className="text-red-500">Hero Identity Journey</span>
          </h1>
          <p className="mb-6 max-w-md text-base leading-relaxed text-gray-400">
            A guided process to convert old emotional loops into a coherent self-led narrative. Move from dream,
            through nightmare and obstacle, into a new authored identity.
          </p>

          {/* Pills */}
          <div className="flex flex-wrap gap-2">
            {['4-Step Framework', 'Nervous System Lens', 'Neptune Blindspots'].map((pill) => (
              <div
                key={pill}
                className="inline-block rounded-full border border-gray-600 bg-gray-800/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300"
              >
                {pill}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Brain Portrait */}
        <div className="relative flex items-center justify-center">
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm shadow-2xl">
            <img
              src="/hj-finals-2-of-20-1.jpg"
              alt="HJ Portrait"
              className="h-80 w-80 rounded-xl object-cover filter drop-shadow-lg"
            />
            <div className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-gray-500">
              HJ Portrait
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-white mb-4">4 Steps to Re-Writing Your Past</h1>
        <p className="text-gray-400 leading-relaxed mb-8 max-w-3xl">
          This workbook is about becoming the hero of your own life in a world that no longer rewards passivity. In this
          new fire era, the people who move forward are the ones who stop waiting to be rescued, stop outsourcing meaning,
          and start authoring their own story. That shift does not start with willpower. It starts in the limbic brain,
          where meaning gets assigned, safety or threat gets coded, and your nervous system decides whether you contract or
          move. These prompts are here to help you turn old pain into authorship, so your inner story, your emotional state,
          and your next actions finally point in the same direction.
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-3 flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span>Completion</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-300 transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Scroll Hint */}
        <div
          ref={scrollHintRef}
          className="mt-8 text-center font-mono text-xs uppercase tracking-widest text-gray-600 animate-pulse transition-opacity duration-300"
        >
          ↓ scroll to begin
        </div>
      </div>

      {/* Divider */}
      <div className="my-12 mx-auto max-w-4xl px-6 sm:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      </div>
    </>
  );
}
