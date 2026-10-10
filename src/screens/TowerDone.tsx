import { useState } from 'react';
import { Button, LinkButton } from '@/components/Button';
import { ChestPick } from '@/components/ChestPick';
import { FreshItems } from '@/components/FreshItems';
import { JokeBox } from '@/components/JokeBox';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { floorCompleted, floorInfo } from '@/domain/tower';
import { Tower as TowerArt } from '@/illustrations/Tower';
import { autoReadOf } from '@/state/progress';
import { towerOf } from '@/state/reducer';
import { pendingChests } from '@/state/wardrobe';
import styles from './Tower.module.css';

/** Abschluss: neue Lampe, ggf. neue Etage, Witzekiste (docs/12 4). */
export function TowerDone({
  profile,
  before,
  praise,
  onAgain,
}: {
  profile: Profile;
  before: number;
  /** eigenes Lob statt „Geschafft!“, z. B. nach einem kniffligen Sudoku */
  praise?: string;
  onAgain: () => void;
}) {
  const lamps = towerOf(profile).lamps;
  const { floors, lit, size } = floorInfo(lamps);
  const newFloor = floorCompleted(before, lamps);
  const readAloud = autoReadOf(profile);
  // beim Öffnen gemerkt, damit die Truhe nach der Wahl nicht sofort verschwindet
  const [chest, setChest] = useState(() => pendingChests(profile) > 0);
  return (
    <Screen title={UI.tower.title}>
      <div className={styles.done}>
        <div role="img" aria-label={UI.tower.label(floors, lit, size)} className={styles.newLamp}>
          <TowerArt floors={floors} lit={lit} size={size} width={140} />
        </div>
        <SpeechBubble pose="freut-sich" kikoSize={72}>
          {newFloor ? UI.tower.newFloor(floors) : (praise ?? UI.tower.done)}
        </SpeechBubble>
        <FreshItems profile={profile} />
        {chest ? (
          <ChestPick
            profile={profile}
            readAloud={readAloud}
            onDone={() => {
              setChest(false);
            }}
          />
        ) : (
          <JokeBox profile={profile} readAloud={readAloud} />
        )}
        <div className={styles.actions}>
          <Button block onClick={onAgain}>
            {UI.tower.again}
          </Button>
          <LinkButton href="/raetsel" variant="secondary" block>
            {UI.tower.toTower}
          </LinkButton>
        </div>
      </div>
    </Screen>
  );
}
