// Geheimbotschaften für die Geheimschrift (docs/12 3.8). Feste, geprüfte Liste: nur A–Z und
// einzelne Leerzeichen, damit jeder Buchstabe ein Symbol bekommen kann. Die Zuordnung wird pro Rätsel
// neu gemischt. Stufe 3: kurze Wörter, Stufe 4: kurze Sätze. „SCHATZ IM SAND“ hat 10 verschiedene
// Buchstaben und steht deshalb bei Stufe 4.

export interface CipherMessage {
  id: string;
  text: string;
  /** ab dieser Stufe */
  from: 3 | 4;
}

export const CIPHER_MESSAGES: readonly CipherMessage[] = [
  { id: 'kiko-mag-kekse', text: 'KIKO MAG KEKSE', from: 3 },
  { id: 'hallo-kiko', text: 'HALLO KIKO', from: 3 },
  { id: 'ahoi-pirat', text: 'AHOI PIRAT', from: 3 },
  { id: 'eis-am-meer', text: 'EIS AM MEER', from: 3 },
  { id: 'kokosnuss', text: 'KOKOSNUSS', from: 3 },
  { id: 'boot-ahoi', text: 'BOOT AHOI', from: 3 },
  { id: 'super-sache', text: 'SUPER SACHE', from: 3 },
  { id: 'anker-los', text: 'ANKER LOS', from: 3 },
  { id: 'leuchtturm', text: 'LEUCHTTURM', from: 3 },
  { id: 'muschel', text: 'MUSCHEL', from: 3 },
  { id: 'kiko-ist-da', text: 'KIKO IST DA', from: 3 },
  { id: 'alles-klar', text: 'ALLES KLAR', from: 3 },
  { id: 'papagei', text: 'PAPAGEI', from: 3 },
  { id: 'ein-fisch', text: 'EIN FISCH', from: 3 },
  { id: 'segel-hoch', text: 'SEGEL HOCH', from: 3 },
  { id: 'robbe-rudi', text: 'ROBBE RUDI', from: 3 },
  { id: 'gute-reise', text: 'GUTE REISE', from: 3 },
  { id: 'du-bist-toll', text: 'DU BIST TOLL', from: 3 },
  { id: 'mehr-kekse', text: 'MEHR KEKSE', from: 3 },
  { id: 'komm-mit', text: 'KOMM MIT', from: 3 },
  { id: 'seestern', text: 'SEESTERN', from: 3 },
  { id: 'kiko-lacht', text: 'KIKO LACHT', from: 3 },
  { id: 'psst-geheim', text: 'PSST GEHEIM', from: 3 },
  { id: 'ich-bin-kiko', text: 'ICH BIN KIKO', from: 3 },
  { id: 'schatz-im-sand', text: 'SCHATZ IM SAND', from: 4 },
  { id: 'kiko-liebt-kokosnuss', text: 'KIKO LIEBT KOKOSNUSS', from: 4 },
  { id: 'der-schatz-ist-hier', text: 'DER SCHATZ IST HIER', from: 4 },
  { id: 'heute-gibt-es-eis', text: 'HEUTE GIBT ES EIS', from: 4 },
  { id: 'kiko-kann-fliegen', text: 'KIKO KANN FLIEGEN', from: 4 },
  { id: 'wir-segeln-los', text: 'WIR SEGELN LOS', from: 4 },
  { id: 'anker-hoch-und-los', text: 'ANKER HOCH UND LOS', from: 4 },
  { id: 'der-papagei-ist-toll', text: 'DER PAPAGEI IST TOLL', from: 4 },
  { id: 'suche-die-goldene-muschel', text: 'SUCHE DIE GOLDENE MUSCHEL', from: 4 },
  { id: 'kiko-hat-hunger', text: 'KIKO HAT HUNGER', from: 4 },
  { id: 'das-boot-ist-bereit', text: 'DAS BOOT IST BEREIT', from: 4 },
  { id: 'robbe-rudi-tanzt', text: 'ROBBE RUDI TANZT', from: 4 },
  { id: 'der-krebs-winkt', text: 'DER KREBS WINKT', from: 4 },
  { id: 'ich-sehe-ein-schiff', text: 'ICH SEHE EIN SCHIFF', from: 4 },
  { id: 'heute-gibt-es-kuchen', text: 'HEUTE GIBT ES KUCHEN', from: 4 },
  { id: 'flamingo-fine-tanzt', text: 'FLAMINGO FINE TANZT', from: 4 },
  { id: 'die-sonne-lacht', text: 'DIE SONNE LACHT', from: 4 },
  { id: 'wir-sind-ein-team', text: 'WIR SIND EIN TEAM', from: 4 },
  { id: 'kiko-singt-laut', text: 'KIKO SINGT LAUT', from: 4 },
  { id: 'du-bist-ein-detektiv', text: 'DU BIST EIN DETEKTIV', from: 4 },
  { id: 'die-karte-ist-alt', text: 'DIE KARTE IST ALT', from: 4 },
  { id: 'folge-dem-pfeil', text: 'FOLGE DEM PFEIL', from: 4 },
  { id: 'grabe-beim-baum', text: 'GRABE BEIM BAUM', from: 4 },
  { id: 'seestern-stella-lacht', text: 'SEESTERN STELLA LACHT', from: 4 },
];

/** Botschaft im Fall „Der Geheimbrief im Sand“: die Einladung zu Kikos Überraschungsfest */
export const CASE_LETTER = 'KOMM ZUM FEST';
