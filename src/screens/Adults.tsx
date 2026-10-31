import { type ChangeEvent, useEffect, useId, useState } from 'react';
import { Link } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { ChildForm, type NewChild } from '@/components/ChildForm';
import { Screen } from '@/components/Screen';
import { STUFEN } from '@/config/levels';
import { avatarInfo } from '@/content/avatars';
import { UI } from '@/content/ui';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { UiIcon } from '@/illustrations/UiIcon';
import {
  getVoicePreference,
  listGermanVoices,
  setVoicePreference,
  stopSpeaking,
  toggleSpeak,
  VOICE_AUTO,
  VOICE_CLOUD,
} from '@/speech/speak';
import { useAppState } from '@/state/context';
import {
  BROKEN_KEY,
  browserStorage,
  canStore,
  exportState,
  importState,
  MAX_PROFILES,
} from '@/state/storage';
import styles from './Adults.module.css';

function download(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** Aufgehobene, unlesbare Daten (siehe loadState). */
function readBroken(storage: Storage | undefined): string | null {
  try {
    return storage?.getItem(BROKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

/** Erwachsenen-Bereich: Kinder, Drucken, Speichern, Daten sichern, Hinweise (docs/09, Abschnitt 4). */
export function Adults() {
  const { state, dispatch } = useAppState();
  const fileId = useId();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [voicePref, setVoicePref] = useState(getVoicePreference);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(listGermanVoices);
  const [storage] = useState(browserStorage);
  const storable = canStore(storage);
  const broken = readBroken(storage);

  useEffect(() => {
    if (!('storage' in navigator) || !('persisted' in navigator.storage)) return;
    navigator.storage.persisted().then(setPersisted, () => undefined);
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const speech = window.speechSynthesis;
    const update = () => {
      setVoices(listGermanVoices());
    };
    update();
    speech.onvoiceschanged = update;
    return () => {
      speech.onvoiceschanged = null;
    };
  }, []);

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
        <label htmlFor={`${fileId}-voice`} className={styles.heading}>
          {UI.adults.voice}
        </label>
        <select
          id={`${fileId}-voice`}
          className={styles.select}
          value={voicePref}
          onChange={(event) => {
            const next = event.target.value;
            setVoicePref(next);
            setVoicePreference(next);
            stopSpeaking();
          }}
        >
          <option value={VOICE_CLOUD}>{UI.adults.voiceCloud}</option>
          <option value={VOICE_AUTO}>{UI.adults.voiceAuto}</option>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={() => {
            stopSpeaking();
            toggleSpeak(UI.adults.voiceSample);
          }}
        >
          <UiIcon name="lautsprecher" /> {UI.adults.voicePreview}
        </Button>
        <p className={styles.muted}>{UI.adults.voiceHint}</p>
      </section>

      <section className={styles.section} aria-labelledby={`${fileId}-speicher`}>
        <h2 id={`${fileId}-speicher`} className={styles.heading}>
          {UI.adults.storage}
        </h2>
        <p className={styles.status}>
          <UiIcon name={storable ? 'haken' : 'gluehbirne'} />
          {storable ? UI.adults.storageOk : UI.adults.storageOff}
        </p>
        {persisted !== null && (
          <p className={styles.muted}>{persisted ? UI.adults.persisted : UI.adults.notPersisted}</p>
        )}
        <p className={styles.muted}>{UI.adults.address(window.location.host)}</p>
        <p className={styles.muted}>{UI.adults.apple}</p>
        {broken !== null && (
          <>
            <p>{UI.adults.broken}</p>
            <Button
              variant="secondary"
              onClick={() => {
                download('schatzinsel-urspruengliche-daten.json', broken);
              }}
            >
              <UiIcon name="download" /> {UI.adults.brokenDownload}
            </Button>
          </>
        )}
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
        <p className={styles.muted}>{UI.adults.version(__APP_VERSION__)}</p>
      </section>

      <LinkButton href="/" variant="ghost">
        {UI.adults.back}
      </LinkButton>
    </Screen>
  );
}
