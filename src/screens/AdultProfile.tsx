import { useId, useState } from 'react';
import { useLocation } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import choice from '@/components/Choice.module.css';
import { Screen } from '@/components/Screen';
import { STUFEN } from '@/config/levels';
import { AVATARS, avatarInfo } from '@/content/avatars';
import { UI } from '@/content/ui';
import { WORLDS } from '@/content/worlds';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { StufeIcon } from '@/illustrations/StufeIcon';
import { useAppState } from '@/state/context';
import { isCompleted, worldOf } from '@/state/progress';
import styles from './AdultProfile.module.css';

type Confirm = 'reset' | 'delete' | undefined;

/** Ein Kind bearbeiten: Name, Tier, Stufe, freischalten, zurücksetzen, löschen (docs/09, 4). */
export function AdultProfile({ profileId }: { profileId: string }) {
  const { state, dispatch } = useAppState();
  const [, navigate] = useLocation();
  const nameId = useId();
  const [confirm, setConfirm] = useState<Confirm>();
  const profile = state.profiles.find((p) => p.id === profileId);

  if (!profile) {
    return (
      <Screen title={UI.adults.title}>
        <p>{UI.adults.unknownChild}</p>
        <LinkButton href="/erwachsene">{UI.adults.toList}</LinkButton>
      </Screen>
    );
  }

  const name = profile.name ?? avatarInfo(profile.avatar).name;
  const world = worldOf(profile);
  const unlocked = profile.worlds[world]?.unlockAll === true;
  const bayDone =
    world === 'kleine-bucht' &&
    WORLDS['kleine-bucht'].stations.every((s) => isCompleted(profile, world, s.id));

  return (
    <Screen title={name}>
      <section className={styles.section}>
        <label htmlFor={nameId} className={styles.heading}>
          {UI.adults.name}
        </label>
        <input
          id={nameId}
          className={styles.input}
          defaultValue={profile.name ?? ''}
          maxLength={20}
          autoComplete="off"
          onBlur={(event) => {
            dispatch({ type: 'update-profile', id: profile.id, name: event.target.value });
          }}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.adults.animal}</h2>
        <div className={choice.grid}>
          {AVATARS.map((info) => (
            <button
              key={info.id}
              type="button"
              className={choice.option}
              aria-pressed={profile.avatar === info.id}
              onClick={() => {
                dispatch({ type: 'update-profile', id: profile.id, avatar: info.id });
              }}
            >
              <AvatarIllustration avatar={info.id} size={56} />
              {info.name}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.adults.stufe}</h2>
        {bayDone && <p className={styles.hint}>{UI.adults.bayDone}</p>}
        <div className={styles.stufen}>
          {Object.values(STUFEN).map((config) => (
            <button
              key={config.id}
              type="button"
              className={choice.option}
              aria-pressed={profile.stufe === config.id}
              onClick={() => {
                dispatch({ type: 'update-profile', id: profile.id, stufe: config.id });
              }}
            >
              <StufeIcon icon={config.icon} size={48} />
              <span className={choice.label}>{config.name}</span>
              <span className={choice.hint}>{config.ageHint}</span>
            </button>
          ))}
        </div>
        <p className={styles.muted}>{UI.stufen[profile.stufe]}</p>
      </section>

      <section className={styles.section}>
        {unlocked && <p className={styles.muted}>{UI.adults.unlockAllOn}</p>}
        <Button
          variant="secondary"
          onClick={() => {
            dispatch({ type: 'set-unlock-all', id: profile.id, world, value: !unlocked });
          }}
        >
          {unlocked ? UI.adults.lockAgain : UI.adults.unlockAll}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setConfirm('reset');
          }}
        >
          {UI.adults.reset}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setConfirm('delete');
          }}
        >
          {UI.adults.delete}
        </Button>
        {confirm && (
          <div className={styles.confirm} role="alertdialog" aria-label={UI.adults[confirm]}>
            <p>
              {confirm === 'reset' ? UI.adults.resetConfirm(name) : UI.adults.deleteConfirm(name)}
            </p>
            <p className={styles.muted}>{UI.adults.storageNote}</p>
            <Button
              onClick={() => {
                setConfirm(undefined);
              }}
            >
              {UI.adults.cancel}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (confirm === 'reset') {
                  dispatch({ type: 'reset-progress', id: profile.id });
                  setConfirm(undefined);
                } else {
                  dispatch({ type: 'delete-profile', id: profile.id });
                  navigate('/erwachsene');
                }
              }}
            >
              {confirm === 'reset' ? UI.adults.resetDo : UI.adults.deleteDo}
            </Button>
          </div>
        )}
      </section>

      <LinkButton href="/erwachsene" variant="ghost">
        {UI.adults.toList}
      </LinkButton>
    </Screen>
  );
}
