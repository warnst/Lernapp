# 02 – Designsystem

## 1. Gestaltungsidee

**„Ein liebevoll gezeichnetes Inselbuch.“** Warmes Sandpapier als Hintergrund, Meerestürkis als Hauptfarbe, Sonnengelb für Belohnungen. Die Illustrationen sind einfache Konturzeichnungen mit weichen Flächen. Sie sehen gezeichnet aus, nicht fotografisch und nicht nach Standard-Clipart.

Die Oberfläche ist ruhig: viel Luft, wenige Elemente gleichzeitig, eine klare Hauptaktion pro Bildschirm. Bewegung gibt es nur, wenn etwas passiert (richtig, Stern, Nebel), nicht als Dauerbeschallung.

Die App unterstützt nur ein helles Farbschema (`color-scheme: light`), damit Druck und Bildschirm gleich wirken.

## 2. Farben (Design-Tokens)

Alle Farben als CSS-Variablen in `src/styles/tokens.css`. Komponenten verwenden nur Tokens, keine Hex-Werte.

```css
:root {
  color-scheme: light;

  /* Flächen */
  --sand-50:  #FFF9EF;  /* App-Hintergrund */
  --sand-100: #FCEFD9;  /* Karten, Sheets */
  --sand-300: #F2D7A6;  /* Ränder, Wege auf der Karte */
  --white:    #FFFFFF;

  /* Text */
  --ink-900:  #1F2D3A;  /* Haupttext            – 13,4:1 auf sand-50 */
  --ink-600:  #4A5A68;  /* Nebentext            –  6,8:1 auf sand-50 */

  /* Hauptfarbe Meer */
  --sea-500:  #0F7F88;  /* Hauptknöpfe          – Weiß darauf 4,8:1 */
  --sea-700:  #0C6870;  /* Gedrückt, Links, Fokus – 6,2:1 auf sand-50 */
  --lagoon-100: #DDF3F1;/* Tipp-Flächen, Kiko-Sheet */

  /* Bedeutungen */
  --palm-600: #23824F;  /* Richtig (immer mit ✓) – Weiß darauf 4,8:1 */
  --sun-400:  #FFC94A;  /* Sterne, Belohnung (Text darauf: ink-900) */
  --coral-400:#FF8A65;  /* Deko-Akzent. NIE für Fehler verwenden. */
  --wood-100: #E8C39A;  /* Fläche der Preisschilder – wood-900 darauf 6,1:1 */
  --wood-500: #A9713F;  /* nur Rahmen und Schnur, nie als Texthintergrund */
  --wood-900: #5B3A1E;  /* Text auf Holzschildern */

  /* Münzen */
  --coin-copper: #C9753D;  --coin-copper-rim: #9A5328;   /* 1, 2, 5 Cent */
  --coin-gold:   #E2B53B;  --coin-gold-rim:   #B98E1F;   /* 10, 20, 50 Cent */
  --coin-silver: #C9CED3;  --coin-silver-rim: #969DA4;   /* Ringe bei 1 € / 2 € */

  /* Fokus */
  --focus-ring: 0 0 0 4px var(--white), 0 0 0 7px var(--sea-700);
}
```

**Regeln**
- Ein Fehlversuch hat **keine eigene Farbe**: gestrichelter Rand in `--ink-600`, Deckkraft 0,55, Icon „↺“.
- „Richtig“ hat Grün **plus** Häkchen-Icon **plus** Text.
- Koralle ist reine Dekoration (Blumen, Kikos Federn), nie ein Signal.

## 3. Schrift

| Rolle | Schrift | Gewicht | Größe Handy | Zeilenhöhe |
|---|---|---|---|---|
| Überschriften, Stationsnamen | **Fredoka** (`@fontsource-variable/fredoka`) | 600 | 28 px | 1,15 |
| Frage | **Andika** (`@fontsource/andika`) | 700 | 24 px | 1,3 |
| Geschichte, Fließtext | Andika | 400 | 20 px | 1,45 |
| Beträge auf Karten und Schildern | Andika | 700 | 28–32 px | 1,1 |
| Kleine Hinweise, Labels | Andika | 400 | 16 px | 1,4 |

- **Andika** wurde für Leseanfänger entwickelt. Sie hat ein einstöckiges „a“, deutlich unterscheidbare Buchstaben und klare Ziffern.
- Für Beträge gilt `font-variant-numeric: tabular-nums;`.
- Beide Schriften werden lokal gebündelt (Lizenz SIL OFL), keine Google-Fonts-Anfrage. Falls ein Paket nicht verfügbar ist, die Schrift-Dateien aus dem offiziellen Release in `src/assets/fonts/` legen und per `@font-face` einbinden.
- Fallback: `ui-rounded, "Nunito", system-ui, sans-serif`.

