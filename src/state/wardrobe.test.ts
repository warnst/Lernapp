import { describe, expect, it } from 'vitest';
import { KIKO_ITEMS, NEST_ITEMS } from '@/content/outfits';
import { mulberry32 } from '@/domain/random';
import type { Wardrobe } from '@/domain/types';
import { makeProfile } from './test-helpers';
import { chestOffer, chestsEarned, pendingChests, surpriseOutfit } from './wardrobe';

const withWardrobe = (lamps: number, wardrobe?: Partial<Wardrobe>) =>
  makeProfile({
    tower: {
      lamps,
      solved: {},
      jokes: [],
      favorites: [],
      wardrobe: { owned: [], chests: 0, kiko: {}, nest: {}, ...wardrobe },
    },
  });

describe('Truhen im Rätselturm', () => {
  it('eine Truhe nach der ersten Lampe, dann eine je Etage', () => {
    expect([0, 1, 2, 3, 7, 8, 13].map(chestsEarned)).toEqual([0, 1, 1, 2, 2, 3, 4]);
    expect(pendingChests(makeProfile())).toBe(0);
    expect(pendingChests(withWardrobe(3))).toBe(2);
    expect(pendingChests(withWardrobe(3, { chests: 2 }))).toBe(0);
    expect(pendingChests(withWardrobe(1, { chests: 4 }))).toBe(0);
  });

  it('bietet ein Kiko-Teil und ein Nestteil an, nie besondere oder schon gefundene', () => {
    const profile = withWardrobe(1);
    const offer = chestOffer(profile);
    expect(offer.map((o) => o.kind)).toEqual(['kiko', 'nest']);
    expect(chestOffer(profile)).toEqual(offer);
    const special = KIKO_ITEMS.filter((item) => item.special).map((item) => item.id);
    for (let chests = 0; chests < 30; chests++) {
      const ids = chestOffer(withWardrobe(1, { chests, owned: ['piratenhut'] })).map((o) => o.id);
      expect(ids.some((id) => special.includes(id) || id === 'piratenhut')).toBe(false);
    }
  });

  it('wenn eine Sorte ausgeht, kommen zwei Teile der anderen; am Ende nichts mehr', () => {
    const allNest = NEST_ITEMS.map((item) => item.id);
    const offer = chestOffer(withWardrobe(1, { owned: allNest }));
    expect(offer.map((o) => o.kind)).toEqual(['kiko', 'kiko']);
    const everything = [...allNest, ...KIKO_ITEMS.map((item) => item.id)];
    expect(chestOffer(withWardrobe(1, { owned: everything }))).toEqual([]);
  });

  it('„Überrasch mich!“ zieht nur gefundene Teile an, höchstens eins je Platz', () => {
    const owned = ['piratenhut', 'partyhut', 'sonnenbrille', 'umhang', 'goldfisch'];
    const profile = withWardrobe(5, { owned });
    for (let seed = 1; seed < 20; seed++) {
      const outfit = surpriseOutfit(profile, mulberry32(seed));
      for (const [slot, id] of Object.entries(outfit)) {
        expect(owned).toContain(id);
        expect(KIKO_ITEMS.find((item) => item.id === id)?.slot).toBe(slot);
      }
    }
  });
});
