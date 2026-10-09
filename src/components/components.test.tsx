import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { BottomNav } from './BottomNav';
import { BottomSheet } from './BottomSheet';
import { cx } from './cx';

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
  it('liest Tab-Namen nur bei automatischem Vorlesen vor und zeigt das Welt-Icon', async () => {
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', {
      speaking: false,
      speak,
      cancel: vi.fn(),
      getVoices: () => [],
    });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    );
    const { hook } = memoryLocation({ path: '/' });
    const { rerender } = render(
      <Router hook={hook}>
        <BottomNav world="kleine-bucht" readAloud />
      </Router>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Üben' }));
    expect(speak).toHaveBeenCalledOnce();
    rerender(
      <Router hook={hook}>
        <BottomNav world="schatzinsel" readAloud={false} />
      </Router>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Schätze' }));
    expect(speak).toHaveBeenCalledOnce();
  });
});

describe('cx', () => {
  it('lässt leere Klassen weg', () => {
    expect(cx('a', false, undefined, 'b')).toBe('a b');
  });
});
