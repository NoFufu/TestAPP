# Produkt-Plan: fitspot wirklich nützlich machen

Stand: 27.11.2026 · Ergänzt `docs/PLAN.md` (Technik und Phasen)

---

## 1. Wo wir stehen

Die App kann heute Spots auf einer Karte zeigen, nach Stil filtern, durch einen Feed wischen, merken und lokal hochladen. Die Daten kommen aus Supabase.

**Was fehlt, damit man sie wirklich benutzt:**

| Lücke | Warum das wehtut |
|---|---|
| **Keine echten Fotos** | Wer einen Spot sucht, will sehen, wie Fotos dort *wirklich* aussehen. Platzhalter machen die App wertlos. |
| **Kein echter Standort** | „In meiner Nähe" stimmt nur am Jahnplatz. |
| **Keine Menschen** | Kein Profil, keine Likes von anderen, kein Grund wiederzukommen. |
| **Wenig Infos pro Spot** | „Beste Zeit" ist ein fester Text. Es fehlt: Wann ist Sonne auf der Wand? Darf man da fotografieren? Ist es voll? |
| **Kein Planen** | Man kann Spots merken, aber keinen Shoot mit mehreren Spots planen oder mit Freunden teilen. |
| **Uploads gehen nirgendwo hin** | Login und echter Upload fehlen (Phase 1b). |
| **Optik ist „Prototyp"** | Funktioniert, fühlt sich aber nicht nach einer App an, die man gern öffnet. |

---

## 2. Für wen und wofür

| Person | Will … | Kernfunktion |
|---|---|---|
| **Outfit-Poster** (16–30, Insta/TikTok) | schnell einen Hintergrund finden, der zum Outfit passt | Filter nach Stil **und Farbe**, Beispiel-Outfits am Spot |
| **Hobby-Fotograf** | Locations für Shoots, mit Licht und Uhrzeit | Sonnenstand am Spot, Ausrichtung der Wand, Foto-Tipps |
| **Fotograf + Model** | gemeinsam einen Shoot planen | **Shoot-Liste**: mehrere Spots als Route, teilbar |
| **Spot-Scout** | coole Orte zeigen und dafür Anerkennung bekommen | Profil, Credits, Ranglisten, „entdeckt von …" |

Kern-Versprechen: **„Öffne die App, wähl deinen Style, und in 5 Minuten weißt du, wo du heute shootest."**

---

## 3. Was die App nützlich macht (nach Wichtigkeit)

### Muss (ohne das kein Launch)
1. **Echte Fotos pro Spot**: mehrere Bilder (Spot leer, mit Person, Detail), Hochformat 4:5. Vor dem Launch selbst 50–100 Bielefeld-Spots fotografieren (du + Freunde).
2. **Echter Standort**: Karte startet bei dir, Entfernungen stimmen, Radius-Filter (500 m / 2 km / Stadt).
3. **Login + Upload in die Cloud**: Uploads sind für alle sichtbar, nach Prüfung.
4. **Profil**: eigene Spots und Fotos im Raster, Anzahl Credits.
5. **Licht-Info live**: Sonnenauf-/untergang und Golden Hour für *heute*, berechnet am Standort des Spots. Plus Himmelsrichtung der Wand → „Sonne auf der Wand: 15–18 Uhr".

