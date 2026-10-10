# 13 – Üben ohne Geld: Uhr, Kalender, Formen, Zahlen

Status: umgesetzt. Ergänzt `05` (Üben) um sechs Themen ohne Geld, damit die App nicht nur aus Geld-Aufgaben besteht. Alle Themen laufen über den normalen Aufgaben-Motor (Tipps, Vorlesen, „So geht's“, Perlen). Grenzen je Stufe stehen in `levels.ts` (`numbers`, `clock`, `calendar`, `shapes`).

## Themen und Vorlagen

| Thema | Vorlage | Stufen | Inhalt |
|---|---|---|---|
| Plus und Minus | PM1 | 1–4 | Rechnen; Stufe 1 mit Dingen zum Zählen, ohne Zehnerübergang; Stufe 4 Zehnerzahlen bis 1000 |
| | PM2 | 1–4 | Ergänzen bis 10, 20, 50/100 bzw. 100/500/1000 |
| | PM3 | 2–4 | Platzhalter bei Minus |
| Verdoppeln und Halbieren | V1 | 1–4 | Das Doppelte; Stufe 1 mit zwei gleichen Gruppen |
| | V2 | 1–4 | Gerecht auf 2 Kinder teilen bzw. halbieren |
| Zahlen und Zahlenstrahl | ZR1 | 1–4 | Nachbarzahlen; ab Stufe 3 auch ± 10, Stufe 4 ± 100 |
| | ZR2 | 1–4 | Fehlende Zahl am Zahlenstrahl (Schritte 1 / 1–2 / 5–10 / 50–100) |
| | ZR3 | 1–4 | Größte bzw. kleinste Zahl |
| Die Uhr | U1 | 1–4 | „Wie spät ist es?“ |
| | U2 | 1–4 | „Welche Uhr zeigt …?“ (Antwortkarten mit Uhren) |
| | U3 | 1–4 | Uhr stellen (neuer Antworttyp `clock`) |
| | U4 | 3–4 | Zeitspannen: „Wann ist es zu Ende?“ |
| Wochentage und Monate | KA1 | 2–4 | Tag davor/danach, morgen, übermorgen, „in 3 Tagen“ |
| | KA2 | 3–4 | Monat davor/danach |
| | KA3 | 2–4 | Tage der Woche, Monate des Jahres, Wochenende, Stunden am Tag |
| Formen | F1 | 1–4 | „Welche Form ist ein Dreieck?“ (Antwortkarten mit Formen) |
| | F2 | 1–4 | „Wie heißt diese Form?“ |
| | F3 | 1–4 | „Wie viele Dreiecke siehst du?“ |
| | F4 | 2–4 | Ecken zählen (auch: ein Kreis hat keine Ecken) |

## Uhrzeit je Stufe

| Stufe | Minutenschritt | Anzeige | Zeitspannen |
|---|---|---|---|
| 1 | volle Stunden | „3 Uhr“ | nein |
| 2 | halbe Stunden | „halb 4“ | nein |
| 3 | Viertelstunden | „Viertel nach 3“, „Viertel vor 4“ | ja |
| 4 | 5 Minuten | digital „3:25 Uhr“, vorgelesen „3 Uhr 25“ | ja |

- Kleiner Zeiger Koralle und kurz, großer Zeiger Meeresblau und lang. Der kleine Zeiger steht wie bei einer echten Uhr zwischen den Zahlen.
- Typische Fehler haben eigene Hinweise: Stunde daneben (vor allem bei „halb“), Zeiger vertauscht, ein Schritt daneben.
- Uhr stellen: kleiner Zeiger in Stundenschritten, großer Zeiger im Minutenschritt der Stufe (auf Stufe 1 nur der kleine Zeiger). Die Uhr startet auf 12 Uhr, deshalb wird nie nach 12 Uhr gefragt. Rückmeldung erst zum großen, dann zum kleinen Zeiger.
- Druck: Bei „Uhr stellen“ steht eine leere Uhr zum Einzeichnen der Zeiger.
