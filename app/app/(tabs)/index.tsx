import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterBar, Tags } from '../../src/components/ui';
import { BIELEFELD, catInfo, fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

export default function MapScreen() {
  const t = useTheme();
  const { visible, setMapCenter } = useStore();
  const [selId, setSelId] = useState<number | null>(null);
  const sel = visible.find((s) => s.id === selId) ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line }}>
        <View style={st.top}>
          <Text style={[st.brand, { color: t.ink }]}>fit<Text style={{ color: t.accent }}>spot</Text></Text>
          <View style={[st.city, { backgroundColor: t.bg }]}><Text style={{ color: t.ink, fontWeight: '600', fontSize: 13 }}>Bielefeld</Text></View>
          <Text style={[st.count, { color: t.muted }]}>{visible.length} Spots</Text>
        </View>
        <FilterBar />
      </SafeAreaView>

      <MapView
        style={{ flex: 1 }}
        initialRegion={BIELEFELD}
        onRegionChangeComplete={(r) => setMapCenter({ lat: r.latitude, lon: r.longitude })}
        onPress={() => setSelId(null)}
        toolbarEnabled={false}
      >
        {visible.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.lat, longitude: s.lon }}
            onPress={(e) => { e.stopPropagation(); setSelId(s.id); }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[st.pin, { backgroundColor: catInfo(s.cats[0]).color, borderColor: t.surface }, selId === s.id && st.pinSel]} />
          </Marker>
        ))}
      </MapView>

      {sel ? (
        <Pressable
          onPress={() => router.push(`/spot/${sel.id}`)}
          style={[st.peek, { backgroundColor: t.surface, borderColor: t.line }]}
          accessibilityRole="button"
          accessibilityLabel={`${sel.name} ansehen`}
        >
          <Image source={sel.images[0]} style={st.peekImg} contentFit="cover" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[st.peekTitle, { color: t.ink }]} numberOfLines={2}>{sel.name}</Text>
            <Text style={[st.meta, { color: t.muted }]}>{sel.area} · {fmtDist(sel.dist)} · ♥ {sel.likes}</Text>
            <Tags cats={sel.cats} />
          </View>
          <View style={[st.go, { backgroundColor: t.accent }]}><Text style={{ color: t.accentInk, fontSize: 18, fontWeight: '700' }}>›</Text></View>
        </Pressable>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 6 },
  brand: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  city: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  count: { marginLeft: 'auto', fontSize: 12, fontVariant: ['tabular-nums'] },
  pin: { width: 18, height: 18, borderRadius: 9, borderWidth: 2.5 },
  pinSel: { width: 26, height: 26, borderRadius: 13, borderWidth: 3 },
  peek: { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 18, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  peekImg: { width: 76, height: 96, borderRadius: 12 },
  peekTitle: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 12, fontVariant: ['tabular-nums'] },
  go: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
