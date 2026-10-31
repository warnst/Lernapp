import { useId, useState } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { UI } from '@/content/ui';
import { formatMoney, moneyFromFields } from '@/domain/money';
import type { GridAnswer, GridCell, StufeConfig } from '@/domain/types';
import { UiIcon } from '@/illustrations/UiIcon';
import { canSpeak, toggleSpeak } from '@/speech/speak';
import { cx } from '../cx';
import { MoneyEntry, type MoneyValue } from './MoneyEntry';
import { NumberEntry } from './NumberEntry';
import styles from './Riddle.module.css';

type Values = Partial<Record<string, number>>;

/** Lage der Felder im Rechendreieck (Prozent von Breite und Höhe der Fläche). */
const TRIANGLE_SPOTS: Record<string, { x: number; y: number }> = {
  a: { x: 50, y: 24 },
  b: { x: 28, y: 66 },
  c: { x: 72, y: 66 },
  ab: { x: 14, y: 40 },
  bc: { x: 50, y: 92 },
  ca: { x: 86, y: 40 },
};

function wallRows(cells: readonly GridCell[]): GridCell[][] {
  const width = cells.filter((cell) => cell.id.startsWith('r0c')).length;
  return Array.from({ length: width }, (_, i) => width - 1 - i).map((row) =>
    Array.from({ length: width - row }, (_, col) => {
      const cell = cells.find((c) => c.id === `r${String(row)}c${String(col)}`);
      if (!cell) throw new Error(`Feld r${String(row)}c${String(col)} fehlt`);
      return cell;
    }),
  );
}

function houseLayout(cells: readonly GridCell[]): {
  roof: GridCell;
  floors: [GridCell, GridCell][];
} {
  const roof = cells.find((c) => c.id === 'dach');
  if (!roof) throw new Error('Feld dach fehlt');
  const count = (cells.length - 1) / 2;
  const floors: [GridCell, GridCell][] = Array.from({ length: count }, (_, row) => {
    const left = cells.find((c) => c.id === `r${String(row)}l`);
    const right = cells.find((c) => c.id === `r${String(row)}r`);
    if (!left || !right) throw new Error(`Etage ${String(row)} fehlt`);
    return [left, right];
  });
  return { roof, floors };
}

/**
 * Erklärt ein angetipptes leeres Feld in Kindersprache (besonders für Stufe 1 & 2,
 * wenn Kinder noch nicht flüssig lesen können).
 */
function explainCell(
  answer: GridAnswer,
  cellId: string,
  locked: readonly string[],
  values: Values,
  show: (v: number) => string,
): string {
  const known = (id: string): number | undefined => {
    const cell = answer.cells.find((c) => c.id === id);
    if (!cell) return undefined;
    if (cell.given || locked.includes(id)) return cell.value;
    return values[id];
  };

  if (answer.shape === 'house') {
    if (cellId === 'dach') {
      const count = (answer.cells.length - 1) / 2;
      for (let row = 0; row < count; row++) {
        const l = known(`r${String(row)}l`);
        const r = known(`r${String(row)}r`);
        if (l !== undefined && r !== undefined) {
          return `In einer Etage wohnen ${show(l)} und ${show(r)}. Rechne ${show(l)} plus ${show(r)} für das Dach.`;
        }
      }
      return 'Beide Zimmer einer Etage ergeben zusammen die Zahl oben im Dach.';
    }
    const match = /^r(\d+)([lr])$/.exec(cellId);
    if (match) {
      const row = match[1] ?? '0';
      const side = match[2] === 'l' ? 'r' : 'l';
      const dach = known('dach');
      const partner = known(`r${row}${side}`);
      if (dach !== undefined && partner !== undefined) {
        return `Im Dach steht ${show(dach)}, nebenan im Zimmer steht ${show(partner)}. Wie viel fehlt von ${show(partner)} noch bis ${show(dach)}?`;
      }
    }
    return 'Beide Zimmer nebeneinander ergeben zusammen die Zahl im Dach.';
  }

  if (answer.shape === 'wall') {
    const match = /^r(\d+)c(\d+)$/.exec(cellId);
    if (match) {
      const row = Number(match[1]);
      const col = Number(match[2]);
      if (row > 0) {
        const leftBelow = known(`r${String(row - 1)}c${String(col)}`);
        const rightBelow = known(`r${String(row - 1)}c${String(col + 1)}`);
        if (leftBelow !== undefined && rightBelow !== undefined) {
          return `Unter diesem Stein stehen ${show(leftBelow)} und ${show(rightBelow)}. Wie viel ist ${show(leftBelow)} plus ${show(rightBelow)} zusammen?`;
        }
      }
      const aboveRight = known(`r${String(row + 1)}c${String(col)}`);
      const rightSibling = known(`r${String(row)}c${String(col + 1)}`);
      if (aboveRight !== undefined && rightSibling !== undefined) {
        return `Darüber steht ${show(aboveRight)} und daneben ${show(rightSibling)}. Wie viel fehlt von ${show(rightSibling)} noch bis ${show(aboveRight)}?`;
      }
      if (col > 0) {
        const aboveLeft = known(`r${String(row + 1)}c${String(col - 1)}`);
        const leftSibling = known(`r${String(row)}c${String(col - 1)}`);
        if (aboveLeft !== undefined && leftSibling !== undefined) {
          return `Darüber steht ${show(aboveLeft)} und daneben ${show(leftSibling)}. Wie viel fehlt von ${show(leftSibling)} noch bis ${show(aboveLeft)}?`;
        }
      }
    }
    return 'Immer zwei Steine nebeneinander ergeben zusammen den Stein darüber.';
  }

  const pairs: Record<string, [string, string]> = {
    ab: ['a', 'b'],
    bc: ['b', 'c'],
    ca: ['c', 'a'],
  };
  const outer = pairs[cellId];
  if (outer) {
    const p1 = known(outer[0]);
    const p2 = known(outer[1]);
    if (p1 !== undefined && p2 !== undefined) {
      return `Daneben im Dreieck stehen ${show(p1)} und ${show(p2)}. Rechne ${show(p1)} plus ${show(p2)}.`;
    }
  }
  return 'Zwei innere Felder ergeben zusammen das Feld außen an ihrer Seite.';
}

