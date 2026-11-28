import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListSpots } from '../../src/components/ListView';
import { MAX_ROUTE_STOPS, deleteList, loadLists, removeFromList, renameList, routeUrl, shareUrl, type ShootList } from '../../src/lib/lists';
import { track } from '../../src/lib/events';
import { useStore } from '../../src/store';
import { Button, IconButton, T, radius, space, type, useColors } from '../../src/ui';

/** Eigene Shoot-Liste: Spots, Karte, Route, Teilen, Umbenennen, Löschen. */
export default function ListScreen() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spots } = useStore();
  const [list, setList] = useState<ShootList | null>(null);
  const [missing, setMissing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  const load = useCallback(() => {
    loadLists().then((ls) => {
      const l = ls.find((x) => x.id === Number(id));
      setList(l ?? null); setMissing(!l); if (l) setName(l.name);
    }, () => setMissing(true));
  }, [id]);
  useFocusEffect(load);

  const items = (list?.spotIds ?? []).map((sid) => spots.find((s) => s.id === sid)).filter((s): s is NonNullable<typeof s> => !!s);
  const city = items[0]?.city ?? 'Bielefeld';
  const routeSpots = items.filter((s) => (s.city ?? 'Bielefeld') === city);
  const route = routeUrl(routeSpots);
  const cut = routeSpots.length > MAX_ROUTE_STOPS || routeSpots.length < items.length;

  async function share() {
    if (!list) return;
    const lines = [
      `📸 ${list.name}`,
      ...items.map((s, i) => `${i + 1}. ${s.name}${s.area ? ` (${s.area})` : ''}`),
      route ? `\nRoute zu Fuß: ${route}` : '',
      `\nIn fitspot öffnen: ${shareUrl(list.share_token)}`,
    ];
    track('list_shared');
    await Share.share({ message: lines.filter(Boolean).join('\n') });
  }

  async function saveName() {
    if (!list || !name.trim()) return;
    try { await renameList(list.id, name); setEditing(false); load(); } catch { Alert.alert('Ging nicht', 'Bitte noch mal versuchen.'); }
  }

  function askDelete() {
    if (!list) return;
    Alert.alert('Liste löschen?', `„${list.name}" wird gelöscht. Die Spots selbst bleiben.`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        try { await deleteList(list.id); router.back(); } catch { Alert.alert('Ging nicht', 'Bitte noch mal versuchen.'); }
      } },
    ]);
  }

  async function remove(spotId: number) {
    if (!list) return;
    try { await removeFromList(list.id, spotId); load(); } catch { Alert.alert('Ging nicht', 'Bitte noch mal versuchen.'); }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        {editing ? (
          <TextInput value={name} onChangeText={setName} maxLength={40} autoFocus onSubmitEditing={saveName} accessibilityLabel="Name der Liste"
            style={[type.title, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]} />
        ) : (
          <T variant="title" accessibilityRole="header" style={{ flex: 1 }} numberOfLines={1}>{list?.name ?? ''}</T>
        )}
        <IconButton icon={editing ? 'checkmark' : 'pencil-outline'} label={editing ? 'Namen speichern' : 'Umbenennen'}
          onPress={editing ? saveName : () => setEditing(true)} />
      </View>
      {missing ? <T color="asphalt" style={st.pad}>Diese Liste gibt es nicht mehr.</T> : !list ? null : (
        <ScrollView contentContainerStyle={{ gap: space.lg, paddingBottom: space.xxl }}>
          <View style={[st.pad, st.row]}>
            <Button label="Route" icon="navigate-outline" style={{ flex: 1 }} disabled={!route} onPress={() => { track('route_opened'); if (route) Linking.openURL(route); }} />
            <Button label="Teilen" icon="share-outline" variant="secondary" style={{ flex: 1 }} onPress={share} />
          </View>
          {cut && route ? (
            <T variant="small" color="asphalt" style={st.pad}>
              Die Route nimmt höchstens {MAX_ROUTE_STOPS} Spots aus {city}, in der kürzesten Reihenfolge.
            </T>
          ) : null}
          <ListSpots spots={items} />
          {items.length ? (
            <View style={[st.pad, { gap: space.sm }]}>
              <T variant="name" accessibilityRole="header">Spots in der Liste</T>
              {items.map((s) => (
                <View key={s.id} style={[st.row, st.item, { borderColor: c.line }]}>
                  <T style={{ flex: 1 }} numberOfLines={1}>{s.name}</T>
                  <IconButton icon="remove-circle-outline" label={`${s.name} aus der Liste nehmen`} color={c.asphalt} onPress={() => remove(s.id)} />
                </View>
              ))}
            </View>
          ) : null}
          <View style={st.pad}>
            <Button label="Liste löschen" icon="trash-outline" variant="secondary" onPress={askDelete} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  pad: { paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  item: { borderBottomWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md, paddingVertical: space.xs },
});
