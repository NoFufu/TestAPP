import { Image } from 'expo-image';
import { router } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterBar, Tags } from '../../src/components/ui';
import { fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

export default function FeedScreen() {
  usePreventScreenCapture(); // Android: blockiert Screenshots. iOS: nur Bildschirmaufnahme.
  const t = useTheme();
  const { visible, saved, toggleSave } = useStore();
  const [sort, setSort] = useState<'near' | 'top'>('near');
  const [h, setH] = useState(0);
  const list = useMemo(
    () => [...visible].sort((a, b) => (sort === 'near' ? a.dist - b.dist : b.likes - a.likes)),
    [visible, sort],
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: t.surface }}>
        <FilterBar />
      </SafeAreaView>
      <View style={{ flex: 1 }} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
        {h > 0 && list.length > 0 ? (
          <FlatList
            data={list}
            keyExtractor={(s) => String(s.id)}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, i) => ({ length: h, offset: h * i, index: i })}
            renderItem={({ item: s }) => {
              const isSaved = saved.has(s.id);
              return (
                <Pressable style={{ height: h, backgroundColor: '#111' }} onPress={() => router.push(`/spot/${s.id}`)}>
                  <Image source={s.images[s.id % 3 === 0 && s.images[1] ? 1 : 0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
                  <View style={[st.cap, { backgroundColor: t.scrim }]}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <Tags cats={s.cats} onPhoto />
                      <Text style={st.title}>{s.name}</Text>
                      <Text style={st.meta}>{s.area} · {fmtDist(s.dist)} entfernt</Text>
                    </View>
                    <Pressable onPress={() => toggleSave(s.id)} style={[st.fab, isSaved && { backgroundColor: '#fff' }]} accessibilityLabel="Merken" hitSlop={8}>
                      <Text style={{ fontSize: 22, color: isSaved ? '#E0478C' : '#fff' }}>♥</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            }}
          />
        ) : null}
        {list.length === 0 ? (
          <View style={st.empty}>
            <Text style={[st.emptyTitle, { color: t.ink }]}>Keine Spots für diesen Filter</Text>
            <Text style={{ color: t.muted, textAlign: 'center' }}>Wähle eine andere Kategorie oder lade selbst einen Spot hoch.</Text>
          </View>
        ) : null}
        <View style={st.sortBar}>
          {(['near', 'top'] as const).map((k) => (
            <Pressable key={k} onPress={() => setSort(k)} style={[st.sortBtn, sort === k && { backgroundColor: '#fff' }]}>
              <Text style={{ fontWeight: '600', fontSize: 13, color: sort === k ? '#12141B' : 'rgba(255,255,255,0.85)' }}>
                {k === 'near' ? 'In der Nähe' : 'Beliebt'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  cap: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 22 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  meta: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5 },
  fab: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  sortBar: { position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.45)' },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  empty: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
});
