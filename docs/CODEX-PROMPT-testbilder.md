# Prompt für Codex: 20 Testbilder für fitspot

Diesen Text komplett an Codex geben (Repo: NoFufu/TestAPP).

---

Du arbeitest im Repo **NoFufu/TestAPP** (Expo-App „fitspot": Foto-Spots für Outfit-Fotos in Bielefeld).
Erzeuge **20 fotorealistische, KI-generierte Testbilder**, die die gezeichneten Platzhalter in `app/assets/spots/` ersetzen. Die Bilder sind nur für Tests gedacht und zeigen **keine realen Personen**.

## Was die Bilder zeigen
Für 10 Spots je 2 Bilder:
- **`{id}a.jpg`**: der Ort **ohne Personen** (Hintergrund für ein Outfit-Foto).
- **`{id}b.jpg`**: derselbe Ort mit **einer erfundenen Person in einem stylischen Outfit**, Ganzkörper oder Dreiviertel, natürliche Pose wie ein Street-Style- oder Outfit-Post auf Instagram.

| id | Spot | Bildidee (a = leer, b = mit Outfit) |
|---|---|---|
| 1 | Burgtreppe | breite alte Steintreppe zwischen Burgmauern, Herbstlaub, Abendlicht |
| 7 | Alte Spinnerei | rote Backsteinfabrik mit großen Sprossenfenstern, bewölkt |
| 11 | Boulevard bei Nacht | nasse Straße, Leuchtreklame in Pink und Blau, blaue Stunde |
| 13 | Café-Ecke | Altbau-Eckcafé mit Bistrotischen draußen, Vormittagssonne |
| 14 | Altbautüren | pastellgrüne Gründerzeit-Haustür mit Oberlicht und Stuck |
| 18 | Botanischer Garten | Weg durch blühende Rhododendren, weiches Licht |
| 21 | Uni-Halle | riesige Betonhalle, Brutalismus, lange Fluchten, Tageslicht |
| 23 | Seesteg | Holzsteg am See mit Schilf, Morgennebel |
| 26 | Graffiti-Wand | lange bunt besprühte Wand an einem Bahndamm, harte Nachmittagsschatten |
| 29 | Rote Tür | knallrote moderne Haustür an weißer Wand, sehr clean, Mittagslicht |

Outfits abwechslungsreich: Trenchcoat, Oversize-Hoodie mit Cargo, Strick, Lederjacke, Anzug, Sommerkleid, Streetwear, Vintage. Personen verschiedenen Geschlechts, Alters (20–35) und Typs.

## Stil und Technik
- Fotorealistisch, wie mit einer Systemkamera (35 mm oder 50 mm, leichte Unschärfe im Hintergrund), natürliche Farben, kein Filter-Look, keine Illustration.
- **Hochformat 4:5, 1080 × 1350 px, JPEG**, Qualität so wählen, dass jede Datei **unter 400 KB** bleibt.
- Die Orte sind **generisch und nur inspiriert** von den Spot-Namen. Keine echten Gebäude oder Wahrzeichen exakt nachbilden.

## Verboten
- Keine echten oder bekannten Personen, kein Ähnlichkeits-Nachbau von Prominenten.
- Keine Markenlogos, Schriftzüge von echten Marken oder Geschäften, keine Nummernschilder, keine lesbaren Straßenschilder.
- Keine Kinder, keine freizügigen Darstellungen, kein Text oder Wasserzeichen im Bild.

## Dateien und Ablauf
1. Neuen Branch `codex/testbilder` von `main` anlegen.
2. Die 20 Bilder als `app/assets/spots/{id}a.jpg` und `app/assets/spots/{id}b.jpg` speichern und die vorhandenen Dateien mit gleichem Namen **überschreiben**. Alle anderen Dateien in `app/assets/spots/` unverändert lassen (die App lädt sie per `require`).
3. Eine Datei `app/assets/spots/TESTBILDER.md` anlegen: Liste der 20 Dateien, Hinweis „KI-generierte Testbilder, keine echten Orte oder Personen, vor dem Launch durch echte Fotos ersetzen", sowie das verwendete Bildmodell.
4. **Keinen** anderen Code ändern. Prüfen: `cd app && npx tsc --noEmit` läuft ohne Fehler.
5. Committen mit der Nachricht „Testbilder (KI-generiert) für 10 Spots" und den Branch pushen. Einen Pull Request nach `main` öffnen, nicht selbst mergen.
