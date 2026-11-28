import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { distanceKm, fmtDist, type Spot } from '../src/data/spots';
import { useAuth } from '../src/lib/auth';
import { addStartPhoto, adminSetLocation, gpsFromExif } from '../src/lib/upload';
import { useStore } from '../src/store';
import { Button, IconButton, T, haptic, radius, space, thumbSize, useColors } from '../src/ui';

type Done = { gps: { lat: number; lon: number } | null; distM: number | null; moved?: boolean };

/** Admin: echte Start-Fotos für Spots mit Platzhalter oder KI-Bild. Nächste Spots zuerst. */
export default function StartPhotos() {
  const c = useColors();
  const { session } = useAuth();
  const { spots, city, reload } = useStore();
  const [busy, setBusy] = useState<number | null>(null);
  const [done, setDone] = useState<Record<number, Done>>({});

  // Kein echtes Foto = Bild ist mitgeliefert (Platzhalter, KI-Testbild).
  const todo = spots.filter((s) => (s.city ?? 'Bielefeld') === city && typeof s.images[0] === 'number')
    .concat(spots.filter((s) => done[s.id] && typeof s.images[0] !== 'number'))
    .filter((s, i, a) => a.findIndex((x) => x.id === s.id) === i)
    .sort((a, b) => a.dist - b.dist);

  async function shoot(s: Spot, camera: boolean) {
    if (!session) return;
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9, exif: true };
    if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) return;
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled) return;
    const a = res.assets[0];
    const gps = gpsFromExif(a.exif as Record<string, unknown>);
    const distM = gps ? Math.round(distanceKm(gps, s) * 1000) : null;
    setBusy(s.id);
    try {
      await addStartPhoto(session.user.id, s.id, a.uri, distM);
      haptic.like();
      setDone((p) => ({ ...p, [s.id]: { gps, distM } }));
      reload();
    } catch { Alert.alert('Ging nicht', 'Hochladen hat nicht geklappt.'); }
    setBusy(null);
  }

  async function move(s: Spot) {
    const d = done[s.id];
    if (!d?.gps) return;
    try {
      await adminSetLocation(s.id, d.gps.lat, d.gps.lon);
      setDone((p) => ({ ...p, [s.id]: { ...d, moved: true } }));
      reload();
    } catch { Alert.alert('Ging nicht', 'Standort nicht gespeichert.'); }
  }

  const thumb = { width: thumbSize, height: thumbSize, borderRadius: radius.thumb, backgroundColor: c.fill };
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="title" accessibilityRole="header">Start-Fotos · {city}</T>
      </View>
      <ScrollView contentContainerStyle={st.body}>
        <T color="asphalt">Spots ohne echtes Foto, die nächsten zuerst. Dein Foto ersetzt den Platzhalter sofort.</T>
        {todo.length === 0 ? <T>Alle Spots in {city} haben echte Fotos. 🎉</T> : null}
        {todo.map((s) => {
          const d = done[s.id];
          return (
            <View key={s.id} style={[st.card, { borderColor: c.line }]}>
              <View style={st.row}>
                <Image source={s.images[0]} style={thumb} contentFit="cover" />
                <View style={st.grow}>
                  <T variant="label" numberOfLines={1}>{s.name}</T>
                  <T variant="small" color="asphalt">{s.area || city} · {fmtDist(s.dist)}</T>
                  {d ? <T variant="small">✓ Foto hochgeladen</T> : null}
                </View>
              </View>
              {d ? (
                d.gps == null ? <T variant="small" color="asphalt">Im Foto war kein Standort gespeichert.</T>
                : d.moved ? <T variant="small">✓ Spot an die Foto-Position verschoben.</T>
                : d.distM != null && d.distM > 30 ? (
                  <View style={{ gap: space.xs }}>
                    <T variant="small" color="asphalt">Foto-Standort liegt {d.distM >= 1000 ? `${(d.distM / 1000).toFixed(1)} km` : `${d.distM} m`} vom Spot entfernt.</T>
                    <Button label="Spot hierhin verschieben" icon="locate-outline" variant="secondary" onPress={() => move(s)} />
                  </View>
                ) : <T variant="small" color="asphalt">Standort passt (unter 30 m).</T>
              ) : (
                <View style={st.row}>
                  <Button label="Kamera" icon="camera-outline" style={st.grow} loading={busy === s.id} disabled={busy != null} onPress={() => shoot(s, true)} />
                  <Button label="Galerie" icon="image-outline" variant="secondary" style={st.grow} disabled={busy != null} onPress={() => shoot(s, false)} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  body: { padding: space.lg, gap: space.md },
  card: { gap: space.sm, paddingBottom: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  grow: { flex: 1, gap: 2 },
});
