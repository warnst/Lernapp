import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { BottomNav } from './BottomNav';
import { BottomSheet } from './BottomSheet';
import { cx } from './cx';
import { ChoiceView } from './game/ChoiceView';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BottomSheet', () => {
  it('schließt bei Wischen nach unten, nicht bei kurzem Ziehen', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet labelledBy="t" onClose={onClose}>
        <h2 id="t">Titel</h2>
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Titel' });
    expect(dialog).toHaveFocus();
    const handle = dialog.firstElementChild as HTMLElement;
    fireEvent.pointerDown(handle, { clientY: 100 });
    fireEvent.pointerUp(handle, { clientY: 140 });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerUp(handle, { clientY: 400 });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(handle, { clientY: 100 });
    fireEvent.pointerUp(handle, { clientY: 300 });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Hintergrund antippen schließt, andere Tasten nicht', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet labelledBy="t" onClose={onClose}>
        <h2 id="t">Titel</h2>
      </BottomSheet>,
    );
    await userEvent.keyboard('a');
    expect(onClose).not.toHaveBeenCalled();
    const [backdrop] = screen.getAllByRole('button', { name: 'Schließen' });
    if (!backdrop) throw new Error('Hintergrund fehlt');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('BottomNav', () => {
  it('zeigt das Welt-Icon und liest beim Tippen nichts vor', async () => {
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', {
      speaking: false,
      speak,
      cancel: vi.fn(),
      getVoices: () => [],
    });
    const { hook } = memoryLocation({ path: '/' });
    render(
      <Router hook={hook}>
        <BottomNav world="kleine-bucht" />
      </Router>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Üben' }));
    expect(speak).not.toHaveBeenCalled();
  });
});

describe('cx', () => {
  it('lässt leere Klassen weg', () => {
    expect(cx('a', false, undefined, 'b')).toBe('a b');
  });
});

describe('ChoiceView Vorlese-Buttons', () => {
  it('liest Text-Antwortmöglichkeiten vor, ohne die Antwort auszuwählen', async () => {
    const onPick = vi.fn();
    render(
      <ChoiceView
        answer={{
          type: 'choice',
          layout: 'cards',
          shuffle: false,
          options: [
            { id: '1', label: 'Rechteck', correct: true },
            { id: '2', label: 'Kreis' },
            { id: '3', label: 'Quadrat' },
          ],
        }}
        seedId="test"
        tried={[]}
        solved={false}
        readOnTap={false}
        onPick={onPick}
      />,
    );

    const speakButtons = screen.getAllByRole('button', { name: 'Antwort vorlesen' });
    expect(speakButtons).toHaveLength(3);
    const firstSpeak = speakButtons[0];
    if (!firstSpeak) throw new Error('Vorlese-Button fehlt');
    await userEvent.click(firstSpeak);
    expect(onPick).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Rechteck' }));
    expect(onPick).toHaveBeenCalledWith('1');
  });

  it('zeigt keinen Vorlese-Button bei reinen Formen-Bildkarten', () => {
    render(
      <ChoiceView
        answer={{
          type: 'choice',
          layout: 'cards',
          shuffle: false,
          options: [
            { id: '1', label: 'Rechteck', shape: 'rechteck', correct: true },
            { id: '2', label: 'Kreis', shape: 'kreis' },
          ],
        }}
        seedId="test"
        tried={[]}
        solved={false}
        readOnTap={false}
        onPick={vi.fn()}
      />,
    );

    expect(screen.queryAllByRole('button', { name: 'Antwort vorlesen' })).toHaveLength(0);
  });
});
