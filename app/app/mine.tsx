import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/lib/auth';
import { deletePhoto, loadMine, type MyPhoto, type MySpot } from '../src/lib/mine';
import { useStore } from '../src/store';
import { IconButton, StatusBadge, T, radius, space, thumbSize, useColors } from '../src/ui';

export default function Mine() {
  const c = useColors();
  const { session } = useAuth();
  const { reload } = useStore();
  const [data, setData] = useState<{ spots: MySpot[]; photos: MyPhoto[] } | null>(null);

  const load = useCallback(() => { if (session) loadMine(session.user.id).then(setData); }, [session]);
  useFocusEffect(load);

  function askDelete(p: MyPhoto) {
    Alert.alert('Foto löschen?', `Dein Foto bei „${p.spotName}" wird endgültig entfernt.`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        try { await deletePhoto(p); load(); reload(); } catch (e) { Alert.alert('Ging nicht', (e as Error).message); }
      } },
    ]);
  }

  const thumb = { width: thumbSize, height: thumbSize, borderRadius: radius.thumb, backgroundColor: c.fill };
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="title" accessibilityRole="header">Meine Inhalte</T>
      </View>
      <ScrollView contentContainerStyle={st.body}>
        <T variant="name" accessibilityRole="header">Meine Spots</T>
        {data?.spots.length === 0 ? <T color="asphalt">Noch keine Spots.</T> : null}
        {data?.spots.map((s) => (
          <Pressable key={s.id} accessibilityRole="button" accessibilityLabel={`${s.name} bearbeiten`}
            onPress={() => router.push({ pathname: '/edit-spot', params: { id: String(s.id) } })}
            style={[st.row, { borderColor: c.line }]}>
            {s.cover ? <Image source={{ uri: s.cover }} style={thumb} contentFit="cover" /> : <View style={thumb} />}
            <View style={st.grow}>
              <T variant="label" numberOfLines={1}>{s.name}</T>
              <StatusBadge status={s.status} />
            </View>
            <IconButton icon="create-outline" label="Bearbeiten" onPress={() => router.push({ pathname: '/edit-spot', params: { id: String(s.id) } })} />
          </Pressable>
        ))}

        <T variant="name" accessibilityRole="header" style={{ marginTop: space.lg }}>Meine Fotos</T>
        {data?.photos.length === 0 ? <T color="asphalt">Noch keine Fotos.</T> : null}
        {data?.photos.map((p) => (
          <View key={p.id} style={[st.row, { borderColor: c.line }]}>
            {p.url ? <Image source={{ uri: p.url }} style={thumb} contentFit="cover" /> : <View style={thumb} />}
            <View style={st.grow}>
              <T variant="label" numberOfLines={1}>{p.instagram ? 'Instagram-Post' : 'Foto'} · {p.spotName}</T>
              <StatusBadge status={p.status} />
            </View>
            <IconButton icon="trash-outline" label="Foto löschen" color={c.danger} onPress={() => askDelete(p)} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  body: { padding: space.lg, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: space.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  grow: { flex: 1, gap: space.xs },
});
