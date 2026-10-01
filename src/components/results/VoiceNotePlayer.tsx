/**
 * VoiceNotePlayer - compact audio player for the pillar voice notes.
 * Custom controls so it looks the same on every browser and phone.
 * Audio loads only when played, and starting one note pauses any other.
 * Progress shows as a decorative waveform that fills in as the note plays.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { waveformBars } from '../../utils/waveform';

const GOLD = '#C9A84C';
const CORMORANT = "'Cormorant Garamond', Georgia, serif";
const INTER = "'Inter', Arial, sans-serif";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceNotePlayer({
  src,
  label,
  variant = 0,
}: {
  src: string;
  label: string;
  /** Picks one of the two waveform shapes, so neighbouring notes look different */
  variant?: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const [seekFocused, setSeekFocused] = useState(false);
  const bars = useMemo(() => waveformBars(44, variant), [variant]);
  const progress = duration ? current / duration : 0;

  // `play` doesn't bubble, so listen in the capture phase to hear every <audio> on the page.
  useEffect(() => {
    const onAnyPlay = (e: Event) => {
      if (e.target !== audioRef.current) audioRef.current?.pause();
    };
    document.addEventListener('play', onAnyPlay, true);
    return () => document.removeEventListener('play', onAnyPlay, true);
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      // Rejections here are interrupted plays (e.g. paused mid-load); real failures fire `error`.
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  }

  return (
    <div
      data-print-card
      data-print-keep-with-next
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 14px',
        margin: '0 0 14px',
        background: 'rgba(201,168,76,0.08)',
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: '6px',
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onError={() => {
          setFailed(true);
          setPlaying(false);
        }}
      />

      <button
        type="button"
        onClick={toggle}
        disabled={failed}
        aria-label={playing ? 'Pause voice note' : 'Play voice note'}
        style={{
          flexShrink: 0,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 'none',
          background: failed ? 'rgba(201,168,76,0.3)' : GOLD,
          color: '#0C1128',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: failed ? 'default' : 'pointer',
          padding: 0,
        }}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 2.5v11a.5.5 0 0 0 .77.42l8.5-5.5a.5.5 0 0 0 0-.84l-8.5-5.5A.5.5 0 0 0 4 2.5z" fill="currentColor" />
          </svg>
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: '0 0 6px',
            fontFamily: CORMORANT,
            fontStyle: 'italic',
            fontSize: '1.05rem',
            lineHeight: 1.3,
            color: '#E8DEFF',
          }}
        >
          🎧 {label}
        </p>
        {failed ? (
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#A098C0', fontFamily: INTER }}>
            This voice note is unavailable right now.
          </p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div
              style={{
                position: 'relative',
                flex: '0 1 300px',
                minWidth: 0,
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                borderRadius: '4px',
                outline: seekFocused ? `2px solid ${GOLD}` : 'none',
                outlineOffset: '3px',
              }}
            >
              {bars.map((h, i) => (
                <span
                  key={i}
                  data-wave-bar
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    maxWidth: '5px',
                    height: `${Math.max(h * 100, 12)}%`,
                    borderRadius: '999px',
                    background: (i + 0.5) / bars.length <= progress ? GOLD : 'rgba(192,176,240,0.28)',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
              {/* Invisible slider over the bars: tap, drag and arrow keys all seek */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={current}
                disabled={!duration}
                onChange={(e) => seek(Number(e.target.value))}
                onFocus={() => setSeekFocused(true)}
                onBlur={() => setSeekFocused(false)}
                aria-label="Seek voice note"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  margin: 0,
                  opacity: 0,
                  cursor: duration ? 'pointer' : 'default',
                }}
              />
            </div>
            <span
              style={{
                flexShrink: 0,
                fontSize: '0.72rem',
                color: '#A098C0',
                fontFamily: INTER,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTime(current)}
              {duration ? ` / ${formatTime(duration)}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
