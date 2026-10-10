import { type ReactNode, useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { cx } from '@/components/cx';
import { STUFEN } from '@/config/levels';
import { avatarInfo } from '@/content/avatars';
import { PRINT } from '@/content/print';
import { UI } from '@/content/ui';
import { WORLDS } from '@/content/worlds';
import type { Stufe } from '@/domain/types';
import { hasTopic } from '@/practice/round';
import { TOPIC_ORDER } from '@/practice/topics';
import {
  buildSheets,
  certificateAllowed,
  parsePrintOptions,
  type PrintOptions,
  printSearch,
  worldFor,
} from '@/print/job';
import { PrintDocument } from '@/print/PrintDocument';
import { useAppState } from '@/state/context';
import { applyUpdate, useUpdateWaiting } from '@/state/pwa';
import styles from './Print.module.css';

const STUFE_IDS = Object.values(STUFEN).map((cfg) => cfg.id);

function newSeed(): number {
  return 1 + Math.floor(Math.random() * 9999);
}

const IOS = /iPhone|iPad|iPod/;

/** iOS: installiert (Home-Bildschirm) oder im Browser? */
function iosMode(): 'standalone' | 'browser' | null {
  if (!IOS.test(navigator.userAgent)) return null;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true ? 'standalone' : 'browser';
}

function Check({
  checked,
  disabled = false,
  onChange,
  children,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className={cx(styles.check, disabled && styles.disabled)}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span>{children}</span>
    </label>
  );
}

/** Druckseite im Erwachsenen-Bereich (docs/06 1). Die Auswahl steht in der URL. */
export function Print() {
  const { state } = useAppState();
  const updateWaiting = useUpdateWaiting();
  const [, navigate] = useLocation();
  const search = useSearch();
  const options = useMemo(
    () => parsePrintOptions(search, state.profiles),
    [search, state.profiles],
  );
  const profile = state.profiles.find((p) => p.id === options.profileId);
  const sheets = useMemo(() => buildSheets(options, profile), [options, profile]);
  const world = WORLDS[worldFor(options.stufe)];
  const allowed = certificateAllowed(options, profile);
  const topics = TOPIC_ORDER.filter(
    (t) =>
      t !== 'raetsel' &&
      STUFEN[options.stufe].practiceTopics.includes(t) &&
      hasTopic(t, options.stufe),
  );

  const go = (next: PrintOptions) => {
    // Stufe 1 druckt immer groß (docs/06 1)
    navigate(
      `/erwachsene/drucken?${printSearch({ ...next, large: next.large || next.stufe === 1 })}`,
      {
        replace: true,
      },
    );
  };
  const update = (change: Partial<PrintOptions>) => {
    go({ ...options, ...change });
  };
  const allDone = certificateAllowed({ ...options, certificateAnyway: false }, profile);

  const chooseStufe = (stufe: Stufe) => {
    const { practice, ...rest } = options;
    const keep = practice !== undefined && STUFEN[stufe].practiceTopics.includes(practice);
    go({
      ...rest,
      ...(keep ? { practice } : {}),
      stufe,
      stations: worldFor(stufe) === worldFor(options.stufe) ? options.stations : [],
      large: options.stufe === 1 ? false : options.large,
    });
  };

  return (
    <div className={styles.page}>
      <main className={cx(styles.controls, 'no-print')}>
        <h1 className={styles.title}>{PRINT.title}</h1>

        <section className={styles.section}>
          <h2 className={styles.heading}>{PRINT.forWhom}</h2>
          <div className={styles.choices}>
            {state.profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.choice}
                aria-pressed={options.profileId === p.id}
                onClick={() => {
                  go({
                    ...options,
                    profileId: p.id,
                    stufe: p.stufe,
                    stations: worldFor(p.stufe) === worldFor(options.stufe) ? options.stations : [],
                  });
                }}
              >
                {p.name ?? avatarInfo(p.avatar).name}
              </button>
            ))}
            <button
              type="button"
              className={styles.choice}
              aria-pressed={options.profileId === undefined}
              onClick={() => {
                const { profileId: _old, ...rest } = options;
                go(rest);
              }}
            >
              {PRINT.noChild}
            </button>
          </div>
          <h3 className={styles.subheading}>{PRINT.stufe}</h3>
          <div className={styles.choices}>
            {STUFE_IDS.map((stufe) => (
              <button
                key={stufe}
                type="button"
                className={styles.choice}
                aria-pressed={options.stufe === stufe}
                onClick={() => {
                  chooseStufe(stufe);
                }}
              >
                {STUFEN[stufe].name}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{PRINT.what}</h2>
          <fieldset className={styles.fieldset}>
            <legend className={styles.subheading}>
              {PRINT.stations} · {world.title}
            </legend>
            <Check
              checked={options.stations.length === world.stations.length}
              onChange={(checked) => {
                update({ stations: checked ? world.stations.map((s) => s.number) : [] });
              }}
            >
              {PRINT.selectAll}
            </Check>
            {world.stations.map((station) => (
              <Check
                key={station.id}
                checked={options.stations.includes(station.number)}
                onChange={(checked) => {
                  update({
                    stations: checked
                      ? [...options.stations, station.number]
                      : options.stations.filter((n) => n !== station.number),
                  });
                }}
              >
                {PRINT.stationTitle(station.number, station.title)}
              </Check>
            ))}
            <Button
              variant="secondary"
              onClick={() => {
                update({ seed: newSeed() });
              }}
            >
              {PRINT.otherNumbers}
            </Button>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.subheading}>{PRINT.practice}</legend>
            <label className={styles.selectLabel}>
              {PRINT.practiceTopic}
              <select
                className={styles.select}
                value={options.practice ?? ''}
                onChange={(event) => {
                  const topic = topics.find((t) => t === event.target.value);
                  const { practice: _old, ...rest } = options;
                  go(topic ? { ...rest, practice: topic } : rest);
                }}
              >
                <option value="">{PRINT.practiceNone}</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {UI.practice.topics[t]}
                  </option>
                ))}
              </select>
            </label>
            {options.practice && (
              <Button
                variant="secondary"
                onClick={() => {
                  update({ practiceSeed: newSeed() });
                }}
              >
                {PRINT.rollPractice}
              </Button>
            )}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.subheading}>{UI.practice.topics.raetsel}</legend>
            <Check
              checked={options.riddles}
              onChange={(checked) => {
                update({ riddles: checked });
              }}
            >
              {PRINT.riddles}
            </Check>
            {options.riddles && (
              <Button
                variant="secondary"
                onClick={() => {
                  update({ riddleSeed: newSeed() });
                }}
              >
                {PRINT.rollRiddles}
              </Button>
            )}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.subheading}>{PRINT.certificate}</legend>
            <Check
              checked={options.certificate && allowed}
              disabled={!allowed}
              onChange={(checked) => {
                update({ certificate: checked });
              }}
            >
              {PRINT.certificate} · {world.title}
            </Check>
            {!allDone && <p className={styles.muted}>{PRINT.certificateLocked}</p>}
            <Check
              checked={options.certificateAnyway}
              onChange={(checked) => {
                update({ certificateAnyway: checked });
              }}
            >
              {PRINT.certificateAnyway}
            </Check>
          </fieldset>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{PRINT.options}</h2>
          <Check
            checked={options.solutions}
            onChange={(checked) => {
              update({ solutions: checked });
            }}
          >
            {PRINT.solutions}
          </Check>
          <Check
            checked={options.nameField}
            onChange={(checked) => {
              update({ nameField: checked });
            }}
          >
            {PRINT.nameField}
          </Check>
          <Check
            checked={options.large}
            disabled={options.stufe === 1}
            onChange={(checked) => {
              update({ large: checked });
            }}
          >
            {PRINT.size}: {PRINT.sizeLarge}
          </Check>
          {options.stufe === 1 && <p className={styles.muted}>{PRINT.sizeLargeFixed}</p>}
        </section>

        {/* iOS: window.print() tut im installierten Modus oft nichts (docs/06 1, docs/03 11) */}
        {iosMode() === 'standalone' && <p className={styles.hint}>{PRINT.iosHint}</p>}
        {iosMode() === 'browser' && <p className={styles.hint}>{PRINT.installHint}</p>}
        {updateWaiting && (
          <Button variant="ghost" onClick={applyUpdate}>
            {PRINT.update}
          </Button>
        )}

        <div className={styles.actions}>
          <Button
            block
            disabled={sheets.length === 0}
            onClick={() => {
              window.print();
            }}
          >
            {PRINT.print}
          </Button>
          <LinkButton href="/erwachsene" variant="ghost" block>
            {UI.adults.title}
          </LinkButton>
        </div>

        <h2 className={styles.heading}>{PRINT.preview}</h2>
        {sheets.length === 0 && <p className={styles.muted}>{PRINT.empty}</p>}
      </main>

      <div className={styles.preview} aria-label={PRINT.preview}>
        <PrintDocument sheets={sheets} options={options} />
      </div>
    </div>
  );
}
