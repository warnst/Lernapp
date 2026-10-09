import { useEffect, useState } from 'react';
import { UI } from '@/content/ui';
import { formatMoney, moneyFromFields } from '@/domain/money';
import { cx } from '../cx';
import styles from './Answer.module.css';
import { Keypad } from './Keypad';

type Field = 'euro' | 'cent';
const MAX_DIGITS: Record<Field, number> = { euro: 2, cent: 3 };

export interface MoneyValue {
  euro: string;
  cent: string;
}

/**
 * Geldeingabe mit Feldern „€“ und „Cent“ und eigener Tastatur. Ohne Cent (Stufe 2) nur das
 * Euro-Feld. Ziffern lassen sich auch mit der Tastatur tippen (docs/01 6.2, docs/09 7).
 */
export function MoneyEntry({
  useCents,
  onChange,
}: {
  useCents: boolean;
  onChange: (value: MoneyValue | null) => void;
}) {
  const [value, setValue] = useState<MoneyValue>({ euro: '', cent: '' });
  const [active, setActive] = useState<Field>('euro');

  const update = (next: MoneyValue) => {
    setValue(next);
    onChange(next.euro === '' && next.cent === '' ? null : next);
  };
  const type = (digit: string) => {
    const current = value[active];
    if (current.length >= MAX_DIGITS[active]) return;
    update({ ...value, [active]: current === '0' ? digit : current + digit });
  };
  const erase = () => {
    update({ ...value, [active]: value[active].slice(0, -1) });
  };
  const next = useCents
    ? () => {
        setActive(active === 'euro' ? 'cent' : 'euro');
      }
    : undefined;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (/^\d$/.test(event.key)) type(event.key);
      else if (event.key === 'Backspace') erase();
      else if ((event.key === 'ArrowRight' || event.key === ',') && useCents) setActive('cent');
      else if (event.key === 'ArrowLeft') setActive('euro');
      else return;
      event.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  });

  const box = (field: Field, label: string) => (
    <button
      type="button"
      className={cx(styles.box, active === field && styles.active)}
      aria-label={`${label}: ${value[field] === '' ? '0' : value[field]}`}
      aria-pressed={active === field}
      onClick={() => {
        setActive(field);
      }}
    >
      {value[field]}
    </button>
  );

  return (
    <div>
      <div className={styles.fields}>
        <span className={styles.field}>
          {box('euro', UI.money.euroField)} {UI.money.euro}
        </span>
        {useCents && (
          <span className={styles.field}>
            {box('cent', UI.money.centField)} {UI.money.cent}
          </span>
        )}
      </div>
      <p className={styles.preview} aria-live="polite">
        {value.euro === '' && value.cent === ''
          ? ' '
          : UI.money.preview(formatMoney(moneyFromFields(value.euro, value.cent)))}
      </p>
      <Keypad onDigit={type} onDelete={erase} onNext={next} />
    </div>
  );
}
