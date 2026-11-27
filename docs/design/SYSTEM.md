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
| `LikeBurst` + `useDoubleTap` | `trigger` | Herz-Animation beim Doppeltipp |
| `haptic` | `like()`, `select()` | Vibration bei Like / Merken / Auswahl |

## Muster (`patterns.tsx`)

| Muster | Aufbau |
|---|---|
| `PostCard` | Kopf (Avatar, Name, Zeit) → Foto 4:5 randlos mit `SpotSign` → Herz / Teilen / … / Merken → „N Likes" → Name + Bildtext. Doppeltipp = Like |
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
