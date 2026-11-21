import { useMemo, useState } from 'react';
import { cx } from '@/components/cx';
import { hashSeed, mulberry32, shuffle } from '@/domain/random';
import type { SyllableBuildAnswer, SyllableTile } from '@/domain/types';
import { speakNow } from '@/speech/speak';
import styles from './SyllableBuild.module.css';

/**
 * Interaktiver Silben- und Buchstaben-Baukasten:
 * Das Kind tippt unten Bausteine an, die der Reihe nach in die blauen/roten Silbenfelder springen.
 * Antippen eines gefüllten Feldes legt den Baustein wieder zurück.
 */
export function SyllableBuild({
  answer,
  seedId,
  onChange,
}: {
  answer: SyllableBuildAnswer;
  seedId: string;
  onChange: (parts: string[] | null) => void;
}) {
  const tiles = useMemo(
    () => shuffle(mulberry32(hashSeed(seedId, 'syllable-build')), answer.bank),
    [answer.bank, seedId],
  );
  const [placed, setPlaced] = useState<SyllableTile[]>([]);

  const placedIds = new Set(placed.map((t) => t.id));

  const updatePlaced = (next: SyllableTile[]) => {
    setPlaced(next);
    onChange(next.length === answer.target.length ? next.map((t) => t.text) : null);
  };

  const pickTile = (tile: SyllableTile) => {
    if (placed.length >= answer.target.length || placedIds.has(tile.id)) return;
    if (tile.speak) speakNow(tile.speak);
    updatePlaced([...placed, tile]);
  };

  const removeAt = (index: number) => {
    updatePlaced(placed.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.slots} role="group" aria-label="Deine zusammengesetzten Bausteine">
        {answer.target.map((_, idx) => {
          const tile = placed[idx];
          const isA = idx % 2 === 0;
          return (
            <button
              key={idx}
              type="button"
              className={cx(
                styles.slot,
                tile ? (isA ? styles.filledA : styles.filledB) : isA ? styles.slotA : styles.slotB,
              )}
              aria-label={
                tile
                  ? `Feld ${String(idx + 1)}: ${tile.text}, antippen zum Zurücklegen`
                  : `Feld ${String(idx + 1)}: noch leer`
              }
              disabled={!tile}
              onClick={() => {
                removeAt(idx);
              }}
            >
              {tile ? (
                <>
                  <span>{tile.text}</span>
                  {answer.mode === 'word' && (
                    <svg className={styles.arc} viewBox="0 0 48 12" aria-hidden="true">
                      <path
                        d="M3 2 Q24 12 45 2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </>
              ) : (
                <span className={styles.placeholder}>{idx + 1}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.bank} role="group" aria-label="Silben-Bausteine zum Antippen">
        {tiles.map((tile) => {
          const used = placedIds.has(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              className={styles.tile}
              disabled={used || placed.length >= answer.target.length}
              onClick={() => {
                pickTile(tile);
              }}
            >
              {tile.text}
            </button>
          );
        })}
      </div>

      <p className={styles.hint}>
        Tippe die {answer.mode === 'blend' ? 'Buchstaben' : 'Silben'} der Reihe nach an. Zum Ändern
        tippe oben auf das Feld.
      </p>
    </div>
  );
}
