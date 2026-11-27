import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image as RNImage, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterBar, Tags } from '../../src/components/ui';
import { BIELEFELD, catInfo, distanceKm, fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

/** Karte randlos wie in Apple Karten: Filter schweben oben, Spot-Infos unten. */
export default function MapScreen() {
  const t = useTheme();
  const dark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const map = useRef<MapView>(null);
  const { visible, setMapCenter, source, me, realLocation, locate } = useStore();
  const [selId, setSelId] = useState<number | null>(null);
  // Foto-Pins kurz „live“ rendern lassen, bis die Bilder geladen sind, dann einfrieren (flüssiger).
  const [livePins, setLivePins] = useState(true);
  const sel = visible.find((s) => s.id === selId) ?? null;

  useEffect(() => {
    setLivePins(true);
    const id = setTimeout(() => setLivePins(false), 1500);
    return () => clearTimeout(id);
  }, [visible, selId]);

  // Beim ersten echten Standort in Bielefeld-Nähe dorthin schwenken.
  const centered = useRef(false);
  useEffect(() => {
    if (realLocation && !centered.current && distanceKm(me, { lat: BIELEFELD.latitude, lon: BIELEFELD.longitude }) < 30) {
      centered.current = true;
      map.current?.animateToRegion({ latitude: me.lat, longitude: me.lon, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
    }
  }, [realLocation, me]);

  async function goToMe() {
    const here = realLocation ? me : await locate();
    if (here) map.current?.animateToRegion({ latitude: here.lat, longitude: here.lon, latitudeDelta: 0.015, longitudeDelta: 0.015 }, 500);
  }

  function select(id: number, lat: number, lon: number) {
    setSelId(id);
    map.current?.animateCamera({ center: { latitude: lat - 0.0015, longitude: lon } }, { duration: 350 });
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={BIELEFELD}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterests={false}
        pitchEnabled
        userInterfaceStyle={dark ? 'dark' : 'light'}
        onRegionChangeComplete={(r) => setMapCenter({ lat: r.latitude, lon: r.longitude })}
        onPress={() => setSelId(null)}
        mapPadding={{ top: insets.top + 110, bottom: sel ? 140 : 0, left: 0, right: 0 }}
      >
        {visible.map((s) => {
          const color = catInfo(s.cats[0]).color;
          const active = selId === s.id;
          return (
            <Marker
              key={s.id}
              coordinate={{ latitude: s.lat, longitude: s.lon }}
              onPress={(e) => { e.stopPropagation(); select(s.id, s.lat, s.lon); }}
              tracksViewChanges={livePins}
              zIndex={active ? 10 : 1}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={[st.pin, { borderColor: active ? t.accent : '#fff' }, active && st.pinActive]}>
                  <RNImage source={s.images[0]} style={st.pinImg} />
                  <View style={[st.pinDot, { backgroundColor: color }]} />
                </View>
                <View style={[st.pinTip, { borderTopColor: active ? t.accent : '#fff' }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Schwebende Kopfzeile mit Milchglas */}
      <BlurView intensity={70} tint={dark ? 'dark' : 'light'} style={[st.header, { paddingTop: insets.top + 4 }]}>
        <View style={st.top}>
          <Text style={[st.brand, { color: t.ink }]}>fit<Text style={{ color: t.accent }}>spot</Text></Text>
          <View style={[st.city, { backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
            <Ionicons name="location-sharp" size={12} color={t.ink} />
            <Text style={{ color: t.ink, fontWeight: '600', fontSize: 13 }}>Bielefeld</Text>
          </View>
          <Text style={[st.count, { color: t.muted }]}>
            {source === 'loading' ? 'lädt …' : `${visible.length} Spots${source === 'local' ? ' · offline' : ''}`}
          </Text>
        </View>
        <FilterBar />
      </BlurView>

      {/* Standort-Knopf */}
      <BlurView intensity={70} tint={dark ? 'dark' : 'light'} style={[st.fab, { top: insets.top + 122 }]}>
        <Pressable onPress={goToMe} style={st.fabInner} accessibilityLabel="Zu meinem Standort" hitSlop={6}>
          <Ionicons name={realLocation ? 'navigate' : 'navigate-outline'} size={20} color={t.accent} />
        </Pressable>
      </BlurView>

      {sel ? (
        <BlurView intensity={80} tint={dark ? 'dark' : 'light'} style={st.sheet}>
          <Pressable onPress={() => router.push(`/spot/${sel.id}`)} style={st.sheetInner} accessibilityRole="button" accessibilityLabel={`${sel.name} ansehen`}>
            <Image source={sel.images[0]} style={st.sheetImg} contentFit="cover" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[st.sheetTitle, { color: t.ink }]} numberOfLines={2}>{sel.name}</Text>
              <Text style={[st.meta, { color: t.muted }]}>{sel.area} · {fmtDist(sel.dist)} · ♥ {sel.likes}</Text>
              <Tags cats={sel.cats} />
            </View>
            <Ionicons name="chevron-forward" size={22} color={t.muted} />
          </Pressable>
        </BlurView>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 4 },
  brand: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  city: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  count: { marginLeft: 'auto', fontSize: 12, fontVariant: ['tabular-nums'] },
  pin: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, overflow: 'hidden', backgroundColor: '#ddd', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  pinActive: { width: 60, height: 60, borderRadius: 30 },
  pinImg: { width: '100%', height: '100%' },
  pinDot: { position: 'absolute', right: 2, bottom: 2, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: '#fff' },
  pinTip: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
  fab: { position: 'absolute', right: 14, width: 44, height: 44, borderRadius: 12, overflow: 'hidden' },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sheet: { position: 'absolute', left: 12, right: 12, bottom: 12, borderRadius: 22, overflow: 'hidden' },
  sheetInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  sheetImg: { width: 76, height: 95, borderRadius: 14 },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 12, fontVariant: ['tabular-nums'] },
});
