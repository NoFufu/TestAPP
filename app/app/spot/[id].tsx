import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tags } from '../../src/components/ui';
import { TIPS, fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

export default function SpotDetail() {
  usePreventScreenCapture();
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spots, saved, toggleSave } = useStore();
  const [page, setPage] = useState(0);
  const s = spots.find((x) => String(x.id) === id);

  if (!s) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <Text style={{ color: t.ink }}>Diesen Spot gibt es nicht mehr.</Text>
      </SafeAreaView>
    );
  }
  const tip = TIPS[s.cats[0]];
  const isSaved = saved.has(s.id);
  const captions = s.user ? ['Dein Upload'] : ['Übersicht', 'Outfit-Beispiel'];

  return (
    <View style={{ flex: 1, backgroundColor: t.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}>
          {s.images.map((img, i) => (
            <View key={i} style={{ width, height: width * 1.15, backgroundColor: '#111' }}>
              <Image source={img} style={StyleSheet.absoluteFill} contentFit="cover" />
              <Text style={st.cap}>{captions[i] ?? ''}</Text>
            </View>
          ))}
        </ScrollView>
        {s.images.length > 1 ? (
          <View style={st.dots}>
            {s.images.map((_, i) => <View key={i} style={[st.dot, { backgroundColor: i === page ? t.ink : t.line, width: i === page ? 16 : 6 }]} />)}
          </View>
        ) : null}

        <View style={{ padding: 16, gap: 14 }}>
          <Tags cats={s.cats} />
          <Text style={[st.h, { color: t.ink }]}>{s.name}</Text>
          <Text style={{ color: t.muted, fontSize: 12.5 }}>{s.area} · {fmtDist(s.dist)} von dir · ♥ {s.likes}</Text>
          <Text style={{ color: t.ink, lineHeight: 22 }}>{s.desc}</Text>

          <View style={[st.facts, { backgroundColor: t.bg }]}>
            <Fact k="BESTE ZEIT" v={tip.best} />
            <Fact k="FOTO-TIPP" v={tip.tip} mono />
            <Fact k="POSITION" v={`${s.lat.toFixed(4)}° N, ${s.lon.toFixed(4)}° O`} mono />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={[st.btn, { backgroundColor: t.accent }]}
              onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}&travelmode=walking`)}>
              <Text style={{ color: t.accentInk, fontWeight: '600' }}>Route</Text>
            </Pressable>
            <Pressable style={[st.btn, { borderWidth: 1, borderColor: t.line, backgroundColor: t.bg }]} onPress={() => toggleSave(s.id)}>
              <Text style={{ color: t.ink, fontWeight: '600' }}>{isSaved ? 'Gemerkt ✓' : 'Merken'}</Text>
            </Pressable>
          </View>
          <View style={[st.soon, { borderColor: t.line }]}>
            <Text style={{ color: t.muted, fontSize: 13.5, lineHeight: 19 }}>
              <Text style={{ color: t.ink, fontWeight: '700' }}>Outfit-Fotos von anderen</Text> an diesem Spot und Social Credits kommen in Phase 3.
            </Text>
          </View>
        </View>
      </ScrollView>
      <Pressable onPress={() => router.back()} style={st.close} accessibilityLabel="Schließen" hitSlop={8}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕</Text>
      </Pressable>
    </View>
  );
}

function Fact({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Text style={{ width: 86, fontSize: 11, fontWeight: '600', letterSpacing: 0.7, color: t.muted, paddingTop: 2 }}>{k}</Text>
      <Text style={{ flex: 1, color: t.ink, fontSize: mono ? 13 : 14, fontFamily: mono ? 'monospace' : undefined }}>{v}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  cap: { position: 'absolute', left: 12, bottom: 12, color: '#fff', fontSize: 11, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingTop: 10 },
  dot: { height: 6, borderRadius: 3 },
  h: { fontSize: 27, fontWeight: '800', letterSpacing: -0.5 },
  facts: { gap: 10, padding: 14, borderRadius: 16 },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
  soon: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, padding: 12 },
  close: { position: 'absolute', top: 14, right: 14, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
});
