# Testphase vorbereiten (Etappe I)

Stand: 28.11.2026. Ziel: 30–100 Tester in Bielefeld über **TestFlight** (iPhone) und **interner Test** (Android, Play Console).

## Schon erledigt (in der App)
- Feedback-Knopf im Profil → Tabelle `feedback`, Admins sehen es unter Profil → Prüfen.
- Messpunkte für die Ziele (PRODUKT-PLAN Kap. 6): `app_open`, `spot_saved`, `route_opened`, `upload_done`, `list_shared` → Tabelle `app_events` (nur Art + Zeit + Konto, keine Inhalte). Auswertung unter Profil → Prüfen → „Testphase".
- Melden, automatisches Ausblenden, Prüfen für Admins, Duplikat-Check (Etappe F).
- Build-Profile in `app/eas.json`: `preview` (intern), `testflight` (Store-Build, Kanal preview), `production`.
- `app.json`: iPad-Unterstützung aus (sonst verlangt Apple iPad-Screenshots), Verschlüsselungs-Frage beantwortet (`ITSAppUsesNonExemptEncryption = false`).

## Du musst erledigen (braucht deine Konten / Daten)
| # | Was | Kosten | Hinweis |
|---|---|---|---|
| 1 | **Apple Developer Program** beitreten | 99 €/Jahr | developer.apple.com, dauert 1–2 Tage |
| 2 | **Google Play Console** Konto | 25 $ einmalig | Identitätsprüfung, dauert einige Tage |
| 3 | **Name final** prüfen (DPMA/EUIPO, App Stores) | – | PRODUKT-PLAN Kap. 7 |
| 4 | **Datenschutzerklärung + Impressum** als Webseite | – | Name + Adresse nötig; ich kann einen Entwurf schreiben |
| 5 | **Eigener Mail-Dienst (SMTP)** für Bestätigungs-Mails | ca. 0–10 €/Monat | z. B. Brevo, Resend; Schlüssel nur über das Formular |
| 6 | Tester-Liste (E-Mails) sammeln | – | TestFlight: bis 10.000 extern, Play intern: bis 100 |

## Muss ich noch bauen (mit deiner Zustimmung)
| Was | Warum | Zustimmung nötig für |
|---|---|---|
| ✅ 28.11. **Konto löschen** in der App (Profil, Migration 0015, getestet) | Apple verlangt es, DSGVO | Löscht Konto, eigene Fotos, Nachrichten, Freunde; Spots mit fremden Fotos bleiben anonym |
| ✅ 28.11. **Einwilligung beim Upload** (Häkchen bei Upload und „Dein Foto hier") | Recht am Bild, DSA | – |
| **Datenschutz/Impressum-Links** in der App: Knöpfe im Profil sind da, grau bis die URLs in `EXPO_PUBLIC_PRIVACY_URL` / `EXPO_PUBLIC_IMPRINT_URL` stehen (`app/.env` + EAS-Variablen) | Pflicht | Links von dir (Punkt 4) |
| **Testphase-Einstellungen zurückdrehen** (s. PRODUKT-PLAN Kap. 9) | Fremde laden hoch | Uploads wieder „wird geprüft", Mail-Bestätigung an |
| **Builds** mit `eas build --profile testflight` / `preview` | – | ausdrücklich (CLAUDE.md: kein Store-Build ohne Zustimmung) |

## Empfehlung zu Kap. 9 (Testphase-Einstellungen)
- **Uploads:** Für 30–100 bekannte Tester kann „sofort sichtbar" bleiben, weil Melden + Prüfen jetzt da sind. Für Fremde: zurück auf `pending`.
- **Login ohne Bestätigungs-Mail:** vor dem Test mit Fremden zurückdrehen (braucht Punkt 5).
- **Bearbeiten ohne Prüfung:** wie Uploads.

## Ablauf, sobald 1–2 erledigt sind
1. `eas build --profile testflight --platform ios` und `--profile preview --platform android` (nach deiner Zustimmung).
2. iOS: `eas submit --profile testflight` → in App Store Connect Tester einladen.
3. Android: APK/AAB in Play Console „Interner Test" hochladen, Tester-Liste eintragen.
4. Updates danach weiter per `eas update --branch preview` (kein neuer Build nötig, solange keine neuen nativen Pakete).
