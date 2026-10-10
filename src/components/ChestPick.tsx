import { useState } from 'react';
import { KIKO_ITEMS, NEST_ITEMS } from '@/content/outfits';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { Chest } from '@/illustrations/Chest';
import { Kiko } from '@/illustrations/Kiko';
import { NestItemIcon } from '@/illustrations/NestRoom';
import { toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { chestOffer, type Offer } from '@/state/wardrobe';
import { Button } from './Button';
import styles from './ChestPick.module.css';
import { SpeechBubble } from './SpeechBubble';

function itemOf(offer: Offer) {
  return offer.kind === 'kiko'
    ? KIKO_ITEMS.find((item) => item.id === offer.id)
    : NEST_ITEMS.find((item) => item.id === offer.id);
}

function Preview({ offer, size }: { offer: Offer; size: number }) {
  const item = KIKO_ITEMS.find((i) => i.id === offer.id);
  if (offer.kind === 'kiko' && item) {
    return <Kiko pose="hallo" size={size} outfit={{ [item.slot]: item.id }} />;
  }
  return <NestItemIcon id={offer.id} size={size} />;
}

/**
 * Schatztruhe mit zwei Teilen zur Wahl (docs/12 4.1). Nach der Wahl trägt Kiko das Teil
 * (bzw. es steht im Nest) und sagt seinen Spruch.
 */
export function ChestPick({
  profile,
  readAloud,
  onDone,
}: {
  profile: Profile;
  readAloud: boolean;
  onDone: () => void;
}) {
  const { dispatch } = useAppState();
  const [offers] = useState(() => chestOffer(profile));
  const [picked, setPicked] = useState<Offer | null>(null);

  if (offers.length === 0) return null;

  if (picked) {
    const item = itemOf(picked);
    return (
      <section className={styles.box} aria-label={UI.wardrobe.chestTitle}>
        <div className={styles.picked}>
          <Preview offer={picked} size={140} />
        </div>
        <SpeechBubble pose="freut-sich">{item?.line ?? ''}</SpeechBubble>
        <p className={styles.muted}>{UI.wardrobe.later}</p>
        <Button block onClick={onDone}>
          {UI.play.next}
        </Button>
      </section>
    );
  }

  return (
    <section className={styles.box} aria-label={UI.wardrobe.chestTitle}>
      <Chest open size={110} className={styles.chest} />
      <h2 className={styles.title}>{UI.wardrobe.chestTitle}</h2>
      <div className={styles.options}>
        {offers.map((offer) => {
          const item = itemOf(offer);
          const name = item?.name ?? offer.id;
          return (
            <button
              key={offer.id}
              type="button"
              className={styles.option}
              aria-label={UI.wardrobe.chestPick(name)}
              onClick={() => {
                dispatch({ type: 'wardrobe-pick', id: profile.id, itemId: offer.id });
                setPicked(offer);
                if (readAloud && item) toggleSpeak(item.line);
              }}
            >
              <Preview offer={offer} size={96} />
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