## 4. Abstände, Radien, Schatten

```css
:root {
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px;

  --radius-s: 12px; --radius-m: 20px; --radius-l: 28px; --radius-full: 999px;

  /* weiche „Papier“-Schatten, keine harten */
  --shadow-1: 0 2px 0 rgba(31,45,58,.10), 0 4px 12px rgba(31,45,58,.06);
  --shadow-2: 0 4px 0 rgba(31,45,58,.12), 0 10px 24px rgba(31,45,58,.10);

  --tap-min: 56px;
}
```

- Seitenränder am Handy: 16 px. Abstand zwischen Antwortkarten: 12 px.
- Knöpfe haben einen „Tiefe“-Effekt: unten 4 px dunklerer Rand, beim Drücken rutscht der Knopf 2 px nach unten (wie ein Spielknopf).

## 5. Komponenten

| Komponente | Zweck | Wichtige Zustände |
|---|---|---|
| `Button` | Varianten `primary` (sea-500, weißer Text), `secondary` (weiß, sea-700 Rand), `ghost` | normal, gedrückt, deaktiviert (Deckkraft 0,4), Fokus |
| `AnswerCard` | Antwortkarte bei `choice` | normal, gedrückt, probiert (gestrichelt, ↺), richtig (palm-600 Rand, ✓, Hüpfer) |
| `MoneyInput` + `Keypad` | Geldeingabe in Euro und Cent | aktives Feld (3 px Rand sea-700), leer, Vorschau |
| `Coin`, `Note` | Münze oder Schein als SVG, Größe proportional | normal, auf Tablett, auswählbar, Druckvariante |
| `CoinTray` + `CoinPalette` | Münzen legen | leer („Tippe unten auf eine Münze“), voll, Summe sichtbar oder versteckt |
| `PriceTag` | Holzschild mit Schnur und Preis | normal |
| `ItemCard` | Sache mit Icon, Name, Preisschild (für `select` und `order`) | normal, ausgewählt (✓-Plakette), nummeriert (1, 2, 3 …) |
| `Scene` | Bühne oben im Spiel: Münzen, Sachen, Beutel, Notiz, Truhe | – |
| `KikoSheet` | Rückmeldung von unten | richtig, Fehlversuch, Lösungsweg |
| `Kiko` | Begleiter-SVG mit `pose`-Eigenschaft | `hallo`, `denkt`, `freut-sich`, `zeigt`, `schlaeft` |
| `ProgressShells` | Muscheln oder Schlösser oben | offen, aktuell, erledigt |
| `StationNode` | Station auf der Karte | geschafft, aktuell, gesperrt |
| `BottomSheet` | Stationskarte, Dialoge | offen, geschlossen (wischen) |
| `BottomNav` | 3 Tabs | aktiv (gefüllt, Label fett), inaktiv |
| `StarPill` | „★ 3 von 9“ (Gesamtzahl je Welt) | Zähl-Animation beim Hinzufügen |

**Antwortkarten-Raster:** 2 Optionen nebeneinander; 3 Optionen untereinander (volle Breite); 4 Optionen im 2 × 2-Raster. Münz- und Beutelkarten immer im Raster.

## 6. Illustrationen

**Stil**
- Konturen 3 px (bei 100 % Größe), runde Linienenden (`stroke-linecap: round; stroke-linejoin: round`), Konturfarbe `--ink-900`.
- Flächen ruhig in Token-Farben, höchstens eine Schattenfläche pro Objekt (eine dunklere Fläche, kein Verlauf).
- Alle Illustrationen sind **eigene, inline gezeichnete SVG-React-Komponenten**. Keine Emojis, denn die sehen auf jedem Gerät anders aus und drucken farbig.
- Jede Illustration hat eine Druckvariante: Flächen über CSS-Variablen (`fill: var(--fill-main)`), im Druck werden sie auf Weiß gesetzt. Übrig bleiben schwarze Konturen (siehe `06`).

### 6.1 Kiko, der Papagei (eigene Figur)

- Runder, fast birnenförmiger Körper in Türkisgrün `#2BB5A0`, heller Bauch in `#FFE9A8`.
- Kurzer, gebogener Schnabel in Orange `#FF9E3D`.
- Drei Schopffedern oben: gelb, koralle, gelb.
- Große runde Augen mit weißem Glanzpunkt, kleine Flügel, die gestikulieren.
- Posen (als Varianten derselben Komponente):
  - `hallo` – ein Flügel winkt.
  - `denkt` – Flügel am Schnabel, Augen schauen nach oben.
  - `freut-sich` – beide Flügel hoch, kleine Sterne um den Kopf.
  - `zeigt` – Flügel zeigt zur Seite (auf den Tipp).
  - `schlaeft` – Augen zu, kleines „z“ (Pause).
