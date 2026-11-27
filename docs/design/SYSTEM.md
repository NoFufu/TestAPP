# fitspot Design-System

Code: `app/src/ui/` (Import: `import { … } from '../src/ui'`) · Richtung: [`richtung.html`](richtung.html) · [Moodboard online](https://claude.ai/artifact/Xjghw9hmCc1dWSeU6yHfk6)

**Grundregel:** In Screens keine Hex-Farben, Pixel-Abstände oder Schriftgrößen direkt eintragen, immer Tokens und Bausteine nutzen. Fehlt etwas, ergänzen wir es hier, statt es im Screen nachzubauen.

---

## Tokens (`tokens.ts`)

### Farben (`useColors()`)
| Token | Hell | Dunkel | Wofür |
|---|---|---|---|
| `paper` | #F6F6F3 | #000000 | Hintergrund |
| `surface` | #FFFFFF | #141517 | Karten, Sheets, Felder |
| `ink` | #16181B | #F2F2EF | Text, Hauptknöpfe, Story-Ring |
| `asphalt` | #62676D | #9EA3A9 | Nebentext |
| `line` | #E2E3DF | #26282B | Rahmen, Trennlinien |
| `fill` | #ECEDE9 | #1E2023 | Platzhalter, Skeleton |
| `cherry` | #C4153A | #FF4D6D | **nur** Like und Merken |
| `onInk` | #F6F6F3 | #000000 | Text auf Tinte |
| `sign` / `onSign` | #16181B / #FFF | #F2F2EF / #16181B | Spot-Schild |
| `danger` | #B3261E | #FF8A80 | Fehler |

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
| `Masonry` + `pinRatio` | Zweispaltiges Raster mit unterschiedlich hohen Kacheln (Home, Fotos an einem Spot, Ähnliche Spots). Kachel: Foto mit Radius 16, darunter Name, Ort und Merken. Kein Liken |
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
- Kontrast: Text ≥ 4.5:1 (geprüft: `asphalt` auf `paper` 5.3:1, `cherry` auf `paper` 5.5:1, dunkel `asphalt` auf Schwarz 8.3:1).
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

## Dock (Tab-Leiste)
`Dock` in `src/ui/dock.tsx`: schwebt unten mittig, jedes Symbol in eigenem runden Quadrat (Token `dock`, Farben `dock`/`onDock`). Screens mit Tab-Leiste brauchen unten `dock.clearance` Platz. Hochladen = + oben rechts auf Home.

## StatusBadge
`<StatusBadge status="pending|live|rejected" />`: kleines umrandetes Schild für den Prüf-Status eigener Inhalte (Sichtbar = Tinte, Wird geprüft = Asphalt, Abgelehnt = danger). Vorschaubilder in Listen: `thumbSize` (64) mit `radius.thumb`.

## PhotoPin
`<PhotoPin photo dot active />`: runde Foto-Markierung für Karten (Entdecken, Shoots). Im `Marker` mit `anchor={{x:0.5,y:1}}` und `tracksViewChanges` nur kurz an.

## Kategorie-Symbole
Jede Kategorie hat in `CATS` ein `icon` aus **MaterialCommunityIcons** (zweite Icon-Familie, nur hierfür; hat Tür, Burg, Treppe, Strand …). `PhotoPin` zeigt es als kleines farbiges Rund-Schild unten rechts.

## GlowPress
`<GlowPress rounded>`: Pressable für Kacheln und Posts. Beim Antippen warmer Glow (`glow`-Farbe) hinter der Kachel und leichtes Einsinken (0.97). In `Masonry` und `PhotoGrid` schon eingebaut.
