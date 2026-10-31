import type { Station, WorldId } from '@/domain/types';
import { kikosLaden } from './worlds/kleine-bucht/b3-kikos-laden';
import { kruemelsWippe } from './worlds/kleine-bucht/b4-kruemels-wippe';
import { muenzquelle } from './worlds/kleine-bucht/b2-muenzquelle';
import { muschelufer } from './worlds/kleine-bucht/b1-muschelufer';
import { muscheltruhe } from './worlds/kleine-bucht/b5-muscheltruhe';
import { geldboerse } from './worlds/schatzinsel/s4-geldboerse';
import { kiosk } from './worlds/schatzinsel/s3-kiosk';
import { leuchtturm } from './worlds/schatzinsel/s7-leuchtturm';
import { markt } from './worlds/schatzinsel/s2-markt';
import { muschelstrand } from './worlds/schatzinsel/s1-muschelstrand';
import { piratenhoehle } from './worlds/schatzinsel/s8-piratenhoehle';
import { pollysLaden } from './worlds/schatzinsel/s5-pollys-laden';
import { raetselbruecke } from './worlds/schatzinsel/s6-raetselbruecke';
import { schatztruhe } from './worlds/schatzinsel/s9-schatztruhe';
import { KOSMOS_STATIONS } from './worlds/kosmos/planets';

export interface World {
  id: WorldId;
  title: string;
  stations: Station[]; // in Spielreihenfolge
}

export const WORLDS: Record<WorldId, World> = {
  'kleine-bucht': {
    id: 'kleine-bucht',
    title: 'Die kleine Bucht',
    stations: [muschelufer, muenzquelle, kikosLaden, kruemelsWippe, muscheltruhe],
  },
  schatzinsel: {
    id: 'schatzinsel',
    title: 'Die geheime Schatzinsel',
    stations: [
      muschelstrand,
      markt,
      kiosk,
      geldboerse,
      pollysLaden,
      raetselbruecke,
      leuchtturm,
      piratenhoehle,
      schatztruhe,
    ],
  },
  kosmos: {
    id: 'kosmos',
    title: 'Reise durch den Kosmos',
    stations: KOSMOS_STATIONS,
  },
};