- Kiko darf **keinem bekannten Filmpapagei ähneln**: keine roten oder blauen Ara-Farben, keine Vorlage nachzeichnen.

### 6.2 Münzen und Scheine

Münzen werden **im echten Größenverhältnis** gezeichnet, weil das Teil des Lernens ist (Station 1.5: Die 50-Cent-Münze ist größer als die 1-Euro-Münze).

| Wert | echter Ø (mm) | Farbe | Darstellung |
|---|---|---|---|
| 1 Cent | 16,25 | Kupfer | „1“ groß, „Cent“ klein |
| 2 Cent | 18,75 | Kupfer | „2“, „Cent“ |
| 5 Cent | 21,25 | Kupfer | „5“, „Cent“ |
| 10 Cent | 19,75 | Gold | „10“, „Cent“ |
| 20 Cent | 22,25 | Gold | „20“, „Cent“ |
| 50 Cent | 24,25 | Gold | „50“, „Cent“ |
| 1 Euro | 23,25 | silberner Kern, goldener Ring | „1“, „Euro“ |
| 2 Euro | 25,75 | goldener Kern, silberner Ring | „2“, „Euro“ |

- **Größe am Bildschirm:** Durchmesser = `realMm / 25.75 * 72px`, die 2-Euro-Münze ist also 72 px groß, die 1-Cent-Münze 45 px. In der Palette kommt ein unsichtbarer Tap-Bereich von mindestens 56 px dazu.
- Rand: dünner Riffelring (gestrichelte Kontur), Glanzbogen oben links.
- **Scheine (5 €, 10 €, 20 €):** abgerundetes Rechteck 120 × 64 px im Spielgeld-Stil. Der Wert steht groß in der Mitte, eine einfache Wellenlinie als Muster. Farben: 5 € grau-grün `#B9C9B5`, 10 € rötlich `#E9B3A6`, 20 € bläulich `#AFC6E3`. **Keine Nachbildung echter Banknotenmotive**, damit es klar als Spielgeld erkennbar ist.

### 6.3 Weitere Illustrationen (Liste für die Umsetzung)

**Pflicht für den MVP**
- Inselkarte: Hintergrund mit Meer (Wellenmuster), Strand, Palmen, Weg und 9 Orten. Dazu Nebelwolken als eigene Ebenen.
- 9 Stations-Icons: Muschel, Marktstand, Kiosk mit Kokosnuss, Geldbörse, Laden mit Vogelschild, Hängebrücke, Leuchtturm, Höhleneingang, Schatztruhe.
- 9 Fundstücke: Glitzermuschel, Strohhut, Bambusflöte, goldener Schlüssel, bunte Feder, Kompass, Fernrohr, Schatzkarte, goldene Krone.
- Nebenfiguren (einfach, Brustbild): Tante Polly (älterer Papagei mit Brille), Krabbe Kalle, Leuchtturmwärterin Frida, Pirat Hein (nur als Buch und Hut, ohne Figur).
- Schatztruhe: zu, mit 1–5 Schlössern (eins pro Aufgabe der Station), offen.
- Beutel mit Symbol: Anker-Beutel, Stern-Beutel.
- Piratenbuch-Seite mit Tintenfleck (für Platzhalter-Aufgaben).
- Kikos Tablett (Holzbrett).
- Sachen-Icons (64 × 64, höchstens 6 Formen je Icon): Muschel, Kokosnuss, Bananenbrot, Banane, Saft, Wasserflasche, Fischbrötchen, Mango, Eis, Muffin, Melonenstück, Keks, Apfel, Strandball, Seifenblasen, Sonnencreme, Muschelkette, Muschel-Armband, Federstift, Vogelpfeife, Postkarte, Stickerheft, Fernglas, Hut, Seil, Kompass, Karte, Kerze, Brot, Käse, Tee, Streichhölzer, Äpfel, Honig, Lampenöl, Decke, Fisch, Laterne, Marmelade, Schatzkästchen, Piratenhut, Augenklappe, Kopftuch, Ball, Feder.

Die Icon-IDs sind identisch mit den `itemId`s aus `04` und `05` (z. B. `wasser`, `melone`, `kokoskeks`, `kekse`, `eimer`). Für die Üben-Generatoren kommen weitere Sachen aus `05` hinzu. Fehlt ein Icon, wird ein neutrales Paket-Icon mit dem Namen darunter gezeigt, nie ein leerer Platz.

