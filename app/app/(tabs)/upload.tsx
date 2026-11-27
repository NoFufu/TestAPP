import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATS, catInfo, type Cat } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { Button, Chip, T, haptic, radius, space, type, useColors } from '../../src/ui';

type Step = { label: string; result: string; done: boolean };
const STEP_MS = 650;

export default function Upload() {
  const c = useColors();
  const { addSpot, mapCenter } = useStore();
  const [uri, setUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cats, setCats] = useState<Cat[]>([]);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [newId, setNewId] = useState<number | null>(null);

  const ready = !!uri && name.trim().length > 1 && cats.length > 0 && !steps;
  const missing = !uri ? 'Wähle zuerst ein Foto.' : name.trim().length < 2 ? 'Gib dem Spot einen Namen.' : !cats.length ? 'Wähle mindestens eine Kategorie.' : null;

  async function pick(camera: boolean) {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [4, 5] };
    if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) return;
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled) setUri(res.assets[0].uri);
  }

  // Simulierte Prüfung. Echte Prüfung kommt in Etappe F.
  function publish() {
    const list: Step[] = [
      { label: 'Standort im Foto prüfen', result: 'passt', done: false },
      { label: 'Nach doppelten Bildern suchen', result: 'keine', done: false },
      { label: 'Inhalt prüfen', result: 'in Ordnung', done: false },
      { label: 'Kategorie erkennen', result: catInfo(cats[0]).label, done: false },
    ];
    setSteps(list);
    list.forEach((_, i) => setTimeout(() => setSteps((p) => p && p.map((x, k) => (k <= i ? { ...x, done: true } : x))), STEP_MS * (i + 1)));
    setTimeout(() => {
      const id = 100000 + (Date.now() % 100000);
      addSpot({ id, name: name.trim(), cats, lat: mapCenter.lat, lon: mapCenter.lon, area: 'Dein Upload', desc: 'Von dir hochgeladen. Wird vorerst nur auf diesem Handy gespeichert.', likes: 0, uri: uri! });
      haptic.like();
      setNewId(id);
    }, STEP_MS * (list.length + 1));
  }

  function reset() { setUri(null); setName(''); setCats([]); setSteps(null); setNewId(null); }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView contentContainerStyle={st.page} keyboardShouldPersistTaps="handled">
        <View style={{ gap: space.xs }}>
          <T variant="title" accessibilityRole="header">Spot hochladen</T>
          <T color="asphalt">Foto, Name, Kategorie. fitspot prüft den Spot danach automatisch.</T>
        </View>

        <View style={[st.photo, { backgroundColor: c.fill }]}>
          {uri ? (
            <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Dein gewähltes Foto" />
          ) : (
            <View style={{ alignItems: 'center', gap: space.sm }}>
              <Ionicons name="image-outline" size={36} color={c.asphalt} />
              <T color="asphalt">Hochformat wirkt am besten</T>
            </View>
          )}
        </View>
        <View style={st.row}>
          <Button label="Kamera" icon="camera-outline" variant="secondary" style={{ flex: 1 }} onPress={() => pick(true)} />
          <Button label="Galerie" icon="images-outline" variant="secondary" style={{ flex: 1 }} onPress={() => pick(false)} />
        </View>

        <View style={{ gap: space.sm }}>
          <T variant="label" nativeID="nameLabel">Name des Spots</T>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={48}
            placeholder="z. B. Grüne Tür in der Weststraße"
            placeholderTextColor={c.asphalt}
            accessibilityLabelledBy="nameLabel"
            accessibilityLabel="Name des Spots"
            style={[type.body, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]}
          />
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

        <T variant="small" color="asphalt">
          Der Spot landet an der Stelle, die gerade in der Mitte der Karte ist. Später liest fitspot den Ort direkt aus dem Foto.
        </T>

        <View style={{ gap: space.sm }}>
          <Button label="Spot prüfen und veröffentlichen" disabled={!ready} onPress={publish} />
          {missing && !steps ? <T variant="small" color="asphalt">{missing}</T> : null}
        </View>

        {steps ? (
          <View style={{ gap: space.sm }} accessibilityLiveRegion="polite">
            {steps.map((x) => (
              <View key={x.label} style={[st.step, { borderColor: c.line, backgroundColor: c.surface, opacity: x.done ? 1 : 0.5 }]}>
                <Ionicons name={x.done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={x.done ? c.ink : c.asphalt} />
                <T style={{ flex: 1 }}>{x.label}</T>
                {x.done ? <T variant="small" color="asphalt">{x.result}</T> : null}
              </View>
            ))}
          </View>
        ) : null}

        {newId ? (
          <View style={{ gap: space.sm }}>
            <T variant="name">Dein Spot ist online.</T>
            <Button label="Spot ansehen" onPress={() => router.push(`/spot/${newId}`)} />
            <Button label="Noch einen hochladen" variant="ghost" onPress={reset} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  page: { padding: space.lg, gap: space.xl, paddingBottom: space.xxl },
  photo: { aspectRatio: 4 / 5, width: '100%', borderRadius: radius.card, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  input: { borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md + 2, paddingVertical: space.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, padding: space.md, borderRadius: radius.thumb, borderWidth: StyleSheet.hairlineWidth },
});