/**
 * Zahlenmauer und Rechendreieck (docs/10 3): Leere Felder antippen, Wert im Sheet eingeben.
 * Felder, die beim Prüfen schon stimmten, sind fest (locked).
 */
export function GridView({
  answer,
  config,
  locked,
  readOnTap,
  onChange,
}: {
  answer: GridAnswer;
  config: StufeConfig;
  locked: readonly string[];
  readOnTap: boolean;
  onChange: (values: Values | null) => void;
}) {
  const titleId = useId();
  const [values, setValues] = useState<Values>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<number | null>(null);
  const show = (value: number) => (answer.unit === 'cents' ? formatMoney(value) : String(value));

  const commit = () => {
    if (editing === null) return;
    const next: Values = { ...values, [editing]: draft ?? undefined };
    setValues(next);
    setEditing(null);
    const open = answer.cells.filter((cell) => !cell.given);
    const filled = Object.fromEntries(
      open.map((cell) => [cell.id, locked.includes(cell.id) ? cell.value : next[cell.id]]),
    );
    onChange(open.every((cell) => filled[cell.id] !== undefined) ? filled : null);
  };

  const renderCell = (cell: GridCell) => {
    if (cell.given) {
      return (
        <span key={cell.id} className={cx(styles.cell, styles.given)}>
          {show(cell.value)}
        </span>
      );
    }
    if (locked.includes(cell.id)) {
      return (
        <span
          key={cell.id}
          className={cx(styles.cell, styles.locked)}
          role="img"
          aria-label={UI.riddle.cellLocked(show(cell.value))}
        >
          {show(cell.value)}
          <UiIcon name="haken" size={16} className={styles.cellCheck} />
        </span>
      );
    }
    const value = values[cell.id];
    return (
      <button
        key={cell.id}
        type="button"
        className={cx(styles.cell, styles.open)}
        aria-label={value === undefined ? UI.riddle.cellEmpty : UI.riddle.cellValue(show(value))}
        onClick={() => {
          setDraft(value ?? null);
          setEditing(cell.id);
          if (config.autoRead) {
            toggleSpeak(explainCell(answer, cell.id, locked, values, show));
          }
        }}
      >
        {value === undefined ? '' : show(value)}
      </button>
    );
  };

  const cellExplanation =
    editing === null ? '' : explainCell(answer, editing, locked, values, show);

  return (
    <div>
      {answer.shape === 'wall' ? (
        <div className={styles.wall} role="group" aria-label={UI.riddle.wall}>
          {wallRows(answer.cells).map((row, i) => (
            <div key={i} className={styles.wallRow}>
              {row.map(renderCell)}
            </div>
          ))}
        </div>
      ) : answer.shape === 'house' ? (
        (() => {
          const house = houseLayout(answer.cells);
          return (
            <div className={styles.house} role="group" aria-label={UI.riddle.house}>
              <div className={styles.houseRoof}>{renderCell(house.roof)}</div>
              <div className={styles.houseBody}>
                {house.floors.map(([left, right], i) => (
                  <div key={i} className={styles.houseFloor}>
                    {renderCell(left)}
                    <span className={styles.housePlus} aria-hidden="true">
                      +
                    </span>
                    {renderCell(right)}
                  </div>
                ))}
              </div>
            </div>
          );
        })()
      ) : (
        <div className={styles.triangle} role="group" aria-label={UI.riddle.triangle}>
          <svg className={styles.triangleLines} viewBox="0 0 100 100" aria-hidden="true">
            <polygon points="50,6 8,82 92,82" />
          </svg>
          {answer.cells.map((cell) => {
            const spot = TRIANGLE_SPOTS[cell.id];
            return (
              <div
                key={cell.id}
                className={cx(styles.spot, cell.id.length === 1 && styles.inner)}
                style={{ left: `${String(spot?.x ?? 0)}%`, top: `${String(spot?.y ?? 0)}%` }}
              >
                {renderCell(cell)}
              </div>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <BottomSheet
          labelledBy={titleId}
          onClose={() => {
            setEditing(null);
          }}
        >
          <div className={styles.cellSheet}>
            <div className={styles.cellSheetHeader}>
              <h2 id={titleId}>{UI.riddle.cellTitle}</h2>
              {canSpeak() && (
                <button
                  type="button"
                  className={styles.cellSpeakBtn}
                  aria-label={UI.riddle.cellRead}
                  onClick={() => {
                    toggleSpeak(cellExplanation);
                  }}
                >
                  <UiIcon name="lautsprecher" size={24} />
                </button>
              )}
            </div>
            <p className={styles.cellHint}>{cellExplanation}</p>
            {answer.unit === 'cents' ? (
              <MoneyEntry
                useCents={config.money.useCents}
                onChange={(money: MoneyValue | null) => {
                  setDraft(money ? moneyFromFields(money.euro, money.cent) : null);
                }}
              />
            ) : (
              <NumberEntry
                mode={config.numberInput}
                max={config.numbers.max}
                readOnTap={readOnTap}
                onChange={setDraft}
              />
            )}
            <Button block disabled={draft === null} onClick={commit}>
              {UI.riddle.cellDone}
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
