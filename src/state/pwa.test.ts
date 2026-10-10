import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registered } from '@/test/pwa-register';
import { isBusy, onNewVersion, startServiceWorker, useReloadOnNavigate } from './pwa';

afterEach(() => {
  vi.restoreAllMocks();
});

function stubReload() {
  const reload = vi.fn();
  vi.spyOn(window, 'location', 'get').mockReturnValue({
    pathname: '/station/strand',
    reload,
  } as unknown as Location);
  return reload;
}

describe('isBusy', () => {
  it('erkennt laufende Aufgaben und Rätsel', () => {
    expect(isBusy('/station/strand')).toBe(true);
    expect(isBusy('/ueben/spiel')).toBe(true);
    expect(isBusy('/raetsel/sudoku')).toBe(true);
    expect(isBusy('/')).toBe(false);
    expect(isBusy('/ueben')).toBe(false);
    expect(isBusy('/raetsel')).toBe(false);
    expect(isBusy('/raetsel/kiko')).toBe(false);
  });
});

describe('neue Version', () => {
  it('lädt auf der Karte sofort, in einer Aufgabe erst beim nächsten Bildschirm', () => {
    const reload = stubReload();
    const { rerender } = renderHook(
      ({ path }) => {
        useReloadOnNavigate(path);
      },
      { initialProps: { path: '/station/strand' } },
    );
    expect(reload).not.toHaveBeenCalled();

    startServiceWorker();
    const options = registered.at(-1);
    options?.onNeedRefresh?.();
    options?.onNeedReload?.();
    expect(reload).not.toHaveBeenCalled();

    rerender({ path: '/station/strand/geschafft' });
    expect(reload).toHaveBeenCalledOnce();

    onNewVersion('/');
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
