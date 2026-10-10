import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STUFEN } from '@/config/levels';
import { CIPHER_MESSAGES } from '@/content/cipher';
import { hashSeed, mulberry32, pick } from '@/domain/random';
import type { AppStateV2, Stufe } from '@/domain/types';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

const SEED = 77;

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = (stufe: Stufe) =>
  makeState({ profiles: [makeProfile({ stufe, celebrated: ['welcome:schatzinsel'] })] });

function messageFor(stufe: Stufe) {
  const cfg = STUFEN[stufe].tower.cipher;
  const rng = mulberry32(hashSeed(SEED, 'botschaft'));
  const message = pick(
    rng,
    CIPHER_MESSAGES.filter((m) => cfg.messages.includes(m.from)),
  );
  return { text: message.text, numbers: cfg.numberKey && rng() < 0.5 };
}

beforeEach(() => {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    if (array instanceof Uint32Array) array[0] = SEED;
    return array;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

const letters = () => within(screen.getByRole('group', { name: 'Buchstaben' }));

describe('Geheimschrift', () => {
  for (const stufe of [3, 4] as Stufe[]) {
    it(`Stufe ${String(stufe)}: falscher Buchstabe bleibt weg, richtige füllen alle gleichen Zeichen`, async () => {
      const { text, numbers } = messageFor(stufe);
      const { user, storage } = renderApp('/raetsel/geheimschrift', state(stufe));
      expect(
        screen.getByText(
          numbers ? /Geheimbotschaft in Zahlen/ : /Ich habe dir eine Geheimbotschaft/,
        ),
      ).toBeInTheDocument();
      const chars = Array.from(text.replace(/ /g, ''));
      const first = chars[0] ?? '';
      const wrong = chars.find((c) => c !== first);
      if (wrong) {
        await user.click(letters().getByRole('button', { name: wrong }));
        expect(screen.getByText('Schau noch einmal genau in den Schlüssel.')).toBeInTheDocument();
      }
      await user.click(screen.getByRole('button', { name: 'Tipp' }));
      expect(screen.getByText(/das Zeichen leuchtet im Schlüssel/)).toBeInTheDocument();
      for (const char of [...new Set(chars)]) {
        await user.click(letters().getByRole('button', { name: char }));
      }
      expect(screen.getByText(`Die Botschaft heißt: ${text}`)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Weiter' }));
      expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { cipher: 1 } });
    });
  }
});
