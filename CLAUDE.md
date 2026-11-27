# fitspot – Hinweise für Claude

## Zusammenarbeit
- Sprache mit dem Nutzer: Deutsch, kurz und ohne Fachjargon.
- Kleine Schritte: ein Thema pro Sitzung (z. B. „Login"). Bei größeren Aufgaben zuerst kurz den Plan nennen.
- Modelle: Sonnet arbeitet, Opus berät als Advisor (`.claude/settings.json`). Den Advisor bei Datenbank-, Sicherheits- und Architekturfragen nutzen.
- Plan und Phasenstatus: `docs/PLAN.md`. Nach jeder abgeschlossenen Phase dort den Status aktualisieren.

## Nach jeder Änderung (Pflicht)
1. `cd app && npx tsc --noEmit` muss fehlerfrei sein. Bei größeren Änderungen zusätzlich `npx expo export --platform android --output-dir <tmp>`.
2. Committen und auf `main` pushen.
3. Update veröffentlichen (nur Kanal **preview**):
   `cd app && EXPO_TOKEN=proxy-injected npx eas-cli@latest update --branch preview --environment preview --message "<was sich geändert hat>" --non-interactive`
4. Dem Nutzer sagen, dass das Update online ist: App in Expo Go schließen und über Projects → nofufu → preview neu öffnen.

## Nie ohne ausdrückliche Zustimmung
- Kein Update auf `production`, kein App-Store-/Play-Store-Build oder -Upload.
- Keine Datenbank-Daten löschen, keine Rechte (RLS/Grants) lockern.
- Tokens und Schlüssel nie in den Chat, in Code oder Commits. Neue Schlüssel nur über das Formular (Netzwerk-Secrets der Umgebung „fitspot"). Ausnahme: der öffentliche Supabase-Key in `app/.env`.

## Testphase (vor öffentlichem Test zurückdrehen, siehe docs/PRODUKT-PLAN.md Kap. 9)
- Uploads sofort sichtbar (Trigger `testphase_autolive`). Login ohne Bestätigungs-Mail (`mailer_autoconfirm`).
- Fokus der App: **Locations**. Keine Klamotten-/Markenangaben.

## Technik
- **Design-System:** `app/src/ui/` (Tokens + Bausteine), Doku `docs/design/SYSTEM.md`. In Screens keine Hex-Farben, Pixelwerte oder Schriftgrößen direkt, immer Tokens/Bausteine. Fehlt etwas, im System ergänzen.
- App: Expo (SDK 58) + Expo Router + TypeScript in `app/`. Tabs kommen aus `expo-router/js-tabs`. Icons: `@expo/vector-icons` (Ionicons).
- Pakete mit `npx expo install <paket>` hinzufügen. `app/.npmrc` setzt `legacy-peer-deps=true` (Peer-Konflikt react/react-dom 19.3). Schlägt `expo install` fehl, die Version aus `node_modules/expo/bundledNativeModules.json` nehmen und mit `npm install` installieren.
- Expo: Projekt `@nofufu1234s-team/nofufu`, ID `e9eb2025-8e60-432a-ae89-13a9a89b6c06`. EAS-CLI immer mit `EXPO_TOKEN=proxy-injected` aufrufen, der echte Token wird vom Proxy eingefügt.
- Supabase: Projekt `weqedfymanchzptccotk`. Öffentliche URL + publishable key stehen in `app/.env` und als EAS-Umgebungsvariablen.
  SQL ausführen über die Management API: `POST https://api.supabase.com/v1/projects/weqedfymanchzptccotk/database/query` mit `{"query": "..."}`.
  Schemaänderungen immer als neue Datei in `supabase/migrations/` anlegen, dann einspielen. Nie bestehende Migrationen ändern.
- Beispieldaten in `app/src/data/spots.ts` und `supabase/seed.sql` sind erfunden (Koordinaten ungefähr). Bilder in `app/assets/spots/`: 10 Spots haben KI-Testfotos (s. `TESTBILDER.md`, `PHOTO_SPOT_IDS`), der Rest sind gezeichnete Platzhalter. Neue Doppelbilder: in der Mitte teilen, links = `{id}a` (leer), rechts = `{id}b` (Outfit).
- Prototyp `prototype/index.html` ist eine eigenständige HTML-Datei, veröffentlicht als Artifact https://claude.ai/artifact/WcngG8WcNPhgv4ZXL4XVnG.
