import type { NonogramPicture } from './pictures-types';

// Bilderrätsel (docs/12 3.6): feste Bilder 5×5 bis 7×7, jedes eindeutig und ohne Raten lösbar (Test).
// '.' = leer, jeder Buchstabe = ausgemalt in der Farbe aus `palette`.

export const NONOGRAMS: readonly NonogramPicture[] = [
  // 5 × 5
  {
    id: 'herz',
    name: 'Herz',
    rows: ['.R.R.', 'RRRRR', 'RRRRR', '.RRR.', '..R..'],
    palette: { R: 'var(--kiko-red)' },
  },
  {
    id: 'pilz',
    name: 'Pilz',
    rows: ['.RRR.', 'RRWRR', 'RRRRR', '.SSS.', '.SSS.'],
    palette: { R: 'var(--kiko-red)', W: 'var(--ill-pearl)', S: 'var(--ill-sand)' },
  },
  {
    id: 'haus',
    name: 'Haus',
    rows: ['..R..', '.RRR.', 'RRRRR', '.WWW.', '.WDW.'],
    palette: { R: 'var(--coral-400)', W: 'var(--ill-sand)', D: 'var(--ill-trunk)' },
  },
  {
    id: 'fisch-klein',
    name: 'Fisch',
    rows: ['.....', '.OO.O', 'OEOOO', 'OOOOO', '.OO.O'],
    palette: { O: 'var(--ill-starfish)', E: 'var(--ink-900)' },
  },
  {
    id: 'boot',
    name: 'Boot',
    rows: ['..R..', '.WDW.', 'WWDWW', 'BBBBB', '.BBB.'],
    palette: {
      R: 'var(--kiko-red)',
      W: 'var(--ill-pearl)',
      D: 'var(--ill-wood-dark)',
      B: 'var(--ill-trunk)',
    },
  },
  {
    id: 'truhe',
    name: 'Schatztruhe',
    rows: ['.WWW.', 'WWWWW', 'GGGGG', 'WWGWW', 'WWWWW'],
    palette: { W: 'var(--ill-trunk)', G: 'var(--ill-gold)' },
  },
  {
    id: 'eis',
    name: 'Eis',
    rows: ['.PPP.', 'PPPPP', 'CCCCC', '.CCC.', '..C..'],
    palette: { P: 'var(--kiko-pink)', C: 'var(--wood-100)' },
  },
  {
    id: 'blume',
    name: 'Blume',
    rows: ['.PPP.', 'PPYPP', '.PPP.', '..GG.', '..G..'],
    palette: { P: 'var(--kiko-pink)', Y: 'var(--sun-400)', G: 'var(--ill-leaf)' },
  },

  // 6 × 6
  {
    id: 'palme',
    name: 'Palme',
    rows: ['.LLLL.', 'LLLLLL', 'L.TT.L', '..T...', '..T...', '.SSSS.'],
    palette: { L: 'var(--ill-leaf)', T: 'var(--ill-trunk)', S: 'var(--ill-sand)' },
  },
  {
    id: 'krebs',
    name: 'Krebs',
    rows: ['R....R', 'RR..RR', '.ERRE.', 'RRRRRR', '.RRRR.', '.R..R.'],
    palette: { R: 'var(--kiko-red)', E: 'var(--ink-900)' },
  },
  {
    id: 'anker',
    name: 'Anker',
    rows: ['..GG..', '..GG..', 'GGGGGG', '..GG..', 'G.GG.G', '.GGGG.'],
    palette: { G: 'var(--ill-dark)' },
  },
  {
    id: 'ente',
    name: 'Ente',
    rows: ['.YY...', 'OEY...', '.YY..Y', '.YYYYY', '.YYYY.', 'WWWWWW'],
    palette: {
      Y: 'var(--kiko-banana)',
      O: 'var(--kiko-beak)',
      E: 'var(--ink-900)',
      W: 'var(--ill-water)',
    },
  },
  {
    id: 'baum',
    name: 'Apfelbaum',
    rows: ['..LL..', '.LLAL.', 'LALLAL', '.LLLL.', '..TT..', '..TT..'],
    palette: { L: 'var(--ill-leaf)', A: 'var(--kiko-red)', T: 'var(--ill-trunk)' },
  },
  {
    id: 'sonne',
    name: 'Sonne',
    rows: ['Y.YY.Y', '.YOOY.', 'YOOOOY', 'YOOOOY', '.YOOY.', 'Y.YY.Y'],
    palette: { Y: 'var(--sun-400)', O: 'var(--ill-honey)' },
  },
  {
    id: 'muschel',
    name: 'Muschel',
    rows: ['.SSSS.', 'SDSSDS', 'SDSSDS', '.SSSS.', '..SS..', '.SSSS.'],
    palette: { S: 'var(--ill-flamingo)', D: 'var(--coral-400)' },
  },
  {
    id: 'pfeil',
    name: 'Pfeil',
    rows: ['..R...', '.RR...', 'RRRRRR', 'RRRRRR', '.RR...', '..R...'],
    palette: { R: 'var(--sea-500)' },
  },

  // 7 × 7
  {
    id: 'kiko',
    name: 'Kiko',
    rows: ['..KKK..', '.KKKKK.', 'KKKEKK.', 'KKKKKBB', 'KKKKK.B', '.KYYY..', '..YYY..'],
    palette: {
      K: 'var(--kiko-body)',
      E: 'var(--ink-900)',
      B: 'var(--kiko-beak)',
      Y: 'var(--kiko-belly)',
    },
  },
  {
    id: 'leuchtturm',
    name: 'Leuchtturm',
    rows: ['...D...', '..DDD..', 'Y.YYY.Y', '..RRR..', '..WWW..', '.RRRRR.', 'SSSSSSS'],
    palette: {
      D: 'var(--ill-dark)',
      Y: 'var(--sun-400)',
      R: 'var(--kiko-red)',
      W: 'var(--ill-pearl)',
      S: 'var(--ill-rock)',
    },
  },
  {
    id: 'schiff',
    name: 'Schiff',
    rows: ['...RR..', '..WD...', '.WWDW..', 'WWWDWW.', 'BBBBBBB', '.BBBBB.', 'AA.A.AA'],
    palette: {
      R: 'var(--kiko-red)',
      W: 'var(--ill-pearl)',
      D: 'var(--ill-wood-dark)',
      B: 'var(--ill-trunk)',
      A: 'var(--ill-water)',
    },
  },
  {
    id: 'stern',
    name: 'Stern',
    rows: ['...Y...', '..YYY..', 'YYYYYYY', '.YYYYY.', '..YYY..', '.YY.YY.', '.Y...Y.'],
    palette: { Y: 'var(--sun-400)' },
  },
  {
    id: 'clownfisch',
    name: 'Clownfisch',
    rows: ['..OO...', '.OWOW.O', 'OEWOWOO', 'OOWOWOO', '.OWOW.O', '..OO...', '.......'],
    palette: { O: 'var(--ill-starfish)', W: 'var(--ill-pearl)', E: 'var(--ink-900)' },
  },
  {
    id: 'schildkroete',
    name: 'Schildkröte',
    rows: ['...T...', 'T.SSS.T', '.SHSHS.', '.SSSSS.', '.SHSHS.', 'T.SSS.T', '...T...'],
    palette: {
      T: 'var(--ill-turtle)',
      S: 'var(--ill-turtle-shell)',
      H: 'var(--ill-leaf)',
    },
  },
];