## 6.4 Ergänzungen für Stufen, Profile, Rätsel und die kleine Bucht

- **Profil-Avatare** (6, rund, 96 px, freundlich, gleicher Stil wie Kiko): Delfin, Schildkröte, Seepferdchen, Pinguin, Robbe, Flamingo.
- **Stufen-Icons** (4): Muschel, Seestern, Krebs, Oktopus. Sie erscheinen im Erwachsenen-Bereich und klein auf dem Üben-Bildschirm.
- **Kleine Bucht:** runde Bucht-Karte mit 5 Orten (Muschelufer, Münzquelle, Kikos Laden, Krümels Wippe, Muscheltruhe). Krümel, ein kleiner Krebs mit großen Augen, ist eine eigene Figur. Fundstücke: Perlmuttmuschel, Glücksstein, kleiner Eimer, Möwenfeder, Perle. Zählbare Dinge: Muschel, Seestern, Fisch, Krebs, Stein, Feder, Möwe, Boot. Sachen: Bonbon, Lolli, Kaugummi, Murmel, Sticker.
- **Neue Komponenten:**
  - `NumberLine` (Zahlenstrahl 0–10, Felder ≥ 56 px, bei < 400 px Breite zweizeilig)
  - `ObjectScene` (Dinge locker verteilt, Zählhilfe-Punkt beim Antippen, „wegschwimmende“ Objekte halbtransparent mit Pfeil)
  - `Wippe` (Neigung −8° bis +8° je nach Gewicht, Übergang 400 ms)
  - `NumberWall` und `NumberTriangle` (Steine als Sandstein-Kacheln, Lücken gestrichelt)
  - `CodeLock` (Räder mit ▲/▼, Symbol über jedem Rad)
  - `SequenceRow`
  - `StairHelper` (Ordnungshilfe bei Logik-Rätseln)
  - `ProfileCard`, `AdultGate`
- **Schriftgrößen je Stufe:** siehe `09`, Abschnitt 7. Umsetzung über eine CSS-Variable `--text-scale` am `<body>` (Stufe 1: 1,2; Stufe 2: 1,1; sonst 1).

## 7. Bewegung

| Ereignis | Animation | Dauer | Easing |
|---|---|---|---|
| Kiko-Sheet hoch und runter | Slide | 250 ms | `cubic-bezier(.2,.8,.2,1)` |
| Richtige Karte | Hüpfer (scale 1 → 1,06 → 1) + ✓ einblenden | 300 ms | ease-out |
| Probierte Karte | sanftes Wackeln ±3° einmal, dann blass | 300 ms | ease-in-out |
| Münze aufs Tablett | Bogenflug von Palette zum Tablett | 200 ms | ease-out |
| Aktuelle Station | Pulsieren 1 → 1,06 | 1,6 s, Endlosschleife | ease-in-out |
| Stern fliegt zur Pille | Bogenflug + Pille zählt hoch | 900 ms | ease-in-out |
| Nebel zieht ab | Wolken gleiten auseinander, Deckkraft → 0 | 1,2 s | ease-out |
| Truhe öffnet sich | Deckel kippt, Licht strahlt | 800 ms | spring-ähnlich |
| Seitenwechsel | Überblendung + 8 px Versatz | 200 ms | ease-out |

- Umsetzung bevorzugt mit **CSS-Animationen und Transitions**. Für Bogenflüge (Stern, Münze) ist die Web Animations API ausreichend. Keine Animationsbibliothek nötig.
- Konfetti: einfaches eigenes CSS-Konfetti (30 Teilchen, 1,2 s) oder das Paket `canvas-confetti` mit `disableForReducedMotion: true`.
- Bei `prefers-reduced-motion: reduce` gibt es nur Überblendungen bis 150 ms, keine Endlosschleifen.

## 8. Icons

- Eigene einfache Strich-Icons im selben Stil (24 px, 2,5 px Kontur): Pause/X, Lautsprecher, Glühbirne, Drucker, Palme, Münzstapel, Truhe, Schloss, Häkchen, ↺, Pfeil, Löschen.
- Alternativ ein Icon-Set mit runden Linienenden (z. B. Lucide), wenn es in Strichstärke und Rundung passt. Das ist nur für die kleinen UI-Icons erlaubt, nicht für Illustrationen.

## 9. Druckvarianten

Siehe `06-druck.md`. Kurz:
- Alle Flächenfarben über `--fill-*`-Variablen, die `@media print` auf `#fff` setzt.
- Konturen werden schwarz, Linien mindestens 1,5 pt.
- Münzen im Druck: weißer Kreis, schwarze Kontur, Wert in Schwarz, echtes Größenverhältnis in Millimetern (2 € = 26 mm).
