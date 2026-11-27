# fitspot

Foto-Spots in deiner Stadt finden, nach Stil filtern und selbst hochladen. Start in Bielefeld.

| Was | Wo |
|---|---|
| Plan & Phasen | [`docs/PLAN.md`](docs/PLAN.md) |
| Klick-Prototyp (Browser) | [online](https://claude.ai/artifact/WcngG8WcNPhgv4ZXL4XVnG) · [`prototype/index.html`](prototype/index.html) |
| App (Expo, React Native, TypeScript) | [`app/`](app/) |

## App am Handy testen

1. Auf dem Handy die App **Expo Go** installieren (App Store / Play Store).
2. Am Computer (Node.js 20+ nötig):

```bash
cd app
npm install
npx expo start
```

3. Den QR-Code mit der Kamera (iPhone) oder in Expo Go (Android) scannen.

Ohne Computer geht es später über einen Link per **EAS Update**. Dafür braucht es ein kostenloses Expo-Konto.

## Aufbau der App

```
app/
  app/                Bildschirme (Expo Router: Datei = Bildschirm)
    (tabs)/index.tsx  Karte
    (tabs)/feed.tsx   Feed
    (tabs)/upload.tsx Hochladen
    (tabs)/saved.tsx  Gemerkt
    spot/[id].tsx     Spot-Details
  src/
    data/spots.ts     Kategorien, Beispiel-Spots, Entfernung
    store.tsx         Filter, Merkliste, eigene Uploads (lokal gespeichert)
    components/ui.tsx Filterleiste, Chips, Tags
    theme.ts          Farben hell/dunkel
  assets/spots/       Platzhalterfotos (generiert)
```

Prüfen vor einem Commit:

```bash
cd app && npm run typecheck
```
