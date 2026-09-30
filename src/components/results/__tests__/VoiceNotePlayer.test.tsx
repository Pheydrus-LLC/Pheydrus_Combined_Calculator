import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VoiceNotePlayer } from '../VoiceNotePlayer';

// jsdom has no media playback, so stand in for play/pause and fire the events a browser would.
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { value: false, configurable: true });
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { value: true, configurable: true });
    this.dispatchEvent(new Event('pause'));
  });
});

describe('VoiceNotePlayer', () => {
  it('shows the label and toggles between play and pause', () => {
    render(<VoiceNotePlayer src="/audio/a.mp3" label="Hear Pillar 1 explained" />);
    expect(screen.getByText(/Hear Pillar 1 explained/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Play voice note' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pause voice note' }));
    expect(screen.getByRole('button', { name: 'Play voice note' })).toBeInTheDocument();
  });

  it('pauses the other voice note when a second one starts', () => {
    render(
      <>
        <VoiceNotePlayer src="/audio/a.mp3" label="Note A" />
        <VoiceNotePlayer src="/audio/b.mp3" label="Note B" />
      </>,
    );
    const [first, second] = screen.getAllByRole('button', { name: 'Play voice note' });

    fireEvent.click(first);
    fireEvent.click(second);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName('Play voice note');
    expect(buttons[1]).toHaveAccessibleName('Pause voice note');
  });

  it('shows a message instead of controls when the file fails to load', () => {
    const { container } = render(<VoiceNotePlayer src="/audio/missing.mp3" label="Note" />);
    fireEvent.error(container.querySelector('audio')!);
    expect(screen.getByText(/unavailable right now/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
