# fitspot – Hinweise für Claude

- Sprache mit dem Nutzer: Deutsch, kurz und ohne Fachjargon.
- Plan und Phasenstatus: `docs/PLAN.md`. Nach jeder abgeschlossenen Phase dort den Status aktualisieren.
- App: Expo (SDK 58) + Expo Router + TypeScript in `app/`. Tabs kommen aus `expo-router/js-tabs`.
- Pakete immer mit `npx expo install <paket>` hinzufügen (passende Versionen). `@expo/vector-icons` hat einen Peer-Konflikt mit React 19.3, deshalb sind die Icons vorerst Textzeichen.
- Vor jedem Commit: `cd app && npx tsc --noEmit`. Zusätzlich prüft `npx expo export --platform android --output-dir <tmp>`, ob das Bundle baut.
- Beispieldaten in `app/src/data/spots.ts` sind erfunden (Koordinaten ungefähr). Die Bilder in `app/assets/spots/` sind generierte Platzhalter.
- Prototyp `prototype/index.html` ist eine eigenständige HTML-Datei, veröffentlicht als Artifact https://claude.ai/artifact/WcngG8WcNPhgv4ZXL4XVnG.
