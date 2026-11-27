import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATS, type Cat } from '../src/data/spots';
import { useAuth } from '../src/lib/auth';
import { deleteSpot, loadMine, updateSpot, type MySpot } from '../src/lib/mine';
import { useStore } from '../src/store';
import { Button, Chip, IconButton, T, radius, space, type, useColors } from '../src/ui';

export default function EditSpot() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { reload } = useStore();
  const [spot, setSpot] = useState<MySpot | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cats, setCats] = useState<Cat[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    loadMine(session.user.id).then(({ spots }) => {
      const s = spots.find((x) => x.id === Number(id));
      if (!s) return;
      setSpot(s); setName(s.name); setDesc(s.description); setCats(s.cats);
    });
  }, [session, id]);

  const ok = name.trim().length >= 2 && cats.length >= 1 && cats.length <= 4;

  async function save() {
    if (!spot || !ok) return;
    setBusy(true);
    try { await updateSpot(spot.id, { name, description: desc, cats }); reload(); router.back(); }
    catch (e) { Alert.alert('Ging nicht', (e as Error).message); }
    setBusy(false);
  }

  function remove() {
    if (!spot) return;
    Alert.alert('Spot löschen?', `„${spot.name}" und deine Fotos daran werden endgültig entfernt.`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        setBusy(true);
        try { await deleteSpot(spot.id); reload(); router.back(); }
        catch (e) { Alert.alert('Ging nicht', (e as Error).message); }
        setBusy(false);
      } },
    ]);
  }

  const input = [type.body, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }];
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="title" accessibilityRole="header">Spot bearbeiten</T>
      </View>
      {!spot ? <T color="asphalt" style={st.pad}>Lädt …</T> : (
        <ScrollView contentContainerStyle={[st.pad, { gap: space.lg }]} keyboardShouldPersistTaps="handled">
          <View style={{ gap: space.sm }}>
            <T variant="label">Name</T>
            <TextInput value={name} onChangeText={setName} maxLength={60} accessibilityLabel="Name des Spots" style={input} />
          </View>
          <View style={{ gap: space.sm }}>
            <T variant="label">Was macht den Spot aus? (optional)</T>
            <TextInput value={desc} onChangeText={setDesc} maxLength={200} multiline accessibilityLabel="Beschreibung"
              style={[input, { minHeight: 72, textAlignVertical: 'top' }]} />
          </View>
          <View style={{ gap: space.sm }}>
            <T variant="label">Kategorie (1 bis 4)</T>
            <View style={st.chips}>
              {CATS.map((k) => (
                <Chip key={k.key} label={k.label} dot={k.color} selected={cats.includes(k.key)}
                  onPress={() => setCats((p) => (p.includes(k.key) ? p.filter((x) => x !== k.key) : p.length < 4 ? [...p, k.key] : p))} />
              ))}
            </View>
          </View>
          <Button label="Speichern" onPress={save} loading={busy} disabled={!ok || busy} />
          {spot.foreign ? (
            <T variant="small" color="asphalt">An diesem Spot hängen Fotos von anderen. Löschen geht deshalb nicht.</T>
          ) : (
            <Button label="Spot löschen" icon="trash-outline" variant="secondary" onPress={remove} disabled={busy} />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  pad: { padding: space.lg },
  input: { borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md, paddingVertical: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
