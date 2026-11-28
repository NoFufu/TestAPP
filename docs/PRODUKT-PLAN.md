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
- **Grundbausteine**: `Avatar` (mit Ring für Stories), `SpotCard`, `PhotoGrid`, `IconButton`, `Chip`, `Sheet`, `Skeleton`.

So sehen alle Bildschirme einheitlich aus, und neue Bildschirme sind schneller gebaut.

---

## 5. Fahrplan

Jede Etappe ist ein eigenes Sitzungs-Thema und endet mit einem Update auf **preview**.

| Etappe | Inhalt | Größe |
|---|---|---|
| **D0 · Richtige Karte** ✅ (vorgezogen) | Karte randlos wie Apple Karten, schwebende Filter, echter Standort, Foto-Pins, Info-Karte unten | S |
| **A · Login & Upload** (Phase 1b fertig) | E-Mail-Login (Magic Link), Profil-Tabelle, Fotos in Supabase Storage, Uploads mit Status „wird geprüft" | M |
| **B · Design-System** ✅ | Farben, Schrift, Abstände, Grundbausteine; Tab-Leiste mit Icons (`docs/design/SYSTEM.md`) | S |
| **C · Insta-Umbau** ✅ (mit Beispiel-Beiträgen) | Home-Feed mit Post-Karten + Doppeltipp-Like, Entdecken mit Raster ↔ Karte, Profil mit Raster, neue Spot-Seite | L |
| **D · Echter Standort + Licht** | `expo-location`, Radius-Filter, Sonnenstand und Golden Hour pro Spot, Wand-Himmelsrichtung beim Upload | M |
| **E · Echte Fotos** | Admin-Upload ✅ 28.11.: Profil → „Start-Fotos" (Spots ohne echtes Foto, nächste zuerst, Kamera/Galerie, ersetzt Platzhalter), Spot an Foto-GPS verschieben (`admin_set_location`, Migration 0012). Offen: du fotografierst die Spots | M (vor allem deine Zeit) |
| **F · Prüfung** (Phase 1c) | Teil 1 ✅ 28.11.: Melde-Knopf (Spot), automatisch ausblenden ab 3 Meldungen, GPS-Abstand beim Foto (Hinweis + `gps_distance_m`), Metadaten geprüft (kein GPS in Uploads). Teil 2 ✅ 28.11.: Admin-Rolle (Tabelle `admins`, Konto levitest), Prüf-Bildschirm im Profil (Freigeben/Ablehnen über `admin_queue`/`moderate`), Duplikat-Check per SHA-256 (nur exakt gleiche Fotos). Foto einzeln melden ✅. Offen: KI-Check (braucht externen Dienst + Server-Funktion) | M |
| **G · Shoot-Listen + Farb-Filter** | Teil 1 ✅ 28.11.: Shoot-Listen (Migration 0010), Route zu Fuß (Google Maps, max. 10 Spots, nächster-Nachbar-Reihenfolge), Teilen (Text + Routenlink + App-Link, Öffnen nur angemeldet), Liste übernehmen. Teil 2 ✅ 28.11.: Hauptfarben je Spot (`spots.colors`, Migration 0011; mitgelieferte Bilder per `scripts/spot-colors.py`, Uploads auf dem Handy per `src/lib/colors.ts`), Farbkreise unter den Kategorien | M |
| **H · Social & Credits** | Fitpics an Spots ✅, Merkliste in der Cloud ✅ 28.11., Credits für Spots und Fotos, Rangliste Bielefeld (Likes vorerst gestrichen) | M |
| **I · Testphase** (Phase 2) | TestFlight/Play-Test mit 30–100 Leuten, Feedback einbauen | – |
| **J · Abo** (Phase 3) | RevenueCat, Plus-Funktionen | M |
| **K · Eigene Inhalte verwalten** ✅ 27.11. | Profil → „Meine Inhalte": eigene Spots mit Status, bearbeiten (Name, Beschreibung, Kategorien), löschen; eigene Fotos löschen. Spots mit fremden Fotos sind nicht löschbar (Migration 0004) | S |

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

## 7. Neu aus deinem Feedback (27.11.2026)

