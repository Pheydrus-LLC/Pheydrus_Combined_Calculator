import type { RewriteYourPastFormData } from '../../calculators/rewriteYourPastCalculator';
import { FormSection } from './FormSection';
import { RangeInput } from './RangeInput';

interface RewriteYourPastFormProps {
  formData: Partial<RewriteYourPastFormData>;
  onUpdateField: (key: keyof RewriteYourPastFormData, value: unknown) => void;
  heroScore: number;
  completionPercent: number;
}

const inputClass =
  'w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors';
const labelClass = 'block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-widest';

export function RewriteYourPastForm({
  formData,
  onUpdateField,
  heroScore,
  completionPercent,
}: RewriteYourPastFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content (2 columns) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Framework Section */}
        <FormSection title="Limbic → Nervous → Heart Signal" eyebrow="Core Framework">
          <p className="text-sm text-gray-400 italic mb-4">
            Think of this as the emotional chain reaction underneath your life. The story you tell yourself gives your limbic
            brain a meaning. That meaning tells your body whether life feels safe or threatening.
          </p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>What "known" zone are you currently clinging to?</label>
              <textarea
                value={formData.knownZone || ''}
                onChange={(e) => onUpdateField('knownZone', e.target.value)}
                placeholder="Describe your current comfort pattern that feels safe but keeps you stuck."
                className={`${inputClass} min-h-24 resize-vertical`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Default nervous system response</label>
                <select
                  value={formData.safetyResponse || 'Freeze'}
                  onChange={(e) =>
                    onUpdateField('safetyResponse', e.target.value as RewriteYourPastFormData['safetyResponse'])
                  }
                  className={inputClass}
                >
                  <option>Freeze</option>
                  <option>Fight</option>
                  <option>Flight</option>
                  <option>Fawn</option>
                  <option>Regulate</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Self-led shift from passive to author</label>
                <input
                  type="text"
                  value={formData.selfLedShift || ''}
                  onChange={(e) => onUpdateField('selfLedShift', e.target.value)}
                  placeholder="One new behavior proving sovereignty this week."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="rounded-lg border border-red-900/30 bg-red-900/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">Slide Anchor</div>
              <p className="text-sm text-gray-400">
                Real change happens when you move from the known into the unknown, from safety-seeking into sovereignty,
                and from passively reacting to consciously authoring your next scene.
              </p>
            </div>
          </div>
        </FormSection>

        {/* Step 1: Dream */}
        <FormSection title="Dream" eyebrow="Step 01">
          <p className="text-sm text-gray-400 italic mb-4">Define what you are called to build without attachment to outcome.</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>What is your dream?</label>
              <textarea
                value={formData.dream || ''}
                onChange={(e) => onUpdateField('dream', e.target.value)}
                placeholder="Describe the dream in one vivid paragraph."
                className={`${inputClass} min-h-24 resize-vertical`}
              />
            </div>

            <div>
              <label className={labelClass}>Why does this dream matter at an identity level?</label>
              <textarea
                value={formData.dreamWhy || ''}
                onChange={(e) => onUpdateField('dreamWhy', e.target.value)}
                placeholder="Who do you become if you live this dream for 3 years?"
                className={`${inputClass} min-h-20 resize-vertical`}
              />
            </div>

            <div>
              <label className={labelClass}>How will you know you're answering the call this week?</label>
              <input
                type="text"
                value={formData.dreamSignal || ''}
                onChange={(e) => onUpdateField('dreamSignal', e.target.value)}
                placeholder="One measurable signal (example: publish 2 posts, make 3 offers)."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Movie question: what is your opening scene?</label>
              <textarea
                value={formData.movieOpening || ''}
                onChange={(e) => onUpdateField('movieOpening', e.target.value)}
                placeholder="If your life was a film, what image or scene captures your current chapter?"
                className={`${inputClass} min-h-20 resize-vertical`}
              />
              <div className="mt-2 rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
                <strong className="text-gray-300">💡 Example:</strong> Batman's dream scene is not just "stop crime." It is the
                moment Bruce decides Gotham does not get to define him through tragedy.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <RangeInput
                label="Dream clarity"
                value={formData.dreamClarity || 5}
                onChange={(v) => onUpdateField('dreamClarity', v)}
              />
              <RangeInput
                label="Commitment level"
                value={formData.dreamCommit || 5}
                onChange={(v) => onUpdateField('dreamCommit', v)}
              />
            </div>

            <div className="rounded-lg border-l-4 border-red-600 bg-gray-900/50 p-3">
              <p className="text-sm text-gray-400">Growth mindset: I will pursue this whole-heartedly without attaching to outcome.</p>
            </div>
          </div>
        </FormSection>

        {/* Step 2: Nightmare */}
        <FormSection title="Nightmare" eyebrow="Step 02">
          <p className="text-sm text-gray-400 italic mb-4">Name the fear pattern or wound that blocks your start.</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>What nightmare is preventing you from starting?</label>
              <textarea
                value={formData.nightmare || ''}
                onChange={(e) => onUpdateField('nightmare', e.target.value)}
                placeholder="What are you afraid will happen if you fully commit?"
                className={`${inputClass} min-h-20 resize-vertical`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Old story sentence</label>
                <input
                  type="text"
                  value={formData.nightmareStory || ''}
                  onChange={(e) => onUpdateField('nightmareStory', e.target.value)}
                  placeholder="The old narrative in one sentence."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Where do you feel it in your body?</label>
                <input
                  type="text"
                  value={formData.nightmareBody || ''}
                  onChange={(e) => onUpdateField('nightmareBody', e.target.value)}
                  placeholder="Chest, throat, stomach, jaw, etc."
                  className={inputClass}
                />
              </div>
            </div>

            <RangeInput
              label="Fear intensity"
              value={formData.fearIntensity || 5}
              onChange={(v) => onUpdateField('fearIntensity', v)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Dominant pattern</label>
                <select
                  value={formData.nightmarePattern || 'Avoidance'}
                  onChange={(e) =>
                    onUpdateField(
                      'nightmarePattern',
                      e.target.value as RewriteYourPastFormData['nightmarePattern']
                    )
                  }
                  className={inputClass}
                >
                  <option>Avoidance</option>
                  <option>Perfectionism</option>
                  <option>People-pleasing</option>
                  <option>Doubt spiral</option>
                  <option>Control</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Soul wound theme</label>
                <select
                  value={formData.soulWound || 'Rejection'}
                  onChange={(e) =>
                    onUpdateField('soulWound', e.target.value as RewriteYourPastFormData['soulWound'])
                  }
                  className={inputClass}
                >
                  <option>Rejection</option>
                  <option>Abandonment</option>
                  <option>Betrayal</option>
                  <option>Humiliation</option>
                  <option>Injustice</option>
                  <option>Mental illness or depression</option>
                  <option>Poverty</option>
                  <option>Violence</option>
                  <option>Addiction</option>
                  <option>Physical handicap</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>How does this wound theme show up in your decisions?</label>
              <textarea
                value={formData.woundStory || ''}
                onChange={(e) => onUpdateField('woundStory', e.target.value)}
                placeholder="Describe the recurring wound pattern and the cost it creates."
                className={`${inputClass} min-h-20 resize-vertical`}
              />
            </div>

            <div className="rounded-lg border-l-4 border-red-600 bg-gray-900/50 p-3">
              <p className="text-sm text-gray-400">Growth mindset: I am going to acquire all the skills necessary to achieve this.</p>
            </div>
          </div>
        </FormSection>

        {/* Step 3: Obstacle */}
        <FormSection title="Obstacle" eyebrow="Step 03">
          <p className="text-sm text-gray-400 italic mb-4">Identify what makes you give up, shut down, or blame others.</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>What obstacle keeps interrupting your momentum?</label>
              <textarea
                value={formData.obstacle || ''}
                onChange={(e) => onUpdateField('obstacle', e.target.value)}
                placeholder="Name the recurring obstacle and how it shows up."
                className={`${inputClass} min-h-20 resize-vertical`}
              />
            </div>

            <div>
              <label className={labelClass}>What is the trigger that usually starts this loop?</label>
              <input
                type="text"
                value={formData.obstacleTrigger || ''}
                onChange={(e) => onUpdateField('obstacleTrigger', e.target.value)}
                placeholder="Example: rejection, silence, uncertainty, money pressure."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>What will your new response be in 1 sentence?</label>
              <input
                type="text"
                value={formData.obstacleResponse || ''}
                onChange={(e) => onUpdateField('obstacleResponse', e.target.value)}
                placeholder="When X happens, I will do Y within 24 hours."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Movie question: what is your midpoint crisis scene?</label>
              <textarea
                value={formData.movieMidpoint || ''}
                onChange={(e) => onUpdateField('movieMidpoint', e.target.value)}
                placeholder="What scene captures your challenge point where old coping no longer works?"
                className={`${inputClass} min-h-20 resize-vertical`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <RangeInput
                label="Obstacle pressure"
                value={formData.obstaclePressure || 5}
                onChange={(v) => onUpdateField('obstaclePressure', v)}
              />
              <RangeInput
                label="Self-responsibility"
                value={formData.ownership || 5}
                onChange={(v) => onUpdateField('ownership', v)}
              />
            </div>

            <div className="rounded-lg border-l-4 border-red-600 bg-gray-900/50 p-3">
              <p className="text-sm text-gray-400">Transmute emotion: I did not come this far to stop now.</p>
            </div>
          </div>
        </FormSection>

        {/* Step 4: New Dream */}
        <FormSection title="New Dream" eyebrow="Step 04">
          <p className="text-sm text-gray-400 italic mb-4">Extract meaning from the path and set the next identity-level goal.</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>What new dream, paradigm, or path is emerging?</label>
              <textarea
                value={formData.newDream || ''}
                onChange={(e) => onUpdateField('newDream', e.target.value)}
                placeholder="What new dream are you now willing to claim?"
                className={`${inputClass} min-h-20 resize-vertical`}
              />
            </div>

            <div>
              <label className={labelClass}>What is your first brave move in the next 72 hours?</label>
              <input
                type="text"
                value={formData.newDreamAction || ''}
                onChange={(e) => onUpdateField('newDreamAction', e.target.value)}
                placeholder="Example: publish the offer, ask for support, launch the beta."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Movie question: what does your ending scene look like 12 months from now?</label>
              <textarea
                value={formData.movieFinale || ''}
                onChange={(e) => onUpdateField('movieFinale', e.target.value)}
                placeholder="Describe the scene that proves your new identity is embodied."
                className={`${inputClass} min-h-20 resize-vertical`}
              />
            </div>

            <div>
              <label className={labelClass}>Choose your meaning statement</label>
              <input
                type="text"
                value={formData.meaning || ''}
                onChange={(e) => onUpdateField('meaning', e.target.value)}
                placeholder="This had to happen so that I can unlock..."
                className={inputClass}
              />
            </div>

            <RangeInput
              label="Belief in new dream"
              value={formData.belief || 5}
              onChange={(v) => onUpdateField('belief', v)}
            />
          </div>
        </FormSection>

        {/* Neptune Blindspots */}
        <FormSection title="Natal Neptune Reflection" eyebrow="Neptune + Blindspots">
          <p className="text-sm text-gray-400 italic mb-4">Use your natal Neptune house as a blindspot lens.</p>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Your natal Neptune house</label>
                <select
                  value={formData.neptuneHouse || '1st'}
                  onChange={(e) =>
                    onUpdateField('neptuneHouse', e.target.value as RewriteYourPastFormData['neptuneHouse'])
                  }
                  className={inputClass}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1}>{i + 1}st House</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Where do blindspots show most?</label>
                <input
                  type="text"
                  value={formData.neptuneTheme || ''}
                  onChange={(e) => onUpdateField('neptuneTheme', e.target.value)}
                  placeholder="Romance, money, purpose, boundaries, career, identity..."
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Where are you idealizing or avoiding reality in this area?</label>
              <textarea
                value={formData.neptuneQuestion || ''}
                onChange={(e) => onUpdateField('neptuneQuestion', e.target.value)}
                placeholder="Name the fantasy, projection, or fog that keeps repeating."
                className={`${inputClass} min-h-20 resize-vertical`}
              />
            </div>

            <div className="rounded-lg border border-red-900/30 bg-red-900/10 p-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">Presentation Anchor</div>
              <p className="text-sm text-gray-400">
                Dream can hide blindspots. Nightmare can expose wounds. Meaning-making plus self-awareness creates a coherent
                heart signal.
              </p>
            </div>
          </div>
        </FormSection>
      </div>

      {/* Sidebar (1 column) */}
      <div className="space-y-4">
        {/* Hero Score */}
        <div className="sticky top-4 rounded-lg border border-gray-700 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-400">Hero Coherence Score</div>
          <div className="font-mono text-5xl font-bold text-white mb-2">{heroScore}</div>
          <div className="text-xs text-gray-500">Start filling the workbook to calculate your score.</div>
        </div>

        {/* Transmutation Formula */}
        <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Transmutation Formula</div>
          <div className="space-y-2 font-mono text-xs text-gray-400">
            <div>Dream → Nightmare → Obstacle → New Dream</div>
            <div className="pt-2 space-y-1">
              <div>✓ Meaning over outcome</div>
              <div>✓ Ownership over blame</div>
              <div>✓ Direction over drift</div>
            </div>
          </div>
        </div>

        {/* Limbic Sequence */}
        <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Limbic Sequence</div>
          <div className="space-y-2 font-mono text-xs text-gray-400 leading-relaxed">
            <div>Limbic meaning</div>
            <div className="text-gray-600">↓</div>
            <div>safety or threat coding</div>
            <div className="text-gray-600">↓</div>
            <div>nervous system regulate or react</div>
            <div className="text-gray-600">↓</div>
            <div>coherent or incoherent heart signal</div>
            <div className="text-gray-600">↓</div>
            <div>manifestation pattern</div>
          </div>
        </div>

        {/* Completion */}
        <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Completion</div>
          <div className="mb-2 font-mono text-2xl font-bold text-white">{completionPercent}%</div>
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-300 transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
