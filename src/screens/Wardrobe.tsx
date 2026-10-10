import { useState } from 'react';
import { Button } from '@/components/Button';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { KIKO_ITEMS, KIKO_SLOTS, NEST_ITEMS, NEST_SLOTS } from '@/content/outfits';
import { UI } from '@/content/ui';
import type { KikoSlot, NestSlot, Profile } from '@/domain/types';
import { floorInfo } from '@/domain/tower';
import { Kiko } from '@/illustrations/Kiko';
import { KikoItemIcon } from '@/illustrations/KikoItemIcon';
import { NestItemIcon, NestRoom } from '@/illustrations/NestRoom';
import { toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { towerOf, wardrobeOf } from '@/state/reducer';
import { surpriseOutfit } from '@/state/wardrobe';
import styles from './Wardrobe.module.css';

type Tab = 'kiko' | 'nest';

/** Lampen bis zur nächsten Truhe (eine nach dem ersten Rätsel, dann eine je Etage). */
function lampsToNextChest(lamps: number): number {
  if (lamps === 0) return 1;
  const { lit, size } = floorInfo(lamps);
  return size - lit;
}

/** Kikos Kleiderschrank und Nest (docs/12 4.1): antippen zum An- und Ausziehen. */
export function Wardrobe({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const readAloud = STUFEN[profile.stufe].autoRead;
  const tower = towerOf(profile);
  const wardrobe = wardrobeOf(tower);
  const [tab, setTab] = useState<Tab>('kiko');
  const [kikoSlot, setKikoSlot] = useState<KikoSlot>('kopf');
  const [nestSlot, setNestSlot] = useState<NestSlot>('boden');
  const [line, setLine] = useState<string>(
    wardrobe.owned.length === 0 ? UI.wardrobe.empty : UI.wardrobe.title,
  );

  const say = (text: string) => {
    setLine(text);
    if (readAloud) toggleSpeak(text);
  };

  const items =
    tab === 'kiko'
      ? KIKO_ITEMS.filter((item) => item.slot === kikoSlot)
      : NEST_ITEMS.filter((item) => item.slot === nestSlot);
  const worn = (id: string) =>
    Object.values(wardrobe.kiko).includes(id) || Object.values(wardrobe.nest).includes(id);

  return (
    <Screen title={UI.wardrobe.title} withNav>
      <div className={styles.stage}>
        {tab === 'kiko' ? (
          <Kiko pose="hallo" size={170} outfit={wardrobe.kiko} className={styles.kiko} />
        ) : (
          <div role="img" aria-label={UI.wardrobe.nestLabel} className={styles.nest}>
            <NestRoom
              items={wardrobe.nest}
              kiko={<Kiko pose="hallo" outfit={wardrobe.kiko} />}
              className={styles.nestRoom}
            />
          </div>
        )}
      </div>
      <SpeechBubble pose="freut-sich" kikoSize={48}>
        {line}
      </SpeechBubble>
      {tab === 'kiko' && wardrobe.owned.some((id) => KIKO_ITEMS.some((i) => i.id === id)) && (
        <Button
          variant="secondary"
          block
          onClick={() => {
            dispatch({
              type: 'wardrobe-outfit',
              id: profile.id,
              kiko: surpriseOutfit(profile, Math.random),
            });
            say(UI.wardrobe.surprise);
          }}
        >
          {UI.wardrobe.surprise}
        </Button>
      )}

      <div className={styles.tabs} role="tablist">
        {(['kiko', 'nest'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={styles.tab}
            onClick={() => {
              setTab(t);
            }}
          >
            {t === 'kiko' ? UI.wardrobe.tabKiko : UI.wardrobe.tabNest}
          </button>
        ))}
      </div>

      <div className={styles.slots}>
        {(tab === 'kiko' ? KIKO_SLOTS : NEST_SLOTS).map((slot) => {
          const active = tab === 'kiko' ? kikoSlot === slot.id : nestSlot === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              className={cx(styles.slot, active && styles.slotActive)}
              aria-pressed={active}
              onClick={() => {
                if (tab === 'kiko') setKikoSlot(slot.id as KikoSlot);
                else setNestSlot(slot.id as NestSlot);
              }}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      <div className={styles.grid}>
        {items.map((item) => {
          const owned = wardrobe.owned.includes(item.id);
          if (!owned) {
            const special = 'special' in item && item.special !== undefined;
            return (
              <div
                key={item.id}
                className={cx(styles.item, styles.locked)}
                role="img"
                aria-label={UI.wardrobe.locked}
              >
                <span className={styles.question} aria-hidden="true">
                  ?
                </span>
                <span className={styles.hint}>
                  {special
                    ? UI.wardrobe.special
                    : UI.wardrobe.nextChest(lampsToNextChest(tower.lamps))}
                </span>
              </div>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              className={styles.item}
              aria-pressed={worn(item.id)}
              onClick={() => {
                dispatch({ type: 'wardrobe-toggle', id: profile.id, itemId: item.id });
                if (!worn(item.id)) say(item.line);
              }}
            >
              {tab === 'kiko' ? (
                <KikoItemIcon id={item.id} slot={kikoSlot} size={56} />
              ) : (
                <NestItemIcon id={item.id} size={56} />
              )}
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}