### Sollte (macht den Unterschied)
6. **Farb-Filter**: Jeder Spot bekommt automatisch seine Hauptfarben (aus dem Foto berechnet). Filter „rot", „pastell", „dunkel" usw. passen genau zu Outfits.
7. **Shoot planen**: Spots zu einer Liste „Samstag Altstadt" sammeln, als Fußweg-Route anzeigen, per Link teilen.
8. **Outfit-Fotos an Spots** (+ Credits): „So sieht es mit Person aus". Das ist der soziale Kern.
9. **Zugang & Regeln am Spot**: öffentlich / privat (fragen) / Eintritt, Hinweise wie „Hausrecht Café".
10. **Wie voll?**: einfache Angabe pro Tageszeit („morgens leer, nachmittags Touristen"), von Nutzern bestätigt.

### Kann (später)
11. **Benachrichtigungen**: „Neuer Tür-Spot 400 m von dir", „Golden Hour in 30 min an deinem gemerkten Spot".
12. **Wetter am Shoot-Tag** in der Shoot-Liste.
13. **Pose- und Perspektive-Tipps** pro Spot (Beispielbild + Text).
14. **Fotografen finden**: Profile mit „buchbar", Kontakt erst nach Login. Das braucht viele Nutzer und kommt spät.

---

## 4. Instagram-ähnliche Optik

Ziel: Die App soll sich **sofort vertraut** anfühlen wie Instagram (Bilder im Vordergrund, schlichte Oberfläche, flüssige Gesten), aber eine **eigene Identität** haben. Logo, Farbverlauf, Icons und Namen von Instagram übernehmen wir nicht, aus rechtlichen Gründen und damit fitspot wiedererkennbar ist.

### Grundregeln
| Regel | Umsetzung |
|---|---|
| **Fotos sind die Oberfläche** | Bilder randlos, Format **4:5**, kaum Rahmen, keine Schatten |
| **Ruhige Oberfläche** | Weiß bzw. Schwarz, eine Akzentfarbe (fitspot-Blau), dünne Linien, viel Luft |
| **Klare Schrift** | Systemschrift (SF Pro / Roboto) oder Inter; fette Nutzernamen, normale Texte |
| **Icons ohne Beschriftung** | Tab-Leiste nur mit Symbolen, aktiv = gefüllt |
| **Gesten statt Knöpfe** | Doppeltippen = Like (Herz-Animation), Wischen durch Fotos, Ziehen zum Aktualisieren |
| **Gefühl** | kurze Vibration bei Like/Merken, weiche Übergänge, Lade-Platzhalter statt Spinner |

### Neue Bildschirm-Struktur (5 Tabs)
| Tab | Inhalt | Vorbild-Muster |
|---|---|---|
| **Home** | Story-Leiste oben (Kategorien + „Spot des Tages"), darunter Feed mit Posts: Profilbild, Name, Ort, Foto 4:5, Herz/Kommentar/Merken/Teilen, Bildunterschrift | Insta-Feed |
| **Entdecken** | Umschalter **Raster ↔ Karte**. Raster: Mosaik aus Spot-Fotos (1 groß + 2 klein), Suche oben, Filter-Chips | Insta-Explore |
| **＋** | Upload: Foto → Zuschneiden 4:5 → Spot wählen oder neu → Kategorien → Teilen | Insta-Post |
| **Shoots** | Gemerkte Spots und Shoot-Listen | Insta-Gespeichert |
| **Profil** | Profilbild, Credits, Zähler, 3-spaltiges Raster der eigenen Fotos | Insta-Profil |

**Spot-Seite**: Foto-Karussell oben (wischen), darunter Name, Licht-Info, „Route", „Zum Shoot hinzufügen" und darunter das **Raster aller Community-Fotos** von diesem Spot.

**Reels-artiger Modus**: Der jetzige Vollbild-Feed bleibt als „Inspiration": Spots im Vollbild durchwischen.

### Bausteine (Technik)
| Zweck | Paket |
|---|---|
| Schnelle Bilder mit unscharfer Vorschau beim Laden | `expo-image` + Blurhash |
| Flüssige lange Listen und Raster | `@shopify/flash-list` |
| Animationen (Doppeltipp-Herz, Übergänge) | `react-native-reanimated` + `react-native-gesture-handler` |
| Vibration | `expo-haptics` |
| Milchglas-Kopfzeile | `expo-blur` |
| Native Sheets, Menüs | `@expo/ui` |
| Sonnenstand | `suncalc` |
| Echter Standort | `expo-location` |

Alles davon läuft in Expo Go, es braucht keinen eigenen App-Build.

### Design-System zuerst
Bevor Bildschirme umgebaut werden, entsteht ein kleines Design-System in `app/src/ui/`:
- **Farben**: hell/dunkel, eine Akzentfarbe, Kategorie-Farben gedämpfter als heute.
- **Abstände und Radien**: z. B. 4/8/12/16/24.
- **Schriftgrößen**: z. B. 12/14/16/20/28.
- **Grundbausteine**: `Avatar` (mit Ring für Stories), `PostCard`, `PhotoGrid`, `IconButton`, `Chip`, `Sheet`, `Skeleton`.

So sehen alle Bildschirme einheitlich aus, und neue Bildschirme sind schneller gebaut.

---

## 5. Fahrplan

Jede Etappe ist ein eigenes Sitzungs-Thema und endet mit einem Update auf **preview**.

| Etappe | Inhalt | Größe |
|---|---|---|
| **D0 · Richtige Karte** (vorgezogen) | Karte randlos wie Apple Karten, schwebende Filter, echter Standort, Foto-Pins, Info-Karte unten | S |
| **A · Login & Upload** (Phase 1b fertig) | E-Mail-Login (Magic Link), Profil-Tabelle, Fotos in Supabase Storage, Uploads mit Status „wird geprüft" | M |
| **B · Design-System** | Farben, Schrift, Abstände, Grundbausteine; Tab-Leiste mit Icons | S |
| **C · Insta-Umbau** | Home-Feed mit Post-Karten + Doppeltipp-Like, Entdecken mit Raster ↔ Karte, Profil mit Raster, neue Spot-Seite | L |
| **D · Echter Standort + Licht** | `expo-location`, Radius-Filter, Sonnenstand und Golden Hour pro Spot, Wand-Himmelsrichtung beim Upload | M |
| **E · Echte Fotos** | Du fotografierst 50–100 Spots, ich baue einen einfachen Admin-Upload für Startfotos | M (vor allem deine Zeit) |
| **F · Prüfung** (Phase 1c) | GPS-Check, Metadaten entfernen, Duplikat-Check, KI-Check, Melde-Button | M |
| **G · Shoot-Listen + Farb-Filter** | Listen, Route, Teilen-Link; Hauptfarben je Foto, Farbfilter | M |
| **H · Social & Credits** | Outfit-Fotos an Spots, Likes, Credits, Rangliste Bielefeld | M |
| **I · Testphase** (Phase 2) | TestFlight/Play-Test mit 30–100 Leuten, Feedback einbauen | – |
| **J · Abo** (Phase 3) | RevenueCat, Plus-Funktionen | M |

Empfohlene Reihenfolge: **D0 → A → B → C → D**, parallel dazu **E** (du sammelst Fotos). Dann F → G → H → I → J.

---

## 6. Woran wir merken, dass es funktioniert (Testphase)

| Kennzahl | Ziel |
|---|---|
| Tester, die mindestens einen Spot merken | > 60 % |
| Tester, die wirklich zu einem Spot gehen (Route geöffnet) | > 30 % |
| Tester, die selbst einen Spot oder ein Outfit hochladen | > 15 % |
| Tester, die nach einer Woche wieder öffnen | > 25 % |

Nach der Testphase entscheiden wir mit diesen Zahlen, ob Abo, mehr Städte oder mehr Social-Funktionen als Nächstes dran sind.

---

## 7. Entscheidungen (27.11.2026)

| Frage | Antwort |
|---|---|
| Fokus | **Outfits**: Home startet mit Outfit-Fotos an Spots |
| Echte Fotos | Ja, später. Bis dahin sucht Claude echte Bielefelder Spots (Orte, keine fremden Fotos) als Basis heraus |
| Kommentare | Vorerst **nur Likes** |
| Name | „fitspot" ist nur ein **Platzhalter** |
| Karte | Dringend: **richtige Apple-Maps-Karte** im Stil der Karten-App (randlos, Standort, Foto-Pins) → vorgezogen als Etappe **D0** |
