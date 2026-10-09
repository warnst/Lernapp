import { useLocation } from 'wouter';
import { Screen } from '@/components/Screen';
import { avatarInfo } from '@/content/avatars';
import { UI } from '@/content/ui';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { useAppState } from '@/state/context';
import styles from './WhoPlays.module.css';

/** „Wer spielt?“ – große Karten mit Tier und Name (docs/09, 3.2). */
export function WhoPlays() {
  const { state, dispatch } = useAppState();
  const [, navigate] = useLocation();
  return (
    <Screen title={UI.whoPlays.title}>
      <div className={styles.cards}>
        {state.profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            className={styles.card}
            onClick={() => {
              dispatch({ type: 'set-active', id: profile.id });
              navigate('/');
            }}
          >
            <AvatarIllustration avatar={profile.avatar} size={96} />
            {profile.name ?? avatarInfo(profile.avatar).name}
          </button>
        ))}
      </div>
    </Screen>
  );
}
