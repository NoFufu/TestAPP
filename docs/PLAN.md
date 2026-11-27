# Plan: fitspot, eine App für Foto-Spots und Outfits

> Was der App fehlt, wie sie wirklich nützlich wird, und die Insta-ähnliche Optik: siehe [`PRODUKT-PLAN.md`](PRODUKT-PLAN.md) (Etappen A–J).

Stand: 27.11.2026 · Arbeitstitel: **fitspot** (Name ist noch offen) · Startstadt: **Bielefeld**

---

## 1. Worum es geht

Du öffnest die App und siehst deine Stadt mit beliebten Foto-Locations. Oben wählst du den Stil, den du suchst:
**Urban & Street**, **Türen**, **Natur**, **Café**, **Industrial**, **Treppen**, **Nacht & Neon**, **Architektur**.
Die Karte und der Feed zeigen dann nur noch passende Spots.

Jeder kann Spots hochladen, so einfach wie ein Inserat bei Vinted. Die App prüft Uploads automatisch, damit wenig Handarbeit nötig ist. Wer Outfit-Fotos an Spots postet, sammelt **Social Credits**. Finanziert wird das über ein kleines **Monats-Abo**.

### Die fünf Bildschirme

| Bildschirm | Was man dort tut |
|---|---|
| **Karte** | Stadt sehen, Spots als farbige Punkte (Farbe = Kategorie), Filter oben, Tippen öffnet eine Vorschau |
| **Feed** | Spots Bild für Bild durchwischen, sortiert nach *In der Nähe* oder *Beliebt* |
| **Spot-Details** | Fotos, Beschreibung, beste Uhrzeit, Foto-Tipp, Route, Merken, später Outfit-Fotos von anderen |
| **Hochladen** | Foto (Kamera/Galerie), Name, Kategorie, danach automatische Prüfung |
| **Gemerkt** | Gespeicherte Spots für den nächsten Shoot |

---

## 2. Entscheidungen

| Thema | Entscheidung | Warum |
|---|---|---|
| Plattform | iPhone + Android aus einer Codebasis | Zielgruppe nutzt viele iPhones |
| Framework | **React Native mit Expo**, Sprache **TypeScript** | iOS-Builds in der Cloud ohne Mac, Updates ohne Store-Release, fertige Bausteine für Karte, Kamera und Abo |
| Navigation | Expo Router (Dateien in `app/app/` = Bildschirme) | Standard bei Expo |
| Karte | `react-native-maps` (Apple Maps auf iOS, Google Maps auf Android) | gratis, echte Kartendaten |
| Backend | **Supabase**, Region eu-west-1 (Irland) | Datenbank mit Umkreissuche (PostGIS), Login, Bildspeicher, DSGVO-freundlich |
| Upload-Prüfung | Supabase Edge Function + Vision-KI + Regeln | siehe Kapitel 5 |
| Abos | **RevenueCat** | erspart den App-Store-/Play-Abo-Code |
| Screenshot-Schutz | `expo-screen-capture` | Android blockiert echt, iOS nur Bildschirmaufnahmen |
| Login | anfangs **ohne Login** anschauen, Login erst zum Hochladen | mehr Leute probieren es aus |

---

## 3. Phasen

| Phase | Inhalt | Status |
|---|---|---|
| **0 · Klick-Prototyp** | HTML-Prototyp im Browser (`prototype/index.html`) | ✅ fertig |
| **1a · App-Grundgerüst** | Expo-App mit allen 5 Bildschirmen, echte Karte, Filter, Feed, Upload mit gespielter Prüfung, Merkliste, Screenshot-Schutz. Daten liegen noch lokal in der App. | ✅ fertig, wartet auf Test am Handy |
| **1b · Backend** ✅ 27.11. | Supabase-Projekt, Tabellen (Kapitel 4), Spots aus der Datenbank laden, Bilder in den Speicher, Login per Apple/Google/E-Mail zum Hochladen | 🔶 läuft: Datenbank + 30 Spots live, App lädt Spots aus Supabase. Offen: Login, Upload in den Speicher |
| **1c · Echte Prüfung** | GPS aus dem Foto lesen, Metadaten vor dem Veröffentlichen entfernen, Duplikat-Check, KI-Check, Warteschlange für Handprüfung, Melde-Button | offen |
| **1d · Echter Standort** | `expo-location`: Entfernungen und Startausschnitt der Karte nach echtem Standort | offen |
| **2 · Testphase** | TestFlight (iOS) + interner Test (Play) mit 30–100 Leuten in Bielefeld, 200–500 Spots vorbefüllen | offen |
| **3 · Launch-Features** | Outfit-Fotos an Spots, Social Credits, Abo via RevenueCat, Profile | offen |
| **4 · Wachstum** | weitere Städte, Café-Betreiber tragen sich selbst ein, Jahresabo | offen |

### Phase 1b im Detail (nächste Schritte)

