# fitspot – Hinweise für Claude

- Sprache mit dem Nutzer: Deutsch, kurz und ohne Fachjargon.
- Plan und Phasenstatus: `docs/PLAN.md`. Nach jeder abgeschlossenen Phase dort den Status aktualisieren.
- App: Expo (SDK 58) + Expo Router + TypeScript in `app/`. Tabs kommen aus `expo-router/js-tabs`.
- Pakete mit `npx expo install <paket>` hinzufügen. `app/.npmrc` setzt `legacy-peer-deps=true` (Peer-Konflikt react/react-dom 19.3). Schlägt `expo install` wegen Expo-Login fehl, die Version aus `node_modules/expo/bundledNativeModules.json` nehmen und mit `npm install` installieren.
- Icons: `@expo/vector-icons` (Ionicons).
- Vor jedem Commit: `cd app && npx tsc --noEmit`. Zusätzlich prüft `npx expo export --platform android --output-dir <tmp>`, ob das Bundle baut.
- Beispieldaten in `app/src/data/spots.ts` sind erfunden (Koordinaten ungefähr). Die Bilder in `app/assets/spots/` sind generierte Platzhalter.
- Prototyp `prototype/index.html` ist eine eigenständige HTML-Datei, veröffentlicht als Artifact https://claude.ai/artifact/WcngG8WcNPhgv4ZXL4XVnG.
- Supabase: Projekt `weqedfymanchzptccotk`. Öffentliche URL + publishable key stehen in `app/.env` (darf ins Repo, Schutz über RLS).
  SQL ausführen über die Management API: `POST https://api.supabase.com/v1/projects/weqedfymanchzptccotk/database/query` mit `{"query": "..."}`. Der Token wird vom Proxy der Umgebung „fitspot" eingefügt.
  Neue Schemaänderungen immer als neue Datei in `supabase/migrations/` anlegen und dann einspielen.
