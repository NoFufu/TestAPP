import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/lib/auth';
import { addToList, createList, loadLists, removeFromList, type ShootList } from '../src/lib/lists';
import { Button, IconButton, T, haptic, radius, space, type, useColors } from '../src/ui';

/** Spot zu einer oder mehreren Shoot-Listen hinzufügen, oder eine neue Liste anlegen. */
export default function AddToList() {
  const c = useColors();
  const { spot, name } = useLocalSearchParams<{ spot: string; name?: string }>();
  const spotId = Number(spot);
  const { session } = useAuth();
  const [lists, setLists] = useState<ShootList[] | null>(null);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => loadLists().then(setLists, () => setLists([]));
  useEffect(() => { if (session) load(); }, [session]);

  async function toggle(l: ShootList) {
    const inside = l.spotIds.includes(spotId);
    setLists((p) => p?.map((x) => x.id !== l.id ? x : { ...x, spotIds: inside ? x.spotIds.filter((i) => i !== spotId) : [...x.spotIds, spotId] }) ?? p);
    haptic.select();
    try { inside ? await removeFromList(l.id, spotId) : await addToList(l.id, spotId); }
    catch { Alert.alert('Ging nicht', 'Bitte noch mal versuchen.'); load(); }
  }

  async function create() {
    if (!session || !newName.trim()) return;
    setBusy(true);
    try { await createList(session.user.id, newName, spotId); setNewName(''); haptic.like(); await load(); }
    catch { Alert.alert('Ging nicht', 'Liste konnte nicht angelegt werden.'); }
    setBusy(false);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="title" accessibilityRole="header">Zur Shoot-Liste</T>
      </View>
      {!session ? (
        <View style={[st.pad, { gap: space.lg }]}>
          <T color="asphalt">Für Shoot-Listen musst du angemeldet sein.</T>
          <Button label="Anmelden" onPress={() => router.replace('/login')} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[st.pad, { gap: space.md }]} keyboardShouldPersistTaps="handled">
          {name ? <T color="asphalt">„{name}"</T> : null}
          {lists?.map((l) => {
            const inside = l.spotIds.includes(spotId);
            return (
              <Pressable key={l.id} onPress={() => toggle(l)} accessibilityRole="checkbox" accessibilityState={{ checked: inside }}
                accessibilityLabel={`${l.name}, ${l.spotIds.length} Spots`} style={[st.row, { borderColor: c.line }]}>
                <Ionicons name={inside ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={inside ? c.ink : c.asphalt} />
                <View style={{ flex: 1 }}>
                  <T variant="label">{l.name}</T>
                  <T variant="small" color="asphalt">{l.spotIds.length} {l.spotIds.length === 1 ? 'Spot' : 'Spots'}</T>
                </View>
              </Pressable>
            );
          })}
          {lists?.length === 0 ? <T color="asphalt">Noch keine Liste. Leg deine erste an:</T> : null}
          <View style={{ gap: space.sm, marginTop: space.md }}>
            <T variant="label">Neue Liste</T>
            <TextInput value={newName} onChangeText={setNewName} maxLength={40} placeholder="z. B. Shoot Samstag"
              placeholderTextColor={c.asphalt} accessibilityLabel="Name der neuen Liste" onSubmitEditing={create}
              style={[type.body, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]} />
            <Button label="Anlegen und Spot hinzufügen" icon="add" onPress={create} loading={busy} disabled={!newName.trim() || busy} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  pad: { padding: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  input: { borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md, paddingVertical: space.md },
});
