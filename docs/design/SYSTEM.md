# fitspot Design-System

Code: `app/src/ui/` (Import: `import { … } from '../src/ui'`) · Richtung: [`richtung.html`](richtung.html) · [Moodboard online](https://claude.ai/artifact/Xjghw9hmCc1dWSeU6yHfk6)

**Grundregel:** In Screens keine Hex-Farben, Pixel-Abstände oder Schriftgrößen direkt eintragen, immer Tokens und Bausteine nutzen. Fehlt etwas, ergänzen wir es hier, statt es im Screen nachzubauen.

---

## Tokens (`tokens.ts`)

### Farben (`useColors()`)
Kein reines Schwarz/Weiß: hell = leichtes Lila-Weiß, dunkel = Blaugrau (Stand 28.11.2026). Nur `onPhoto` bleibt Weiß (liegt auf Fotos).
| Token | Hell | Dunkel | Wofür |
|---|---|---|---|
| `paper` | #F3F1F8 | #161B22 | Hintergrund (hell: Lila-Weiß, dunkel: Blaugrau) |
| `surface` | #FBFAFE | #1F2630 | Karten, Sheets, Felder |
| `ink` | #1B1A22 | #E8ECF2 | Text, Hauptknöpfe, Story-Ring |
| `asphalt` | #625E70 | #A1ABB8 | Nebentext |
| `line` | #E1DEEA | #2E3743 | Rahmen, Trennlinien |
| `fill` | #ECE9F3 | #252D38 | Platzhalter, Skeleton |
| `cherry` | #C4153A | #FF4D6D | **nur** Like und Merken |
| `onInk` | #F3F1F8 | #161B22 | Text auf Tinte |
| `sign` / `onSign` | #1B1A22 / #FBFAFE | #E8ECF2 / #161B22 | Spot-Schild |
| `danger` | #B3261E | #FF8A80 | Fehler |

Neu 28.11.: `accent` (Lila: hell #6A55B8, dunkel #8F7FE0) für Story-Ringe und Hervorhebung auf der Karte, `dockActive` (aktiver Knopf der Tab-Leiste: hell #E2DCF5, dunkel #4A4468). Kirsche bleibt nur für Like/Merken.

Kategorie-Farben (`catColors`) sind gedämpft und erscheinen nur als kleine Punkte (Chip, Pin).

### Schrift (`type`, Baustein `<T variant>`)
| Stufe | Schrift | Größe/Zeile | Wofür |
|---|---|---|---|
| `display` | Barlow Condensed 700 | 34/36 | Spot-Name auf der Detailseite |
| `title` | Barlow Condensed 700 | 26/28 | Seitentitel, Wortmarke |
| `sign` | Barlow Condensed 600 | 17/20 | Spot-Schild |
| `signMeta` | Barlow Condensed 500 | 15/20 | Entfernung im Schild |
| `stat` | Barlow Condensed 600 | 22/24 | Zahlen in Info-Kacheln (z. B. Golden Hour) |
| `name` | System 600 | 15/20 | Nutzernamen, Knopftexte |
| `body` | System 400 | 15/21 | Fließtext |
| `label` | System 500 | 13/18 | Chips, kleine Labels |
| `small` | System 400 | 12/16 | Zeitangaben, Hinweise |

Barlow Condensed nie für Fließtext oder Knöpfe.

### Abstände (`space`) und Ecken (`radius`)
`xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32`

| Radius | Wert | Wofür |
|---|---|---|
| `photo` | 0 | Feed-Fotos (randlos) |
| `sign` | 6 | Spot-Schild |
| `thumb` | 12 | Vorschaubilder, schwebende Icon-Knöpfe |
| `card` | 20 | Karten, Sheets |
| `pill` | 999 | Knöpfe, Chips |

Weitere: `motion` (fast 120 ms, base 220 ms, pop-Feder fürs Herz), `hit` = 44 (Mindest-Tippfläche).

---

## Bausteine (`components.tsx`)

| Baustein | Varianten / Props | Hinweise |
|---|---|---|
| `T` | `variant`, `color` (Token-Name) | Ersetzt `<Text>` überall |
| `Button` | `primary` (Tinte) · `secondary` (Rahmen) · `ghost`; `icon`, `loading`, `disabled` | Eine `primary` pro Bildschirmbereich. Text sagt, was passiert („Route", „Spot teilen") |
| `IconButton` | `icon`, **`label` Pflicht**, `filled`, `color` | Tippfläche ≥ 44 |
| `Chip` | `selected`, `dot` | Filter; ausgewählt = Tinte |
| `SpotSign` | `name`, `distance`, `onPress` | **Erkennungszeichen.** Unten links auf Fotos, Abstand `md` |
| `Avatar` | `size`, `ring` = `new` · `seen` · `none` | Story-Ring in Tinte, kein Farbverlauf |
| `Skeleton` | `style` | Statt Lade-Spinner bei Listen und Bildern |
| `Sheet` | children | Schwebende Fläche unten (Karte, Aktionen) |
| `LikeBurst` + `useDoubleTap` | `trigger` | derzeit ungenutzt (Liken ist raus) |
| `haptic` | `like()`, `select()` | Vibration bei Like / Merken / Auswahl |

## Muster (`patterns.tsx`)

| Muster | Aufbau |
|---|---|
| `Masonry` + `pinRatio` | Zweispaltiges Raster mit unterschiedlich hohen Kacheln (Home, Gemerkt auf Shoots, Fotos an einem Spot, Ähnliche Spots). Kachel: Foto mit Radius 16, darunter Name, Ort und Merken. Kein Liken |
| `PhotoGrid` | `square`: 3 Spalten, 2 px Abstand (Profil) · `mosaic`: Dreiergruppen 1 groß + 2 klein, abwechselnd (Entdecken) |

---

## Do & Don't

| ✅ Do | ❌ Don't |
|---|---|
| Fotos randlos, Hochformat 4:5 | Rahmen oder Schatten um Feed-Fotos |
| Kirsche nur für Like/Merken | Kirsche für Knöpfe, Links oder Hinweise |
| Linksbündig | Zentrierte Textblöcke (außer leere Zustände) |
| Satzschreibung („Zum Shoot hinzufügen") | GROSSBUCHSTABEN-Labels |
| Bewegung nur als Antwort auf Tippen | Automatische Einblend-Animationen überall |
| Insta-Muster (Stories, Raster, Doppeltipp) | Insta-Farbverlauf, Insta-Icons oder -Namen |

## Barrierefreiheit (Mindestanforderungen)
- Tippflächen ≥ 44 × 44 (`hit`).
- Jeder `IconButton` hat ein `label`, Fotos haben eine Beschreibung.
- Kontrast: Text ≥ 4.5:1 (geprüft 28.11.: hell `asphalt` auf `paper` 5.6:1, `cherry` auf `paper` 5.3:1; dunkel `asphalt` auf `paper` 7.4:1, `cherry` auf `surface` 4.7:1).
- Dynamische Schriftgröße nicht blockieren (kein `allowFontScaling={false}`).

## Prüfstand 27.11.2026 (am Code, nicht am Gerät)
- Kontraste: alle Texte ≥ 4.5:1 (s. oben). Spot-Schild Weiß auf Tinte 17:1.
- Tippflächen: Icon-Knöpfe, Standort-Knopf, Schließen ≥ 44. Chips 36 hoch + 4 hitSlop, Umschalter Karte/Raster 34 hoch + 6 hitSlop.
- Screenreader: alle Icon-Knöpfe, Fotos, Raster-Kacheln, Pins, Story-Kreise und Tabs haben Beschreibungen. Nicht tippbare Chips werden als Text angesagt.
- „Bewegung reduzieren" wird beachtet (Lade-Puls aus, Herz ohne Feder).
- Offen: Test mit VoiceOver am iPhone; Kategorie-Chip-Rahmen hell (1.2:1), ist durch Text erkennbar, ggf. kräftiger.

## SunArc (Sonnenuhr)
`<SunArc sunrise sunset golden now />` aus `src/ui/sun.tsx`: Halbbogen von Aufgang bis Untergang, Golden Hour in `sun`-Farbe, Sonne an der aktuellen Stelle, Status-Satz in der Mitte. Farben: Tokens `sun`, `sunTrack`.
- Update: SunArc ist jetzt klein (Mini-Bogen + ein Satz), sitzt in der Infozeile.

## Raster wie Pinterest
Token `grid` (Rand 4, Spaltenabstand 6, Ecken 16, Fußzeile 28). Kacheln: nur Bild + kleine Zeile (Name grau, Merken-Symbol). `Tab` = Text-Reiter mit Strich (Filterleiste).

## Karten-Ausschnitt
Token `mapZoom`: `single` (ein Spot, fester Ausschnitt statt Maximal-Zoom) und `city` (mehrere Spots, dann `fitToCoordinates`).

## Dock (Tab-Leiste)
`Dock` in `src/ui/dock.tsx`: schwebt unten mittig, jedes Symbol in eigenem runden Quadrat (Token `dock`, Farben `dock`/`onDock`). Dahinter ein weicher Verlauf in `paper` (`dock.fade`), damit Kachel-Texte nicht zerschnitten durchscheinen; auf der Karte (Entdecken) aus. Screens mit Tab-Leiste brauchen unten `dock.clearance` Platz. Hochladen = + oben rechts auf Home.

## StatusBadge
`<StatusBadge status="pending|live|rejected" />`: kleines umrandetes Schild für den Prüf-Status eigener Inhalte (Sichtbar = Tinte, Wird geprüft = Asphalt, Abgelehnt = danger). Vorschaubilder in Listen: `thumbSize` (64) mit `radius.thumb`.

## PhotoPin
`<PhotoPin photo dot active />`: runde Foto-Markierung für Karten (Entdecken, Shoots). Im `Marker` mit `anchor={{x:0.5,y:1}}` und `tracksViewChanges` nur kurz an.

## Kategorie-Symbole
Jede Kategorie hat in `CATS` ein `icon` aus **MaterialCommunityIcons** (zweite Icon-Familie, nur hierfür; hat Tür, Burg, Treppe, Strand …). `PhotoPin` zeigt es als kleines farbiges Rund-Schild unten rechts.

## GlowPress
`<GlowPress rounded tint?>`: Pressable für Kacheln und Posts. Ganz feiner **heller** Leuchtrand (`glow`/`glowSoft`, kein Gold mehr), beim Antippen etwas stärker und leichtes Einsinken (0.98). Mit `tint` bekommt der Ruherand einen Hauch Mood-Farbe (`moodColors`, Deckkraft `moodRim`). Nur Rand, keine Fläche. In `Masonry` (über `Pin.tint`) und `PhotoGrid` eingebaut.

## Mood-Farben (`moodColors`)
Gedämpfte Farbe je Mood (Urban Lehm, Ruhig Graublau, Natürlich Salbei, Verspielt Sandgelb, Romantisch Altrosa, Dunkel Staubviolett, Modern Stahlgrau). Nur als Hauch: Ring der Mood-Kreise, Rand der Foto-Kacheln (`moodTint(spot)`), Rand der aktiven Kachel auf der Karte. Nie als Fläche, die App bleibt ruhig mit wenig Farbe. Rand 1 px, Deckkraft `moodRim` 0.75; wer mehr Farbe will, erhöht Rand oder Sättigung hier.
## Swatch (Farbfilter)
`<Swatch color label selected onPress />`: runder Farbkreis (`swatchSize`), ausgewählt mit Ring in Tinte. Farben aus `swatch` in `tokens.ts` (Daten-Farben, nur für den Filter).

## CollectionCard / CollectionBanner
Sammlungs-Karte im Home-Feed, alle 10 Kacheln eine: Foto des ersten Spots als Hintergrund mit dunklem Farbverlauf (`collectionTint` als Tönung, Weiß darauf), große Zahl „TOP n“ (Stufe `hero`), Titel, drei gefächerte Fotos der nächsten Spots. `CollectionBanner` ist dasselbe oben im Sammlungs-Screen, darunter die Rangliste (`ListSpots ranked`: Platz, Bild, Name, Viertel, Entfernung) und die Karte. Sammlungen sind Regeln in `src/data/collections.ts` (Stadt + Kategorie/Farbe/Stichwort, beliebteste zuerst, max. 10, erst ab 3 Spots). Nur ohne aktiven Filter.

## Moods (MoodStories)
Runde Story-Kreise (`story`-Token, `Avatar` mit Ring) statt der Farbpunkte, unter den Kategorie-Reitern. Moods (`src/data/moods.ts`) werden automatisch aus Kategorie, Farben und Stichworten gebildet (kein DB-Feld): Urban Aesthetic, Ruhig, Natürlich, Verspielt, Romantisch, Dunkel & Moody, Modern & Clean. Foto im Kreis = beliebtester Spot der Stadt mit diesem Mood. Ausgewählt = Ring in Tinte. Farben sind jetzt nur noch in der Suche.

## CountryCode (Landesfarben)
`<CountryCode country="GER|SP" />` in `CityButton`: der Ländercode selbst trägt die Landesfarben als Streifen in den Buchstaben (SVG-Text mit hartem Verlauf, Farben aus `flags`). Schwarz (GER) wird im Dunkelmodus zu `asphalt`.

## Suche (`app/search.tsx`)
Textsuche (Name, Viertel, Beschreibung, Kategorie, Mood; ohne Akzente) + ausklappbare Filter: Stadt, Kategorie, Mood, Farbe, Entfernung, „nur mit echten Fotos von Nutzern“. Ergebnis als `Masonry`. Einstieg: Lupe oben auf Home.

## MapSearch (Entdecken)
Auf der Karte oben nur die Textzeile (Wortmarke, Stadt, Lupe, Karte/Raster). Die Lupe klappt `MapSearch` aus (`src/components/MapSearch.tsx`): Suchfeld + Kategorie- und Mood-Chips + Link zur großen Suche. Punkt (`accent`) an der Lupe, solange Suche/Filter aktiv sind. Die Spot-Leiste unten holt immer die vorderste Kachel: Karte schwenkt (und zoomt bei weitem Ausschnitt heran), Kachel bekommt `accent`-Rand.

## LocationPicker (Ort beim Hochladen wählen)
`src/components/LocationPicker.tsx` (Modal): Vollbild-Karte, Pin bleibt in der Mitte, die Karte wird darunter geschoben. Suchfeld (Adresse/Ort, `expo-location` geocodeAsync), „Mein Standort“, darunter Adresse (reverseGeocode) oder Koordinaten und „Diesen Ort wählen“. In `upload.tsx`: Vorrang gewählter Ort > Foto-GPS > Standort > Kartenmitte; kleine Vorschau-Karte mit Marker. Ort außerhalb 20 km um Bielefeld/Barcelona blockiert das Veröffentlichen (die App lädt Spots je Stadt im Umkreis 20 km).
