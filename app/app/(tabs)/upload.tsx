import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../src/components/ui';
import { CATS, catInfo, type Cat } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

type Step = { label: string; result: string; done: boolean };

export default function UploadScreen() {
  const t = useTheme();
  const { addSpot, mapCenter } = useStore();
  const [uri, setUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cats, setCats] = useState<Cat[]>([]);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [newId, setNewId] = useState<number | null>(null);

  const ok = !!uri && name.trim().length > 0 && cats.length > 0 && !steps;

  async function pick(camera: boolean) {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [3, 4] };
    if (camera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
    }
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled) setUri(res.assets[0].uri);
  }

  // Simulierte Prüfung. In Phase 1b ersetzt durch Supabase Edge Function + KI-Check.
  function publish() {
    const list: Step[] = [
      { label: 'Standort im Foto prüfen', result: 'GPS ✓', done: false },
      { label: 'Nach doppelten Bildern suchen', result: '0 Treffer', done: false },
      { label: 'Inhalt prüfen', result: 'unbedenklich', done: false },
      { label: 'Kategorie erkennen', result: catInfo(cats[0]).label, done: false },
    ];
    setSteps(list);
    list.forEach((_, i) =>
      setTimeout(() => setSteps((p) => p && p.map((s, k) => (k <= i ? { ...s, done: true } : s))), 650 * (i + 1)),
    );
    setTimeout(() => {
      const id = 100000 + (Date.now() % 100000);
      addSpot({ id, name: name.trim(), cats, lat: mapCenter.lat, lon: mapCenter.lon, area: 'Dein Upload', desc: 'Von dir hochgeladen. Wird vorerst nur auf deinem Gerät gespeichert.', likes: 0, uri: uri! });
      setNewId(id);
    }, 650 * (list.length + 1));
  }

  function reset() { setUri(null); setName(''); setCats([]); setSteps(null); setNewId(null); }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={[st.h, { color: t.ink }]}>Spot hochladen</Text>
          <Text style={{ color: t.muted, lineHeight: 21 }}>So schnell wie ein Inserat: Foto, Name, Kategorie. Die App prüft den Spot danach automatisch.</Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[st.label, { color: t.muted }]}>FOTO</Text>
          <View style={[st.drop, { borderColor: t.line, backgroundColor: t.surface }]}>
            {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Text style={{ color: t.muted }}>Noch kein Foto</Text>}
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={[st.btn, st.ghost, { borderColor: t.line, backgroundColor: t.surface }]} onPress={() => pick(true)}><Text style={{ color: t.ink, fontWeight: '600' }}>Kamera</Text></Pressable>
            <Pressable style={[st.btn, st.ghost, { borderColor: t.line, backgroundColor: t.surface }]} onPress={() => pick(false)}><Text style={{ color: t.ink, fontWeight: '600' }}>Galerie</Text></Pressable>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[st.label, { color: t.muted }]}>NAME DES SPOTS</Text>
          <TextInput value={name} onChangeText={setName} maxLength={48} placeholder="z. B. Grüne Tür in der Weststraße" placeholderTextColor={t.muted} style={[st.input, { borderColor: t.line, backgroundColor: t.surface, color: t.ink }]} />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[st.label, { color: t.muted }]}>KATEGORIE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATS.map((c) => (
              <Chip key={c.key} label={c.label} color={c.color} active={cats.includes(c.key)} onPress={() => setCats((p) => (p.includes(c.key) ? p.filter((x) => x !== c.key) : [...p, c.key]))} />
            ))}
          </View>
        </View>

        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19 }}>Der Spot wird an der aktuellen Kartenmitte eingetragen. Schieb die Karte vorher an die richtige Stelle. Später kommt der Ort aus dem GPS des Fotos.</Text>

        <Pressable disabled={!ok} onPress={publish} style={[st.btn, { backgroundColor: t.accent, opacity: ok ? 1 : 0.45 }]}>
          <Text style={{ color: t.accentInk, fontWeight: '600' }}>Spot prüfen & veröffentlichen</Text>
        </Pressable>

        {steps ? (
          <View style={{ gap: 10 }}>
            {steps.map((s) => (
              <View key={s.label} style={[st.step, { borderColor: t.line, backgroundColor: t.surface, opacity: s.done ? 1 : 0.45 }]}>
                <Text style={{ color: s.done ? '#3AA35A' : t.muted, fontWeight: '700' }}>{s.done ? '✓' : '○'}</Text>
                <Text style={{ color: t.ink, flex: 1 }}>{s.label}</Text>
                {s.done ? <Text style={{ color: t.muted, fontSize: 11 }}>{s.result}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {newId ? (
          <View style={{ gap: 10 }}>
            <Pressable style={[st.btn, { backgroundColor: t.accent }]} onPress={() => router.push(`/spot/${newId}`)}><Text style={{ color: t.accentInk, fontWeight: '600' }}>Spot ansehen</Text></Pressable>
            <Pressable style={[st.btn, st.ghost, { borderColor: t.line }]} onPress={reset}><Text style={{ color: t.ink, fontWeight: '600' }}>Noch einen hochladen</Text></Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  h: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.7 },
  drop: { aspectRatio: 4 / 3, borderWidth: 2, borderStyle: 'dashed', borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
  ghost: { borderWidth: 1 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
});
