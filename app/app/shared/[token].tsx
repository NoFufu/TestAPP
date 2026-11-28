import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListSpots } from '../../src/components/ListView';
import { useAuth } from '../../src/lib/auth';
import { createList, addToList, loadShared, routeUrl } from '../../src/lib/lists';
import { track } from '../../src/lib/events';
import { useStore } from '../../src/store';
import { Button, IconButton, T, space, useColors } from '../../src/ui';

/** Geteilte Shoot-Liste ansehen und als eigene Liste übernehmen. */
export default function SharedList() {
  const c = useColors();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { session } = useAuth();
  const { spots } = useStore();
  const [data, setData] = useState<{ name: string; owner: string | null; spotIds: number[] } | null | 'missing'>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (session && token) loadShared(token).then((d) => setData(d ?? 'missing')); }, [session, token]);

  const items = data && data !== 'missing'
    ? data.spotIds.map((id) => spots.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s) : [];
  const route = routeUrl(items.filter((s) => (s.city ?? 'Bielefeld') === (items[0]?.city ?? 'Bielefeld')));

  async function copy() {
    if (!session || !data || data === 'missing') return;
    setBusy(true);
    try {
      const id = await createList(session.user.id, data.name.slice(0, 40));
      for (const s of items) await addToList(id, s.id);
      router.replace(`/list/${id}`);
    } catch { Alert.alert('Ging nicht', 'Bitte noch mal versuchen.'); }
    setBusy(false);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
        <T variant="title" accessibilityRole="header" numberOfLines={1} style={{ flex: 1 }}>
          {data && data !== 'missing' ? data.name : 'Geteilte Liste'}
        </T>
      </View>
      {!session ? (
        <View style={[st.pad, { gap: space.lg }]}>
          <T color="asphalt">Melde dich an, um die geteilte Shoot-Liste zu sehen.</T>
          <Button label="Anmelden" onPress={() => router.push('/login')} />
        </View>
      ) : data === 'missing' ? (
        <T color="asphalt" style={st.pad}>Diese Liste gibt es nicht mehr oder der Link stimmt nicht.</T>
      ) : !data ? null : (
        <ScrollView contentContainerStyle={{ gap: space.lg, paddingBottom: space.xxl }}>
          {data.owner ? <T color="asphalt" style={st.pad}>Geteilt von {data.owner}</T> : null}
          <View style={[st.pad, st.row]}>
            <Button label="Übernehmen" icon="copy-outline" style={{ flex: 1 }} loading={busy} disabled={busy || !items.length} onPress={copy} />
            <Button label="Route" icon="navigate-outline" variant="secondary" style={{ flex: 1 }} disabled={!route}
              onPress={() => { track('route_opened'); if (route) Linking.openURL(route); }} />
          </View>
          <ListSpots spots={items} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  pad: { paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
