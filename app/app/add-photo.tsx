import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../src/lib/auth';
import { distanceKm } from '../src/data/spots';
import { addPhotoToSpot, cleanInstagramUrl, gpsFromExif } from '../src/lib/upload';
import { track } from '../src/lib/events';
import { useStore } from '../src/store';
import { Button, ConsentRow, IconButton, T, haptic, radius, space, type, useColors } from '../src/ui';

/** Eigenes Fitpic (und/oder Instagram-Link) zu einem bestehenden Spot hinzufügen. */
export default function AddPhoto() {
  const c = useColors();
  const { spot } = useLocalSearchParams<{ spot: string }>();
  const { session } = useAuth();
  const { spots, reload } = useStore();
  const s = spots.find((x) => String(x.id) === spot);
  const [uri, setUri] = useState<string | null>(null);
  const [gps, setGps] = useState<{ lat: number; lon: number } | null>(null);
  const [insta, setInsta] = useState('');
  const [step, setStep] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const instaClean = insta.trim() ? cleanInstagramUrl(insta) : null;
  const instaInvalid = !!insta.trim() && !instaClean;
  const busy = step !== null && step < 3;
  const ready = (!!uri || !!instaClean) && !instaInvalid && consent && !busy;

  async function pick(camera: boolean) {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9, exif: true };
    if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) return;
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled) { setUri(res.assets[0].uri); setGps(gpsFromExif(res.assets[0].exif as Record<string, unknown>)); }
  }

  // GPS-Check: Foto-Standort gegen Spot. Nur Hinweis, in der Testphase kein Blocker.
  const distM = uri && gps && s ? Math.round(distanceKm(gps, s) * 1000) : null;
  const gpsHint = !uri ? null : distM == null ? 'Im Foto ist kein Standort gespeichert. Das ist okay, wird aber später geprüft.'
    : distM > 300 ? `Das Foto wurde etwa ${distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${distM} m`} vom Spot entfernt aufgenommen. Stimmt der Spot?` : null;

  async function submit() {
    if (!session || !s) return;
    setError(null);
    try {
      await addPhotoToSpot(session.user.id, s.id, uri, instaClean, setStep, distM);
      haptic.like();
      track('upload_done');
      reload();
      router.back();
    } catch {
      setStep(null);
      setError('Hochladen hat nicht geklappt. Prüfe dein Internet und versuch es noch mal.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView contentContainerStyle={st.page} keyboardShouldPersistTaps="handled">
        <View style={st.close}><IconButton icon="close" label="Schließen" onPress={() => router.back()} /></View>
        <View style={{ gap: space.xs }}>
          <T variant="display" accessibilityRole="header">Dein Foto hier</T>
          <T color="asphalt">{s ? `Teile dein Fitpic am Spot „${s.name}".` : 'Spot nicht gefunden.'}</T>
        </View>
        <Pressable onPress={() => pick(false)} accessibilityRole="button" accessibilityLabel="Foto aus der Galerie wählen"
          style={[st.slot, { backgroundColor: c.fill }]}>
          {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : (
            <View style={{ alignItems: 'center', gap: space.xs }}>
              <Ionicons name="image-outline" size={32} color={c.asphalt} />
              <T variant="label">Foto wählen</T>
            </View>
          )}
        </Pressable>
        {gpsHint ? <T variant="small" color="asphalt">{gpsHint}</T> : null}
        <T variant="small" color="asphalt">Standort und andere Metadaten werden vor dem Hochladen aus dem Foto entfernt.</T>
        <Button label="Mit der Kamera aufnehmen" icon="camera-outline" variant="secondary" onPress={() => pick(true)} />
        <View style={{ gap: space.sm }}>
          <T variant="label">Oder dein Instagram-Post</T>
          <TextInput value={insta} onChangeText={setInsta} autoCapitalize="none" autoCorrect={false} keyboardType="url"
            placeholder="https://www.instagram.com/p/…" placeholderTextColor={c.asphalt} accessibilityLabel="Link zu deinem Instagram-Post"
            style={[type.body, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]} />
          {instaInvalid ? <T variant="small" color="danger">Bitte einen Link zu einem Beitrag oder Reel einfügen.</T> : null}
        </View>
        <ConsentRow checked={consent} onToggle={() => setConsent(!consent)} />
        {error ? <T color="danger" accessibilityLiveRegion="polite">{error}</T> : null}
        <Button label="Teilen" disabled={!ready || !s} loading={busy} onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  page: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl },
  close: { alignItems: 'flex-end', marginRight: -space.sm },
  slot: { aspectRatio: 4 / 5, borderRadius: radius.card, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md + 2, paddingVertical: space.md },
});