### Instagram-Post einbetten statt doppelt posten
Beim Hochladen wählt man: **eigenes Foto** *oder* **Instagram-Link einfügen**.
- Die App zeigt den Instagram-Post direkt im Feed und auf der Spot-Seite eingebettet (öffentliche Posts, über die offizielle Einbettung von Instagram in einer Web-Ansicht).
- **Datenschutz:** Das Laden von Instagram-Inhalten überträgt Daten an Meta. Deshalb zeigen wir zuerst eine Vorschau-Kachel mit „Instagram-Post laden", erst nach Tippen wird geladen (Zwei-Klick-Lösung).
- Private oder gelöschte Posts: Kachel „Post nicht mehr verfügbar", Spot bleibt erhalten.
- Später möglich: Vorschaubild über Metas offizielle oEmbed-Schnittstelle (braucht Meta-Entwicklerkonto und App-Prüfung).

### ~~Outfit-Teile angeben~~ (gestrichen 27.11.2026)
Fokus liegt auf **Locations**. Fotos mit Personen bleiben als Beispiel, wie der Spot wirkt, aber ohne Klamotten- oder Markenangaben.

### Datenmodell (umgesetzt, Migration 0003)
`spot_photos` hat jetzt `instagram_url` (eigenes Foto **oder** Instagram-Link), `kind = spot` (leer) / `outfit` (mit Person). `spots_nearby` liefert Titelbild, Foto mit Person, Instagram-Link und Entdecker.

### Karte
Pins kleiner, unten eine wischbare Spot-Leiste wie bei Apple Karten ✅ (27.11.).

### Einordnung in die Etappen
- **A · Login & Upload** ✅ 27.11.: E-Mail + Passwort, Benutzername, Profilbild; Upload mit Foto vom Spot, optional Foto mit Person und Instagram-Link; Ort aus dem Foto-GPS.
- **Home zeigt Spots** statt Outfit-Beiträgen ✅.
- **Raster-Ansicht wie eine Pinnwand** ✅ 27.11.: Home = zweispaltiges Raster aller Spot-Fotos, **kein Liken, nur Merken**. Spot groß öffnen → darunter **alle Fotos an diesem Spot** (Fitpics von verschiedenen Leuten) und **ähnliche Spots**. Neuer Knopf „Eigenes Foto hier hinzufügen".

## 8. Entscheidungen (27.11.2026)

| Frage | Antwort |
|---|---|
| Fokus | **Locations** (geändert 27.11.): Home zeigt Spots, Fotos mit Personen nur als Beispiel |
| Echte Fotos | Ja, später. Bis dahin sucht Claude echte Bielefelder Spots (Orte, keine fremden Fotos) als Basis heraus |
| Kommentare | Vorerst **nur Likes** |
| Name | „fitspot" ist nur ein **Platzhalter** |
| Karte | Dringend: **richtige Apple-Maps-Karte** im Stil der Karten-App (randlos, Standort, Foto-Pins) → vorgezogen als Etappe **D0** |

## 9. Testphase-Einstellungen (vor dem öffentlichen Test zurückdrehen!)
| Einstellung | Jetzt | Vor öffentlichem Test |
|---|---|---|
| Uploads | sofort sichtbar (`testphase_autolive` setzt `live`) | neue Migration: `pending`, Prüfung (Etappe F) |
| Login | E-Mail + Passwort, **ohne Bestätigungs-Mail** (`mailer_autoconfirm = true`) | eigener Mail-Dienst (SMTP), Bestätigung wieder an, Code-Login möglich |
| Meldungen | ab 3 Meldungen ausgeblendet, Prüfen im Profil (nur Admin) | so lassen |
| Bearbeiten | Änderungen an sichtbaren Spots gehen ohne neue Prüfung live | Änderungen erneut prüfen (Etappe F) |
| Mails | Supabase-Standard, max. 2 pro Stunde | eigener Mail-Dienst |

## Barcelona (27.11.2026)
20 Spots (IDs 9001–9020, Migrationen 0006 + 0007), KI-Beispielbilder für 16 Orte, 4 noch Platzhalter. Koordinaten: bekannte Lage, nicht vor Ort geprüft. Offen: echte Fotos mit Lizenz (Wikimedia/Openverse waren aus der Cloud gesperrt), Koordinaten und Öffnungszeiten prüfen. Liste und Quellen: Übergabe-Datei fitspot-barcelona.
