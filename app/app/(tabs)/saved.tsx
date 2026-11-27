import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

export default function SavedScreen() {
  const t = useTheme();
  const { spots, saved } = useStore();
  const list = spots.filter((s) => saved.has(s.id));
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={list}
        numColumns={2}
        keyExtractor={(s) => String(s.id)}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 4 }}>
            <Text style={[st.h, { color: t.ink }]}>Gemerkt</Text>
            <Text style={{ color: t.muted, lineHeight: 21 }}>
              {list.length ? `${list.length} Spots für deinen nächsten Shoot.` : 'Noch nichts gemerkt. Tippe im Feed oder in den Details auf das Herz, dann landen Spots hier.'}
            </Text>
          </View>
        }
        renderItem={({ item: s }) => (
          <Pressable style={{ flex: 1 / 2, gap: 6 }} onPress={() => router.push(`/spot/${s.id}`)}>
            <Image source={s.images[0]} style={[st.img, { backgroundColor: t.line }]} contentFit="cover" />
            <Text style={{ color: t.ink, fontWeight: '600' }} numberOfLines={2}>{s.name}</Text>
            <Text style={{ color: t.muted, fontSize: 12 }}>{fmtDist(s.dist)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  h: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  img: { width: '100%', aspectRatio: 3 / 4, borderRadius: 14 },
});
