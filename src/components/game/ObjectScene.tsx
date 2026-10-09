import { useState } from 'react';
import { UI } from '@/content/ui';
import type { ObjectGroup } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import { cx } from '../cx';
import styles from './Game.module.css';

type Group = ObjectGroup & { leaving?: number; label?: string };

/**
 * Zählbare Dinge, locker verteilt. Antippen setzt einen Zählpunkt (Zählhilfe, wird nicht
 * ausgewertet). Wegschwimmende Dinge sind blass mit Pfeil (docs/02 6.4, docs/11).
 */
export function ObjectScene({ groups }: { groups: Group[] }) {
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const toggle = (key: string) => {
    setMarked((before) => {
      const next = new Set(before);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  return (
    <>
      {groups.map((group, g) => (
        <div key={g} className={styles.group}>
          {group.label !== undefined && <span className={styles.sceneLabel}>{group.label}</span>}
          <div className={styles.objects}>
            {Array.from({ length: group.count }, (_, i) => {
              const key = `${String(g)}-${String(i)}`;
              const leaving = i >= group.count - (group.leaving ?? 0);
              return (
                <button
                  key={key}
                  type="button"
                  className={cx(styles.object, leaving && styles.leaving)}
                  aria-pressed={marked.has(key)}
                  aria-label={UI.scene.countHelp(i + 1)}
                  onClick={() => {
                    toggle(key);
                  }}
                >
                  <ItemIcon itemId={group.itemId} size={52} />
                </button>
              );
            })}
            {(group.leaving ?? 0) > 0 && (
              <span className={styles.arrow} aria-hidden="true">
                <UiIcon name="pfeil-weiter" size={32} />
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
