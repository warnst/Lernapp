import { type ChangeEvent, useId, useState } from 'react';
import { Link } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { ChildForm, type NewChild } from '@/components/ChildForm';
import { Screen } from '@/components/Screen';
import { STUFEN } from '@/config/levels';
import { avatarInfo } from '@/content/avatars';
import { UI } from '@/content/ui';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { UiIcon } from '@/illustrations/UiIcon';
import { useAppState } from '@/state/context';
import { exportState, importState, MAX_PROFILES } from '@/state/storage';
import styles from './Adults.module.css';

function download(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** Erwachsenen-Bereich: Kinder, Drucken, Daten sichern, Hinweise (docs/09, Abschnitt 4). */
export function Adults() {
  const { state, dispatch } = useAppState();
  const fileId = useId();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  const add = (child: NewChild) => {
    dispatch({
      type: 'add-profile',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...child,
    });
    setAdding(false);
  };

  const backup = () => {
    const now = new Date();
    download(
      `schatzinsel-sicherung-${now.toISOString().slice(0, 10)}.json`,
      exportState(state, now),
    );
  };

  const restore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const loaded = importState(await file.text());
    if (loaded) dispatch({ type: 'replace', state: loaded });
    setMessage(loaded ? UI.adults.imported : UI.adults.importFailed);
  };

  return (
    <Screen title={UI.adults.title}>
      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.adults.children}</h2>
        <ul className={styles.list}>
          {state.profiles.map((profile) => {
            const name = profile.name ?? avatarInfo(profile.avatar).name;
            const stufe = STUFEN[profile.stufe];
            return (
              <li key={profile.id}>
                <Link href={`/erwachsene/kind/${profile.id}`} className={styles.child}>
                  <AvatarIllustration avatar={profile.avatar} size={48} />
                  <span className={styles.childName}>{name}</span>
                  <span className={styles.muted}>
                    {UI.adults.stufe} {stufe.name}
                  </span>
                  <span className={styles.muted}>{UI.adults.edit}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        {adding ? (
          <ChildForm onSave={add} />
        ) : (
          state.profiles.length < MAX_PROFILES && (
            <Button
              variant="secondary"
              onClick={() => {
                setAdding(true);
              }}
            >
              <UiIcon name="plus" /> {UI.adults.addChild}
            </Button>
          )
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.adults.print}</h2>
        <LinkButton href="/erwachsene/drucken" variant="secondary">
          {UI.adults.printLink}
        </LinkButton>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.adults.backup}</h2>
        <Button variant="secondary" onClick={backup}>
          <UiIcon name="download" /> {UI.adults.download}
        </Button>
        <input
          id={fileId}
          className={styles.file}
          type="file"
          accept="application/json,.json"
          onChange={(event) => void restore(event)}
        />
        <label htmlFor={fileId} className={styles.fileLabel}>
          <UiIcon name="upload" /> {UI.adults.upload}
        </label>
        <p aria-live="polite">{message}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.adults.notes}</h2>
        <p className={styles.muted}>{UI.adults.storageNote}</p>
      </section>

      <LinkButton href="/" variant="ghost">
        {UI.adults.back}
      </LinkButton>
    </Screen>
  );
}
