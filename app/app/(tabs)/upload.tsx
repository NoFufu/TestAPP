import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATS, type Cat } from '../../src/data/spots';
import { useAuth } from '../../src/lib/auth';
import { track } from '../../src/lib/events';
import { cleanInstagramUrl, createSpot, gpsFromExif } from '../../src/lib/upload';
import { useStore } from '../../src/store';
import { Button, Chip, T, haptic, radius, space, type, useColors, dock } from '../../src/ui';

type Photo = { uri: string; gps: { lat: number; lon: number } | null };
type Where = { lat: number; lon: number; source: 'foto' | 'standort' | 'karte' };
const STEPS = ['Fotos verkleinern', 'Fotos hochladen', 'Spot speichern'];

export default function Upload() {
  const c = useColors();
  const { session, profile } = useAuth();
  const { mapCenter, me, realLocation, reload } = useStore();
  const [empty, setEmpty] = useState<Photo | null>(null);
  const [person, setPerson] = useState<Photo | null>(null);
  const [insta, setInsta] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cats, setCats] = useState<Cat[]>([]);
  const [step, setStep] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newId, setNewId] = useState<number | null>(null);

  if (!session || !profile?.username) {
    return (
      <SafeAreaView edges={['top']} style={[st.center, { backgroundColor: c.paper }]}>
        <T variant="title" accessibilityRole="header">Spot hochladen</T>
        <T color="asphalt" style={{ textAlign: 'center' }}>Melde dich an, damit dein Spot für alle sichtbar wird und dein Name dabei steht.</T>
        <Button label="Anmelden" onPress={() => router.push('/login')} />
      </SafeAreaView>
    );
  }

  const where: Where = empty?.gps ? { ...empty.gps, source: 'foto' }
    : realLocation ? { ...me, source: 'standort' } : { ...mapCenter, source: 'karte' };
  const instaClean = insta.trim() ? cleanInstagramUrl(insta) : null;
  const instaInvalid = !!insta.trim() && !instaClean;
  const busy = step !== null && step < STEPS.length;
  const ready = !!empty && name.trim().length > 1 && cats.length > 0 && !instaInvalid && !busy;
  const missing = !empty ? 'Wähle zuerst ein Foto vom Spot.' : name.trim().length < 2 ? 'Gib dem Spot einen Namen.'
    : !cats.length ? 'Wähle mindestens eine Kategorie.' : instaInvalid ? 'Der Instagram-Link sieht nicht richtig aus.' : null;

  async function pick(set: (p: Photo) => void, camera: boolean) {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9, exif: true };
    if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) return;
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled) set({ uri: res.assets[0].uri, gps: gpsFromExif(res.assets[0].exif as Record<string, unknown>) });
  }

  async function publish() {
    if (!empty || !session) return;
    setError(null);
    try {
      const id = await createSpot(session.user.id, {
        name, description: desc, cats, lat: where.lat, lon: where.lon,
        emptyUri: empty.uri, personUri: person?.uri, instagramUrl: instaClean,
      }, setStep);
      haptic.like();
      track('upload_done');
      setNewId(id);
      reload();
    } catch {
      setStep(null);
      setError('Hochladen hat nicht geklappt. Prüfe dein Internet und versuch es noch mal.');
    }
  }

  function reset() {
    setEmpty(null); setPerson(null); setInsta(''); setName(''); setDesc(''); setCats([]); setStep(null); setNewId(null); setError(null);
  }

  const input = [type.body, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }];

  if (newId) {
    return (
      <SafeAreaView edges={['top']} style={[st.center, { backgroundColor: c.paper }]}>
        <Ionicons name="checkmark-circle" size={56} color={c.ink} />
        <T variant="title" accessibilityRole="header">Dein Spot ist online</T>
        <T color="asphalt" style={{ textAlign: 'center' }}>Alle sehen ihn jetzt im Feed und auf der Karte.</T>
        <Button label="Spot ansehen" onPress={() => router.push(`/spot/${newId}`)} />
        <Button label="Noch einen hochladen" variant="ghost" onPress={reset} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView contentContainerStyle={st.page} keyboardShouldPersistTaps="handled">
        <View style={{ gap: space.xs }}>
          <T variant="title" accessibilityRole="header">Spot hochladen</T>
          <T color="asphalt">Ein Foto vom leeren Spot, optional eins mit Person oder dein Instagram-Post.</T>
        </View>

        <View style={st.photos}>
          <PhotoSlot label="Der Spot" hint="Pflicht" photo={empty} onCamera={() => pick(setEmpty, true)} onLibrary={() => pick(setEmpty, false)} />
          <PhotoSlot label="Mit Person" hint="Optional" photo={person} onCamera={() => pick(setPerson, true)} onLibrary={() => pick(setPerson, false)} />
        </View>

        <View style={{ gap: space.sm }}>
          <T variant="label">Instagram-Post (optional)</T>
          <TextInput value={insta} onChangeText={setInsta} autoCapitalize="none" autoCorrect={false} keyboardType="url"
            placeholder="https://www.instagram.com/p/…" placeholderTextColor={c.asphalt}
            accessibilityLabel="Link zu deinem Instagram-Post" style={input} />
          <T variant="small" color={instaInvalid ? 'danger' : 'asphalt'}>
            {instaInvalid ? 'Bitte einen Link zu einem Beitrag oder Reel einfügen (instagram.com/p/… oder /reel/…).' : 'Hast du hier schon gepostet? Dann zeigen wir deinen Post direkt beim Spot.'}
          </T>
        </View>

        <View style={{ gap: space.sm }}>
          <T variant="label">Name des Spots</T>
          <TextInput value={name} onChangeText={setName} maxLength={60} placeholder="z. B. Grüne Tür in der Weststraße"
            placeholderTextColor={c.asphalt} accessibilityLabel="Name des Spots" style={input} />
        </View>

        <View style={{ gap: space.sm }}>
          <T variant="label">Was macht den Spot aus? (optional)</T>
          <TextInput value={desc} onChangeText={setDesc} maxLength={200} multiline placeholder="z. B. Sonne ab 15 Uhr, wenig los am Vormittag"
            placeholderTextColor={c.asphalt} accessibilityLabel="Beschreibung" style={[input, { minHeight: 72, textAlignVertical: 'top' }]} />
        </View>

        <View style={{ gap: space.sm }}>
          <T variant="label">Kategorie</T>
          <View style={st.row}>
            {CATS.map((k) => (
              <Chip key={k.key} label={k.label} dot={k.color} selected={cats.includes(k.key)}
                onPress={() => setCats((p) => (p.includes(k.key) ? p.filter((x) => x !== k.key) : [...p, k.key]))} />
            ))}
          </View>
        </View>

        <View style={[st.where, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Ionicons name="location-outline" size={20} color={c.ink} />
          <T variant="small" style={{ flex: 1 }}>
            {where.source === 'foto' ? 'Ort aus dem Foto übernommen.'
              : where.source === 'standort' ? 'Kein Ort im Foto. Wir nehmen deinen aktuellen Standort.'
              : 'Kein Ort im Foto. Wir nehmen die Mitte der Karte. Schieb sie vorher an die richtige Stelle.'}
          </T>
        </View>

        <View style={{ gap: space.sm }}>
          <Button label="Spot veröffentlichen" disabled={!ready} loading={busy} onPress={publish} />
          {missing && !busy ? <T variant="small" color="asphalt">{missing}</T> : null}
          {error ? <T color="danger" accessibilityLiveRegion="polite">{error}</T> : null}
        </View>

        {step !== null ? (
          <View style={{ gap: space.sm }} accessibilityLiveRegion="polite">
            {STEPS.map((label, i) => (
              <View key={label} style={[st.step, { borderColor: c.line, backgroundColor: c.surface, opacity: i <= step ? 1 : 0.5 }]}>
                <Ionicons name={i < step ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={i < step ? c.ink : c.asphalt} />
                <T style={{ flex: 1 }}>{label}</T>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function PhotoSlot({ label, hint, photo, onCamera, onLibrary }: {
  label: string; hint: string; photo: Photo | null; onCamera: () => void; onLibrary: () => void;
}) {
  const c = useColors();
  return (
    <View style={{ flex: 1, gap: space.sm }}>
      <Pressable onPress={onLibrary} accessibilityRole="button" accessibilityLabel={`${label}: Foto aus der Galerie wählen`}
        style={[st.slot, { backgroundColor: c.fill }]}>
        {photo ? <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : (
          <View style={{ alignItems: 'center', gap: space.xs }}>
            <Ionicons name="image-outline" size={28} color={c.asphalt} />
            <T variant="label">{label}</T>
            <T variant="small" color="asphalt">{hint}</T>
          </View>
        )}
      </Pressable>
      <Button label="Kamera" icon="camera-outline" variant="secondary" onPress={onCamera} />
    </View>
  );
}

const st = StyleSheet.create({
  page: { padding: space.lg, gap: space.xl, paddingBottom: dock.clearance },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl },
  photos: { flexDirection: 'row', gap: space.md },
  slot: { aspectRatio: 4 / 5, borderRadius: radius.card, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  input: { borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md + 2, paddingVertical: space.md },
  where: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.thumb + 2, borderWidth: StyleSheet.hairlineWidth },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, padding: space.md, borderRadius: radius.thumb, borderWidth: StyleSheet.hairlineWidth },
});
