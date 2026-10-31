import type { ReactNode } from 'react';
import { Redirect, useLocation } from 'wouter';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { WORLDS } from '@/content/worlds';
import type { Profile } from '@/domain/types';
import { useAppState } from '@/state/context';
import { activeProfile, starCount, worldOf } from '@/state/progress';

/**
 * Rahmen für die Kinder-Bildschirme mit Kopfzeile und unterer Navigation.
 * Ohne Einrichtung geht es zur Startseite (dort die Einrichtung), ohne aktives Kind zu „Wer spielt?“.
 */
export function ChildLayout({ children }: { children: (profile: Profile) => ReactNode }) {
  const { state } = useAppState();
  const [path] = useLocation();
  if (!state.setupDone || state.profiles.length === 0) return <Redirect to="/" />;
  const profile = activeProfile(state);
  if (!profile) return <Redirect to="/wer-spielt" />;
  const baseWorld = WORLDS[worldOf(profile)];
  const activeWorld = path.startsWith('/kosmos') ? WORLDS.kosmos : baseWorld;
  return (
    <>
      <AppHeader
        profile={profile}
        stars={starCount(profile, activeWorld.stations)}
        totalStars={activeWorld.stations.length}
      />
      {children(profile)}
      <BottomNav world={baseWorld.id} />
    </>
  );
}