1. ✅ Supabase-Projekt `weqedfymanchzptccotk` (Region eu-west-1, Irland, also EU).
2. ✅ Tabellen + Sicherheitsregeln als SQL-Migration (`supabase/migrations/`), eingespielt.
3. ✅ Die 30 Beispiel-Spots als Startdaten (`supabase/seed.sql`).
4. ✅ App lädt Spots per Umkreissuche (`spots_nearby`). Ohne Netz fällt sie auf die lokalen Beispieldaten zurück.
5. Upload speichert Bild im Supabase Storage und legt den Spot mit Status `pending` an.
6. Login (erst E-Mail-Link, Apple/Google kurz vor Phase 2).

---

## 4. Datenmodell (Phase 1b)

```
profiles        id (= auth user) · username · avatar_url · credits · created_at
spots           id · name · description · location (PostGIS point) · area · city
                · categories (text[]) · status (pending | live | rejected)
                · created_by → profiles · created_at · likes_count
spot_photos     id · spot_id → spots · storage_path · kind (spot | outfit)
                · uploaded_by → profiles · status · created_at
saves           user_id · spot_id                       (Merkliste)
likes           user_id · photo_id
reports         id · photo_id · reporter_id · reason · status   (Melde-Funktion, DSA)
credit_events   id · user_id · amount · reason · ref_id · created_at
```

Umkreissuche: `select … from spots where status='live' and st_dwithin(location, :me, :radius)`.
Sicherheit: Jeder darf `live`-Spots lesen. Schreiben nur eingeloggt und nur eigene Einträge, freigeben nur über die Prüf-Funktion.

---

## 5. Automatische Prüfung (Phase 1c)

1. **Standort**: GPS aus dem Foto mit dem angegebenen Ort vergleichen (Toleranz ~150 m).
2. **Duplikate**: Bild-Fingerabdruck (Perceptual Hash) gegen vorhandene Bilder.
3. **KI-Check** (ein API-Aufruf pro Bild, Bruchteil eines Cents): brauchbarer Hintergrund? passende Kategorien? keine Nacktheit, Gewalt, fremden Personen im Fokus, kein Spam?
4. **Ergebnis**: automatisch live, Warteschlange oder abgelehnt mit Begründung.
5. **Datenschutz**: Metadaten (genauer Ort, Uhrzeit, Kamera) werden vor dem Veröffentlichen entfernt.
6. Vertrauens-Level: Wer oft gute Spots liefert, wird schneller freigeschaltet.

---

## 6. Abo und Social Credits (Phase 3)

| Gratis | Abo „Plus" (0,99 € / Monat) |
|---|---|
| Karte + Feed im Umkreis von ~1 km | unbegrenzter Radius, andere Städte |
| 3 Filter | alle Filter + Kombinationen |
| Hochladen, Credits sammeln | Merklisten, Offline-Karte, Lichtinfos |

Von 0,99 € bleiben nach MwSt. und Store-Gebühr (Small-Business-Programm, 15 %) etwa **0,71 €**. Für 1.000 € im Monat braucht man rund 1.400 Abos.

| Aktion | Credits |
|---|---|
| Neuer Spot freigegeben | +20 |
| Outfit-Foto an einem Spot | +10 |
| Like auf dein Foto | +1 |
| Dein Spot wird gemerkt | +2 |
| Bestätigter Fake | −50 |

Credits gibt es für Gratis-Abo-Monate (300 = 1 Monat), Abzeichen und Ranglisten pro Stadt. Sie werden **nicht** gegen Geld ausgezahlt und sind **nicht** kaufbar, wegen der Regeln von Apple und Google.

---

## 7. Recht (vor Phase 2 klären)

- **DSGVO**: Datenschutzerklärung, Löschfunktion, Server in der EU.
- **Personen auf Fotos**: Uploader bestätigt Rechte bzw. Einwilligung.
- **Private Orte** (Cafés, Bars): Hinweis „vorher fragen", Betreiber können Spots entfernen lassen.
- **Digital Services Act**: Melde-Funktion, Begründung bei Löschung, Kontaktstelle.
- Impressum, AGB, Altersfreigabe in den Stores.
- **Name**: Vor der Festlegung im Markenregister (DPMA/EUIPO) und in den App Stores prüfen. Bei „-gram" ist Vorsicht geboten (Meta/Instagram).

---

## 8. Kosten zum Start

| Posten | Kosten |
|---|---|
| Apple Developer | 99 $ / Jahr (erst für TestFlight nötig) |
| Google Play | 25 $ einmalig |
| Expo-Konto + EAS | 0 € (Free-Tier) |
| Supabase | 0 € → 25 $/Monat ab echten Nutzern |
| KI-Prüfung | wenige Euro pro 1.000 Uploads |
| RevenueCat | 0 € bis 2.500 $ Umsatz/Monat |

---

## 9. Offen

1. **Name**: Vorschläge sind *fitspot*, *Spotfit*, *Outspot*, *Shotspot*, *Backdrop*, *Kulisse*.
2. **Fokus**: eher Fotografen (Spots im Vordergrund) oder Fashion (Menschen im Vordergrund)?
3. **Expo-Konto** anlegen, damit die App per Link auf dein Handy kommt (siehe README).
4. **Supabase-Projekt** anlegen (Phase 1b).
